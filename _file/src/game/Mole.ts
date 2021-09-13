import { MovableObject } from '../gameFrame/MovableObject';
import { ReactionRecorder } from '../gameFrame/ReactionRecorder';
import { VFXObject } from '../gameFrame/VFXObject';
import { GameProgram } from './GameProgram';

export class Mole extends MovableObject {

    game: GameProgram;

    isActive: boolean;
    timer: number;

    hitVFX: VFXObject;

    reactionRecorder: ReactionRecorder;

    constructor() {

        super();

        this.isActive = false;
        this.timer = 0;

        this.setTexture("assets/texture/mole.png", true);
        this.setSize(2);
        this.rotateX(-Math.PI/4);   //稍微調整地鼠的抬頭角度

        this.hitVFX = new VFXObject('assets/texture/hit.png', 1, 2, 2, 150, 2);
        this.hitVFX.setAudio('assets/sound/poka02.mp3');
        this.hitVFX.position.y = 12;
        this.add(this.hitVFX);

        this.reactionRecorder = new ReactionRecorder();

    }

    public process(deltaTime: number) {

        this.timer += deltaTime;

        if (!this.isActive && this.timer >= 0.5) {

            if (Math.random() <= 0.1) {
                this.reactionRecorder.start();
                this.isActive = true;
                this.velocity.y = 30;
            }
            this.timer = 0;
            
        }
        else if (this.isActive) {

            if (this.position.y > 10 && this.timer <= 2) {
                this.velocity.y = 0;
                this.position.y = 10;
            }
            else if (this.position.y == 10 && this.timer > 2) {
                this.velocity.y = -30;
            }
            else if (this.position.y <= this.defaultPosition.y) {
                this.isActive = false;
                this.reset();
                this.timer = 0;
            }
            
        }

    } 

    public onClickEvent() {

        if (this.isActive) {

            this.reactionRecorder.recordDeltaTime();
            this.isActive = false;
            this.timer = 0;
            this.reset();
            this.game.score += 10;
            this.hitVFX.play();

        }

    }

}