import { Vector } from "two.js/src/vector";
import { PhysicsEntity } from "./PhysicsEntity";
import { PhysicsType } from "./PhysicsType";
import { Shape } from "two.js/src/shape";

export abstract class Entity extends PhysicsEntity {

    abstract shape: Shape;

    constructor(type: PhysicsType, width: number, height: number, position: Vector, mass: number = 1, friction: number = 0.1, restitution: number = 0) {
        super(type, width, height, position, mass, friction, restitution);
    }

    // what should happen to an entity when it collides with this one 
    abstract onCollideWith(entity: PhysicsEntity): void;

    getShape(): Shape {
        return this.shape;
    }

    override applyForceMotion(): void {
        super.applyForceMotion();
        this.shape.position = this.position; // updates the position of the entity on the canvas
    }

    override resolveCollisionWith(other: PhysicsEntity): boolean {
        let result = super.resolveCollisionWith(other);
        if (result) {
            this.onCollideWith(other);
        }
        return result;
    }

}