import { BUTTONTYPE } from "./enums.js";
import Button from "./button.js";

const BUTTON_SIZE = 50;
const BUTTON_SPACING = (350 - BUTTON_SIZE*4) / 5
const CONSOLE_FONT = "Berlin Sans FB"

export default class Console {
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