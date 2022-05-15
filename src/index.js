import Sim from "/src/sim.js";
import { sleep } from "/src/utils.js";
import { SIMSTATE } from "/src/enums.js";


let canvas = document.getElementById("simScreen");
let imgBackground = document.getElementById("imgBackground");
let resetHighscoresButton = document.getElementById("reset-highscores");
let modal = document.getElementById("instructions-modal");
let modalButton = document.getElementById("instructions-button");
let modalCloseButton = document.getElementById("close-instructions-modal");
let ctx = canvas.getContext("2d");

const SIM_WIDTH = 1000;
const SIM_HEIGHT = 800;

let sim = new Sim(SIM_WIDTH, SIM_HEIGHT);

ctx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);

sim.Populate();

let lastTime = 0;

function simLoop(timestamp) {
  let deltaTime = timestamp - lastTime;

  lastTime = timestamp;

  ctx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);

  ctx.drawImage(
    imgBackground,
    0,
    -300,
    SIM_WIDTH + 300,
    SIM_HEIGHT + 300
  );

  sim.update(deltaTime);
  sim.draw(ctx);

  requestAnimationFrame(simLoop);
}

canvas.addEventListener('click', (e)=>{
  sim.HitTest({x : e.offsetX, y : e.offsetY})
});

resetHighscoresButton.addEventListener('click', (e)=>{
  sim.ResetHighScores();
})

modalButton.onclick = function()
{
  modal.style.display = "block";
}

modalCloseButton.onclick = function()
{
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

requestAnimationFrame(simLoop);
