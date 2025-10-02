import { Shape } from "two.js/src/shape";
import { Entity } from "../Entity";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { PLAYER_COLOR, PLAYER_JUMP_HEIGHT, PLAYER_RESTITUTION, PLAYER_SIZE } from "../Globals";
import { PhysicsType } from "../PhysicsType";
import { Vector } from "two.js/src/vector";
import { Wall } from "./Wall";
import { AppliedMotion } from "../AppliedMotion";
import { PhysicsEntity } from "../PhysicsEntity";

export class Player extends Entity{
    override shape: Shape;
    jumps: number;
    maxJumps: number;

    constructor(position: Vector = new Vector(0,0)) {
        super(PhysicsType.DYNAMIC, PLAYER_RESTITUTION, PLAYER_SIZE, PLAYER_SIZE, position);

        let shape = new Rectangle(position.x, position.y, PLAYER_SIZE, PLAYER_SIZE);
        shape.fill = PLAYER_COLOR;
        shape.noStroke();

        this.shape = shape;
        this.maxJumps = 1;
        this.jumps = 1;
    }

    override onCollideWith(entity: PhysicsEntity): void {
        if (entity instanceof Wall) {
            if (entity.getTop() >= this.getBottom()) {
                this.jumps = this.maxJumps;
                this.removeVelocity("jump");
            }
        }
    }

    jump() {
        if (this.jumps > 0) {
            this.velocity.y = 0;
            this.addVelocity(new AppliedMotion("jump", new Vector(0, -PLAYER_JUMP_HEIGHT), 40));
            this.jumps -= 1;
        }
    }

}