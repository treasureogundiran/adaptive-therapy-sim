import Cell from "./cell.js";
import { GetRandomUserName, randomRange, randomChoice, sleep, Logarithm, GetLayers, Shuffle } from "/src/utils.js";
import { SIMSTATE, CELLTYPE, SIM_FONT, CELL_SIZE, MUTATION_RATE, MAX_CELL_SIZE, MAX_TUMOR_SIZE, MUTATION_MULTIPLIER } from "/src/enums.js";
import HealthBar from "./healthbar.js";
import TumorBar from "./tumorbar.js";
import Console from "./console.js";
import ScoreBoard from "./scoreboard.js";

let intensitySlider = document.getElementById("intensity");
let intensityDisplay = document.getElementById("intensityDisplay");
intensityDisplay.innerHTML = "Intensity: " + intensitySlider.value + "%";

intensitySlider.oninput = function () {
  intensityDisplay.innerHTML = "Intensity: " + this.value + "%";
};

let healthyCellsInput = document.getElementById("healthyCells");
let cancerCellsInput = document.getElementById("cancerCells");
let nameInput = document.getElementById("name-input");
let treatmentSensitiveCheckbox = document.getElementById("treatment-sensitive-checkbox");
let chemoResistantCheckbox = document.getElementById("chemo-resistant-checkbox");
let radiationResistantCheckbox = document.getElementById("radiation-resistant-checkbox");

healthyCellsInput.oninput = function () {
  if (this.value >= MAX_CELL_SIZE)
  {
    this.value = MAX_CELL_SIZE
    cancerCellsInput.value = 0;
  }
}

// The number of healthy cells that are destroyed each cycle
// Equal to the number of cancer cells that are created in the same cycle
let MUTATION_COUNT = 5;

const CHANCE_OF_MUTATION = 10;

export default class Sim {
  constructor(simWidth, simHeight) {
    this.radiationImage = document.getElementById("imgRadiation");

    this.simstate = SIMSTATE.POPULATING;

    this.simWidth = simWidth;
    this.simHeight = simHeight;

    this.center = {
      x : simWidth/2 + 140,
      y : simHeight/2 + 120
    }

    this.intensity = 0.01 * intensitySlider.value;

    this.healthyCells = [];
    this.cancerCells = [];

    this.numSensitive = 0;
    this.numChemoResistant = 0;
    this.numRadiationResistant = 0;

    this.healthbar = new HealthBar(this, 10, 10);
    this.tumorbar = new TumorBar(this, 10, 75);
    this.scoreboard = new ScoreBoard(this, 10, 175);
    this.console = new Console(this, 20, this.simHeight-320);

    this.currentCycle = 0;
    this.elapsed = 0;
    this.gameOverTimer = 0;

    this.simstate = SIMSTATE.PAUSED;
    this.cancerLocations = [];
    this.healthyLocations = [];

    this.highScores = this.LoadHighScores();
    this.stats = {
      numChemoTreatments : 0,
      numRadiationTreatments : 0,
      numCycles : 0,
      intensities : []
    }

    this.username = GetRandomUserName();
  }

  GetHealthyCells()
  {
    return this.healthyCells.length;
  }

  GetCancerCells()
  {
    return this.numSensitive+this.numChemoResistant+this.numRadiationResistant;
  }

  GetNumSensitive()
  {
    return this.numSensitive;
  }

  GetNumChemoResistant()
  {
    return this.numChemoResistant;
  }

  GetNumRadiationResistant()
  {
    return this.numRadiationResistant;
  }

  GetCurrentCycle()
  {
    return this.currentCycle;
  }

  GetSimstate()
  {
    return this.simstate;
  }

  SetSimstate(simstate)
  {
    this.simstate = simstate;
  }

  HitTest(point)
  {
    this.console.HitTest(point);
  }

  Populate() {
    this.healthyCells = this.healthyCells.splice(0,this.healthyCells.length);

    this.cancerCells = this.cancerCells.splice(0,this.cancerCells.length);

    for(let i=0; i < healthyCellsInput.value; i++)
    {
      let c = new Cell(this);
      this.healthyCells.push(c);
    }

    if (!(treatmentSensitiveCheckbox.checked || chemoResistantCheckbox.checked || radiationResistantCheckbox.checked))
    {
      treatmentSensitiveCheckbox.checked = true;
    }

    for(let i=0; i < cancerCellsInput.value; i++)
    {
      let type = this.GenerateType();

      let c = new Cell(this, type);
      this.cancerCells.push(c);
      switch (type)
      {
        case CELLTYPE.CHEMO_RESISTANT:
          this.numChemoResistant++;
          break;
        case CELLTYPE.RADIATION_RESISTANT:
          this.numRadiationResistant++;
          break;
        default:
          this.numSensitive++;
      }
    }

    this.ResetLocations();
  }

