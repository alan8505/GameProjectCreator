import { Vector2, Vector3, Raycaster } from 'three';

import { GameObject } from './GameObject';
import { MovableObject } from './MovableObject';
import { RigidMovableObject } from './RigidMovableObject';
import { GameManager } from './GameManager';

export class CollisionManager {

    private status: string;
    game: GameManager;

    raycaster: Raycaster;

    constructor(game: GameManager) {

        this.status = "start";
        this.game = game;

        this.raycaster = new Raycaster();

        var self = this;
        document.addEventListener('mouseup', function() {

            if ( self.game.getGameStatus() != "start" ) return;
            self.raycaster.setFromCamera( self.game.mouse, self.game.mainCamera );
            let intersects = self.raycaster.intersectObjects(self.game.mainScene.children);
            
            if (intersects.length > 0 && intersects[0].object instanceof GameObject) {
                intersects[0].object.onClickEvent();
            }

        }, false);

    }

    public collisionProcess(item: MovableObject , other: GameObject ,deltaTime: number) {

        if (this.status == "pause") return;

        if (item instanceof RigidMovableObject && other instanceof MovableObject) {
            this.rigidCircleCollision(item, other, deltaTime);
        }

        this.circleCollision(item, other);
        this.circleRectangleCollision(item, other);
        
    }

    public start() {
        this.status = "start";
    }

    public pause() {
        this.status = "pause";
    }

    public getStatus() {
        return this.status;
    }

    private circleCollision(circle: MovableObject, other: GameObject) {

        if ( !(circle.isCollisionShapeCircle()) ) return;
        if ( !(other.isCollisionShapeCircle()) ) return;
        if ( circle instanceof RigidMovableObject ) return;
        if ( other instanceof RigidMovableObject ) return;

        let c1 = circle.position.y+circle.radius;
        let c2 = circle.position.y-circle.radius;
        let r1 = other.position.y+other.radius;
        let r2 = other.position.y-other.radius;
        if (c1>=r1 && c1>=r2 && c2>=r1 && c2>=r2) return;
        if (c1<=r1 && c1<=r2 && c2<=r1 && c2<=r2) return;
        
        let d = circle.position.distanceTo(other.position);
        if (d >= circle.radius + other.radius) return;

        let x = circle.position.x - other.position.x;
        let z = circle.position.z - other.position.z;

        circle.position.x += (circle.radius + other.radius - d) / d * x;
        circle.position.z += (circle.radius + other.radius - d) / d * z;
        
        let velocity1, velocity2;
        velocity1 = new Vector2( circle.velocity.x, circle.velocity.z );
        if (other instanceof MovableObject) {
            velocity2 = new Vector2( other.velocity.x, other.velocity.z );
        }
        else {
            velocity2 = new Vector2(0, 0);
        }
        
        let vNorm = new Vector2(x, z);
    
        let unitVNorm = vNorm.clone().normalize();
        let unitVTan = new Vector2( -unitVNorm.y, unitVNorm.x );

        let v1n = velocity1.clone().dot(unitVNorm);
        let v1t = velocity1.clone().dot(unitVTan);

        let v2n = velocity2.clone().dot(unitVNorm);
        let v2t = velocity2.clone().dot(unitVTan);

        let v1nAfter, v2nAfter;
        if (other instanceof MovableObject) {
            v1nAfter = (v1n * (circle.mass - other.mass) + 2 * other.mass * v2n) / (circle.mass + other.mass);
            v2nAfter = (v2n * (other.mass - circle.mass) + 2 * circle.mass * v1n) / (circle.mass + other.mass);
        }
        else {

            let mass = 99999999;
            v1nAfter = (v1n * (circle.mass - mass) + 2 * mass * v2n) / (circle.mass + mass);
            v2nAfter = (v2n * (mass - circle.mass) + 2 * circle.mass * v1n) / (circle.mass + mass);

        }
        
        
        if (v1nAfter < v2nAfter) return;
        
        let v1VectorNorm = unitVNorm.clone().multiplyScalar(v1nAfter);
        let v1VectorTan = unitVTan.clone().multiplyScalar(v1t);

        let v2VectorNorm = unitVNorm.clone().multiplyScalar(v2nAfter);
        let v2VectorTan = unitVTan.clone().multiplyScalar(v2t);
        
        let velocity1After = v1VectorNorm.clone().add(v1VectorTan);
        let velocity2After = v2VectorNorm.clone().add(v2VectorTan);

        circle.velocity.x = velocity1After.x;
        circle.velocity.z = velocity1After.y;

        if (other instanceof MovableObject) {
            other.velocity.x = velocity2After.x;
            other.velocity.z = velocity2After.y;
        }

        circle.collisionEvent(other);
        other.collisionEvent(circle);
        

    }

