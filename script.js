const cvs = document.querySelector("#canvas");
const ctx = cvs.getContext("2d");
cvs.focus();

const imgs = ['bird', 'bg', 'fg', 'pipeNorth', 'pipeSouth'];
const promises = [];
const loadedImgs = {};
const loadedSounds = {};

imgs.map(img => {
  const image = new Image();
  image.src = `images/${img}.png`;
  const promise = new Promise((res, rej) => {
    image.onload = res;
    image.onerror = rej;
  })
  promises.push(promise);
  loadedImgs[img] = image; 
})

var fly = new Audio();
var score = new Audio();

fly.src = "sounds/fly.mp3";
score.src = "sounds/score.mp3";

Promise.all(promises).then(start).catch(() => console.warn("Image or sound file not found"));

function start() {
  const { bird, bg, fg, pipeNorth, pipeSouth } = loadedImgs;

  const gap = 70;
  const fgHeight = cvs.height - 80;
  const birdCoords = {
    x: 10,
    y: cvs.height / 2,
  };
  const gravity = 1.5;

  let totalScore = 0;

  const pipes = [
    {
      x: cvs.width - pipeNorth.width,
      y: pipeNorth.height,
    }
  ]

  document.addEventListener("keydown", jump);

  function jump() {
    if (birdCoords.y > 30) {
      fly.play();
      birdCoords.y -= 30;
    }
  }

  function getRandom(min, max) {
    return Math.random() * (max - min) + min;
  }

  function drawPipes() {
    pipes.map(pipe => {
      ctx.drawImage(pipeNorth, pipe.x, pipe.y - pipeNorth.height);
      ctx.drawImage(pipeSouth, pipe.x, pipe.y + gap);
      if (pipe.x === 50) {
        pipes.push({
          x: cvs.width,
          y: getRandom(80, pipeNorth.height),
        })
      }
      if (pipe.x === 10) {
        totalScore++;
        score.play();
      }
      checkCollision(pipe.x, pipe.y)
      pipe.x--;
    })
  }

  function checkCollision(x, y) {
    const birdMargins = {
      left: birdCoords.x,
      right: birdCoords.x + bird.width,
      top: birdCoords.y,
      bottom: birdCoords.y + bird.height,
    }
    const { left, right, top, bottom } = birdMargins;
    const failed = bottom > fgHeight
      || (top < y && right > x && left < x + pipeNorth.width)
      || (bottom > y + gap && right > x && left < x + pipeNorth.width)
    if (failed) {
      location.reload();
    }
  }

  function draw() {
    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(bird, birdCoords.x, birdCoords.y);

    birdCoords.y += gravity;

    drawPipes();
    ctx.drawImage(fg, 0, fgHeight);

    ctx.fillText("Score : "+ totalScore, 10, cvs.height - 20);

    checkCollision();
    requestAnimationFrame(draw);
  }

  draw();
}
