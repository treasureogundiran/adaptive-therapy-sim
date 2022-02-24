import Cell from "/src/cell.js";

import { randomRange, sleep } from "/src/utils.js";

///
let intensitySlider = document.getElementById("intensity");
let intensityDisplay = document.getElementById("intensityDisplay");
intensityDisplay.innerHTML = "Intensity: " + intensitySlider.value + "%";

intensitySlider.oninput = function () {
  intensityDisplay.innerHTML = "Intensity: " + this.value + "%";
};

let totalCellsInput = document.getElementById("totalCells");
let resistantCellsInput = document.getElementById("resistantCells");

let stateDisplay = document.getElementById("stateDisplay");
let totalCellsDisplay = document.getElementById("totalCellsDisplay");
let resistantCellsDisplay = document.getElementById("resistantCellsDisplay");
///

const MAX_CELLS = 1000;
const SIMSTATE = {
  STOPPED: 0,
  DESTROYING: 1,
  REPRODUCING: 2,
};

export default class Sim {
  constructor(simWidth, simHeight) {
    this.simWidth = simWidth;
    this.simHeight = simHeight;

    this.totalCells = totalCellsInput.value;
    this.resistantCells = resistantCellsInput.value;
    this.intensity = 0.01 * intensitySlider.value;
    this.numToDestroy = Math.floor(this.intensity * this.totalCells);

    this.cycleCount = 100;
    this.cycle = 1;

    this.cells = [];

    this.simstate = SIMSTATE.STOPPED;
  }

  populate() {
    this.cells.splice(0, this.cells.length);
    for (let i = 0; i < this.totalCells; i++) {
      let cell = new Cell(
        this,
        randomRange(20, this.simWidth - 200),
        randomRange(20, this.simHeight - 200)
      );
      this.cells.push(cell);
    }

    let numResistantCells = this.resistantCells;
    while (numResistantCells > 0) {
      let index = randomRange(0, this.cells.length);
      if (!this.cells[index].getResistance()) {
        this.cells[index].setResistance(true);
        numResistantCells -= 1;
      }
    }

    totalCellsDisplay.innerHTML = "Total Cells: " + this.cells.length;

    this.numToDestroy = Math.floor(this.intensity * this.cells.length);
    return;
  }

  async start() {
    this.simstate = SIMSTATE.DESTROYING;
    stateDisplay.innerHTML = "DESTROYING CELLS...";
    if (this.numToDestroy == 0 || this.totalCells == this.resistantCells) {
      totalCellsDisplay.innerHTML = "Total Cells: " + this.cells.length;
      return;
    }

    let index = randomRange(0, this.cells.length);
    if (!this.cells[index].getResistance()) {
      this.cells.splice(index, 1);
      this.numToDestroy -= 1;
    }
    totalCellsDisplay.innerHTML = "Total Cells: " + this.cells.length;

    await sleep(250);
    this.start();

    return;
  }

  update(deltaTime) {
    if (totalCellsInput.value > MAX_CELLS) {
      totalCellsInput.value = MAX_CELLS;
    }
    if (resistantCellsInput.value > MAX_CELLS) {
      resistantCellsInput.value = MAX_CELLS;
    }

    this.totalCells = totalCellsInput.value;
    this.resistantCells = Math.min(
      resistantCellsInput.value,
      totalCellsInput.value
    );
    this.intensity = 0.01 * intensitySlider.value;

    resistantCellsDisplay.innerHTML = "Resistant Cells: " + this.resistantCells;
  }

  draw(ctx) {
    this.cells.forEach((cell) => {
      cell.draw(ctx);
    });
  }

  stop() {
    this.simstate = SIMSTATE.STOPPED;
  }

  getState() {
    return this.simstate;
  }

  async reproduce() {
    this.simstate = SIMSTATE.REPRODUCING;
    stateDisplay.innerHTML = "REPRODUCING CELLS...";
    if (this.cells.length <= MAX_CELLS) {
      let l = this.cells.length;
      for (let i = 0; i < this.cycleCount * this.cycle - l; i++) {
        await sleep(250);
        this.cells[i].reproduce();
      }
      this.cycle += 1;
    }
    console.log(this.cells.length);
    resistantCellsDisplay.innerHTML = "Resistant Cells: " + this.resistantCells;
    stateDisplay.innerHTML = "IDLE...";
  }

  createCell(xPos, yPos, resistance) {
    if (this.cells.length < MAX_CELLS) {
      let cell = new Cell(this, xPos, yPos, resistance);
      this.cells.push(cell);
      if (resistance) this.resistantCells += 1;
    }
  }
}