    // rigid cirlcle with not rigid cicle collision
    private rigidCircleCollision(item: MovableObject, other: GameObject, dt: number) {

        if ( !(item instanceof RigidMovableObject) ) return;
        if ( !(other instanceof MovableObject) || (other instanceof RigidMovableObject) ) return;
        if ( !(item.isCollisionShapeCircle()) ) return;
        if ( !(other.isCollisionShapeCircle()) ) return;

        let c1 = item.position.y+item.radius;
        let c2 = item.position.y-item.radius;
        let r1 = other.position.y+other.radius;
        let r2 = other.position.y-other.radius;
        if (c1>=r1 && c1>=r2 && c2>=r1 && c2>=r2) return;
        if (c1<=r1 && c1<=r2 && c2<=r1 && c2<=r2) return;
        
        let d = item.previusPosition.distanceTo(other.position);

        if (d < item.radius + other.radius) {

            let x = item.previusPosition.x - other.position.x;
            let z = item.previusPosition.z - other.position.z;

            other.position.x -= (item.radius + other.radius - d) / d * x;
            other.position.z -= (item.radius + other.radius - d) / d * z;

        }

        d = item.position.distanceTo(other.position);

        if (d <= item.radius + other.radius) {

            let x = item.position.x - other.position.x;
            let z = item.position.z - other.position.z;

            other.position.x -= (item.radius + other.radius - d) / d * x;
            other.position.z -= (item.radius + other.radius - d) / d * z;

            other.velocity.x += (item.radius + other.radius - d) / d * x / dt;
            other.velocity.z += (item.radius + other.radius - d) / d * z / dt;
            
            let velocity1 = new Vector2( item.velocity.x, item.velocity.z );
            let velocity2 = new Vector2( other.velocity.x, other.velocity.z );
            
            let vNorm = new Vector2(x, z);
        
            let unitVNorm = vNorm.clone().normalize();
            let unitVTan = new Vector2( -unitVNorm.y, unitVNorm.x );

            let v1n = velocity1.clone().dot(unitVNorm);
            let v1t = velocity1.clone().dot(unitVTan);

            let v2n = velocity2.clone().dot(unitVNorm);
            let v2t = velocity2.clone().dot(unitVTan);

            let v1nAfter = (v1n * (item.mass - other.mass) + 2 * other.mass * v2n) / (item.mass + other.mass);
            let v2nAfter = (v2n * (other.mass - item.mass) + 2 * item.mass * v1n) / (item.mass + other.mass);
            
            let v1VectorNorm = unitVNorm.clone().multiplyScalar(v1nAfter);
            let v1VectorTan = unitVTan.clone().multiplyScalar(v1t);

            let v2VectorNorm = unitVNorm.clone().multiplyScalar(v2nAfter);
            let v2VectorTan = unitVTan.clone().multiplyScalar(v2t);
            
            let velocity1After = v1VectorNorm.clone().add(v1VectorTan);
            let velocity2After = v2VectorNorm.clone().add(v2VectorTan);

            other.velocity.x = -velocity1After.x + velocity2After.x;
            other.velocity.z = -velocity1After.y + velocity2After.y;

            item.collisionEvent(other);
            other.collisionEvent(item);

        }

    }

