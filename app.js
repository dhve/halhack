(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const closeMenu = () => { navigation.classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu(); menuButton.focus();
    }
  });

  const NS = 'http://www.w3.org/2000/svg';
  const nodes = document.querySelector('#swarm-nodes');
  const lines = document.querySelector('#swarm-connections');
  const monitors = document.querySelector('#monitor-nodes');
  const countButtons = [...document.querySelectorAll('[data-count]')];
  const oversightButton = document.querySelector('#oversight-toggle');
  const caption = document.querySelector('#swarm-caption');
  let population = 25;
  let oversight = false;
  const make = (tag, attrs) => {
    const element = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };
  const render = () => {
    nodes.replaceChildren(); lines.replaceChildren(); monitors.replaceChildren();
    const hubs = [{x:280,y:138}, {x:403,y:261}, {x:280,y:384}, {x:157,y:261}];
    for (let i = 0; i < population; i++) {
      const angle = i * 2.39996323 - Math.PI / 2;
      const radius = population === 5 ? 174 : 82 + Math.sqrt((i + 1) / population) * 142;
      const x = 280 + Math.cos(angle) * radius;
      const y = 261 + Math.sin(angle) * radius;
      const quadrant = ((Math.round(Math.atan2(y - 261, x - 280) / (Math.PI / 2)) + 1) % 4 + 4) % 4;
      const target = oversight ? hubs[quadrant] : {x:280,y:261};
      lines.append(make('line', {x1:x,y1:y,x2:target.x,y2:target.y,stroke:oversight?'#9da891':'#c0c4b3','stroke-width':.7,opacity:oversight?.55:.35}));
      const group = make('g', {'class':'agent-node',style:`animation-delay:${-i * .27}s`});
      const size = population === 100 ? 3.5 : population === 5 ? 8 : 5;
      if (i % 5 === 0) group.append(make('rect',{x:x-size,y:y-size,width:size*2,height:size*2,rx:1.3,fill:'#e9623b',transform:`rotate(15 ${x} ${y})`}));
      else group.append(make('circle',{cx:x,cy:y,r:size,fill:i%3===0?'#8a9880':'#34452f'}));
      if (population === 5) {
        const label = make('text', {x,y:y+24,'text-anchor':'middle','font-family':'monospace','font-size':8,fill:'#64695c','letter-spacing':'.6'});
        label.textContent = `AGENT 0${i+1}`; group.append(label);
      }
      nodes.append(group);
    }
    if (oversight) {
      hubs.forEach((hub, index) => {
        lines.append(make('line',{x1:hub.x,y1:hub.y,x2:280,y2:261,stroke:'#e9623b','stroke-width':1.4,'stroke-dasharray':'4 5'}));
        monitors.append(make('rect',{x:hub.x-17,y:hub.y-17,width:34,height:34,rx:9,fill:'#f4f2eb',stroke:'#e9623b','stroke-width':1.5}));
        monitors.append(make('path',{d:`M${hub.x-7} ${hub.y}h14M${hub.x} ${hub.y-7}v14`,stroke:'#e9623b','stroke-width':1.5}));
        const label = make('text',{x:hub.x,y:hub.y+31,'text-anchor':'middle','font-family':'monospace','font-size':7,fill:'#8d452b'});
        label.textContent = `MONITOR 0${index+1}`; monitors.append(label);
      });
    }
    document.querySelector('#swarm-title').textContent = `A human within a network of ${population} agents${oversight ? ' with four oversight monitors' : ''}`;
    document.querySelector('#diagram-label').textContent = oversight ? `${population} agents. Cases for human judgment.` : `${population} agents. One human perspective.`;
    caption.textContent = oversight ? 'Monitors group activity into cases. People set priorities and decide what the monitors cannot.' : population === 5 ? 'Start with a few agents. Follow their interactions and learn where human judgment helps.' : 'More interactions create more to interpret. Human attention stays limited.';
  };
  countButtons.forEach(button => button.addEventListener('click', () => {
    population = Number(button.dataset.count);
    countButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    render();
  }));
  oversightButton.addEventListener('click', () => {
    oversight = !oversight; oversightButton.setAttribute('aria-pressed', String(oversight)); render();
  });
  const motionButton = document.querySelector('#motion-toggle');
  const panel = document.querySelector('.swarm-panel');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reducedMotion.matches;
  const updateMotion = () => {
    panel.classList.toggle('motion-paused', paused);
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.textContent = paused ? 'Resume motion ▷' : 'Pause motion Ⅱ';
    if (reducedMotion.matches) { motionButton.textContent = 'Reduced motion'; motionButton.disabled = true; }
    else motionButton.disabled = false;
  };
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); });
  updateMotion(); render();
})();
