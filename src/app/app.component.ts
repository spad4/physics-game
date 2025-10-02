import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import Two from "two.js";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { PhysicsEntity } from "../physics/PhysicsEntity";
import { PhysicsType } from "../physics/PhysicsType";
import { Shape } from "two.js/src/shape";
import { Entity } from "../physics/Entity";
import { Player } from "../physics/objects/Player";
import { Wall } from "../physics/objects/Wall";
import { PLAYER_JUMP_HEIGHT, PLAYER_MOVESPEED } from "../physics/Globals";
import { Force } from "../physics/Force";
import { Text } from "two.js/src/text";
import { Heavy } from "../physics/objects/Heavy";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {

  two: Two;

  gameRunning: boolean = true;
  gravity: number = 1.0;
  canJump: boolean = true;

  dynamicEntities: PhysicsEntity[];
  staticEntities: PhysicsEntity[];
  entityShapes: Map<number, Shape>;

  player: Player;
  playerForces: Text[] = [];

  drawableEntityCount = 0;


  @ViewChild("gameWindow") gameWindow!: ElementRef;

  constructor(domElement: ElementRef) {

    var params = {
      fullscreen: true
    };

    this.two = new Two(params)
    .appendTo(domElement.nativeElement);

    this.dynamicEntities = [];
    this.staticEntities = [];
    this.entityShapes = new Map();
    this.player = new Player(new Vector(500, 400));
  }

  ngOnInit() {

    this.restart();
    this.gameLoop();
  }

  restart() {
    this.two.clear();
    this.dynamicEntities = [];
    this.staticEntities = [];
    this.player.acceleration.clear();
    this.player.velocity.clear();
    this.player.forces.clear();
    this.playerForces.forEach(text => {
      text.remove();
    })
    this.dynamicEntities.push(this.player);
    this.player.position = new Vector(500, 400);
    this.two.add(this.player.getShape());
    this.player.addForce(new Force("gravity", new Vector(0, 1), this.gravity * this.player.mass, -1));

    let test = new Player(new Vector(900, 500));
    this.two.add(test.getShape());
    test.addForce(new Force("gravity", new Vector(0, 1), this.gravity * test.mass, -1));
      // test.addForce(new Force("lft", new Vector(-1, 0), 1, 1));

    this.dynamicEntities.push(test);

    let wall = new Wall(new Vector(500, 600), 2000, 50);
    this.two.add(wall.getShape());
    this.staticEntities.push(wall);

    let wall2 = new Wall(new Vector(700, 550), 50, 50);
    this.two.add(wall2.getShape());
    this.staticEntities.push(wall2);


    this.two.update();
  }

  gameLoop() {

    // physics handling
    this.physicsOperations();
    // draw everything
    this.playerForces.forEach(text => {
      text.remove();
    })

    let velocity = this.player.velocity;
    let velocityText = new Text(`velocity | ${velocity.x}, ${velocity.y}`, 100, 200);
    this.playerForces.push(velocityText);
    this.two.add(velocityText);
    let i = 1;
    this.player.forces.forEach(force => {
      let text = new Text(`${force.id} | ${force.direction.x * force.magnitude}, ${force.direction.y * force.magnitude} | ${force.framesLeft}`, 100, 200 + 20 * i);
      this.playerForces.push(text);
      this.two.add(text);
      i++;
    })

    this.two.update();
    this.sleep(20).then(_ => { this.gameLoop() });
  }

  physicsOperations() {

    for (let i = 0; i < this.dynamicEntities.length; i++) {
      this.dynamicEntities[i].applyForceMotion();
      
      this.staticEntities.forEach(sEntity => {
        this.dynamicEntities[i].resolveCollisionWith(sEntity);
      })

      this.dynamicEntities.slice(i + 1, this.dynamicEntities.length).forEach(oEntity => {
        this.dynamicEntities[i].resolveCollisionWith(oEntity);
      })
    }
  }

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent): void {
    let key = event.key;

    switch(key) {
      case "a":
        this.player.addForce(new Force("moveLeft", new Vector(-1, 0), 1, -1));
      break;
      case "d":
        this.player.addForce(new Force("moveRight", new Vector(1, 0), 1, -1));
      break;
      case "w":
        this.player.addForce(new Force("jump", new Vector(0, -1), PLAYER_JUMP_HEIGHT, 1));
      break;
      case "z":
        this.gameRunning = false;
      break;
      case "r":
        this.restart();
      break;
    }
  }

  @HostListener('document:keyup', ['$event'])
  keyUp(event: KeyboardEvent): void {
    let key = event.key;

    switch(key) {
      case "a":
        this.player.forces.delete("moveLeft");
      break;
      case "d":
        this.player.forces.delete("moveRight");
      break;
      case "w":
      break;
    }
  }

  initializeDrawableEntity(entity: Entity): void {
    
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}