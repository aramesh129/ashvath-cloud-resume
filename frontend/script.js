// 1. Lenis Smooth Scroll Setup
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

// Integrate GSAP with Lenis for smooth internal anchor linking
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    lenis.scrollTo(this.getAttribute('href'), { offset: -70 }); // Offset for header height
  });
});

// 2. GSAP Intro Animations
const premiumEase = "power4.out"; 
const introTimeline = gsap.timeline({ delay: 0.2 });

introTimeline.to('.hero .gsap-reveal', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  opacity: 1,
  duration: 2.5,
  ease: premiumEase,
  stagger: 0.3
});

// Target the new .main-header class
introTimeline.to('.main-header', {
  y: 0,
  duration: 1.5,
  ease: premiumEase
}, "-=1.8");

const scrollElements = document.querySelectorAll('.content-section .gsap-reveal');
scrollElements.forEach((el) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: "top 85%" },
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    opacity: 1, duration: 1.2, ease: premiumEase, stagger: 0.2
  });
});

// 3. UI Interactions (Typing Effect & Dropdown)
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

  let typeSpeed = isDeleting ? 30 : 60; // Deletion is faster

  // Pause at the end of a message
  if (!isDeleting && charIndex === currentMsg.length) {
    typeSpeed = 2000; 
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    messageIndex = (messageIndex + 1) % messages.length;
    typeSpeed = 500; // Pause before typing new word
  }
  setTimeout(typeMessage, typeSpeed);
}
// Start the typing loop
setTimeout(typeMessage, 1500);

// SYS_CONFIG Dropdown Logic
const configTrigger = document.getElementById('sys-config-trigger');
const configDropdown = document.getElementById('sys-config-dropdown');

configTrigger.addEventListener('click', () => {
  configDropdown.classList.toggle('hidden');
  configTrigger.classList.toggle('active'); // Rotates the arrow
});

// 4. Generative Canvas Background (Fixed Grid Engine - Ripple Physics)
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
      
      cell.drawX = baseX;
      cell.drawY = baseY;
      
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