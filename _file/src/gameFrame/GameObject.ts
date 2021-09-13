import { Mesh, TextureLoader, Vector3, Color } from 'three';
import { Material, MeshBasicMaterial, MeshLambertMaterial, MeshNormalMaterial, MeshPhongMaterial, MeshStandardMaterial, MeshToonMaterial } from 'three';
import { BufferGeometry, BoxGeometry, CircleGeometry, ConeGeometry, CylinderGeometry, PlaneGeometry, SphereGeometry, TorusGeometry } from 'three';

export class GameObject extends Mesh {

    private collisionShape: string;
    defaultPosition: Vector3;
    defaultVisible: boolean;

    texturePath: string;

    width: number;
    height: number;
    depth: number;
    radius: number;

    constructor( geometry = new BufferGeometry(), material = new MeshBasicMaterial() ) {

        if (geometry.type == "BufferGeometry") {
            super( new PlaneGeometry(10, 10), material );
        }
        else {
            super( geometry, material );
        }
        
        this.type = "GameObject";
        this.collisionShape = null;
        this.defaultPosition = new Vector3();

        this.texturePath = null;
        
    }

    public resetPosition() {
        this.position.copy(this.defaultPosition);
    }

    public reset() {
        this.resetPosition();
        this.visible = this.defaultVisible;
    }

    public setSize(size: number) {
        this.scale.multiplyScalar(size);
    }

    public copy(source) {

        super.copy( source );
        this.collisionShape = source.collisionShape;
        this.width = source.width;
        this.height = source.height;
        this.depth = source.depth;
        this.radius = source.radius;
        this.texturePath = source.texturePath;
        this.collisionEvent = source.collisionEvent;
        this.onClickEvent = source.onClickEvent;
        return this;

    }

    // Texture

    public setTexture(path: string, transparent = false) {
        this.texturePath = path;
        this.textureTransfer(path);
        this.setMaterialTransparent(transparent);
    }

    private textureTransfer(path = this.texturePath) {

        if (path==null) return;
        if (this.material instanceof MeshBasicMaterial ||
            this.material instanceof MeshLambertMaterial ||
            this.material instanceof MeshPhongMaterial ||
            this.material instanceof MeshStandardMaterial ||
            this.material instanceof MeshToonMaterial )
            {
            this.material.map = new TextureLoader().load(path);
        }

    }

    // Material

    public setMaterialToBasic(parameters: Object = null) {
        this.material = new MeshBasicMaterial(parameters);
        this.textureTransfer(this.texturePath);
    }

    public setMaterialToLambert(parameters: Object = null) {
        this.material = new MeshLambertMaterial(parameters);
        this.textureTransfer(this.texturePath);
    }

    public setMaterialToNormal(parameters: Object = null) {
        this.material = new MeshNormalMaterial(parameters);
        this.textureTransfer(this.texturePath);
    }

    public setMaterialToPhong(parameters: Object = null) {
        this.material = new MeshPhongMaterial(parameters);
        this.textureTransfer(this.texturePath);
    }

    public setMaterialToStandard(parameters: Object = null) {
        this.material = new MeshStandardMaterial(parameters);
        this.textureTransfer(this.texturePath);
    }

    public setMaterialToToon(parameters: Object = null) {
        this.material = new MeshToonMaterial(parameters);
        this.textureTransfer(this.texturePath);
    }

    public setMaterialTransparent(transparent: boolean) {
        if (this.material instanceof Material) {
            this.material.transparent = transparent;
        }
        else {
            this.material.forEach( function(item){
                item.transparent = transparent;
            })
        }
    }

    public setMaterialColor(color: string|number|Color) {

        if (this.material instanceof MeshBasicMaterial ||
            this.material instanceof MeshLambertMaterial ||
            this.material instanceof MeshPhongMaterial ||
            this.material instanceof MeshStandardMaterial ||
            this.material instanceof MeshToonMaterial )
            {
            this.material.color.set(color);
            if (this.children.length>0) {
                
                this.children.forEach( item => {
                    if (item instanceof GameObject) {
                        item.setMaterialColor(color);
                    }
                });
                
            }
        }

    }

    // Geometry

    public setGeometryToBox(width = 10, height = 10, depth = 10, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
        this.geometry = new BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments);
        this.setCollisionShapeToRectangle(width, height, depth);
    }

    public setGeometryToCircle(radius = 5, segments = 16, thetaStart = 0, thetaLength = Math.PI*2) {
        this.geometry = new CircleGeometry(radius, segments, thetaStart, thetaLength);
    }

    public setGeometryToCone(radius = 5, height = 10, radialSegments = 16, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI*2) {
        this.geometry = new ConeGeometry(radius, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
    }

    public setGeometryToCylinder(radiusTop = 5, radiusBottom = 5, height = 10, radialSegments = 16, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI*2) {
        this.geometry = new CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, openEnded, thetaStart, thetaLength);
        this.setCollisionShapeToCircle(radiusTop>radiusBottom?radiusTop:radiusBottom);
    }

    public setGeometryToPlane(width = 10, height = 10, widthSegments = 1, heightSegments = 1) {
        this.geometry = new PlaneGeometry(width, height, widthSegments, heightSegments);
    }

    public setGeometryToSphere(radius = 5, widthSegments = 16, heightSegments = 16, phiStart = 0, phiLength = Math.PI*2, thetaStart = 0, thetaLength = Math.PI) {
        this.geometry = new SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
        this.setCollisionShapeToCircle(radius);
    }

    public setGeometryToTorus(radius = 5, tube = 2, radialSegments = 8, tubularSegments = 16, arc = Math.PI*2) {
        this.geometry = new TorusGeometry(radius, tube, radialSegments, tubularSegments, arc);
    }

    // CollisionShape

    public getCollisionShape() {
        return this.collisionShape;
    }

    public setCollisionShapeToCircle(radius: number) {

        this.collisionShape = "circle";
        this.width = null;
        this.height = null;
        this.radius = radius;

    }

    public setCollisionShapeToRectangle(width: number, height: number, depth: number) {

        this.collisionShape = "rectangle";
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.radius = null;

    }

    public isCollisionShapeCircle() {
        if (this.collisionShape == "circle") return true;
        return false;
    }

    public isCollisionShapeRectangle() {
        if (this.collisionShape == "rectangle") return true;
        return false;
    }

    public collisionEvent(item: GameObject) {}

    public onClickEvent() {}

}
    