/*
 * Práctica Conceptos Básicos de Videojuegos (Breakout)
 *
 * Nicolas Casillas
 * 2025-05-14
 */

"use strict";

// Global variables
const canvasWidth = 800;
const canvasHeight = 600;

// Context of the Canvas
let ctx;

// A variable to store the game object
let game;

// Variable to store the time at the previous frame
let oldTime = 0;

let initialSpeed = 0.5;
let paddleSpeed = 0.5;
let ballSpeed = 0.5;
let speedIncrease = 1.015;

class Ball extends GameObject {
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "ball", sheetCols);
        this.velocity = new Vector(0, 0);
    }

    update(deltaTime) {
        this.position = this.position.plus(this.velocity.times(ballSpeed).times(deltaTime));
        this.updateCollider();
    }

    reset() {
        this.position.x = canvasWidth / 2;
        this.position.y = canvasHeight / 2;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    // Changed for vertical movement
    serve() {
        let angle = Math.random() * Math.PI / 3 + Math.PI / 3;
        this.velocity = new Vector(Math.cos(angle), -Math.sin(angle));
        ballSpeed = initialSpeed;
    }
}

// Class for the main character in the game
class Paddle extends GameObject {
    constructor(position, width, height, color, sheetCols) {
        super(position, width, height, color, "player", sheetCols);
        this.velocity = new Vector(0, 0);
        // Structure with the directions the object can move
        this.motion = {
            left: {
                axis: "x",
                sign: -1,
            },
            right: {
                axis: "x",
                sign: 1,
            },
        }
        // Keys pressed to move the player
        this.keys = [];
    }

    update(deltaTime) {
        // Restart the velocity
        this.velocity.x = 0;
        this.velocity.y = 0;
        // Modify the velocity according to the directions pressed
        for (const direction of this.keys) {
            const axis = this.motion[direction].axis;
            const sign = this.motion[direction].sign;
            this.velocity[axis] += sign;
        }
        this.velocity = this.velocity.normalize().times(paddleSpeed);
        this.position = this.position.plus(this.velocity.times(deltaTime));
        this.clampWithinCanvas();
        this.updateCollider();
    }

    // Modified for horizontal movement of the paddle
    clampWithinCanvas() {
        if (this.position.x - this.halfSize.x < 0) {
            this.position.x = this.halfSize.x;
        }
        if (this.position.x + this.halfSize.x > canvasWidth) {
            this.position.x = canvasWidth - this.halfSize.x;
        }
    }
}

// Class to keep track of all the events and objects in the game
class Game {
    constructor() {
        this.destroyedBlocks = 0;
        this.level = 1;
        this.lives = 3;
        this.createEventListeners();
        // Display labels
        this.scoreLabel = new TextLabel(80, 580, "25px Arial", "white");
        this.levelLabel = new TextLabel(350, 580, "25px Arial", "white");
        this.livesLabel = new TextLabel(620, 580, "25px Arial", "white");
        this.messageLabel = new TextLabel(250, 325, "50px Arial", "yellow");
        this.inPlay = false;
        this.initObjects();
        this.ping = document.createElement("audio");
        this.ping.src = "4387__noisecollector__pongblipe4.wav";
    }

