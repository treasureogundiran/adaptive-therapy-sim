import { SIM_FONT } from "./enums.js";

export default class ScoreBoard {
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