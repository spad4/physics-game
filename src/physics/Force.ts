import { Vector } from "two.js/src/vector";

export class Force {
    
    id: string;

    direction: Vector;
    magnitude: number;
    
    // how many frames to apply this motion vector for
    // 1 second = 50 frames
    // -1 = forever (e.g. gravity)
    framesLeft: number;

    constructor(id: string, direction: Vector, magnitude: number, framesLeft: number) {
        this.id = id;
        this.direction = direction;
        this.magnitude = magnitude;
        this.framesLeft = framesLeft;
    }
}