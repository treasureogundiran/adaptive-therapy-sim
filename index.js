///CONSTANTS FOR THE SIMULATION
const SIMSTATE = { STOPPED: 0, CHEMO: 1, RADIATION : 2, REPLICATING: 3, PAUSED: 4 };
const CELLTYPE = { HEALTHY : 0, TREATMENT_SENSITIVE : 1, CHEMO_RESISTANT : 2, RADIATION_RESISTANT : 3, NULL : 4 }
const BUTTONTYPE = { PAUSE : 0, CHEMO : 1, RADIATION : 2, RESET : 3 }
const MAX_TUMOR_SIZE = 5000;
const MAX_CELL_SIZE = 10000;
const CELL_SIZE = 10;
const MUTATION_RATE = 8000;
const MUTATION_MULTIPLIER = 2;
const CHANCE_OF_MUTATION = 10;
const BUTTON_SIZE = 50;
const BUTTON_SPACING = (350 - BUTTON_SIZE*4) / 5
const BUTTON_MARGIN = 6;
const SIM_FONT = 'Berlin Sans FB';
const CONSOLE_FONT = "Berlin Sans FB"
const USERNAMES = ["mildzebra", "workmancoffee", "sailordrone", "roadman", "classicferret", "cookiesleather", "milkysweep", "bakeleather", "skilletsocial", "picklespipe", "remotehumor"]
let MUTATION_COUNT = 5;



/// GRAB THE HTML ELEMENTS THAT INTERACT WITH THE SIM
/// AND ASSIGN NAMES TO THEM
let intensitySlider = document.getElementById("intensity");
let intensityDisplay = document.getElementById("intensityDisplay");
intensityDisplay.innerHTML = "Intensity: " + intensitySlider.value + "%";
let canvas = document.getElementById("simScreen");
let imgBackground = document.getElementById("imgBackground");
let resetHighscoresButton = document.getElementById("reset-highscores");
let modal = document.getElementById("instructions-modal");
let modalButton = document.getElementById("instructions-button");
let modalCloseButton = document.getElementById("close-instructions-modal");
let healthyCellsInput = document.getElementById("healthyCells");
let cancerCellsInput = document.getElementById("cancerCells");
let nameInput = document.getElementById("name-input");
let treatmentSensitiveCheckbox = document.getElementById("treatment-sensitive-checkbox");
let chemoResistantCheckbox = document.getElementById("chemo-resistant-checkbox");
let radiationResistantCheckbox = document.getElementById("radiation-resistant-checkbox");
let cell_image = document.getElementById("imgCell");
let cancer_image = document.getElementById("imgCancer");
let chemo_image = document.getElementById("imgChemoResistant");
let radiation_image = document.getElementById("imgRadiationResistant");



/// HELPER FUNCTIONS FOR THE SIMULATION

/**
 * Return a random number from a range
 * @param {*} min minimum number
 * @param {*} max maximum number
 * @returns random number
 */
function randomRange(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
}

/**
 * Return a random choice between two values
 * @param {*} val1 value 1
 * @param {*} val2 value 2
 * @returns random choice
 */
function randomChoice(val1, val2)
{
    return [val1, val2][Math.round(Math.random())];
}

/**
 * Pause the program
 * @param {*} ms number of milliseconds to pause for
 * @returns Asynchronous promise
 */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get the logarithm to base 'b' of a number 'n'
 * @param {*} b base
 * @param {*} n number
 * @returns logarithm
 */
function Logarithm(b, n) {
    return Math.log(n) / Math.log(b);
}

/**
 * Get the number of layers for the cell cloud, 
 * given a population of cells
 * @param {*} n number of cells
 * @returns number of layers
 */
function GetLayers(n) {
    let layer = 0;
    let t = n;
    while (t > 0)
    {
        t = (t - 3) / 2
        layer += 1;
    }
    return layer;
}

/**
 * Shuffle an array in place
 * @param {*} arr array to shuffle
 */
function Shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--)
    {
        const j = randomRange(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

/**
 * Get a random username
 * @returns random username
 */
function GetRandomUserName()
{
    return `${USERNAMES[randomRange(0,USERNAMES.length - 1)]}${randomRange(0,100)}`;
}  



/**
 * MAIN CLASS FOR A CONSOLE BUTTON
 */
class Button {
    constructor(sim, x, y, bgColor, strokeColor, type=BUTTONTYPE.POPULATE)
    {
        this.sim = sim;
        this.position = {
            x : x,
            y : y
        };

        this.size = 50;
        this.center = {
            x : this.position.x + this.size/2,
            y : this.position.y + this.size/2
        }
        this.backgroundColor = bgColor;
        this.strokeColor = strokeColor;
        this.type = type;
    }

    draw(ctx)
    {
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 4;

        ctx.beginPath();
        ctx.shadowBlur = 3;
        ctx.shadowColor = '#000000';
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = this.backgroundColor;
        ctx.arc(this.center.x, this.center.y,25,0,2*Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.font = 'bold 16px Calibiri';

        switch (this.type)
        {
            case BUTTONTYPE.PAUSE:
                this.sim.GetSimstate() == SIMSTATE.PAUSED ? this.DrawTriangle(ctx) : this.DrawPause(ctx);
                break;
            case BUTTONTYPE.CHEMO:
                this.DrawBox(ctx);
                break;
            case BUTTONTYPE.RADIATION:
                this.DrawCross(ctx);
                break;
            default: // Reset
                this.DrawCircle(ctx);
                break;
        }

    }

    DrawPause(ctx)
    {
        let offset = (this.size/2 - BUTTON_MARGIN) * Math.sin(0.785398);

        ctx.lineWidth = 4;
        ctx.moveTo(this.center.x - BUTTON_MARGIN, this.center.y - offset)
        ctx.lineTo(this.center.x - BUTTON_MARGIN, this.center.y + offset)
        ctx.stroke();

        ctx.moveTo(this.center.x + BUTTON_MARGIN, this.center.y - offset)
        ctx.lineTo(this.center.x + BUTTON_MARGIN, this.center.y + offset)
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.fillText('Pause',this.position.x, this.position.y + this.size + 16);
        ctx.lineWidth = 4;
    }

    DrawTriangle(ctx)
    {
        ctx.beginPath();
        ctx.moveTo(this.center.x,this.center.y - this.size/2 + BUTTON_MARGIN)
        ctx.lineTo(this.center.x + (this.size/2-BUTTON_MARGIN)*Math.cos(0.523599), this.center.y+(this.size/2-BUTTON_MARGIN)*Math.sin(0.523599));
        ctx.stroke();

        ctx.moveTo(this.center.x + (this.size/2-BUTTON_MARGIN)*Math.cos(0.523599), this.center.y+(this.size/2-BUTTON_MARGIN)*Math.sin(0.523599))
        ctx.lineTo(this.center.x - (this.size/2-BUTTON_MARGIN)*Math.cos(0.523599), this.center.y+(this.size/2-BUTTON_MARGIN)*Math.sin(0.523599));
        ctx.stroke();

        ctx.moveTo(this.center.x - (this.size/2-BUTTON_MARGIN)*Math.cos(0.523599), this.center.y+(this.size/2-BUTTON_MARGIN)*Math.sin(0.523599))
        ctx.lineTo(this.center.x,this.center.y - this.size/2 + BUTTON_MARGIN);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#000000';
        ctx.fillText('Play',this.position.x+10, this.position.y + this.size + 16);
    }

    DrawBox(ctx)
    {
        let offset = (this.size/2 - BUTTON_MARGIN) * Math.sin(0.785398);
        ctx.beginPath();
        ctx.moveTo(this.center.x - offset,this.center.y - offset)
        ctx.lineTo(this.center.x + offset, this.center.y - offset);
        ctx.stroke();

        ctx.moveTo(this.center.x + offset, this.center.y - offset)
        ctx.lineTo(this.center.x + offset, this.center.y + offset);
        ctx.stroke();

        ctx.moveTo(this.center.x + offset, this.center.y + offset)
        ctx.lineTo(this.center.x - offset, this.center.y + offset);
        ctx.stroke();

        ctx.moveTo(this.center.x - offset, this.center.y + offset)
        ctx.lineTo(this.center.x - offset, this.center.y - offset);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#000000';
        ctx.fillText('Chemo',this.position.x, this.position.y + this.size + 16);
    }

    DrawCross(ctx)
    {
        let offset = (this.size/2 - BUTTON_MARGIN) * Math.sin(0.785398);
        
        ctx.beginPath();
        ctx.moveTo(this.center.x - offset,this.center.y - offset)
        ctx.lineTo(this.center.x + offset, this.center.y + offset);
        ctx.stroke();

        ctx.moveTo(this.center.x + offset, this.center.y - offset)
        ctx.lineTo(this.center.x - offset, this.center.y + offset);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#000000';
        ctx.fillText('Radiation',this.position.x, this.position.y + this.size + 16);
    }

    DrawCircle(ctx)
    {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.size/2-BUTTON_MARGIN-3, 0, 2*Math.PI);
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = '#000000';
        ctx.fillText('Reset',this.position.x, this.position.y + this.size + 16);
    }


    HitTest(point)
    {
        let distance = Math.sqrt((this.center.x-point.x)**2+(this.center.y-point.y)**2);
        if (distance < this.size/2)
        {
            switch(this.type)
            {
                case BUTTONTYPE.PAUSE:
                    this.sim.GetSimstate() == SIMSTATE.PAUSED ? this.sim.SetSimstate(SIMSTATE.IDLE) : this.sim.SetSimstate(SIMSTATE.PAUSED);
                    break;
                case BUTTONTYPE.CHEMO:
                    if(this.sim.simstate == SIMSTATE.IDLE)
                    {
                        this.sim.TreatWithChemo();
                    }
                    break;
                case BUTTONTYPE.RADIATION:
                    if(this.sim.simstate == SIMSTATE.IDLE)
                    {
                        this.sim.TreatWithRadiation();
                    }
                    break;
                default:    // Reset
                if(this.sim.simstate == SIMSTATE.IDLE)
                {}
                    this.sim.Reset();
                    break;
            }
        }
    }
}



/**
 * MAIN CLASS FOR THE CONSOLE
 * THE CONSOLE DISPLAYS INFORMATION ABOUT THE CELLS
 * IN THE SIMULATION
 */
class Console {
    constructor(sim, x, y)
    {
        this.sim = sim;
        this.position = {
            x : x,
            y : y
        }
        this.width = 350;
        this.height = 287;

        this.pauseButton = new Button(sim, this.position.x + BUTTON_SPACING, this.position.y + 192 + BUTTON_SIZE/2 - 8, 'rgb(0,0,250)', 'rgb(0,0,50)', BUTTONTYPE.PAUSE);

        this.chemoButton = new Button(sim, this.position.x + BUTTON_SPACING*2 + BUTTON_SIZE, this.position.y + 192 + BUTTON_SIZE/2 - 8, 'rgb(0,215,0)', 'rgb(0,50,0)', BUTTONTYPE.CHEMO);

        this.radiationButton = new Button(sim, this.position.x + BUTTON_SPACING*3 + BUTTON_SIZE*2 , this.position.y + 192 + BUTTON_SIZE/2 - 8, 'rgb(200,200,0)', 'rgb(25,25,0)', BUTTONTYPE.RADIATION);

        this.resetButton = new Button(sim, this.position.x + BUTTON_SPACING*4 + BUTTON_SIZE*3 , this.position.y + 192 + BUTTON_SIZE/2 - 8, 'rgb(250,0,0)', 'rgb(50,0,0)', BUTTONTYPE.RESET);

        this.buttons = [this.pauseButton, this.chemoButton, this.radiationButton, this.resetButton];
    }

    draw(ctx)
    {
        // Draw the background for the console
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#000000';
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = '#616161';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw the border
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#262626';
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        ctx.shadowBlur = 1;
        // Draw the console screen
        ctx.fillStyle = 'black';
        ctx.fillRect(this.position.x + 8, this.position.y + 8, this.width - 16, 192)

        ctx.fillStyle = 'white';
        ctx.font = `24px ${CONSOLE_FONT}`;

        let val = `${this.sim.GetHealthyCells()}`;
        let text = ctx.measureText(val);
        ctx.fillText('Healthy Cells: ', this.position.x + 16, this.position.y + 30, this.width-32-text.width);
        ctx.fillText(val, this.position.x + this.width - text.width - 16, this.position.y + 30);

        val = `${this.sim.GetCancerCells()}`;
        text = ctx.measureText(val);
        ctx.fillText('Cancer Cells: ', this.position.x + 16, this.position.y + 54, this.width-32-text.width);
        ctx.fillText(val, this.position.x + this.width - text.width - 16, this.position.y + 54);

        val = '------------------------';
        text = ctx.measureText(val);
        ctx.fillText(val, this.position.x + 16, this.position.y + 76, this.width-32);

        val = `${this.sim.GetNumSensitive()}`;
        text = ctx.measureText(val);
        ctx.fillText('Treatment Sensitive: ', this.position.x + 16, this.position.y + 98, this.width-32-text.width);
        ctx.fillText(val, this.position.x + this.width - text.width - 16, this.position.y + 98);

        val = `${this.sim.GetNumChemoResistant()}`;
        text = ctx.measureText(val);
        ctx.fillText('Chemo Resistant: ', this.position.x + 16, this.position.y + 120, this.width-32-text.width);
        ctx.fillText(val, this.position.x + this.width - text.width - 16, this.position.y + 120);

        val = `${this.sim.GetNumRadiationResistant()}`;
        text = ctx.measureText(val);
        ctx.fillText('Radiation Resistant: ', this.position.x + 16, this.position.y + 142, this.width-32-text.width);
        ctx.fillText(val, this.position.x + this.width - text.width - 16, this.position.y + 142);

        val = '------------------------';
        text = ctx.measureText(val);
        ctx.fillText(val, this.position.x + 16, this.position.y + 164, this.width-32);

        val = `${this.sim.GetCurrentCycle()}`;
        text = ctx.measureText(val);
        ctx.fillText('Current Cycle: ', this.position.x + 16, this.position.y + 186, this.width-32-text.width);
        ctx.fillText(val, this.position.x + this.width - text.width - 16, this.position.y + 186);
        
        this.buttons.forEach((button) => {
            button.draw(ctx);
        });
    }

    HitTest(point)
    {
        this.buttons.forEach((button) => {
            button.HitTest(point);
        });
    }
}



/**
 * MAIN CLASS FOR A SCOREBOARD
 * THIS CLASS DISPLAYS THE HIGH SCORES FOR THE CURRENT BROWSER
 */
class ScoreBoard {
    constructor(sim, x, y)
    {
        this.sim = sim;
        this.position = {
            x : x,
            y : y
        }
        this.width = 300;
        this.height = 275;
    }

    draw(ctx)
    {
        let highScores = this.sim.GetHighScores();
        
        ctx.font = `26px ${SIM_FONT}`;
        
        ctx.fillStyle = '#d16900';
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        ctx.fillStyle = '#fffbf7';
        ctx.fillRect(this.position.x + 5, this.position.y + 40, this.width - 10, this.height - 45);
    
        let title = 'High Scores';
        let text1 = ctx.measureText(title);
        ctx.fillStyle = 'black';
        ctx.fillText(title, this.position.x + this.width / 2 - text1.width/2, this.position.y + 28);

        let diff = (this.width - 10) / 4;
        let rankPos = this.position.x + 5 + diff/2;
        let scorePos = this.position.x + 5 + 3*diff/2;
        let namePos = this.position.x + 5 + 3*diff;

        ctx.font = `22px ${SIM_FONT}`;

        let rankTitle = "Rank";
        let text2 = ctx.measureText(rankTitle);
        ctx.fillText(rankTitle, rankPos - text2.width/2, this.position.y + 65);

        let scoreTitle = "Score";
        let text3 = ctx.measureText(scoreTitle);
        ctx.fillText(scoreTitle, scorePos - text3.width/2, this.position.y + 65);

        let nameTitle = "Name";
        let text4 = ctx.measureText(nameTitle);
        ctx.fillText(nameTitle, namePos - text4.width/2, this.position.y + 65);

        for(let i=1; i < highScores.length + 1 && i < 9; i++)
        {
            let name = highScores[i-1].name;
            let score = highScores[i-1].numCycles;
            let n = ctx.measureText(name);
            let s = ctx.measureText(score);
            let r = ctx.measureText(i);

            ctx.fillText(i, rankPos - r.width/2, this.position.y + 65 + i*24);
            ctx.fillText(score, scorePos - s.width/2, this.position.y + 65 + i*24);
            ctx.fillText(name, namePos - n.width/2, this.position.y + 65 + i*24);
        }

    }
}



/**
 * MAIN CLASS FOR A TUMORBAR
 * THIS CLASS DISPLAYS INFORMATION ABOUT
 * THE NUMBER OF TUMORS OF THE PATIENT IN THE SIM
 */
class TumorBar {
    constructor(sim, x, y)
    {
        this.sim = sim;
        this.position = {
            x : x,
            y : y
        }
        this.width = 300;
        this.height = 20;
    }

    draw(ctx)
    {
        ctx.fillStyle = 'Black';
        ctx.font = `22px ${SIM_FONT}`;

        let val = `Tumor Size: ${this.sim.GetCancerCells()}`;
        let text = ctx.measureText(val);
        ctx.fillText(val, this.position.x + this.width / 2 - text.width / 2, this.position.y + 10);        ctx.lineWidth = 2;
        
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y + 15, this.width, this.height);
        ctx.fillRect(this.position.x, this.position.y + 15, this.width, this.height);
        let w = (this.width-8) * this.sim.GetCancerCells() / MAX_TUMOR_SIZE;

        ctx.fillStyle = `#ff8030`;


        ctx.fillRect(this.position.x+4, this.position.y+4+15, w , this.height-8);

        ctx.fillStyle = `black`;
        ctx.fillText('0', this.position.x, this.position.y + 55);
        
        let m = `${MAX_TUMOR_SIZE}`;
        let text2 = ctx.measureText(m);
        ctx.fillText(m, this.position.x + this.width - text2.width, this.position.y + 55);
    }
}


/**
 * MAIN CLASS FOR A HEALTHBAR
 * THIS CLASS DISPLAYS INFORMATION ABOUT
 * THE HEALTH OF THE PATIENT IN THE SIM
 */
class HealthBar {
    constructor(sim, x, y)
    {
        this.sim = sim;
        this.position = {
            x : x,
            y : y
        }
        this.width = 300;
        this.height = 20;
    }

    draw(ctx)
    {
        ctx.fillStyle = 'Black';
        ctx.font = `22px ${SIM_FONT}`;

        let val = `Healthy: ${this.sim.GetHealthyCells()}`;
        let text = ctx.measureText(val);

        ctx.fillText(val, this.position.x + this.width / 2 - text.width / 2, this.position.y + 10);        ctx.lineWidth = 2;
        ctx.strokeRect(this.position.x, this.position.y + 15, this.width, this.height);
        ctx.fillRect(this.position.x, this.position.y + 15, this.width, this.height);
        let w = (this.width-8) * this.sim.GetHealthyCells() / MAX_CELL_SIZE;

        ctx.fillStyle = `rgb(
            ${255*((this.width-8-w)/(this.width-8))},
            ${255*(w/(this.width-8))},
            0)`;


        ctx.fillRect(this.position.x+4, this.position.y+4+15, w , this.height-8);

        ctx.fillStyle = 'black';
        ctx.fillText('0', this.position.x, this.position.y + 55);
        
        let m = `${MAX_CELL_SIZE}`;
        let text2 = ctx.measureText(m);
        ctx.fillText(m, this.position.x + this.width - text2.width, this.position.y + 55);
    }
}



/**
 * MAIN CLASS FOR A CELL
 */
class Cell {
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



/**
 * MAIN CLASS FOR THE SIMULATION
 * THIS CLASS HOLDS AND CONTROLS ALL OBJECTS IN THE SIMULATION
 */
class Sim {
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



/// CREATE A SIMULATION OBJECT AND POPULATE IT WITH CELLS
const SIM_WIDTH = 1000;
const SIM_HEIGHT = 800;
let sim = new Sim(SIM_WIDTH, SIM_HEIGHT);
sim.Populate();


/// SET UP THE CANVAS FOR DRAWING THE SIM
let ctx = canvas.getContext("2d");


/**
 * MAIN LOOP FOR THE SIMULATION
 * THIS FUNCTION CAUSES THE CANVAS TO REDRAW
 * EVERYTIME THERE IS A TIME UPDATE
 */
ctx.clearRect(0, 0, SIM_WIDTH, SIM_HEIGHT);
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


/**
 * EVENT LISTENERS FOR THE SIMULATION
 */
canvas.addEventListener('click', (e)=>{
  sim.HitTest({x : e.offsetX, y : e.offsetY})
});

intensitySlider.oninput = function () {
    intensityDisplay.innerHTML = "Intensity: " + this.value + "%";
};

healthyCellsInput.oninput = function () {
    if (this.value >= MAX_CELL_SIZE)
    {
      this.value = MAX_CELL_SIZE
      cancerCellsInput.value = 0;
    }
}

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
