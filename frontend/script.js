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

// 2. GSAP Wodniack-Style Animations
gsap.registerPlugin(ScrollTrigger);

const premiumEase = "power4.inOut";
const introTimeline = gsap.timeline({ delay: 0.2 });

introTimeline.to('.hero .gsap-reveal', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  opacity: 1,
  duration: 1.5,
  ease: premiumEase,
  stagger: 0.15 
});

introTimeline.to('nav', {
  y: 0,
  duration: 1.2,
  ease: premiumEase
}, "-=1.0"); 

introTimeline.to('#control-panel', {
  x: 0,
  duration: 1.2,
  ease: premiumEase
}, "-=1.0");

const scrollElements = document.querySelectorAll('.content-section .gsap-reveal');
scrollElements.forEach((el) => {
  gsap.to(el, {
    scrollTrigger: { 
      trigger: el, 
      start: "top 85%" 
    },
    clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    opacity: 1,
    duration: 1.2,
    ease: premiumEase,
    stagger: 0.2
  });
});

// 3. Generative Canvas Background (Fixed Grid Engine)
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
  
  let charWidth = fontSize * 0.6; 
  cols = Math.floor(canvas.width / charWidth) + 1;
  rows = Math.floor(canvas.height / fontSize) + 1;
  
  grid = [];
  drops = [];
  for(let i = 0; i < cols; i++) {
    grid[i] = [];
    for(let j = 0; j < rows; j++) {
      grid[i][j] = {
        char: Math.random() > 0.5 ? '1' : '0',
        intensity: 0,
        drawX: 0,
        drawY: 0,
        isHovered: false
      };
    }
    drops[i] = Math.random() * -rows; 
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. Calculate drop physics
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
    
    if (drops[i] > rows && Math.random() > 0.95) {
      drops[i] = Math.random() * -20; 
    }
  }

  let charWidth = fontSize * 0.6;
  ctx.font = fontSize + 'px "Space Mono", monospace';
  ctx.textBaseline = 'top';

  // 2. Compute Cursor Repulsion Math
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      
      cell.intensity -= 0.015;
      if (cell.intensity < 0) cell.intensity = 0;
      
      if (Math.random() > 0.999) {
        cell.char = cell.char === '1' ? '0' : '1';
      }
      
      let baseX = i * charWidth;
      let baseY = j * fontSize;
      
      const dx = baseX - mouseX;
      const dy = baseY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radius = 150;
      
      cell.isHovered = false;
      cell.drawX = baseX;
      cell.drawY = baseY;
      
      // Added > 0.1 to prevent division by zero NaN errors at the exact cursor center
      if (distance < radius && distance > 0.1) {
        cell.isHovered = true;
        // Used Math.pow to smooth the force curve so they don't bunch into a dense ring
        const force = Math.pow((radius - distance) / radius, 1.2);
        cell.drawX += (dx / distance) * force * 30;
        cell.drawY += (dy / distance) * force * 30;
      }
    }
  }

  // 3. Pass One: Draw Background Text (Stays muted, just moves out of the way)
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      if (cell.intensity === 0) {
        // Slightly brighter if hovered, but strictly grey. NO CYAN!
        ctx.globalAlpha = cell.isHovered ? 0.25 : 0.15;
        ctx.fillStyle = cell.isHovered ? '#666666' : '#444444';
        ctx.fillText(cell.char, cell.drawX, cell.drawY);
      }
    }
  }

  // 4. Pass Two: Draw Falling Rain (Only lights up cyan if it hits the cursor)
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      if (cell.intensity > 0) {
        if (cell.isHovered) {
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = themeColor; // This is the fix! Cyan only applies to rain drops now.
        } else {
          ctx.globalAlpha = 0.2 + (cell.intensity * 0.8);
          ctx.fillStyle = cell.intensity > 0.8 ? themeColor : '#666666';
        }
        ctx.fillText(cell.char, cell.drawX, cell.drawY);
      }
    }
  }
  
  ctx.globalAlpha = 1.0; 
}

function renderLoop() {
  drawCanvas();
  requestAnimationFrame(renderLoop);
}
renderLoop();