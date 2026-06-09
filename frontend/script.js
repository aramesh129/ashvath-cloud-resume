const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    lenis.scrollTo(this.getAttribute('href'), { offset: -70 }); 
  });
});

const premiumEase = "power4.out"; 
const introTimeline = gsap.timeline({ delay: 0.2 });

introTimeline.to('.hero .gsap-reveal', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  opacity: 1,
  duration: 2.5,
  ease: premiumEase,
  stagger: 0.3
});

introTimeline.to('.main-header', {
  y: 0,
  duration: 1.5,
  ease: premiumEase
}, "-=1.8");

const rollNames = document.querySelectorAll('.roll-name');

rollNames.forEach(nameEl => {
  const text = nameEl.textContent;
  nameEl.textContent = ''; 
  nameEl.setAttribute('aria-label', text); 

  text.split('').forEach(char => {
    if (char === ' ') {
      nameEl.appendChild(document.createTextNode(' '));
    } else {
      const wrap = document.createElement('span');
      wrap.className = 'char-wrap';
      const inner = document.createElement('span');
      inner.className = 'char';
      inner.textContent = char;
      wrap.appendChild(inner);
      nameEl.appendChild(wrap);
    }
  });
});

function playRollAnimation() {
  const chars = document.querySelectorAll('.roll-name .char');
  
  chars.forEach((char, i) => {
    gsap.timeline({ delay: i * 0.05 })
      .to(char, { y: "-110%", duration: 0.4, ease: "power3.in" })
      .set(char, { y: "110%" })
      .to(char, { y: "0%", duration: 0.4, ease: "power3.out" });
  });
}

setTimeout(() => {
  playRollAnimation();
  setInterval(playRollAnimation, 5000);
}, 2500);

const scrollElements = document.querySelectorAll('.content-section .gsap-reveal');
scrollElements.forEach((el) => {
  gsap.to(el, {
    scrollTrigger: { 
      trigger: el, 
      start: "top 85%",
      toggleActions: "play none none reverse" 
    },
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    opacity: 1, 
    duration: 1.2, 
    ease: premiumEase, 
    stagger: 0.2
  });
});

const messages = [
  "INITIALIZING...",
  "ID: 104840775962",
  "ACCESS LEVEL: ROOT",
  "CREATIVE PROFILE LOADED",
  "NOMINAL SYSTEMS",
  "READY_"
];
const typingTextElement = document.getElementById('typing-text');
let messageIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeMessage() {
  const currentMsg = messages[messageIndex];
  
  if (isDeleting) {
    typingTextElement.textContent = currentMsg.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typingTextElement.textContent = currentMsg.substring(0, charIndex + 1);
    charIndex++;
  }

  let typeSpeed = isDeleting ? 30 : 60; 

  if (!isDeleting && charIndex === currentMsg.length) {
    typeSpeed = 2000; 
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    messageIndex = (messageIndex + 1) % messages.length;
    typeSpeed = 500; 
  }
  setTimeout(typeMessage, typeSpeed);
}
setTimeout(typeMessage, 1500);

const configTrigger = document.getElementById('sys-config-trigger');
const configDropdown = document.getElementById('sys-config-dropdown');

configTrigger.addEventListener('click', () => {
  configDropdown.classList.toggle('hidden');
  configTrigger.classList.toggle('active'); 
});

document.addEventListener('click', (e) => {
  if (!configTrigger.contains(e.target) && !configDropdown.contains(e.target)) {
    configDropdown.classList.add('hidden');
    configTrigger.classList.remove('active');
  }
});

const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const densitySlider = document.getElementById('density-slider');
const densityVal = document.getElementById('density-val');
const colorPicker = document.getElementById('color-picker');

let dropSpeed = parseFloat(speedSlider.value);
let fontSize = parseInt(densitySlider.value);
let themeColor = colorPicker.value;

let cols, rows;
let grid = [];
let drops = [];
let mouseX = -1000;
let mouseY = -1000;

