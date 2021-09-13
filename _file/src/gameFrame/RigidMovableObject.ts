import { BufferGeometry, MeshBasicMaterial, Raycaster, Vector2 } from 'three';
import { GameManager } from './GameManager';
import { MovableObject } from './MovableObject';

export class RigidMovableObject extends MovableObject {

    protected game: GameManager;
    protected mouse: Vector2;
    protected raycaster: Raycaster;
    protected keyState = {};

    isMouseControl: boolean;
    isTouchControl: boolean;
    isKeyboardControl: boolean;
    controllSpeed: number;

    // for movable area
    offset: { front: number, back: number,left: number , right: number };

    constructor( geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {

        super(geometry, material);
        this.type = "RigidMovableObject";

        this.isMouseControl = false;
        this.isTouchControl = false;
        this.isKeyboardControl = false;

    }

    public positionUpdate(deltaTime: number) {

        if (this.isFrozen) return;
        this.previusPosition.copy(this.position);

        if (this.isMouseControl || this.isTouchControl) {

            this.raycaster.setFromCamera( this.game.mouse, this.game.mainCamera );
            let intersects = this.raycaster.intersectObjects( this.game.mainScene.children );
            if (intersects.length > 0) {
                this.position.x = intersects[0].point.x;
                this.position.z = intersects[0].point.z;
            }

        }
        if (this.isKeyboardControl) {

            if (this.keyState["ArrowRight"]) {
                this.position.x += this.controllSpeed;
            }
            if (this.keyState["ArrowLeft"]) {
                this.position.x -= this.controllSpeed;
            }
            if (this.keyState["ArrowUp"]) {
                this.position.z -= this.controllSpeed;
            }
            if (this.keyState["ArrowDown"]) {
                this.position.z += this.controllSpeed;
            }
            
        }

        this.process(deltaTime);
        this.movableAreaLimit();

    }

    public setMouseControll(game: GameManager) {

        this.isMouseControl = true;
        this.game = game;
        this.mouse = new Vector2(this.position.x, this.position.z);
        this.raycaster = new Raycaster();

        var self = this;
        window.addEventListener( 'mousemove', function(event) {
            self.mouse.x =  ( event.clientX / window.innerWidth  ) * 2 - 1;
            self.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        }, false );

    }

    public setTouchControll(game: GameManager) {

        this.isTouchControl = true;
        this.game = game;
        this.mouse = new Vector2(this.position.x, this.position.z);
        this.raycaster = new Raycaster();

        var self = this;
        document.addEventListener('touchmove', function(event) {
            if (event.touches.length > 0) {
                self.mouse.x =  ( event.touches[0].pageX / window.innerWidth  ) * 2 - 1;
                self.mouse.y = -( event.touches[0].pageY / window.innerHeight ) * 2 + 1;
            }
        }, false);

    }

    public setKeyboardControll(speed = 1) {

        var self = this;
        this.isKeyboardControl = true;
        this.controllSpeed = speed;

        window.addEventListener('keydown', function(event) {
            self.keyState[event.key] = true;
        }, true);

        window.addEventListener('keyup', function(event) {
            self.keyState[event.key] = false;
        }, true);

    }

    protected movableAreaLimit() {

        if (this.offset==undefined) return;

        if (this.position.x > this.offset.right) {
            this.position.x = this.offset.right;
        }
        if (this.position.x < this.offset.left) {
            this.position.x = this.offset.left;
        }
        if (this.position.z > this.offset.front) {
            this.position.z = this.offset.front;
        }
        if (this.position.z < this.offset.back) {
            this.position.z = this.offset.back;
        }

    }

    public setMovableArea( front: number, back: number, left: number, right: number ) {

        if (this.isCollisionShapeRectangle()) {

            let a = right - this.width/2;
            let b = left + this.width/2;
            let c = front - this.depth/2;
            let d = back + this.depth/2;
            this.offset = {right: a, left: b, front: c, back: d};

        }
        else if (this.isCollisionShapeCircle()) {

            let a = right - this.radius;
            let b = left + this.radius;
            let c = front - this.radius;
            let d = back + this.radius;
            this.offset = {right: a, left: b, front: c, back: d};

        }

    }

}
    