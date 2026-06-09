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

const radiusSlider = document.getElementById('speed-slider');
const radiusVal = document.getElementById('speed-val');
const densitySlider = document.getElementById('density-slider');
const densityVal = document.getElementById('density-val');
const colorPicker = document.getElementById('color-picker');

let hoverRadius = parseFloat(radiusSlider.value);
let fontSize = parseInt(densitySlider.value);
let themeColor = colorPicker.value;

let cols, rows;
let grid = [];
let mouseX = -1000;
let mouseY = -1000;
let targetMouseX = -1000;
let targetMouseY = -1000;

radiusSlider.addEventListener('input', (e) => {
  hoverRadius = parseFloat(e.target.value);
  radiusVal.textContent = hoverRadius;
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

window.addEventListener('mousemove', (e) => {
  targetMouseX = e.clientX;
  targetMouseY = e.clientY;
});
window.addEventListener('mouseout', () => { 
  targetMouseX = -1000; 
  targetMouseY = -1000; 
});

const chars = '01+-/\\*#_'.split('');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  if (canvas.width < 500) canvas.width = window.screen.width;
  if (canvas.height < 500) canvas.height = window.screen.height;

  let charWidth = fontSize * 0.8;
  let charHeight = fontSize;

  cols = Math.floor(canvas.width / charWidth) + 1;
  rows = Math.floor(canvas.height / charHeight) + 1;

  grid = [];
  for(let i = 0; i < cols; i++) {
    grid[i] = [];
    for(let j = 0; j < rows; j++) {
      grid[i][j] = {
        c: chars[Math.floor(Math.random() * chars.length)],
        x: i * charWidth,
        y: j * charHeight,
        intensity: 0
      };
    }
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
setTimeout(resizeCanvas, 200); 

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  mouseX += (targetMouseX - mouseX) * 0.15;
  mouseY += (targetMouseY - mouseY) * 0.15;

  ctx.font = fontSize + 'px "Space Mono", monospace';
  ctx.textBaseline = 'top';

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];

      let dx = cell.x - mouseX;
      let dy = cell.y - mouseY;
      let dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < hoverRadius) {
        cell.intensity = 1.0 - (dist / hoverRadius);
        if (Math.random() > 0.95) {
          cell.c = chars[Math.floor(Math.random() * chars.length)];
        }
      } else {
        cell.intensity -= 0.05;
        if (cell.intensity < 0) cell.intensity = 0;
      }

      if (cell.intensity > 0) {
        ctx.globalAlpha = cell.intensity;
        ctx.fillStyle = themeColor;
      } else {
        ctx.globalAlpha = 0.03; 
        ctx.fillStyle = '#ffffff';
      }
      ctx.fillText(cell.c, cell.x, cell.y);
    }
  }
  requestAnimationFrame(drawCanvas);
}
drawCanvas();

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
  const arrow = container.querySelector('.work-item-arrow');

  header.addEventListener('click', (e) => {
    e.preventDefault();
    const isActive = container.classList.contains('active');
    
    document.querySelectorAll('.work-container').forEach(c => {
      c.classList.remove('active');
      gsap.to(c.querySelector('.work-item-arrow'), { rotate: 0, duration: 0.3 });
    });

    if (!isActive) {
      container.classList.add('active');
      gsap.to(arrow, { rotate: 90, duration: 0.3 });
    }

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400); 
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