  GenerateType()
  {
    let sensitive = treatmentSensitiveCheckbox.checked;
    let chemo = chemoResistantCheckbox.checked;
    let radiation = radiationResistantCheckbox.checked;
    
    if (sensitive && chemo && radiation)
    {
      return randomRange(CELLTYPE.TREATMENT_SENSITIVE, CELLTYPE.RADIATION_RESISTANT);
    }

    if(sensitive && chemo)
    {
      return randomChoice(CELLTYPE.TREATMENT_SENSITIVE, CELLTYPE.CHEMO_RESISTANT);
    }

    if(sensitive && radiation)
    {
      return randomChoice(CELLTYPE.TREATMENT_SENSITIVE, CELLTYPE.RADIATION_RESISTANT);
    }

    if(chemo && radiation)
    {
      return randomChoice(CELLTYPE.CHEMO_RESISTANT, CELLTYPE.RADIATION_RESISTANT);
    }

    if(chemo)
    {
      return CELLTYPE.CHEMO_RESISTANT;
    }

    if(radiation)
    {
      return CELLTYPE.RADIATION_RESISTANT;
    }

    return CELLTYPE.TREATMENT_SENSITIVE;
  }

  TreatWithChemo()
  {
    this.simstate = SIMSTATE.CHEMO;
    let numToDestroy = Math.round((this.GetHealthyCells() + this.GetCancerCells()) * this.intensity);

    while (numToDestroy > 0)
    {
      let index = randomRange(0,this.healthyCells.length+this.cancerCells.length-1);
      // Remove from cancer cells
      if(index >= this.healthyCells.length)
      {
        index = index - this.healthyCells.length;
        if(this.cancerCells[index].GetCellType() == CELLTYPE.CHEMO_RESISTANT)
        {
          numToDestroy--;
          continue;
        }

        let prevC = this.cancerCells.splice(index,1);
        this.cancerLocations.push({x : prevC[0].GetPos().x, y : prevC[0].GetPos().y});

        switch(prevC[0].GetCellType())
        {
          case CELLTYPE.RADIATION_RESISTANT:
            this.numRadiationResistant--;
            break;
          default:
            this.numSensitive--;
            break;
        }
      }

      // Remove from healthy cells
      else
      {
        let p = this.healthyCells.splice(index,1);
        this.healthyLocations.push({x : p[0].GetPos().x, y : p[0].GetPos().y});
      }
      numToDestroy--;
    }

    this.stats.intensities.push(this.intensity*100);
    this.stats.numChemoTreatments++;
    this.simstate = SIMSTATE.IDLE;
  }

  TreatWithRadiation()
  {
    this.simstate = SIMSTATE.CHEMO;
    let numToDestroy = Math.round((this.GetHealthyCells() + this.GetCancerCells()) * this.intensity);

    while (numToDestroy > 0)
    {
      let index = randomRange(0,this.healthyCells.length+this.cancerCells.length-1);
      
      // Remove from cancer cells
      if(index >= this.healthyCells.length)
      {
        index = index - this.healthyCells.length;
        if(this.cancerCells[index].GetCellType() == CELLTYPE.RADIATION_RESISTANT)
        {
          numToDestroy--;
          continue;
        }

        let prevC = this.cancerCells.splice(index,1);
        this.cancerLocations.push({x : prevC[0].GetPos().x, y : prevC[0].GetPos().y});

        switch(prevC[0].GetCellType())
        {
          case CELLTYPE.CHEMO_RESISTANT:
            this.numChemoResistant--;
            break;
          default:
            this.numSensitive--;
            break;
        }
      }

      // Remove from healthy cells
      else
      {
        let p = this.healthyCells.splice(index,1);
        this.healthyLocations.push({x : p[0].GetPos().x, y : p[0].GetPos().y});
      }
      numToDestroy--;
    }

    this.stats.intensities.push(this.intensity*100);
    this.stats.numRadiationTreatments++;
    this.simstate = SIMSTATE.IDLE;
  }

