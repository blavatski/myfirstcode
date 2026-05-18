import { Config } from "@remotion/cli/config";

// Set the entry point for the Remotion bundler
Config.setEntryPoint("./src/index.ts");

// Configure the codec for rendering
Config.setCodec("h264");

// Set the pixel format
Config.setPixelFormat("yuv420p");

// Configure concurrency for rendering (number of parallel browser tabs)
Config.setConcurrency(2);

// Set quality for rendered output (0-100, higher is better quality)
Config.setQuality(80);

// Override the webpack configuration if needed
// Config.overrideWebpackConfig((currentConfiguration) => {
//   return currentConfiguration;
// });
