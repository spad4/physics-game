import { Shape } from "two.js/src/shape";
import { Entity } from "../Entity";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { WALL_COLOR, WALL_RESTITUTION } from "../Globals";
import { PhysicsType } from "../PhysicsType";
import { Vector } from "two.js/src/vector";

export class Wall extends Entity{
    override shape: Shape;

    constructor(position: Vector = new Vector(0,0), width: number, height: number) {
        super(PhysicsType.STATIC, WALL_RESTITUTION, width, height, position);

        let shape = new Rectangle(position.x, position.y, width, height);
        shape.fill = WALL_COLOR;
        shape.noStroke();

        this.shape = shape;
    }

    override onCollideWith(entity: Entity): void {
        // no collision logic
    }


}