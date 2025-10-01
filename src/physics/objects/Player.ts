import { Shape } from "two.js/src/shape";
import { Entity } from "../Entity";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { PLAYER_COLOR, PLAYER_RESTITUTION, PLAYER_SIZE } from "../Globals";
import { PhysicsType } from "../PhysicsType";
import { Vector } from "two.js/src/vector";

export class Player extends Entity{
    override shape: Shape;

    constructor(position: Vector = new Vector(0,0)) {
        super(PhysicsType.DYNAMIC, PLAYER_RESTITUTION, PLAYER_SIZE, PLAYER_SIZE, position);

        let shape = new Rectangle(position.x, position.y, PLAYER_SIZE, PLAYER_SIZE);
        shape.fill = PLAYER_COLOR;
        shape.noStroke();

        this.shape = shape;
    }

    override onCollideWith(entity: Entity): void {
        // no collision logic
    }


}