speedSlider.addEventListener('input', (e) => {
  dropSpeed = parseFloat(e.target.value);
  speedVal.textContent = dropSpeed.toFixed(1);
});
densitySlider.addEventListener('input', (e) => {
  fontSize = parseInt(e.target.value);
  densityVal.textContent = fontSize;
  resizeCanvas(); 
});
colorPicker.addEventListener('input', (e) => {
  themeColor = e.target.value;
  document.documentElement.style.setProperty('--accent', themeColor);
});

window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('mouseout', () => { mouseX = -1000; mouseY = -1000; });

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let charWidth = fontSize * 0.6; 
  cols = Math.floor(canvas.width / charWidth) + 1;
  rows = Math.floor(canvas.height / fontSize) + 1;
  
  grid = [];
  drops = [];
  for(let i = 0; i < cols; i++) {
    grid[i] = [];
    for(let j = 0; j < rows; j++) {
      grid[i][j] = { char: Math.random() > 0.5 ? '1' : '0', intensity: 0, drawX: 0, drawY: 0 };
    }
    drops[i] = Math.random() * -rows; 
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < cols; i++) {
    let oldY = Math.floor(drops[i]);
    drops[i] += dropSpeed;
    let newY = Math.floor(drops[i]);
    
    if (newY > oldY) {
      for (let y = oldY + 1; y <= newY; y++) {
        if (y >= 0 && y < rows && grid[i] && grid[i][y]) {
          grid[i][y].intensity = 1.0;
          grid[i][y].char = Math.random() > 0.5 ? '1' : '0';
        }
      }
    }
    if (drops[i] > rows && Math.random() > 0.95) { drops[i] = Math.random() * -20; }
  }

  let charWidth = fontSize * 0.6;
  ctx.font = fontSize + 'px "Space Mono", monospace';
  ctx.textBaseline = 'top';

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      cell.intensity -= 0.02;
      if (cell.intensity < 0) cell.intensity = 0;
      if (Math.random() > 0.995) cell.char = cell.char === '1' ? '0' : '1';
      
      let baseX = i * charWidth;
      let baseY = j * fontSize;
      const dx = baseX - mouseX;
      const dy = baseY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = 150;
      
      if (distance < radius && distance > 0.1) {
        const force = Math.sin((distance / radius) * Math.PI) * 15; 
        cell.drawX += (dx / distance) * force;
        cell.drawY += (dy / distance) * force;
      }
      
      if (cell.intensity > 0) {
        ctx.globalAlpha = 0.2 + (cell.intensity * 0.8);
        ctx.fillStyle = cell.intensity > 0.8 ? themeColor : '#777777';
      } else {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#444444';
      }
      ctx.fillText(cell.char, cell.drawX, cell.drawY);
    }
  }
}

function renderLoop() {
  drawCanvas();
  requestAnimationFrame(renderLoop);
}
renderLoop();

document.querySelectorAll('.gsap-reveal-up').forEach((el) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
      toggleActions: 'play none none reverse'
    },
    opacity: 1,
    y: 0,
    duration: 1.0,
    ease: premiumEase,
  });
});

gsap.utils.toArray('.about-body .gsap-reveal-up').forEach((el, i) => {
  gsap.to(el, {
    scrollTrigger: { trigger: '.about-body', start: 'top 80%', toggleActions: 'play none none reverse' },
    opacity: 1,
    y: 0,
    duration: 1.0,
    delay: i * 0.15,
    ease: premiumEase,
  });
});

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1500;
  const start = performance.now();
  
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) statObserver.observe(statsEl);

gsap.utils.toArray('.work-item').forEach((item, i) => {
  gsap.to(item, {
    scrollTrigger: {
      trigger: item,
      start: 'top 90%',
      toggleActions: 'play none none reverse',
    },
    opacity: 1,
    x: 0,
    rotate: 0,
    duration: 0.8,
    delay: i * 0.07,
    ease: 'power3.out',
  });
});

document.querySelectorAll('.work-item').forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(item, {
      skewX: relY * -3,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  });
  item.addEventListener('mouseleave', () => {
    gsap.to(item, { skewX: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' });
  });
});

