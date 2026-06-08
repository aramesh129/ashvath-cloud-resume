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
  
  // Monospace fonts are narrower than they are tall. 
  // Multiplier fixes horizontal gaps so the grid looks perfect.
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
  // Clear the canvas entirely every frame - prevents all smudging
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 1. Calculate drop physics logic
  for (let i = 0; i < cols; i++) {
    let oldY = Math.floor(drops[i]);
    drops[i] += dropSpeed;
    let newY = Math.floor(drops[i]);
    
    // Light up crossed cells so rain never breaks at high speeds
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

  // Set font styling once per frame for performance
  let charWidth = fontSize * 0.6;
  ctx.font = fontSize + 'px "Space Mono", monospace';
  ctx.textBaseline = 'top';

  // 2. Pass One: Calculate hover math and draw faint background cells
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      
      // Gradually fade out the rain trail over time
      cell.intensity -= 0.015;
      if (cell.intensity < 0) cell.intensity = 0;
      
      // Randomly glitch background characters
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
      
      if (distance < radius) {
        cell.isHovered = true;
        const force = (radius - distance) / radius;
        cell.drawX += (dx / distance) * force * 40;
        cell.drawY += (dy / distance) * force * 40;
      }
      
      // Draw standard faint background cells immediately to save loops
      if (!cell.isHovered && cell.intensity === 0) {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#444444';
        ctx.fillText(cell.char, cell.drawX, cell.drawY);
      }
    }
  }

  // 3. Pass Two: Draw the high-intensity rain trails and hovered cells on top
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let cell = grid[i][j];
      if (cell.isHovered || cell.intensity > 0) {
        if (cell.isHovered) {
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = themeColor;
        } else {
          // Fade alpha with intensity
          ctx.globalAlpha = 0.2 + (cell.intensity * 0.8);
          // Only the very front of the drop gets the bright accent color
          ctx.fillStyle = cell.intensity > 0.8 ? themeColor : '#666666';
        }
        ctx.fillText(cell.char, cell.drawX, cell.drawY);
      }
    }
  }
  
  // Clean up canvas state
  ctx.globalAlpha = 1.0; 
}

function renderLoop() {
  drawCanvas();
  requestAnimationFrame(renderLoop);
}
renderLoop();