    // Create the objects in the game
    initObjects() {
        
        let paddleWidth = 0; 
        if (this.level == 1) { 
            paddleWidth = 150; 
        } 
        if (this.level == 2) { 
            paddleWidth = 120; 
        } 
        if (this.level == 3) { 
            paddleWidth = 90; 
        } 
        this.paddleLeft = new Paddle(new Vector(canvasWidth/2, 520), paddleWidth, 50, "cyan");
        this.paddleLeft.setSprite("../Breakout/Assets/paddle.png");
        this.topBorder = new GameObject(new Vector(canvasWidth / 2, 0), canvasWidth, 15, "red");
        this.bottomBorder = new GameObject(new Vector(canvasWidth / 2, canvasHeight), canvasWidth, 15, "cyan");
        this.rightBorder = new GameObject(new Vector(canvasWidth, canvasHeight / 2), 15, canvasHeight, "red");
        this.leftBorder = new GameObject(new Vector(0, canvasHeight / 2), 15, canvasHeight, "red");
        this.ball = new Ball(new Vector(canvasWidth / 2, 400), 20, 20, "white");
        this.ball.setSprite("../Breakout/Assets/ball.png");
        // Blocks
        this.blocks = [];
        // So the levels have different amount of rows
        let rows = this.level + 2;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 6; col++) {
                let block = new GameObject(new Vector(150 + col * 100, 60 + row * 40), 80, 30, "lime");
                this.blocks.push(block);
            }
        }
        this.actors = [
            this.paddleLeft,
            this.ball,
            this.topBorder,
            this.bottomBorder,
            this.rightBorder,
            this.leftBorder,
            ...this.blocks // To not need to specify each one individually
        ];
    }

    draw(ctx) {
        for (let actor of this.actors) {
            actor.draw(ctx);
        }
        this.scoreLabel.draw(ctx, "Blocks: " + this.destroyedBlocks);
        this.levelLabel.draw(ctx, "Level: " + this.level);
        this.livesLabel.draw(ctx, "Lives: " + this.lives);
        if (this.lives <= 0) {
            this.messageLabel.draw(ctx, "GAME OVER");
        }
        if (this.level == 3 && this.blocks.length == 0) {
            this.messageLabel.draw(ctx, "  YOU  WIN");
        }
    }

    // Updated function that detects collisions, moves the objects and advances levels
    update(deltaTime) {
        if (this.lives <= 0 || (this.level == 3 && this.blocks.length == 0)) {
            return;
        }
        
        // Move objects
        this.paddleLeft.update(deltaTime);
        this.ball.update(deltaTime);
        // Paddle collision
        if (boxOverlap(this.paddleLeft, this.ball)) {
            this.ball.velocity.y = -Math.abs(this.ball.velocity.y);
            ballSpeed *= speedIncrease;
        }
        // Top border collision
        if (boxOverlap(this.topBorder, this.ball)) {
            this.ball.velocity.y = Math.abs(this.ball.velocity.y);
            ballSpeed *= speedIncrease;
        }
        // Side border collision
        if (boxOverlap(this.leftBorder, this.ball) || boxOverlap(this.rightBorder, this.ball)) {
            this.ball.velocity.x *= -1;
            ballSpeed *= speedIncrease;
        }
        // Bottom border collision
        if (boxOverlap(this.bottomBorder, this.ball)) {
            this.lives--;
            this.ball.reset();
            this.inPlay = false;
        }
        // Block collision
        for (let i = 0; i < this.blocks.length; i++) {
            if (boxOverlap(this.blocks[i], this.ball)) {
                this.ball.velocity.y *= -1;
                this.actors.splice(this.actors.indexOf(this.blocks[i]), 1);
                this.ping.play();
                this.blocks.splice(i, 1);
                this.destroyedBlocks++;
                break;
            }
        }
        // Next level
        if (this.blocks.length == 0) { 
            if (this.level == 3) { 
                this.inPlay = false; 
                return; 
            } 
            this.level++; 
            this.initObjects(); 
            this.ball.reset(); 
            this.inPlay = false; 
        }
    }

    createEventListeners() {
        window.addEventListener('keydown', (event) => {
            if (event.key == 'a') {
                this.addKey('left', this.paddleLeft);
            }
            if (event.key == 'd') {
                this.addKey('right', this.paddleLeft);
            }
            if (event.key == ' ') {
                if (!this.inPlay) {
                    this.ball.serve();
                    this.inPlay = true;
                }
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.key == 'a') {
                this.delKey('left', this.paddleLeft);
            }
            if (event.key == 'd') {
                this.delKey('right', this.paddleLeft);
            }
        });
    }

    // Add the key pressed to the 'keys' array
    addKey(direction, object) {
        if (!object.keys.includes(direction)) {
            object.keys.push(direction);
        }
    }

    // Remove the key pressed
    delKey(direction, object) {
        if (object.keys.includes(direction)) {
            object.keys.splice(object.keys.indexOf(direction), 1);
        }
    }
}

// Starting function that will be called from the HTML page
function main() {
    // Get a reference to the object with id 'canvas' in the page
    const canvas = document.getElementById('canvas');
    // Resize the element
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    // Get the context for drawing in 2D
    ctx = canvas.getContext('2d');
    // Background color 
    ctx.canvas.style.background = "url(../Breakout/Assets/canvas1.png)";
    // Create the game object
    game = new Game();
    drawScene(0);
}

// Main loop function to be called once per frame
function drawScene(newTime) {
    // Compute the time elapsed since the last frame, in milliseconds
    let deltaTime = newTime - oldTime;
    // Clean the canvas so we can draw everything again
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    game.update(deltaTime);
    game.draw(ctx);
    oldTime = newTime;
    requestAnimationFrame(drawScene);
}