document.querySelectorAll('.work-container').forEach(container => {
  const header = container.querySelector('.work-item');
  const details = container.querySelector('.work-details');
  const arrow = container.querySelector('.work-item-arrow');

  header.addEventListener('click', () => {
    const isActive = container.classList.contains('active');
    
    document.querySelectorAll('.work-container').forEach(c => {
      c.classList.remove('active');
      gsap.to(c.querySelector('.work-details'), { height: 0, duration: 0.4, ease: 'power2.out' });
      gsap.to(c.querySelector('.work-item-arrow'), { rotate: 0, duration: 0.3 });
    });

    if (!isActive) {
      container.classList.add('active');
      gsap.to(details, { height: 'auto', duration: 0.4, ease: 'power2.out' });
      gsap.to(arrow, { rotate: 90, duration: 0.3 });
    }
  });
});

gsap.utils.toArray('.contact-section .gsap-reveal-up').forEach((el, i) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    opacity: 1,
    y: 0,
    duration: 1.0,
    delay: i * 0.12,
    ease: premiumEase,
  });
});

(function() {
  const ac = document.getElementById('ascii-canvas');
  if (!ac) return;
  const ax = ac.getContext('2d');

  const GLYPHS = {
    A: [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    R: [[1,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,0],[1,0,0,0,1]],
    S: [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,0],[0,0,0,0,1],[0,0,0,0,1],[1,1,1,1,0]],
    H: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    V: [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0]],
    T: [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    M: [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    E: [[1,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,0,0,0,0],[1,1,1,1,1]]
  };

  const wordsToCycle = ['AR', 'ASHVATH', 'RAMESH'];
  let currentWordIdx = 0;

  function buildWordCells(word, gridW, gridH) {
    const letterW = 5, letterH = 7, gap = 2;
    const totalW = (letterW * word.length) + (gap * (word.length - 1));
    const startCol = Math.floor((gridW - totalW) / 2);
    const startRow = Math.floor((gridH - letterH) / 2);
    const lit = new Set();
    
    word.split('').forEach((ch, li) => {
      const offC = startCol + li * (letterW + gap);
      if (GLYPHS[ch]) {
        GLYPHS[ch].forEach((row, r) => {
          row.forEach((px, c) => {
            if (px) lit.add(`${offC + c},${startRow + r}`);
          });
        });
      }
    });
    return lit;
  }

  const CHARS = '01アイウエオカキクケコABCDEFRX#@%&'.split('');
  const CELL = 18; 
  let cols, rows, cells, litSet;
  let phase = 1; 
  let phaseTimer = 0;
  const CHAOS_DUR    = 50;
  const CONVERGE_DUR = 60;
  const FORMED_DUR   = 150;
  const EXPLODE_DUR  = 40;

  function resize() {
    ac.width  = ac.offsetWidth;
    ac.height = ac.offsetHeight;
    cols = Math.floor(ac.width  / CELL);
    rows = Math.floor(ac.height / CELL);
    litSet = buildWordCells(wordsToCycle[currentWordIdx], cols, rows);
    initCells();
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr)  { return arr[Math.floor(Math.random() * arr.length)]; }

  function initCells() {
    cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isLit = litSet.has(`${c},${r}`);
        cells.push({
          c, r,
          x: rnd(0, ac.width),
          y: rnd(0, ac.height),
          hx: c * CELL + CELL / 2,
          hy: r * CELL + CELL / 2,
          char: pick(CHARS),
          charTimer: Math.floor(rnd(0, 20)),
          targetAlpha: isLit ? 1.0 : 0.08,
          alpha: Math.random(),
          isLit,
          vx: 0, vy: 0,
          scale: rnd(0.5, 1.2),
          mutRate: isLit ? 0.015 : 0.06,
        });
      }
    }
  }

  function getAccentColor() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ffcc';
  }

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  }

  let frameId;
  function draw() {
    frameId = requestAnimationFrame(draw);
    ax.clearRect(0, 0, ac.width, ac.height);

    phaseTimer++;
    const phaseDurs = [CHAOS_DUR, CONVERGE_DUR, FORMED_DUR, EXPLODE_DUR];
    
    if (phaseTimer > phaseDurs[phase]) {
      phaseTimer = 0;
      phase = (phase + 1) % 4;
      
      if (phase === 3) {
        cells.forEach(cell => {
          if (cell.isLit) {
            const angle = rnd(0, Math.PI * 2);
            const speed = rnd(4, 18);
            cell.vx = Math.cos(angle) * speed;
            cell.vy = Math.sin(angle) * speed;
          }
        });
      }
      
      if (phase === 0) {
        currentWordIdx = (currentWordIdx + 1) % wordsToCycle.length;
        litSet = buildWordCells(wordsToCycle[currentWordIdx], cols, rows);

        cells.forEach(cell => {
          cell.isLit = litSet.has(`${cell.c},${cell.r}`);
          cell.targetAlpha = cell.isLit ? 1.0 : 0.08;
          cell.mutRate = cell.isLit ? 0.015 : 0.06;
          cell.x = rnd(0, ac.width);
          cell.y = rnd(0, ac.height);
          cell.vx = 0; cell.vy = 0;
        });
      }
    }

    const t  = phaseTimer / phaseDurs[phase];
    const accent = hexToRgb(getAccentColor());
    ax.font = `bold ${CELL - 2}px "Space Mono", monospace`;
    ax.textAlign = 'center';
    ax.textBaseline = 'middle';

    cells.forEach(cell => {
      if (phase === 0) {
        cell.x += Math.sin(phaseTimer * 0.03 + cell.c) * 0.4;
        cell.y += Math.cos(phaseTimer * 0.03 + cell.r) * 0.4;
        if (cell.x < 0) cell.x = ac.width;
        if (cell.x > ac.width) cell.x = 0;
        if (cell.y < 0) cell.y = ac.height;
        if (cell.y > ac.height) cell.y = 0;
      } else if (phase === 1) {
        cell.x += (cell.hx - cell.x) * (0.04 + t * 0.06);
        cell.y += (cell.hy - cell.y) * (0.04 + t * 0.06);
      } else if (phase === 2) {
        cell.x = cell.hx + Math.sin(phaseTimer * 0.05 + cell.c * 0.7) * 0.8;
        cell.y = cell.hy + Math.cos(phaseTimer * 0.05 + cell.r * 0.7) * 0.8;
      } else if (phase === 3) {
        cell.vx *= 0.93;
        cell.vy *= 0.93;
        cell.x += cell.vx;
        cell.y += cell.vy;
      }

      cell.charTimer--;
      if (cell.charTimer <= 0) {
        cell.char = pick(CHARS);
        cell.charTimer = Math.floor(rnd(8, 35));
        if (phase === 2 && cell.isLit) cell.charTimer = Math.floor(rnd(40, 90));
      }

      let targetA = cell.targetAlpha;
      if (phase === 3 && cell.isLit) targetA = 1 - t;
      if (phase === 0 && !cell.isLit) targetA = 0.05 + Math.sin(phaseTimer * 0.04 + cell.c) * 0.04;
      cell.alpha += (targetA - cell.alpha) * 0.08;

      if (cell.alpha < 0.01) return;

      let color;
      if (cell.isLit) {
        color = `rgba(${accent.r},${accent.g},${accent.b},${cell.alpha.toFixed(3)})`;
      } else {
        color = `rgba(255,255,255,${(cell.alpha * 0.5).toFixed(3)})`;
      }

      ax.fillStyle = color;
      ax.save();
      ax.translate(cell.x, cell.y);
      ax.fillText(cell.char, 0, 0);
      ax.restore();
    });
  }

  const section = ac.closest('section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        resize();
        draw();
      } else {
        cancelAnimationFrame(frameId);
      }
    });
  }, { threshold: 0.05 });
  observer.observe(section);

  window.addEventListener('resize', () => {
    if (ac.offsetParent !== null) resize();
  });
})();