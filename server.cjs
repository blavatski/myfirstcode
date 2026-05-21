const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const CONFIG_PATH = path.join(__dirname, 'jbp-app-config.json');

const DEFAULT_CONFIG = {
  videoDir: 'D:\\vids',
  outputDir: 'D:\\blackos',
  videoFile: '20220802_232841.mp4',
  hostName: 'Black$',
  hostTitle: 'Host',
  episodeNumber: 1,
  episodeTitle: "Once again it's on",
  episodeDate: '2026',
  accentColor: '#CC0000',
  highlightQuote: 'I said what I said.',
  highlightStart: 0,
  highlightEnd: 90,
  captions: [
    { text: 'Welcome back to the show.', start: 1.5, end: 4.0, speaker: 'BLACK$' },
  ],
};

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2));
    return { ...DEFAULT_CONFIG };
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2));
}

// Serve video files from the configured videoDir
app.get('/videos/:filename', (req, res) => {
  const config = loadConfig();
  const filePath = path.join(config.videoDir, req.params.filename);
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found', path: filePath });
  }
  res.sendFile(filePath);
});

// Get current config
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

// Save config
app.post('/api/config', (req, res) => {
  saveConfig(req.body);
  res.json({ ok: true });
});

// Render composition via SSE stream
app.post('/api/render', (req, res) => {
  const { composition } = req.body;
  const config = loadConfig();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const outputFile = path.join(config.outputDir, composition.toLowerCase() + '.mp4');

  const props = {
    videoSrc: `http://localhost:3001/videos/${config.videoFile}`,
    hostName: config.hostName,
    hostTitle: config.hostTitle,
    episodeNumber: config.episodeNumber,
    episodeTitle: config.episodeTitle,
    episodeDate: config.episodeDate,
    accentColor: config.accentColor,
    highlightQuote: config.highlightQuote,
    highlightStart: config.highlightStart,
    highlightEnd: config.highlightEnd,
    captions: config.captions,
  };

  const propsJSON = JSON.stringify(props);

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendEvent({ type: 'log', message: `Starting render: ${composition}` });
  sendEvent({ type: 'log', message: `Output: ${outputFile}` });

  const child = spawn(
    'npx',
    ['remotion', 'render', 'src/index.ts', composition, outputFile, '--props', propsJSON],
    { shell: true, cwd: __dirname }
  );

  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter((l) => l.trim());
    lines.forEach((line) => sendEvent({ type: 'log', message: line }));
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter((l) => l.trim());
    lines.forEach((line) => sendEvent({ type: 'log', message: line }));
  });

  child.on('close', (code) => {
    if (code === 0) {
      sendEvent({ type: 'done', output: outputFile });
    } else {
      sendEvent({ type: 'error', message: `Render failed with code ${code}` });
    }
    res.end();
  });

  req.on('close', () => {
    child.kill();
  });
});

app.listen(3001, () => console.log('BlackOS Studio ready at http://localhost:3001'));
