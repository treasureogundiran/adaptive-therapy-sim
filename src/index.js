import Sim from "/src/sim.js";
import { sleep } from "/src/utils.js";

let canvas = document.getElementById("simScreen");
let populateButton = document.getElementById("populateButton");
let startButton = document.getElementById("startButton");
let stopButton = document.getElementById("stopButton");

let ctx = canvas.getContext("2d");

const SIM_WIDTH = 1000;
const SIM_HEIGHT = 800;

let sim = new Sim(SIM_WIDTH, SIM_HEIGHT);

ctx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);

sim.populate();

let lastTime = 0;

function simLoop(timestamp) {
  let deltaTime = timestamp - lastTime;

  lastTime = timestamp;

  ctx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);

  sim.update(deltaTime);
  sim.draw(ctx);

  requestAnimationFrame(simLoop);
}

populateButton.addEventListener("click", () => {
  sim.populate();
});

startButton.addEventListener("click", async () => {
  sim.start();
  await sleep(4000);
  sim.reproduce();
});

stopButton.addEventListener("click", () => {
  sim.stop();
});

requestAnimationFrame(simLoop);
