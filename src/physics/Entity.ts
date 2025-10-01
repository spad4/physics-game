import { Vector } from "two.js/src/vector";
import { PhysicsEntity } from "./PhysicsEntity";
import { PhysicsType } from "./PhysicsType";
import { Shape } from "two.js/src/shape";

export abstract class Entity extends PhysicsEntity {

    abstract shape: Shape;

    constructor(type: PhysicsType, restitution: number, width: number, height: number, position: Vector) {
        super(type, restitution, width, height, position);
    }

    // what should happen to an entity when it collides with this one 
    abstract onCollideWith(entity: Entity): void;

    getShape(): Shape {
        return this.shape;
    }

    override applyMotion(): void {
        super.applyMotion();
        this.shape.position = this.position; // updates the position of the entity on the canvas
    }

}