    // circle and rectangle collision
    private circleRectangleCollision(circle: MovableObject, rectangle: GameObject) {

        //if ( circle instanceof RigidMovableObject ) return;
        if ( !(circle.isCollisionShapeCircle()) ) return;

        var self = this;
        if (rectangle.children.length != 0) {
            rectangle.children.forEach( item => {
                if (item instanceof GameObject) {
                    self.circleRectangleCollision(circle, item);
                }
            });
        }

        if ( !(rectangle.isCollisionShapeRectangle()) ) return;

        let c1 = circle.position.y+circle.radius;
        let c2 = circle.position.y-circle.radius;
        let r1 = rectangle.position.y+rectangle.height/2;
        let r2 = rectangle.position.y-rectangle.height/2;
        if (c1>=r1 && c1>=r2 && c2>=r1 && c2>=r2) return;
        if (c1<=r1 && c1<=r2 && c2<=r1 && c2<=r2) return;

        let right  = rectangle.position.x + rectangle.width/2;
        let left   = rectangle.position.x - rectangle.width/2;
        let top    = rectangle.position.z + rectangle.depth/2;
        let bottom = rectangle.position.z - rectangle.depth/2;

        // check circle in which area

        // A|B|C 
        // -+-+- 
        // D|E|F 
        // -+-+- 
        // G|H|I 
        
        if (circle.position.z >= top) {

            if (circle.position.x < left) {
                // area A
                this.elasticCollision(left, top, circle, rectangle);
            }
            else if (circle.position.x < right) {
                // area B
                this.elasticCollision(circle.position.x, top, circle, rectangle);
            }
            else {
                // area C
                this.elasticCollision(right, top, circle, rectangle);
            }

        }
        else if (circle.position.z > bottom) {

            if (circle.position.x < left) {
                // area D
                this.elasticCollision(left, circle.position.z, circle, rectangle);
            }
            else if (circle.position.x < right) {
                // area E
            }
            else {
                // area F
                this.elasticCollision(right, circle.position.z, circle, rectangle);
            }
            
        }
        else {

            if (circle.position.x < left) {
                // area G
                this.elasticCollision(left, bottom, circle, rectangle);
            }
            else if (circle.position.x < right) {
                // area H
                this.elasticCollision(circle.position.x, bottom, circle, rectangle);
            }
            else {
                // area I
                this.elasticCollision(right, bottom, circle, rectangle);
            }

        }

    }

    private elasticCollision(tX: number, tZ: number, circle: MovableObject, rectangle: GameObject) {

        let d = circle.position.distanceTo( new Vector3(tX, 0, tZ) );

        if (d >= circle.radius) return;

        let x = circle.position.x - tX;
        let z = circle.position.z - tZ;

        circle.position.x += (circle.radius - d) / d * x;
        circle.position.z += (circle.radius - d) / d * z;
        
        let velocity1 = new Vector2( circle.velocity.x, circle.velocity.z );
        let velocity2: Vector2;
        if ( !(rectangle instanceof MovableObject) ) {
            velocity2 = new Vector2(0, 0);
        }
        else {
            velocity2 = new Vector2( rectangle.velocity.x, rectangle.velocity.z );
        }
        
        let vNorm = new Vector2(x, z);
    
        let unitVNorm = vNorm.clone().normalize();
        let unitVTan = new Vector2( -unitVNorm.y, unitVNorm.x );

        let v1n = velocity1.clone().dot(unitVNorm);
        let v1t = velocity1.clone().dot(unitVTan);

        let v2n = velocity2.clone().dot(unitVNorm);
        let v2t = velocity2.clone().dot(unitVTan);

        let v1nAfter: number;
        let v2nAfter: number;
        if ( !(rectangle instanceof MovableObject) ) {

            let mass = 99999999;
            v1nAfter = (v1n * (circle.mass - mass) + 2 * mass * v2n) / (circle.mass + mass);
            v2nAfter = (v2n * (mass - circle.mass) + 2 * circle.mass * v1n) / (circle.mass + mass);

        }
        else {

            v1nAfter = (v1n * (circle.mass - rectangle.mass) + 2 * rectangle.mass * v2n) / (circle.mass + rectangle.mass);
            v2nAfter = (v2n * (rectangle.mass - circle.mass) + 2 * circle.mass * v1n) / (circle.mass + rectangle.mass);

        }
        
        if (v1nAfter < v2nAfter) return;
        
        let v1VectorNorm = unitVNorm.clone().multiplyScalar(v1nAfter);
        let v1VectorTan = unitVTan.clone().multiplyScalar(v1t);

        let v2VectorNorm = unitVNorm.clone().multiplyScalar(v2nAfter);
        let v2VectorTan = unitVTan.clone().multiplyScalar(v2t);
        
        let velocity1After = v1VectorNorm.clone().add(v1VectorTan);
        let velocity2After = v2VectorNorm.clone().add(v2VectorTan);

        if (rectangle instanceof MovableObject && rectangle instanceof RigidMovableObject) {

            circle.velocity.x = velocity1After.x - velocity2After.x;
            circle.velocity.z = velocity1After.y - velocity2After.y;

        }
        else {

            circle.velocity.x = velocity1After.x;
            circle.velocity.z = velocity1After.y;

        }

        if (rectangle instanceof MovableObject && !(rectangle instanceof RigidMovableObject)) {

            rectangle.velocity.x = velocity2After.x;
            rectangle.velocity.z = velocity2After.y;

        }

        circle.collisionEvent(rectangle);
        rectangle.collisionEvent(circle);

    }

}