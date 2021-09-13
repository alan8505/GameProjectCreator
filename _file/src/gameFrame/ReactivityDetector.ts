import { Clock } from 'three';

export class ReactivityDetector {

    private clock: Clock;
    private deltaTimes: number[];

    private highestScore: number;
    timeLevel: number[];
    scoreLevel: number[];

    constructor() {

        this.clock = new Clock();
        this.deltaTimes = [];

        this.timeLevel = [6, 5, 4, 3, 2, 1, 0.5, 0.3, 0.2];

    }

    public start() {
        this.clock.start();
    }

    public stop() {
        this.clock.stop();
    }

    public reset() {
        this.deltaTimes = [];
    }

    public recordTime() {

        let time = this.clock.getDelta();
        if (time >= 0.1) {
            this.deltaTimes.push( time );
        }
        this.clock.stop();

    }

    public getAverageTime() {

        if (this.deltaTimes.length==0) return 0;
        var total = 0;
        this.deltaTimes.forEach( function(time) {
            total += time;
        });
        return total / this.deltaTimes.length;

    }

    public getLevelByTime() {

        var averageTime = this.getAverageTime();
        if (averageTime==0) return null;
        for (let i=0; i<=9; i++) {
            if (averageTime >= this.timeLevel[i]) {
                return i;
            }
        }

    }

    public setHighestScore(score: number) {

        if (score <= 0) return;
        this.highestScore = score;
        this.scoreLevel = [];
        for (let i=1; i<=10; i++) {
            this.scoreLevel.push(this.highestScore/10*i);
        }

    }

    public getLevelByScore(score: number) {

        if (this.highestScore==undefined) return;
        for (let i=0; i<=9; i++) {
            if (score <= this.scoreLevel[i]) {
                return i;
            }
        }
        return 9;

    }

}