  Replicate()
  {
    if (this.healthyCells.length <= 0)
    {
      this.elapsed = 0;
      this.GameOver();
      return;
    }

    this.simstate = SIMSTATE.REPLICATING;
 
    // Double the number of chemo resistant cells
    let lenChemoResistant = this.numChemoResistant * (MUTATION_MULTIPLIER - 1);
    while (lenChemoResistant > 0 && this.cancerCells.length < MAX_TUMOR_SIZE)
    {
      let c = new Cell(this, CELLTYPE.CHEMO_RESISTANT);
      this.cancerCells.push(c);
      this.numChemoResistant++;
      lenChemoResistant--;
    }


    // Double the number of radiation resistant cells
    let lenRadiationResistant = this.numRadiationResistant * (MUTATION_MULTIPLIER - 1);
    while (lenRadiationResistant > 0 && this.cancerCells.length < MAX_TUMOR_SIZE)
    {
      let c = new Cell(this, CELLTYPE.RADIATION_RESISTANT);
      this.cancerCells.push(c);
      this.numRadiationResistant++;
      lenRadiationResistant--;
    }
    

    // Double the number of treatment sensitive cells
    // However, there is a chance that the treatment sensitive
    // cell will mutate into a chemo or radiation resistant cell
    let lenTreatmentSensitive = this.numSensitive * (MUTATION_MULTIPLIER - 1);
    while (lenTreatmentSensitive > 0 && this.cancerCells.length < MAX_TUMOR_SIZE )
    {
      let c = new Cell(this, CELLTYPE.TREATMENT_SENSITIVE);

      // Generate random number in the range [1,100]
      let r = randomRange(1,100);

      if ( r <= CHANCE_OF_MUTATION)
      {
        let type = randomChoice(CELLTYPE.CHEMO_RESISTANT, CELLTYPE.RADIATION_RESISTANT);
        c.SetCellType(type);
        
        switch (type)
        {
          case CELLTYPE.CHEMO_RESISTANT:
            this.numChemoResistant++;
            break;
          default:
            this.numRadiationResistant++;
            break;
        }
      }
      else
      {
        this.numSensitive++;
      }

      this.cancerCells.push(c);
      lenTreatmentSensitive--;
    }
    

    // Double the number of healthy cells
    let lenHealthy = this.healthyCells.length * (MUTATION_MULTIPLIER - 1);
    while (lenHealthy > 0 && this.healthyCells.length < MAX_CELL_SIZE - this.cancerCells.length)
    {
      let c = new Cell(this, CELLTYPE.HEALTHY);
      this.healthyCells.push(c);
      lenHealthy--;
    }

    this.ResetLocations();

    if (this.healthyCells.length <= 0 || this.cancerCells.length >= MAX_TUMOR_SIZE)
    {
      this.elapsed = 0;
      this.GameOver();
      return;
    }

    this.simstate = SIMSTATE.IDLE;
  }

  update(deltaTime) {
    if(this.simstate == SIMSTATE.STOPPED)
    {
      this.gameOverTimer += deltaTime;
      if (this.gameOverTimer >= 5000)
      {
        this.Reset();
        return;
      }
    }

    if (this.simstate != SIMSTATE.PAUSED)
    {
      this.elapsed += deltaTime;
    }

    if(this.elapsed >= MUTATION_RATE && this.simstate == SIMSTATE.IDLE)
    {
      this.currentCycle += 1;
      this.Replicate();
      this.elapsed = 0;
    }

    this.intensity = 0.01 * intensitySlider.value;
  }

  GameOver()
  {
    this.simstate = SIMSTATE.STOPPED;
    if(this.storageAvailable())
    {
      this.AddScoreToStorage();
    }
    this.gameOverTimer = 0;
  }

  storageAvailable(type)
  {
    let storage;
    let currentScores = [];
    try 
    {
      storage = window[type];
      return true;
    }
    catch(e)
    {
      return false;
    }
  }

  AddScoreToStorage()
  {
    let highScores = this.LoadHighScores();
    console.log(highScores)
    
    this.stats.numCycles = this.currentCycle;
    let s = {
      name: nameInput.value == "" ? this.username : nameInput.value,
      numCycles : this.stats.numCycles,
    };
    highScores.push(s);
    highScores.sort((a, b) => {
      return b.numCycles - a.numCycles
    });
    localStorage.setItem('highscores', JSON.stringify(highScores));
  }

  LoadHighScores()
  {
    let h = localStorage.getItem('highscores');
    if (h == null)
    {
      return [];
    }
    let highScores = JSON.parse(h);
    return highScores;
  }

  GetHighScores()
  {
    return this.highScores;
  }

  ResetHighScores()
  {
    if(this.storageAvailable("localStorage"))
    {
      localStorage.setItem("highscores", JSON.stringify([]));
      this.highScores = this.LoadHighScores();
    }
  }

