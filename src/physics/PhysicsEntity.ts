import { Vector } from "two.js/src/vector";
import { PhysicsType } from "./PhysicsType";
import { Force } from "./Force";
import { STICKY_THRESHOLD } from "./Globals";
import { Player } from "./objects/Player";

export class PhysicsEntity {

    private type: PhysicsType;

    mass: number;
    frictionCoefficient: number; // friction coefficient
    restitution: number; // how bouncy is this object?

    position: Vector; // center of the rectangle
    velocity: Vector;
    acceleration: Vector;

    forces: Map<string, Force>;

    private width: number;
    private height: number;
    
    private halfWidth: number;
    private halfHeight: number;

    constructor(type: PhysicsType, width: number, height: number, position: Vector, mass: number = 1, friction: number = 0.2, restitution: number = 0) {
        this.type = type;
        this.width = width;
        this.halfWidth = width * 0.5;
        this.height = height;
        this.halfHeight = height * 0.5;
        this.position = position;
        this.velocity = new Vector(0, 0);
        this.acceleration = new Vector(0, 0);
        this.mass = mass;
        this.frictionCoefficient = friction;
        this.forces = new Map();
        this.restitution = restitution;
    }

    getPhysicsType(): PhysicsType {
        return this.type;
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

    resolveCollisionWith(other: PhysicsEntity): boolean {
        if (!this.collidesWith(other)) {
            return false;
        }
        if (other instanceof Player) {
            console.log("player");
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

            if (dx > 0) {
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
        }
        else if (absDX > absDY) { // sides
            if (dx > 0) {
                this.position.x = other.getLeft() - this.halfWidth;
            }
            else {
                this.position.x = other.getRight() + this.halfWidth;
            }

            // collisions - also does normal
            if (Math.abs(this.velocity.x) < 0.05) {
                return true;
            }

            let relativeVelocity = other.velocity.clone().sub(this.velocity);
            let normal = other.position.clone().sub(this.position).normalize();

            let velocityNormalized = relativeVelocity.dot(normal);

            let momentum = this.mass * this.velocity.x + other.mass * other.velocity.x;
            let totalMass = this.mass + other.mass;
            let restitution = Math.min(this.restitution, other.restitution);

            // let impulse = -(restitution + 1) * velocityNormalized;
            // impulse /= 1/this.mass + 1/other.mass;

            let myRatio = (1 / this.mass) / totalMass;
            let myMomentum = momentum * myRatio * (1 + restitution);
            if (this.velocity.x > 0) {
                myMomentum = -myMomentum;
            }
            this.addForce(new Force("collisionX", new Vector(normal.x, 0), myMomentum, 1));


            let otherRatio = (1 / other.mass) / totalMass;
            let otherMomentum = momentum * otherRatio * (1 + restitution);
            if (this.velocity.x < 0) {
                otherMomentum = -otherMomentum;
            }
            if (otherRatio) {
                other.addForce(new Force("collisionX", new Vector(normal.x, 0), otherMomentum, 1))
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

            // collisions
            if (Math.abs(this.velocity.y) < 0.1) {
                return true;
            }

            let momentum = this.mass * this.velocity.y + other.mass * other.velocity.y;
            let totalMass = this.mass + other.mass;
            let restitution = Math.min(this.restitution, other.restitution);

            let myRatio = this.mass / totalMass;
            let myMomentum = momentum * myRatio * (1 + restitution);
            let direction = this.velocity.y / this.velocity.y
            this.addForce(new Force("collisionY", new Vector(0, -direction), myMomentum, 1));

            let otherRatio = other.mass / totalMass;
            let otherMomentum = momentum * otherRatio * (1 + restitution);
            let otherDirection = other.velocity.y / Math.abs(other.velocity.y)
            other.addForce(new Force("collisionY", new Vector(0, -otherDirection), otherMomentum, 1))

            // friction
            let friction = other.frictionCoefficient * myMomentum / this.velocity.y;
            if (Math.abs(this.velocity.x) > 0.1) {
                this.addForce(new Force("frictionX", new Vector(-this.velocity.x, 0), friction, 1));
            }
            else {
                this.velocity.x = 0;
            }
        }

        return true;
    }

    applyForceMotion() {

        this.acceleration.clear();
        // v = v(t-1) + a*t
        this.forces.forEach(force => {
            this.acceleration.add(this.forceToAcceleration(force));
            if (force.framesLeft == 1) {
                this.forces.delete(force.id);
            }
            else if (force.framesLeft > 0) {
                force.framesLeft--;
            }
        })

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);

    }

    private forceToAcceleration(force: Force): Vector {
        return force.direction.multiplyScalar(force.magnitude).divideScalar(this.mass);
    }

    addForce(force: Force) {
        if (this.forces.has(force.id)) { return; }
        this.forces.set(force.id, force);
    }
}