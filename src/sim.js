import Cell from "/src/cell.js";

import { randomRange, sleep } from "/src/utils.js";
import { SIMSTATE } from "/src/simstates.js";

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
let cyclesDisplay = document.getElementById("cycles");
///

const MAX_CELLS = 500;

export default class Sim {
  constructor(simWidth, simHeight) {
    this.radiationImage = document.getElementById("imgRadiation");

    this.simstate = SIMSTATE.POPULATING;

    this.simWidth = simWidth;
    this.simHeight = simHeight;

    this.totalCells = totalCellsInput.value;
    this.resistantCells = resistantCellsInput.value;
    this.intensity = 0.01 * intensitySlider.value;

    this.cycleCount = 25;
    this.cycle = 1;

    this.cells = [];

    this.numToDestroy = Math.floor(this.intensity * this.cells.length);
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

    totalCellsDisplay.innerHTML = this.cells.length;

    this.numToDestroy = Math.floor(this.intensity * this.cells.length);

    this.simstate = SIMSTATE.POPULATING;
    return;
  }

  async start() {
    if (this.simstate == SIMSTATE.STOPPED) {
      this.reset();
      return;
    }
    this.simstate = SIMSTATE.DESTROYING;
    stateDisplay.innerHTML = "DESTROYING CELLS...";
    if (this.numToDestroy == 0 || this.cells.length == this.resistantCells) {
      this.simstate = SIMSTATE.POPULATING;
      this.numToDestroy = Math.floor(this.intensity * this.cells.length);
      return;
    }

    let index = randomRange(0, this.cells.length);
    if (!this.cells[index].getResistance()) {
      this.cells.splice(index, 1);
      totalCellsDisplay.innerHTML = this.cells.length;
      this.numToDestroy -= 1;
    }

    await sleep(100);
    this.start();

    return;
  }

  update(deltaTime) {
    this.setInitialValues();
  }

  draw(ctx) {
    this.cells.forEach((cell) => {
      cell.draw(ctx);
      totalCellsDisplay.innerHTML = this.cells.length;
      resistantCellsDisplay.innerHTML = this.resistantCells;
    });
    if (this.simstate == SIMSTATE.DESTROYING) {
      ctx.drawImage(this.radiationImage, 50, 50, 100, 100);
    }
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
        if (this.simstate == SIMSTATE.STOPPED) {
          this.cycle += 1;
          cyclesDisplay.innerHTML = this.cycle - 1;
          this.reset();
          return;
        }
        await sleep(100);
        this.cells[i].reproduce();
        resistantCellsDisplay.innerHTML = this.resistantCells;
        this.numToDestroy = Math.floor(this.intensity * this.cells.length);
      }
      this.cycle += 1;
      cyclesDisplay.innerHTML = this.cycle - 1;
    }
    this.numToDestroy = Math.floor(this.intensity * this.cells.length);
    stateDisplay.innerHTML = "IDLE...";

    return;
  }

  createCell(xPos, yPos, resistance) {
    if (this.cells.length < MAX_CELLS) {
      let cell = new Cell(this, xPos, yPos, resistance);
      this.cells.push(cell);
      if (resistance) this.resistantCells += 1;
    }
  }

  reset() {
    this.setInitialValues();
    stateDisplay.innerHTML = "IDLE...";
    this.populate();
  }

  getCells() {
    return { total: this.cells.length, resistant: this.resistantCells };
  }

  setInitialValues() {
    if (totalCellsInput.value > MAX_CELLS) {
      totalCellsInput.value = MAX_CELLS;
    }
    if (resistantCellsInput.value > MAX_CELLS) {
      resistantCellsInput.value = MAX_CELLS;
    }

    this.totalCells = parseInt(totalCellsInput.value);

    this.resistantCells = Math.min(
      parseInt(resistantCellsInput.value),
      this.totalCells
    );

    this.intensity = 0.01 * intensitySlider.value;

    return;
  }
}
