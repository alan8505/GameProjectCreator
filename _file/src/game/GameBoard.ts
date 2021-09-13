import { GameObject } from 'src/gameFrame/GameObject';

export class GameBoard extends GameObject {

    leftEdge: GameObject;
    rightEdge: GameObject;
    topEdge: GameObject;
    bottomEdge: GameObject;

    constructor(width: number = 90, height: number = 10, depth: number = 160, edge: number = 6) {

        super();

        // board top
        this.setGeometryToBox(width, 0.001, depth);
        this.setMaterialToPhong({color: "skyblue"});

        // left edge
        this.leftEdge = new GameObject();
        this.leftEdge.setMaterialToPhong({color: "skyblue"});
        this.leftEdge.setGeometryToBox(edge, height, depth+edge*2);
        this.leftEdge.position.set(-width/2-edge/2, height/2, 0);

        // right edge
        this.rightEdge = this.leftEdge.clone();
        this.rightEdge.position.x = -this.rightEdge.position.x;

        // top edge
        this.topEdge = this.rightEdge.clone();
        this.topEdge.setGeometryToBox(width, height, edge);
        this.topEdge.position.set(0, height/2, -(depth/2+edge/2));

        // bottom edge
        this.bottomEdge = this.topEdge.clone();
        this.bottomEdge.position.z = -this.bottomEdge.position.z;

        this.add(this.leftEdge, this.rightEdge, this.topEdge, this.bottomEdge);

    }

}
    