import { Shape } from "two.js/src/shape";
import { Entity } from "../Entity";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { PLAYER_COLOR, PLAYER_JUMP_HEIGHT, PLAYER_RESTITUTION, PLAYER_SIZE, WALL_RESTITUTION } from "../Globals";
import { PhysicsType } from "../PhysicsType";
import { Vector } from "two.js/src/vector";
import { Wall } from "./Wall";
import { PhysicsEntity } from "../PhysicsEntity";

export class Heavy extends Entity{
    override shape: Shape;
    jumps: number;
    maxJumps: number;

    constructor(position: Vector = new Vector(0,0)) {
        super(PhysicsType.DYNAMIC, PLAYER_SIZE, PLAYER_SIZE, position, 5, 0, WALL_RESTITUTION);

        let shape = new Rectangle(position.x, position.y, PLAYER_SIZE, PLAYER_SIZE);
        shape.fill = PLAYER_COLOR;
        shape.noStroke();

        this.shape = shape;
        this.maxJumps = 1;
        this.jumps = 1;
    }

    override onCollideWith(entity: PhysicsEntity): void {
    }
}