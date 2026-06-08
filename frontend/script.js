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

// 3. Generative Canvas Background (The Flipping Grid)
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

let cols, rows, grid;
const fontSize = 18;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / fontSize) + 1;
  rows = Math.floor(canvas.height / fontSize) + 1;
  
  // Create a 2D array of random 1s and 0s
  grid = Array.from({length: cols}, () => 
    Array.from({length: rows}, () => Math.random() > 0.5 ? '1' : '0')
  );
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#444'; // Text color
  ctx.font = fontSize + 'px monospace';
  
  for(let i = 0; i < cols; i++) {
    for(let j = 0; j < rows; j++) {
       // Randomly flip a tiny percentage of the bits every frame
       if (Math.random() > 0.995) {
           grid[i][j] = grid[i][j] === '1' ? '0' : '1';
       }
       ctx.fillText(grid[i][j], i * fontSize, j * fontSize);
    }
  }
}

// Add canvas drawing to the main animation loop
function renderLoop() {
  drawCanvas();
  requestAnimationFrame(renderLoop);
}
renderLoop();