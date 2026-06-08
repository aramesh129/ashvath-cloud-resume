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

// Custom easing for that premium snappy feel
const premiumEase = "power4.inOut";

// Create the initial load timeline
const introTimeline = gsap.timeline({ delay: 0.2 });

// A. Reveal the Hero Text Left-to-Right
introTimeline.to('.hero .gsap-reveal', {
  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
  opacity: 1,
  duration: 1.5,
  ease: premiumEase,
  stagger: 0.15 // Delays each line slightly
});

// B. Drop down the Navigation Bar
introTimeline.to('nav', {
  y: 0,
  duration: 1.2,
  ease: premiumEase
}, "-=1.0"); // Start 1 second before previous animation ends

// C. Slide in the Control Panel
introTimeline.to('#control-panel', {
  x: 0,
  duration: 1.2,
  ease: premiumEase
}, "-=1.0");

// D. ScrollTrigger for elements further down the page (About section, etc.)
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


// 3. Generative Canvas Background & Config Menu
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
let baseColor = '#555555'; 
let cols;
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
  cols = Math.floor(canvas.width / fontSize) + 1;
  
  drops = [];
  for(let i = 0; i < cols; i++) {
    drops[i] = Math.random() * -100; 
  }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCanvas() {
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
      ctx.fillStyle = themeColor; 
    } else {
      ctx.fillStyle = baseColor;
    }
    
    ctx.fillText(text, drawX, drawY);
    
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