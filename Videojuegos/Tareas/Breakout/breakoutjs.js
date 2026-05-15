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
let paddleSpeed = 0.8;
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
        this.gameOverImg = new Image(); 
        this.gameOverImg.src = "../Breakout/Assets/gameover.png";  //game Over Image file
        this.gameWinImg = new Image();
        this.gameWinImg.src = "../Breakout/Assets/win.png"; //Win screen Image file
        //this.messageLabel = new TextLabel(100,300, "100px Arial", "Red");
        this.heart = new Image();
        this.heart.src = "../Breakout/Assets/hearts.png"; //lives Image file
        this.heartextra = new Image();
        this.heartextra.src = "../Breakout/Assets/heartextra.png"; //extra live Image file
        this.inPlay = false;
        this.initObjects();
        this.ping = document.createElement("audio");
        this.ping.src = "4387__noisecollector__pongblipe4.wav";
        this.sounds = { //Sounds
            hit: new Audio("../Breakout/Assets/sounds/hit.wav"),
            blocksound: new Audio("../Breakout/Assets/sounds/block.wav"),
            freeze: new Audio("../Breakout/Assets/sounds/freeze.wav"),
            extralive: new Audio("../Breakout/Assets/sounds/extralive.wav"),
            win: new Audio("../Breakout/Assets/sounds/win.wav"),
            gameover: new Audio("../Breakout/Assets/sounds/gameover.wav")
        };
    }

    // Create the objects in the game
    initObjects() {
        //Paddle
        let paddleWidth = 120;
        this.paddleLeft = new Paddle(new Vector(canvasWidth/2, 520), paddleWidth, 50, "cyan");
        this.paddleLeft.setSprite("../Breakout/Assets/paddle.png");
        //canvas borders
        this.topBorder = new GameObject(new Vector(canvasWidth / 2, 0), canvasWidth, 15, "black");
        this.bottomBorder = new GameObject(new Vector(canvasWidth / 2, canvasHeight), canvasWidth, 15, "red");
        this.rightBorder = new GameObject(new Vector(canvasWidth, canvasHeight / 2), 15, canvasHeight, "black");
        this.leftBorder = new GameObject(new Vector(0, canvasHeight / 2), 15, canvasHeight, "black");
        //ball sprite with its image file
        this.ball = new Ball(new Vector(canvasWidth / 2, 400), 20, 20, "white");
        this.ball.setSprite("../Breakout/Assets/ball.png");
        // Blocks
        this.blocks = [];
        // Add rows for each level
        let rows = this.level + 2;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 8; col++) {
                //Probabilities of generating magic blocks
                let bloquemagico = Math.random() < 0.05;
                let bloquebendicion = Math.random() < 0.05;
                let bloquevida = 0;
                if(this.lives < 5){ //only generates extra lives in levels when you have less than 5 lives
                    bloquevida = Math.random() < 0.008;
                }
                let block = new GameObject(new Vector(50 + col * 100, 60 + row * 40), 80, 30, "cyan");
                //adds the ability if the probability landed
                block.bloquemagico = bloquemagico; 
                block.bloquebendicion = bloquebendicion;
                block.bloquevida = bloquevida;
                //Different block visuals for each level and abilities
                if(this.level == 1){
                    block.setSprite("../Breakout/Assets/block1.png");
                }
                if(this.level == 2){
                    block.setSprite("../Breakout/Assets/block2.png");
                }
                if(this.level == 3){
                    block.setSprite("../Breakout/Assets/block3.png");
                }
                if(bloquemagico){
                    block.setSprite("../Breakout/Assets/blockmagico.png");
                }
                if(bloquebendicion){
                    block.setSprite("../Breakout/Assets/blockbendicion.png");
                }
                if(bloquevida){
                    block.setSprite("../Breakout/Assets/bloquevida.png");
                }
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
            ...this.blocks 
        ];
    }

    draw(ctx) {
        for (let actor of this.actors) {
            actor.draw(ctx);
        }
        //Counts the amount of destroyed blocks
        this.scoreLabel.draw(ctx, "Blocks: " + this.destroyedBlocks);
        //Counts the level you are on
        this.levelLabel.draw(ctx, "Level: " + this.level);

        //Draws the lives but if theres more than 3, the extra live image will appear
        for(let i = 0; i < this.lives; i++) {
            if(i < 3){
                ctx.drawImage(this.heart, 520 + i * 50, 530, 48,48);
            }
            else{
                ctx.drawImage(this.heartextra, 520 + i * 50, 530, 48,48);
            }
            
        }
        //Game over situation
        if (this.lives <= 0) {
            ctx.drawImage(this.gameOverImg, (canvasWidth /2) - (600/2), (canvasHeight / 2) - (200/2), 600,200);
            this.sounds.gameover.play();
        }
        //Win Situation
        if (this.level == 3 && this.blocks.length == 0) {
            ctx.drawImage(this.gameWinImg, (canvasWidth /2) - (600/2), (canvasHeight / 2) - (200/2), 600,200);
            this.sounds.win.play();
        }
    }
    //Apply Curse function to slow down the sword
    aplicarMaldicion(){
        this.sounds.freeze.play();
        paddleSpeed = 0.4;
        this.paddleLeft.setSprite("../Breakout/Assets/paddlecongelada.png");
        setTimeout(() => { //Timeout of 5 seconds to revert
            paddleSpeed = 0.8;
            this.paddleLeft.setSprite("../Breakout/Assets/paddle.png");
        }, 5000);
    }
    //Apply blessing and slowing down the ball
    aplicarBendicion(){
        this.sounds.freeze.play();
        this.ball.velocity.y = this.ball.velocity.y/2;
        this.ball.setSprite("../Breakout/Assets/ballcongelada.png");
        setTimeout(() => {
            paddleSpeed = 0.8;
            this.ball.velocity.y = this.ball.velocity.y *1.75;
            this.ball.setSprite("../Breakout/Assets/ball.png");
        }, 5000);
    }
    // This function takes care of moving objects, collisions and finishing the game
    update(deltaTime) {
        //game ended situation
        if (this.lives <= 0 || (this.level == 3 && this.blocks.length == 0)) {
            return;
        }
        
        // Move objects
        this.paddleLeft.update(deltaTime);
        this.ball.update(deltaTime);

        // Paddle collision
        if (boxOverlap(this.paddleLeft, this.ball)) {
            this.sounds.hit.play();
            //calculates the hit point on the paddle
            let hitPoint = (this.ball.position.x - this.paddleLeft.position.x) / 60;
            
            //changes trajectory depending on the hitpoint
            this.ball.velocity.x = hitPoint;
            this.ball.velocity.y = -Math.abs(this.ball.velocity.y);

            ballSpeed *= speedIncrease;
        }

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

        // Block collisions
        for (let i = 0; i < this.blocks.length; i++) {
            if (boxOverlap(this.blocks[i], this.ball)) {
                this.ball.velocity.y *= -1;
                //If the ball hits a cursed block it calls the function
                if(this.blocks[i].bloquemagico){
                    this.aplicarMaldicion();
                }
                //If the ball hits a blessed block it calls the function
                else if(this.blocks[i].bloquebendicion){
                    this.aplicarBendicion();
                }
                //If the ball hits an extra life block it plays the sound and adds an extra life
                else if(this.blocks[i].bloquevida){
                    this.sounds.extralive.play();
                    this.lives += 1;
                }
                //If the ball hits a normal block it just plays the sound
                else{
                    this.sounds.blocksound.play();
                }

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
    //ctx.canvas.style.background = "url(https://i.pinimg.com/236x/67/58/fd/6758fdd6f636259b36b6ddfdc765b474.jpg)";
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