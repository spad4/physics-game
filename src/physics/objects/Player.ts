import { Shape } from "two.js/src/shape";
import { Entity } from "../Entity";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { PLAYER_COLOR, PLAYER_JUMP_HEIGHT, PLAYER_RESTITUTION, PLAYER_SIZE } from "../Globals";
import { PhysicsType } from "../PhysicsType";
import { Vector } from "two.js/src/vector";
import { Wall } from "./Wall";
import { PhysicsEntity } from "../PhysicsEntity";
import { Direction } from "../Direction";
import { Force } from "../Force";

export class Player extends Entity{
    override shape: Shape;
    jumps: number;
    maxJumps: number;

    constructor(position: Vector = new Vector(0,0)) {
        super(PhysicsType.DYNAMIC, PLAYER_SIZE, PLAYER_SIZE, position, 1, 0, 1);

        let shape = new Rectangle(position.x, position.y, PLAYER_SIZE, PLAYER_SIZE);
        shape.fill = PLAYER_COLOR;
        shape.noStroke();

        this.shape = shape;
        this.maxJumps = 1;
        this.jumps = 1;
    }

    override onCollideWith(entity: PhysicsEntity): void {
    }

    override applyForceMotion(): void {
        let onGround = this.sideColliding(Direction.DOWN);
        super.applyForceMotion();
        if (!onGround) {
            // let drag = 0.001 * Math.pow(this.velocity.x, 2) * this.getHeight();
            this.addForce(new Force("air friction", new Vector(-this.velocity.x, 0), Math.abs(this.velocity.x) * 0.0025, 1));
        }
    }

    jump() {
        if (this.sideColliding(Direction.DOWN)) {
            this.acceleration.clear();
            this.addForce(new Force("jump", new Vector(0, -1), PLAYER_JUMP_HEIGHT, 1));
        }
    }
}