import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import Two from "two.js";
import { Rectangle } from "two.js/src/shapes/rectangle";
import { Vector } from "two.js/src/vector";
import { PhysicsEntity } from "../physics/PhysicsEntity";
import { PhysicsType } from "../physics/PhysicsType";
import { AppliedMotion } from "../physics/AppliedMotion";
import { Shape } from "two.js/src/shape";
import { Entity } from "../physics/Entity";
import { Player } from "../physics/objects/Player";
import { Wall } from "../physics/objects/Wall";
import { PLAYER_JUMP_HEIGHT, PLAYER_MOVESPEED } from "../physics/Globals";

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
    this.dynamicEntities.push(this.player);
  }

  ngOnInit() {

    // this.two = this.two.appendTo(this.gameWindow.nativeElement);
    this.two.add(this.player.getShape());

    // add permanent gravity to the player
    this.player.accelerationModifiers.set("gravity", new AppliedMotion("gravity", new Vector(0, this.gravity), -1));
    this.dynamicEntities.push(this.player);

    let wall = new Wall(new Vector(1000, 600), 2000, 50);
    this.two.add(wall.getShape());
    this.staticEntities.push(wall);

    // this.restart();
    this.gameLoop();
  }

  restart() {
    this.player.acceleration.clear();
    this.player.accelerationModifiers.clear();
    this.player.accelerationModifiers.set("gravity", new AppliedMotion("gravity", new Vector(0, this.gravity), -1));
    this.player.velocity.clear();
    this.player.velocityModifiers.clear();
    this.player.position.clear();
  }

  gameLoop() {

    // physics handling
    this.physicsOperations();
    // draw everything

    this.two.update();
    this.sleep(20).then(_ => { this.gameLoop() });
  }

  physicsOperations() {
    this.dynamicEntities.forEach(dEntity => {

      dEntity.applyMotion();
      
      this.staticEntities.forEach(sEntity => {
        dEntity.resolveCollisionWith(sEntity);
      })
    })
  }

  @HostListener('document:keydown', ['$event'])
  keyDown(event: KeyboardEvent): void {
    let key = event.key;

    switch(key) {
      case "a":
        this.player.addVelocity(new AppliedMotion("moveLeft", new Vector(-PLAYER_MOVESPEED, 0), -1));
      break;
      case "d":
        this.player.addVelocity(new AppliedMotion("moveRight", new Vector(PLAYER_MOVESPEED, 0), -1));
      break;
      case "w":
        this.player.addVelocity(new AppliedMotion("jump", new Vector(0, -PLAYER_JUMP_HEIGHT), 40));
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
        this.player.removeVelocity("moveLeft");
      break;
      case "d":
        this.player.removeVelocity("moveRight");
      break;
      case "w":
        if (this.player.velocity.y < 0) {
          this.player.removeVelocity("jump");
          this.player.velocity.y = 0;
        }
      break;
    }
  }

  initializeDrawableEntity(entity: Entity): void {
    
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}