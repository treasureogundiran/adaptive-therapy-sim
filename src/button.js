import { SIMSTATE } from "./enums.js";
import { BUTTONTYPE } from "./enums.js";

const BUTTON_MARGIN = 6;

export default class Button {
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