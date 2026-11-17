'use strict';
/* Illustrated how-tos. Every figure is drawn here as inline SVG from joint positions,
   so the app needs no image files and nothing from outside. */
(function(){
  const INK = '#e8ede4', DIM = '#9aa89e', BELL = '#e8c95a', ARROW = '#8fbfe0', PROP = '#5d7166', GROUND = 108;
  const F = {hd:[50,21], shs:[[40,34],[60,34]], sh:[50,34], hp:[50,64], kn:[[44,86],[56,86]], ft:[[42,GROUND],[58,GROUND]], front:true};  // front-view base
  const S = {hd:[48,20], sh:[48,32], hp:[48,62], kn:[[47,85],[49,85]], ft:[[46,GROUND],[50,GROUND]]};                                       // side-view base
  const chair = `<path d="M20 46V74H44M22 74V${GROUND}M42 74V${GROUND}" />`;
  const wall = x => `<path d="M${x} 6V${GROUND}" />`;

  const T = {
    swing: {name:'Kettlebell swing', labels:['Hike','Stand tall'], frames:[
        {...S, hd:[71,41], sh:[62,50], hp:[36,62], kn:[[47,84],[50,84]], ft:[[44,GROUND],[47,GROUND]], el:[[52,66],[52,66]], ha:[[43,80],[43,80]], bell:[38,85], arrows:['M47 94Q74 96 86 58']},
        {...S, el:[[62,34],[62,34]], ha:[[75,35],[75,35]], bell:[83,37], arrows:['M88 66Q92 82 78 96']}],
      cues:['Push your hips back and let the bell swing between your legs, high and close.', 'Snap your hips forward to stand. The hips throw the bell, the arms just hold on.', 'Finish tall with knees and hips locked and the bell at chest height.'],
      avoid:'Squatting it down, or lifting the bell with your shoulders.'},
    halo: {name:'Halo', labels:['At the chest','Around the head'], frames:[
        {...F, el:[[36,48],[64,48]], ha:[[46,43],[54,43]], bell:[50,47]},
        {...F, el:[[36,26],[68,22]], ha:[[54,9],[62,11]], bell:[59,6], arrows:['M36 28A15 15 0 1 1 61 32']}],
      cues:['Hold the bell upside down by the sides of the handle.', 'Circle it close around your head, elbows passing your ears.', 'Keep your ribs down and your head still. Switch direction each rep or each set.'],
      avoid:'Leaning back or ducking your head under the bell.'},
    press: {name:'Overhead press', labels:['Rack','Lockout'], frames:[
        {...F, el:[[38,48],[66,50]], ha:[[38,62],[62,39]], bell:[67,37], arrows:['M80 36V12']},
        {...F, el:[[38,48],[63,20]], ha:[[38,62],[62,7]], bell:[68,7]}],
      cues:['Start with the bell resting on your forearm at the shoulder, wrist straight.', 'Squeeze your glutes and press straight up until the elbow locks by your ear.', 'Lower it under control back to the shoulder.'],
      avoid:'Arching your lower back to get it up. If that happens, the set is over.'},
    split: {name:'Bulgarian split squat', labels:['Top','Bottom'], props:`<path d="M8 88H28M10 88V${GROUND}M26 88V${GROUND}" />`, frames:[
        {hd:[52,17], sh:[52,29], hp:[50,60], kn:[[36,82],[60,84]], ft:[[20,86],[60,GROUND]], toe:[[14,86],[68,GROUND]], el:[[58,43],[58,43]], ha:[[60,37],[60,37]], bell:[65,39], arrows:['M84 38V64']},
        {hd:[52,33], sh:[51,45], hp:[46,76], kn:[[33,99],[67,82]], ft:[[20,86],[62,GROUND]], toe:[[14,86],[70,GROUND]], el:[[57,59],[57,59]], ha:[[59,53],[59,53]], bell:[64,55]}],
      cues:['Back foot rests on a chair or bench, laces down. Front foot far enough forward to stay flat.', 'Drop straight down until the back knee is just off the floor.', 'Drive up through the whole front foot. Do every rep on one leg, then switch.'],
      avoid:'Front heel lifting or the knee caving inward. Use no weight until it is steady.'},
    walk: {name:'Walk', labels:['Two minutes'], frames:[
        {...S, kn:[[40,84],[57,84]], ft:[[31,105],[61,GROUND]], toe:[[38,GROUND],[69,GROUND]], el:[[57,45],[41,46]], ha:[[63,54],[35,57]], arrows:['M72 96H92']}],
      cues:['Get up and walk anywhere for two minutes: hallway, stairs, around the block.', 'Let your arms swing and pick a pace a little faster than a stroll.'],
      avoid:'Standing still and calling it a break. The point is to move.'},
    sit: {name:'Sit-to-stands', labels:['Sit','Stand'], props:chair, frames:[
        {hd:[38,31], sh:[37,44], hp:[34,72], kn:[[57,74],[58,74]], ft:[[57,GROUND],[59,GROUND]], el:[[45,56],[45,56]], ha:[[39,48],[39,48]], arrows:['M80 70V42']},
        {hd:[57,19], sh:[57,31], hp:[56,62], kn:[[56,85],[58,85]], ft:[[57,GROUND],[59,GROUND]], el:[[64,43],[64,43]], ha:[[58,37],[58,37]]}],
      cues:['Arms crossed on your chest, feet flat under your knees.', 'Lean forward and stand all the way up without using your hands.', 'Sit back down slowly. That is one rep.'],
      avoid:'Dropping into the chair. Use a sturdy chair that will not roll.'},
    hip: {name:'Hip circles', labels:['Knee up','Open out'], frames:[
        {...F, kn:[[44,86],[62,68]], ft:[[42,GROUND],[64,88]], el:[[30,50],[70,50]], ha:[[44,60],[56,60]], arrows:['M78 60A11 10 0 1 1 66 54']},
        {...F, kn:[[44,86],[74,72]], ft:[[42,GROUND],[72,92]], el:[[30,50],[70,50]], ha:[[44,60],[56,60]]}],
      cues:['Stand by a wall or chair for balance. Lift one knee to hip height.', 'Draw a big slow circle with the knee, opening out to the side and back around.', 'Ten one way, ten the other, then switch legs.'],
      avoid:'Twisting your whole body. Hips and chest stay facing forward.'},
    cat: {name:'Cat-cow at a desk', labels:['Round up','Let it sag'], props:`<path d="M68 60H98M94 60V${GROUND}" />`, frames:[
        {hd:[69,66], sh:[60,58], hp:[30,62], spine:[45,42], kn:[[30,85],[31,85]], ft:[[29,GROUND],[31,GROUND]], el:[[66,62],[66,62]], ha:[[72,59],[72,59]], arrows:['M45 34V22']},
        {hd:[72,49], sh:[60,58], hp:[30,62], spine:[45,72], kn:[[30,85],[31,85]], ft:[[29,GROUND],[31,GROUND]], el:[[66,62],[66,62]], ha:[[72,59],[72,59]], arrows:['M45 80V92']}],
      cues:['Hands on a desk or counter, step back until your back is flat.', 'Round your back up toward the ceiling and tuck your chin.', 'Then let your chest sink and look forward. Move slowly, breathing with it.'],
      avoid:'Forcing either end of the range. Easy and smooth.'},
    twist: {name:'Standing twists', labels:['Face front','Turn'], frames:[
        {...F, el:[[34,43],[66,43]], ha:[[46,41],[54,41]], arrows:['M30 9Q50 2 70 9']},
        {...F, shs:[[45,34],[59,34]], sh:[52,34], hd:[52,21], el:[[57,43],[71,41]], ha:[[69,43],[82,38]]}],
      cues:['Feet hip width, arms loose at chest height.', 'Turn your chest to one side and let the back heel lift as you go.', 'Swing easily side to side. No forcing the end.'],
      avoid:'Yanking into the twist or locking your knees.'},
    arm: {name:'Arm circles and shoulder rolls', labels:['Circle','Roll'], frames:[
        {...F, el:[[26,36],[74,36]], ha:[[14,36],[86,36]], arrows:['M10 28A8 8 0 1 0 10 44','M90 28A8 8 0 1 1 90 44']},
        {...F, el:[[38,48],[62,48]], ha:[[38,62],[62,62]], arrows:['M30 42A8 8 0 0 1 35 27','M70 42A8 8 0 0 0 65 27']}],
      cues:['Arms straight out to the sides. Draw circles that start small and grow.', 'Ten forward, ten backward.', 'Then drop your arms and roll your shoulders up, back and down.'],
      avoid:'Shrugging up toward your ears the whole time.'},
    door: {name:'Doorway chest stretch', labels:['Set the arm','Step through'], props:wall(66), frames:[
        {...S, hd:[50,21], sh:[50,33], hp:[50,63], kn:[[46,85],[52,85]], ft:[[42,GROUND],[54,GROUND]], el:[[39,46],[64,34]], ha:[[41,58],[65,18]], arrows:['M74 52H92']},
        {...S, hd:[61,21], sh:[60,33], hp:[57,63], kn:[[48,86],[66,85]], ft:[[40,GROUND],[72,GROUND]], el:[[49,46],[65,37]], ha:[[52,58],[66,20]]}],
      cues:['Forearm flat on the door frame, elbow at shoulder height.', 'Step the same-side foot through until you feel the front of the chest open.', 'Hold 30 seconds and breathe, then do the other side.'],
      avoid:'Leaning hard into it or letting the shoulder ride up.'},
    calf: {name:'Calf raises', labels:['Flat','Up on toes'], props:wall(82), frames:[
        {...S, el:[[66,46],[66,46]], ha:[[81,44],[81,44]], toe:[[54,GROUND],[58,GROUND]], arrows:['M30 70V48']},
        {hd:[49,14], sh:[49,26], hp:[49,56], kn:[[48,79],[50,79]], ft:[[46,101],[50,101]], toe:[[54,GROUND],[58,GROUND]], el:[[66,41],[66,41]], ha:[[81,40],[81,40]]}],
      cues:['One hand on a wall or chair for balance, feet hip width.', 'Rise onto the balls of your feet as high as you can and pause.', 'Lower slowly, taking about two seconds.'],
      avoid:'Bouncing. The slow lowering is the useful part.'},
    ankle: {name:'Ankle circles', labels:['Circle the foot'], props:wall(84), frames:[
        {...S, hd:[46,20], sh:[46,32], hp:[46,62], kn:[[46,85],[57,80]], ft:[[45,GROUND],[62,97]], toe:[[52,GROUND],[70,99]], el:[[66,45],[66,45]], ha:[[83,43],[83,43]], arrows:['M78 92A9 9 0 1 1 68 108']}],
      cues:['Hold a wall, lift one foot just off the floor.', 'Draw the biggest slow circle you can with your toes.', 'Ten each way, then switch feet.'],
      avoid:'Moving the whole leg. Only the ankle turns.'}
  };

  const L = (a,b,o) => `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}"${o ? ` opacity="${o}"` : ''}/>`;
  function fig(p, props, n){
    const far = .45, out = [];
    out.push(`<path d="M4 ${GROUND+3}H96" stroke="${PROP}" stroke-width="1.5"/>`);
    if(props) out.push(`<g stroke="${PROP}" stroke-width="3">${props}</g>`);
    out.push(`<g stroke="${INK}" stroke-width="4">`);
    p.kn.forEach((k,i) => { const o = !p.front && i === 0 ? far : 0, toe = p.toe ? p.toe[i] : [p.ft[i][0] + (p.front ? (i ? 5 : -5) : 7), p.ft[i][1]];
      out.push(L(p.hp,k,o), L(k,p.ft[i],o), L(p.ft[i],toe,o)); });
    out.push(p.spine ? `<path d="M${p.sh[0]} ${p.sh[1]}Q${p.spine[0]} ${p.spine[1]} ${p.hp[0]} ${p.hp[1]}"/>` : L(p.sh,p.hp));
    if(p.shs) out.push(L(p.shs[0],p.shs[1]));
    if(p.el) p.el.forEach((e,i) => { const o = !p.front && i === 0 ? far : 0, s = p.shs ? p.shs[i] : p.sh; out.push(L(s,e,o), L(e,p.ha[i],o)); });
    out.push(`</g><circle cx="${p.hd[0]}" cy="${p.hd[1]}" r="7.5" fill="#1c2520" stroke="${INK}" stroke-width="3.5"/>`);
    if(p.bell) out.push(`<circle cx="${p.bell[0]}" cy="${p.bell[1]}" r="7" fill="${BELL}"/>`);
    (p.arrows || []).forEach(d => out.push(`<path d="${d}" stroke="${ARROW}" stroke-width="2.5" stroke-dasharray="1 0" marker-end="url(#ah${n})"/>`));
    return `<svg viewBox="0 0 100 116" role="img" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <defs><marker id="ah${n}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${ARROW}" stroke="none"/></marker></defs>${out.join('')}</svg>`;
  }
  let uid = 0;
  // Returns the full illustrated card body for one move.
  window.tutorial = function(id){
    const t = T[id]; if(!t) return '';
    return `<div class="tut">
      <div class="tut-figs n${t.frames.length}">${t.frames.map((f,i) => `<figure>${fig(f, t.props, ++uid)}<figcaption><b>${t.frames.length > 1 ? i+1 : ''}</b> ${t.labels[i]}</figcaption></figure>`).join('')}</div>
      <ol class="tut-cues">${t.cues.map(c => `<li>${c}</li>`).join('')}</ol>
      <p class="tut-avoid"><b>Avoid:</b> ${t.avoid}</p>
    </div>`;
  };
  window.tutorialName = id => (T[id] || {}).name || '';
})();
