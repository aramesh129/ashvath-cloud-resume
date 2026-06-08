// 1. Lenis Smooth Scroll
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

// 2. GSAP Text Reveals
gsap.registerPlugin(ScrollTrigger);
const revealElements = document.querySelectorAll('.gsap-reveal');
revealElements.forEach((el) => {
  gsap.to(el, {
    scrollTrigger: { trigger: el, start: "top 85%" },
    opacity: 1, y: 0, duration: 1.2, ease: "power4.out", stagger: 0.2
  });
});

// 3. Generative Canvas Background & Config Menu
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// UI Elements
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const densitySlider = document.getElementById('density-slider');
const densityVal = document.getElementById('density-val');
const colorPicker = document.getElementById('color-picker');

// State Variables tied directly to initial UI values
let dropSpeed = parseFloat(speedSlider.value);
let fontSize = parseInt(densitySlider.value);
let themeColor = colorPicker.value;
let baseColor = '#555555'; // Brightened the inactive text so you can see it
let cols;
let drops = [];
let mouseX = -1000;
let mouseY = -1000;

// Update UI & Variables on input
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
  // This physically changes your CSS variable so headers/sliders update too
  document.documentElement.style.setProperty('--accent', themeColor);
});

// Mouse tracking
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});
window.addEventListener('mouseout', () => {
  mouseX = -1000;
  mouseY = -1000;
});

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / fontSize) + 1;
  
  drops = [];
  for(let i = 0; i < cols; i++) {
    drops[i] = Math.random() * -100; // Staggered drop start
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCanvas() {
  // Dark overlay creates the fading trail
  ctx.fillStyle = 'rgba(5, 5, 5, 0.15)'; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = fontSize + 'px "Space Mono", monospace';
  
  for(let i = 0; i < drops.length; i++) {
    const text = Math.random() > 0.5 ? '1' : '0';
    const baseX = i * fontSize;
    const baseY = drops[i] * fontSize;
    
    let drawX = baseX;
    let drawY = baseY;

    const dx = baseX - mouseX;
    const dy = baseY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const radius = 150;
    if (distance < radius) {
      const force = (radius - distance) / radius;
      drawX += (dx / distance) * force * 40; 
      drawY += (dy / distance) * force * 40; 
      
      // Cursor reaction color
      ctx.fillStyle = themeColor; 
    } else {
      // Normal background rain color
      ctx.fillStyle = baseColor;
    }
    
    ctx.fillText(text, drawX, drawY);
    
    // Reset drop to top randomly when it hits bottom
    if(baseY > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    
    drops[i] += dropSpeed; 
  }
}

function renderLoop() {
  drawCanvas();
  requestAnimationFrame(renderLoop);
}
renderLoop();