import { randomRange } from "/src/utils.js";
import { CELLTYPE, CELL_SIZE } from "/src/enums.js";

let cell_image = document.getElementById("imgCell");
let cancer_image = document.getElementById("imgCancer");
let chemo_image = document.getElementById("imgChemoResistant");
let radiation_image = document.getElementById("imgRadiationResistant");

export default class Cell {
  constructor(sim, celltype = CELLTYPE.HEALTHY) 
  {
    this.sim = sim;
    this.size = CELL_SIZE;
    this.position = {
      x: sim.center.x,
      y: sim.center.y,
    };
    this.celltype = celltype;
  }

  GetSize()
  {
    return this.size;
  }

  draw(ctx) {
    let img = cell_image;

    switch(this.celltype){
      
      case CELLTYPE.TREATMENT_SENSITIVE:
        img = cancer_image;
        break;

      case CELLTYPE.CHEMO_RESISTANT:
        img = chemo_image;
        break;

      case CELLTYPE.RADIATION_RESISTANT:
        img = radiation_image;
        break;

      case CELLTYPE.NULL:
        return;  

      default:
        break;
    }

    ctx.drawImage(
      img,
      this.position.x-this.size/2,
      this.position.y-this.size/2,
      this.size,
      this.size
    );
  }

  SetPos(x, y)
  {
    this.position.x = x;
    this.position.y = y;
  }

  GetPos()
  {
    return {x: this.position.x, y : this.position.y}
  }

  GetCellType()
  {
    return this.celltype;
  }

  SetCellType(type)
  {
    this.celltype = type;
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
    // let xMin = this.position.x - REPRODUCTION_RANGE;
    // let yMin = this.position.y - REPRODUCTION_RANGE;
    // let xMax = this.position.x + REPRODUCTION_RANGE;
    // let yMax = this.position.y + REPRODUCTION_RANGE;

    // if (xMin < 1) xMin = 1;
    // if (xMax > this.sim.simWidth - 85) xMax = this.sim.simWidth - 85;
    // if (yMin < 1) yMin = 1;
    // if (yMax > this.sim.simHeight - 85) yMax = this.sim.simHeight - 85;

    // if (this.resistant) this.sim.resistantCells += 1;

    // this.sim.createCell(
    //   randomRange(xMin, xMax),
    //   randomRange(yMin, yMax),
    //   this.resistant
    // );
  }
}
