import { randomRange } from "/src/utils.js";

const REPRODUCTION_RANGE = 200;

export default class Cell {
  constructor(sim, xPos = 500, yPos = 500, resistance = false) {
    this.image = document.getElementById("imgCell");
    this.imageResistant = document.getElementById("imgCellResistant");

    this.sim = sim;
    this.size = 75;
    this.position = {
      x: xPos,
      y: yPos,
    };
    this.resistant = resistance;
  }

  draw(ctx) {
    if (!this.resistant) {
      ctx.drawImage(
        this.image,
        this.position.x,
        this.position.y,
        this.size,
        this.size
      );
    } else {
      ctx.drawImage(
        this.imageResistant,
        this.position.x - 4.5,
        this.position.y - 5,
        this.size + 10,
        this.size + 10
      );
    }
  }

  getResistance() {
    return this.resistant;
  }

  setResistance(resistance) {
    this.resistant = resistance;
  }

  update() {}

  distanceTo(other, taxicab = false) {
    return taxicab
      ? Math.abs(this.position.x - other.position.x) +
          Math.abs(this.position.y - other.position.y)
      : Math.sqrt(
          Math.pow(this.position.x - other.position.x, 2) +
            Math.pow(this.position.y - other.position.y, 2)
        );
  }

  reproduce() {
    let xMin = this.position.x - REPRODUCTION_RANGE;
    let yMin = this.position.y - REPRODUCTION_RANGE;
    let xMax = this.position.x + REPRODUCTION_RANGE;
    let yMax = this.position.y + REPRODUCTION_RANGE;

    if (xMin < 1) xMin = 1;
    if (xMax > this.sim.simWidth - 85) xMax = this.sim.simWidth - 85;
    if (yMin < 1) yMin = 1;
    if (yMax > this.sim.simHeight - 85) yMax = this.sim.simHeight - 85;

    if (this.resistant) this.sim.resistantCells += 1;

    this.sim.createCell(
      randomRange(xMin, xMax),
      randomRange(yMin, yMax),
      this.resistant
    );
  }
}
