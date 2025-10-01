import { Vector } from "two.js/src/vector";

export class AppliedMotion {
    
    id: string;

    // the motion vector to apply
    vector: Vector;
    
    // how many frames to apply this motion vector for
    // 1 second = 50 frames
    // -1 = forever (e.g. gravity)
    framesLeft: number;

    constructor(id: string, vector: Vector, framesLeft: number) {
        this.id = id;
        this.vector = vector;
        this.framesLeft = framesLeft;
    }
}