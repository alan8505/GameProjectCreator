import { Scene, Sprite, SpriteMaterial, TextureLoader, Vector2, Vector3 } from 'three';

export class VFXObject extends Sprite {

    uvOffsets: Vector2[];
    path: string;
    row: number;
    col: number;
    frames: number;

    audio: HTMLAudioElement;
    audioPath: string;

    timer: number;
    durationTime: number;
    currentFrame: number;
    isActive: boolean;
    isLoop: boolean;

    parallelVFXObjects: VFXObject[];

    constructor(path: string, row: number, col: number, frames: number, durationTime: number, size = 1) {

        super();

        this.path = path;
        this.row = row;
        this.col = col;
        this.frames = frames;

        this.timer = 0;
        this.durationTime = durationTime;
        this.currentFrame = 0;
        this.isActive = false;
        this.isLoop = false;
        this.visible = false;
        this.setSize(size);

        this.parallelVFXObjects = [];

        this.uvOffsets = [];
        for (let i=row-1; i>=0; i--) {
            for (let j=0; j<col; j++) {
                this.uvOffsets.push( new Vector2(j/col, i/row) );
            }
        }
        for (let i=0; i<row*col-frames; i++) {
            this.uvOffsets.pop();
        }

        let tex = new TextureLoader().load( path );
        this.material = new SpriteMaterial( { map: tex } );
        this.material.transparent = true;
        this.material.map.repeat.set(1/col, 1/row);

    }

    public frameUpdate(deltaTime: number) {

        if (!this.isActive) return;
        
        this.material.map.offset.copy(this.uvOffsets[this.currentFrame]);
        this.timer += deltaTime*1000;
        this.currentFrame = this.timer / (this.durationTime/this.uvOffsets.length);
        this.currentFrame = Math.floor(this.currentFrame);
    
        if (this.currentFrame >= this.uvOffsets.length) {
            this.stop();
        }

    }

    public parallelFrameUpdate(deltaTime: number, mainScene: Scene) {

        var self = this;
        self.parallelVFXObjects.forEach( function (pvfx) {
                
            if (!pvfx.isActive) {
                mainScene.add(pvfx);
                pvfx.play();
            }

            pvfx.frameUpdate(deltaTime);

            if (self.parallelVFXObjects.length>0 && !self.parallelVFXObjects[0].isActive) {
                mainScene.remove(self.parallelVFXObjects[0]);
                self.parallelVFXObjects.shift();
            }

        });

    }

    public playParallel (position: Vector3) {

        let effect = new VFXObject(this.path, this.row, this.col, this.frames, this.durationTime);
        effect.position.copy(position);
        effect.scale.copy(this.scale);
        if (this.audio != undefined) {
            effect.setAudio(this.audioPath);
        }
        
        this.parallelVFXObjects.push(effect);

    }

    public play() {

        this.isActive = true;
        this.visible = true;
        if (this.audio != undefined) {
            this.audio.play();
        }

    }

    public pause() {
        this.isActive = false;
    }

    public stop() {

        this.isActive = false;
        this.visible = false;
        this.timer = 0;
        this.currentFrame = 0;
        this.material.map.offset.copy(this.uvOffsets[0]);

        if (this.isLoop) {
            this.play();
        }
        
    }

    public setSize(size: number) {
        this.scale.multiplyScalar(size*10);
    }

    public setAudio(path: string) {
        this.audio = new Audio(path);
        this.audioPath = path;
    }

}
    