import { BufferGeometry, MeshBasicMaterial, Vector3 } from 'three';
import { GameObject } from './GameObject';

export class MovableObject extends GameObject {

    previusPosition: Vector3;
    velocity: Vector3;
    defaultVelocity: Vector3;
    mass: number;
    isFrozen: boolean;

    constructor( geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {

        super( geometry, material );
        
        this.type = "MovableObject";
        this.previusPosition = new Vector3();
        this.velocity = new Vector3();
        this.defaultVelocity = new Vector3();
        this.mass = 1;
        this.isFrozen = false;

    }

    public copy(source) {

        super.copy( source );
        this.previusPosition = source.previusPosition.clone();
        this.velocity = source.velocity.clone();
        this.defaultVelocity = source.defaultVelocity.clone();
        this.mass = source.mass;
        this.process = source.process;
        return this;

    }

    public positionUpdate(deltaTime: number) {
        
        if (this.isFrozen) return;
        this.previusPosition.copy(this.position);
        this.position.add( this.velocity.clone().multiplyScalar(deltaTime) );
        this.process(deltaTime);

    }

    public process(deltaTime: number) {}

    public resetVelocity(){
        this.velocity.copy(this.defaultVelocity);
    }

    public reset() {
        this.resetPosition();
        this.resetVelocity();
    }

    public freeze(sec: number) {
        
        this.isFrozen = true;

        var self = this;
        setTimeout( function() {
            self.isFrozen = false;
        }, sec*1000);

    }

}
    