  Reset()
  {
    this.healthyCells.splice(0,this.healthyCells.length);
    this.cancerCells.splice(0,this.cancerCells.length);
    this.numSensitive = 0;
    this.numChemoResistant = 0;
    this.numRadiationResistant = 0;
    this.nullHealthyCells = 0;
    this.currentCycle = 0;
    this.elapsed = 0;
    this.gameOverTimer = 0;
    this.cancerLocations = [];
    this.Populate();
    this.simstate = SIMSTATE.PAUSED;

    this.highScores = this.LoadHighScores();

    this.stats = {
      numChemoTreatments : 0,
      numRadiationTreatments : 0,
      numCycles : 0,
      intensities : []
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#b08a33";
    ctx.strokeStyle = "black";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y, 200, 0, 2*Math.PI);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.shadowBlur = 0;

    this.healthyCells.forEach((cell) => {
      cell.draw(ctx);
    }) 

    this.cancerCells.forEach((cell) => {
      cell.draw(ctx);
    })

    this.healthbar.draw(ctx);
    this.tumorbar.draw(ctx);
    this.scoreboard.draw(ctx);
    this.console.draw(ctx);

    if (this.simstate == SIMSTATE.STOPPED)
    {
      ctx.fillStyle = 'black';
      ctx.font = `100px ${SIM_FONT}`;
      let val = "GAME OVER";
      let text = ctx.measureText(val);
      ctx.fillText(val, this.simWidth/2 - text.width/2, this.simHeight/4);
      let scoreVal = `SCORE: ${this.currentCycle}`;
      let text2 = ctx.measureText(scoreVal);
      ctx.fillText(scoreVal, this.simWidth/2 - text2.width/2, this.simHeight/2)
    }

    if (this.simstate == SIMSTATE.PAUSED)
    {
      ctx.fillStyle = 'black';
      ctx.font = `100px ${SIM_FONT}`;
      let val = "PLAY";
      let text = ctx.measureText(val);
      ctx.fillText(val, this.simWidth/2 - text.width/2, this.simHeight/2);
    }
  }

  SetLocations(prevSize, layer_start, layer_end, r, cells)
  {
    let index = 0;
    for (let i = layer_start; i <= layer_end; i++)
    {
      let currSize = prevSize*2;

      // Angle = 360 deg / max number of cells on this layer
      let angle = (360 / currSize) * Math.PI / 180;

      // If this is the last layer, spread cells evenly
      if (i == layer_end)
      {
        angle = 360 / (cells.length - index);
      }

      let radius = i * r;
      let j = 0;
      while (j < currSize && index < cells.length)
      {
        let x = this.center.x - radius * Math.cos(Math.PI - j*angle);
        x = randomRange(x-10,x+10);
        let y = this.center.y - radius * Math.sin(Math.PI - j*angle);
        y = randomRange(y-10,y+10);
        cells[index].SetPos(x, y);
        index++;
        j++;
      }
      prevSize = currSize;
    }    

    return prevSize;
  }


  ResetLocations() {
    let s = CELL_SIZE;

    // radius of a layer
    let r = (s / 2) / Math.sin(2.0944);

    // Current size of cells in a layer
    let prevSize = 3/2;
    
    if(this.cancerCells.length == 1)
    {
      this.cancerCells[0].SetPos(this.center.x, this.center.y);

      let healthyLayers = 1 + GetLayers(this.cancerCells.length + this.healthyCells.length);
      prevSize = this.SetLocations(3/2, 1, healthyLayers, r, this.healthyCells);
    }
    else if(this.cancerCells.length == 2)
    {
      this.cancerCells[0].SetPos(this.center.x-s/2, this.center.y);
      this.cancerCells[1].SetPos(this.center.x+s/2, this.center.y);
      let healthyLayers = 1 + GetLayers(this.cancerCells.length + this.healthyCells.length);
      prevSize = this.SetLocations(3/2, 1, healthyLayers, r, this.healthyCells);
    }
    else
    {
      // Farthest layer to set location for cancer cells
      let cancerLayers = GetLayers(this.cancerCells.length);
      
      // Size of cells in the previous cancer layer
      prevSize = this.SetLocations(prevSize, 1, cancerLayers, r, this.cancerCells);

      let healthyLayers = 1 + GetLayers(this.cancerCells.length + this.healthyCells.length);
      
      prevSize = this.SetLocations(prevSize, cancerLayers+1, healthyLayers, r, this.healthyCells);
    }

    Shuffle(this.cancerCells);
    Shuffle(this.healthyCells);
  }
}
