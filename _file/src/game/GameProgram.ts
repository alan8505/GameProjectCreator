import { GameManager } from '../gameFrame/GameManager';
import { GameObject } from '../gameFrame/GameObject';
import { Mole } from './Mole';

export class GameProgram extends GameManager {

    score: number;
    moles: Mole[];

    constructor() {

        super();

        this.score = 0;
        this.setCountdownTime(30);

        // create moles
        var offset = 40;

        this.moles = [];
        for (let i=0; i<3; i++) {
            for (let j=0; j<3; j++) {

                let mole = new Mole();
                mole.game = this;
                mole.position.set(i*offset - offset, -10, j*offset - offset);
                let self = this;
                this.moles.push(mole);
                this.add(mole);

            }
        }

        // create backGround
        var backGround = new GameObject();
        backGround.setGeometryToPlane(200, 100);
        backGround.setTexture("assets/texture/bg_inaka_tanbo.jpg");
        backGround.position.set(0 ,50, -100);
        this.add(backGround);

        // create ground
        var ground = new GameObject();
        ground.setGeometryToPlane(300, 300);
        ground.setTexture("assets/texture/bg_ground.png");
        ground.rotateX(-Math.PI/2);
        this.add(ground);

        // for debug
        //this.createTestFunction();

    }

    public process() {}

    public gameStartEvent() {}

    public gamePauseEvent() {}

    public gameStopEvent() {

        this.score = 0;
        this.moles.forEach( function(mole) {
            mole.isActive = false;
        });

    }

    /*
    public createTestFunction() {

        var self = this;
        document.onkeydown = function(event) {

            console.log(event.key);
            if (event.key=='p') {

                if (self.getGameStatus()=="start") {
                    self.pause();
                }
                else {
                    self.start();
                }
                
            }
            
        }

    }
    */

}