import { Vector } from "two.js/src/vector";
import { PhysicsType } from "./PhysicsType";
import { AppliedMotion } from "./AppliedMotion";
import { STICKY_THRESHOLD } from "./Globals";

export class PhysicsEntity {

    private type: PhysicsType;

    // when an object collides with this one, how much of its velocity is preserved
    // 0 = none, 1 = all
    private restitution: number;

    position: Vector; // center of the rectangle
    velocity: Vector;
    acceleration: Vector;

    velocityModifiers: Map<string, AppliedMotion>;
    accelerationModifiers: Map<string, AppliedMotion>;

    private width: number;
    private height: number;
    
    private halfWidth: number;
    private halfHeight: number;

    isOnGround: boolean = false;

    constructor(type: PhysicsType, restitution: number, width: number, height: number, position: Vector) {
        this.type = type;
        this.restitution = restitution;
        this.width = width;
        this.halfWidth = width * 0.5;
        this.height = height;
        this.halfHeight = height * 0.5;
        this.position = position;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.velocityModifiers = new Map();
        this.accelerationModifiers = new Map();
    }

    getPhysicsType(): PhysicsType {
        return this.type;
    }

    getRestitution(): number {
        return this.restitution;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.height;
    }

    getHalfWidth(): number {
        return this.halfWidth;
    }

    getHalfHeight(): number {
        return this.halfHeight;
    }

    getTop(): number {
        return this.position.y - this.halfHeight; // -Y is up for twojs
    }

    getBottom(): number {
        return this.position.y + this.halfHeight; // +Y is down for twojs
    }

    getLeft(): number {
        return this.position.x - this.halfWidth;
    }

    getRight(): number {
        return this.position.x + this.halfWidth;
    }

    collidesWith(other: PhysicsEntity): boolean {

        var l1 = this.getLeft();
        var r1 = this.getRight();
        var t1 = this.getTop();
        var b1 = this.getBottom();

        var l2 = other.getLeft();
        var r2 = other.getRight();
        var t2 = other.getTop();
        var b2 = other.getBottom();

        // If the any of the edges are beyond any of the
        // others, then we know that the box cannot be
        // colliding
        if (b1 < t2 || t1 > b2 || r1 < l2 || l1 > r2) {
            return false;
        }

        // If the algorithm made it here, it had to collide
        return true;
    }

    resolveCollisionWith(other: PhysicsEntity) {
        if (!this.collidesWith(other)) {
            return;
        }

        // To find the side of entry calculate based on
        // the normalized sides
        var dx = (other.position.x - this.position.x) / other.halfWidth;
        var dy = (other.position.y - this.position.y) / other.halfHeight;

        // Calculate the absolute change in x and y
        var absDX = Math.abs(dx);
        var absDY = Math.abs(dy);
        
        // object approaching from corner
        if (Math.abs(absDX - absDY) < 0.1) {

            if (dx < 0) {
                this.position.x = other.getLeft() - this.halfWidth;
            }
            else {
                this.position.x = other.getRight() + this.halfWidth;
            }

            // positive Y (it's BELOW!)
            if (dy < 0) {
                this.position.y = other.getBottom() + this.halfHeight;
            }
            else {
                this.position.y = other.getTop() - this.halfHeight;
            }   

            // restitution here!
                    // Randomly select a x/y direction to reflect velocity on
            // if (Math.random() < .5) {

            //     // Reflect the velocity at a reduced rate
            //     player.vx = -player.vx * entity.restitution;

            //     // If the object's velocity is nearing 0, set it to 0
            //     // STICKY_THRESHOLD is set to .0004
            //     if (abs(player.vx) < STICKY_THRESHOLD) {
            //         player.vx = 0;
            //     }
            // } else {

            //     player.vy = -player.vy * entity.restitution;
            //     if (abs(player.vy) < STICKY_THRESHOLD) {
            //         player.vy = 0;
            //     }
            // }
            // randomly pick a direction to reflect in
            if (Math.random() < 0.5) {
                this.velocity.x *= -other.restitution;
                if (Math.abs(this.velocity.x) < STICKY_THRESHOLD) {
                    this.velocity.x = 0;
                }
            }
            else {
                this.velocity.y *= -other.restitution;
                if (Math.abs(this.velocity.y) < STICKY_THRESHOLD) {
                    this.velocity.y = 0;
                }
            }
        }
        else if (absDX > absDY) { // sides
            if (dx < 0) {
                this.position.x = other.getLeft() - this.halfWidth;
            }
            else {
                this.position.x = other.getRight() + this.halfWidth;
            }

            this.velocity.x *= -other.restitution;
            if (Math.abs(this.velocity.x) < STICKY_THRESHOLD) {
                this.velocity.x = 0;
            }
        }
        else { // top or bottom
            // positive Y (it's BELOW!)
            if (dy < 0) {
                this.position.y = other.getBottom() + this.halfHeight;
            }
            else {
                this.position.y = other.getTop() - this.halfHeight;
            }   

            this.velocity.y *= -other.restitution;
            if (Math.abs(this.velocity.y) < STICKY_THRESHOLD) {
                this.velocity.y = 0;
            }
        }
    }

    applyMotion() {

        this.acceleration = new Vector(0, 0);
        this.accelerationModifiers.forEach((modifier, id) => {

            this.acceleration.add(modifier.vector);
            if (modifier.framesLeft > 0) {
                modifier.framesLeft -= 1;
                if (modifier.framesLeft == 0) {
                    this.accelerationModifiers.delete(id);
                }
                else {
                    this.accelerationModifiers.set(id, modifier);
                }
            }
        })

        this.velocity.add(this.acceleration);

        this.velocityModifiers.forEach((modifier, id) => {

            // this.velocity.add(modifier.vector);

            if (modifier.framesLeft > 0) {
                modifier.framesLeft -= 1;
                this.velocityModifiers.set(id, modifier);
            }

            if (modifier.framesLeft == 0) {
                this.removeVelocity(modifier.id);
            }
        })

        this.position.add(this.velocity);
    }

    addVelocity(velocity: AppliedMotion) {
        this.velocityModifiers.set(velocity.id, velocity);
        this.velocity.add(velocity.vector);
    }

    removeVelocity(id: string) {
        let velocity = this.velocityModifiers.get(id);
        if (!velocity) { return; }
        this.velocity.sub(velocity.vector);
        this.velocityModifiers.delete(id);
    }
}