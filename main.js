import { Player } from './player.js';
import { InputHandler } from './input.js';
import { Background } from './background.js';
import { FlyingEnemy, ClimbingEnemy, GroundEnemy, FinalBoss1 } from './enemies.js';
import { UI } from './UI.js';

window.addEventListener('load', function () {
    /** @type {HTMLCanvasElement} */
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    class Game {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.groundMargin = 40;
            this.speed = 0;
            this.maxSpeed = 3;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.UI = new UI(this);
            this.enemies = [];
            this.particles = [];
            this.collisions = [];
            this.floatingMessages = [];
            this.maxParticles = 50;
            this.enemyTimer = 0;
            this.enemyInterval = 1000;
            this.debug = false;
            this.score = 0;
            this.shadowColor = 'black';
            this.fontColor = 'red';
            this.time = 0;
            this.gameOver = false;
            this.lives = 5;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            this.finalBoss = null;
            this.isFinalBossSpawned = false;
            this.isFinalBossAdded = false;
        }

        update(deltaTime) {
            this.time += deltaTime;
            if (this.time > this.maxTime) this.gameOver = true;
            this.background.update();
            this.player.update(this.input.keys, deltaTime);
        
            // Handle enemies
            if (this.enemyTimer > this.enemyInterval) {
                this.addEnemy();
                this.enemyTimer = 0;
            } else {
                this.enemyTimer += deltaTime;
            }
        
            // Check if the final boss has spawned and if it is added to the enemies array
            if (this.isFinalBossSpawned && !this.isFinalBossAdded) {
                this.enemies.push(this.finalBoss);
                console.log("Final boss added!");
                this.isFinalBossAdded = true; // Set the variable to true so it won't be added again
            }
        
            this.enemies.forEach(enemy => enemy.update(deltaTime));
        
            // Handle messages
            this.floatingMessages.forEach(message => {
                message.update();
            });
        
            // Handle particles
            this.particles.forEach(particle => particle.update());
            if (this.particles.length > this.maxParticles) {
                this.particles.length = this.maxParticles;
            }
        
            // Handle collision sprites
            this.collisions.forEach(collision => collision.update(deltaTime));
            this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);
            this.particles = this.particles.filter(particle => !particle.markedForDeletion);
            this.collisions = this.collisions.filter(collision => !collision.markedForDeletion);
            this.floatingMessages = this.floatingMessages.filter(message => !message.markedForDeletion);
        
            // Verificar si el juego ha terminado y el jugador ha muerto
            if (this.gameOver && this.player.isDead) {
                this.restartGame();
            }
        }
        
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.enemies.forEach(enemy => {
                enemy.draw(context);
            });
            this.particles.forEach(particle => {
                particle.draw(context);
            });
            this.collisions.forEach(collision => {
                collision.draw(context);
            });
            this.floatingMessages.forEach(message => {
                message.draw(context);
            });
            this.UI.draw(context);
        }
        addEnemy() {
            if (this.isFinalBossAdded || this.isFinalBossSpawned) {
                return;
            }
            if (this.score >= 20) {
                this.isFinalBossSpawned = true;
                this.finalBoss = new FinalBoss1(this);
                this.enemies.push(this.finalBoss);
                console.log("Jefe final agregado!");
                this.isFinalBossAdded = true; // Establecemos la variable en true para que no se agregue nuevamente
                return;
            }
            if (this.speed > 0 && Math.random() < 0.5) {
                this.enemies.push(new GroundEnemy(this));
            } else if (this.speed > 0) {
                this.enemies.push(new ClimbingEnemy(this));
            }
            this.enemies.push(new FlyingEnemy(this));
        }
        restartGame() {
            this.isFinalBossSpawned = false;
            this.isFinalBossAdded = false;
            this.score = 0;
            this.gameOver = false;
            this.lives = 5;
            this.player.currentState = this.player.states[0];
            this.player.currentState.enter();
            this.enemies = [];
        }
    }


    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        if (!game.gameOver) requestAnimationFrame(animate);
    }
    animate(0);

});



