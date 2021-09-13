import * as THREE from 'three';

import { CollisionManager } from './CollisionManager';
import { GameObject } from './GameObject';
import { MovableObject } from './MovableObject';
import { VFXObject } from './VFXObject';

export class GameManager {

    private gameStatus: string;

    renderer: THREE.WebGLRenderer;
    mainScene: THREE.Scene;
    mainCamera: THREE.PerspectiveCamera;

    clock: THREE.Clock;
    deltaTime: number;
    countdownTime: number;

    mouse: THREE.Vector2;

    collisionManager: CollisionManager;

    constructor() {

        this.gameStatus = "start";

        // create renderer
        this.renderer = new THREE.WebGLRenderer({alpha: true});
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.id = "renderer";

        // create main scene
        this.mainScene = new THREE.Scene();
        
        // create main camera
        this.mainCamera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 10000);
        this.mainCamera.position.y = 200;
        this.mainCamera.position.z = 200;
        this.mainCamera.lookAt(0, 0, 0);

        // create clock
        this.clock = new THREE.Clock;
        this.deltaTime = 0;
        this.countdownTime = 0;

        // create collision manager
        this.collisionManager = new CollisionManager(this);

        // add screen resize event
        var self = this;
        window.addEventListener('resize', function() {
            self.onRendererResize();
        }, false);

        // track mouse and touch position
        this.mouse = new THREE.Vector2();
        var self = this;
        window.addEventListener( 'mousemove', function(event) {
            self.mouse.x =  ( event.clientX / window.innerWidth  ) * 2 - 1;
            self.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        }, false );

        document.addEventListener('touchmove', function(event) {

            if (event.touches.length > 0) {
                self.mouse.x =  ( event.touches[0].pageX / window.innerWidth  ) * 2 - 1;
                self.mouse.y = -( event.touches[0].pageY / window.innerHeight ) * 2 + 1;
            }

        }, false);

    }

    public run() {

        requestAnimationFrame(this.run.bind(this));

        if (this.gameStatus!="start") return;
        this.deltaTime = this.clock.getDelta();
        //if (this.deltaTime > 1) return;
        if (this.countdownTime > 0 && this.getLeftTime() == 0) {
            this.pause();
            return;
        }

        var self = this;
        this.mainScene.children.forEach( function(item) {

            if ( item.visible && item instanceof MovableObject ) {
                
                item.positionUpdate(self.deltaTime);
                self.mainScene.children.forEach( function(other) {
                    if ( item == other || !other.visible || !(other instanceof GameObject) ) return;
                    self.collisionManager.collisionProcess(item, other, self.deltaTime);
                });

            }
            
            if ( item instanceof GameObject ) {

                item.children.forEach( vfx => {
                    if (vfx instanceof VFXObject) {
                        vfx.frameUpdate(self.deltaTime);
                        vfx.parallelFrameUpdate(self.deltaTime, self.mainScene);
                    }
                })

            }
            else if ( item instanceof VFXObject ) {
                item.frameUpdate(self.deltaTime);
                item.parallelFrameUpdate(self.deltaTime, self.mainScene);
            }

        });

        this.process();
        this.renderer.render(this.mainScene, this.mainCamera);

    }

    

    public start() {

        if (this.gameStatus == "stop") {
            this.clock = new THREE.Clock;
            this.mainScene.children.forEach( item => {
                if (item instanceof GameObject) {
                    item.reset();
                }
            });
        }
        this.gameStatus = "start";
        this.gameStartEvent();

    }

    public pause() {
        this.gameStatus = "pause";
        this.gamePauseEvent();
    }

    public stop() {
        this.gameStatus = "stop";
        this.gameStopEvent();
    }

    public process() {}

    public gameStartEvent() {}

    public gamePauseEvent() {}

    public gameStopEvent() {}

    public getTime() {
        return Math.round(this.clock.elapsedTime);
    }

    public getLeftTime() {
        let leftTime = this.countdownTime - this.clock.elapsedTime;
        if (leftTime <= 0) return 0;
        return Math.round(leftTime);
    }

    public setCountdownTime(time: number) {
        this.countdownTime = time;
    }

    public getGameStatus() {
        return this.gameStatus;
    }

    public isStart() {
        return this.gameStatus=="start" ? true : false;
    }

    public isPause() {
        return this.gameStatus=="pause" ? true : false;
    }

    public isStop() {
        return this.gameStatus=="stop" ? true : false;
    }

    public add(item: THREE.Object3D) {

        this.mainScene.add(item);

        if (item instanceof GameObject) {
            item.defaultPosition.copy(item.position);
            item.defaultVisible = item.visible;
        }

        if (item instanceof MovableObject) {
            item.previusPosition.copy(item.position);
            item.defaultVelocity.copy(item.velocity);
        }
    
    }

    private onRendererResize() {

        this.mainCamera.aspect = window.innerWidth / window.innerHeight;
        this.mainCamera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        if (this.gameStatus=="pause") {
            this.renderer.render(this.mainScene, this.mainCamera);
        }

    }

}