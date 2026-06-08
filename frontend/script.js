// 1. Initialize Lenis Smooth Scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Weighty easing
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Initialize GSAP Text Reveals
gsap.registerPlugin(ScrollTrigger);

const revealElements = document.querySelectorAll('.gsap-reveal');

revealElements.forEach((el) => {
  gsap.to(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%", // Triggers when the element is 85% down the screen
    },
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power4.out",
    stagger: 0.2
  });
});

// 3. Generative Canvas Background & Config Menu
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// State Variables hooked to UI
let dropSpeed = 1.0;
let fontSize = 16;
let themeColor = '#00ffcc';
let baseColor = '#666666'; // Brightened up so it doesn't blend into the background
let cols;
let drops = [];
let mouseX = -1000;
let mouseY = -1000;

// UI Elements
const speedSlider = document.getElementById('speed-slider');
const speedVal = document.getElementById('speed-val');
const densitySlider = document.getElementById('density-slider');
const densityVal = document.getElementById('density-val');
const colorPicker = document.getElementById('color-picker');

// UI Event Listeners
speedSlider.addEventListener('input', (e) => {
  dropSpeed = parseFloat(e.target.value);
  speedVal.textContent = dropSpeed.toFixed(1);
});

densitySlider.addEventListener('input', (e) => {
  fontSize = parseInt(e.target.value);
  densityVal.textContent = fontSize;
  resizeCanvas(); // Rebuild the grid when font size changes
});

colorPicker.addEventListener('input', (e) => {
  themeColor = e.target.value;
  // Update the CSS variable so the menu text/sliders match the new canvas color
  document.documentElement.style.setProperty('--accent', themeColor);
});

// Mouse Tracking
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
    drops[i] = Math.random() * -100; 
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCanvas() {
  ctx.fillStyle = 'rgba(5, 5, 5, 0.1)'; 
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
      
      // Use the dynamically selected theme color
      ctx.fillStyle = themeColor; 
    } else {
      // Use the brightened base color
      ctx.fillStyle = baseColor;
    }
    
    ctx.fillText(text, drawX, drawY);
    
    if(baseY > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    
    // Fall speed mapped to the slider
    drops[i] += dropSpeed; 
  }
}

function renderLoop() {
  drawCanvas();
  requestAnimationFrame(renderLoop);
}
renderLoop();