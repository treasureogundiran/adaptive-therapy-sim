import { MAX_CELL_SIZE, SIM_FONT } from "/src/enums.js";

export default class HealthBar {
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