import { Sitting, Running, Jumping, Falling, Rolling, Diving, Hit } from "./playerStates.js";
import { CollisionAnimation } from "./collisionAnimation.js";
import { FloatingMessage } from "./floatingMessages.js";

export class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = 0;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.vy = 0;
        this.weight = 1;
        this.image = document.getElementById('player');
        this.frameX = 0;
        this.frameY = 0;
        this.maxFrame = 4;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.speed = 0;
        this.maxSpeed = 10;
        this.currentState = null;
        this.states = [
            new Sitting(this.game),
            new Running(this.game),
            new Jumping(this.game),
            new Falling(this.game),
            new Rolling(this.game),
            new Diving(this.game),
            new Hit(this.game)
        ];
    }

    update(input, deltaTime) {
        this.checkCollision();
        this.currentState.handleInput(input);

        // horizontal movement
        this.x += this.speed;
        if (input.includes('d') && this.currentState !== this.states[6]) this.speed = this.maxSpeed;
        else if (input.includes('a') && this.currentState !== this.states[6]) this.speed = -this.maxSpeed;
        else this.speed = 0;

        // horizontal boundaries
        if (this.x < 0) this.x = 0;
        else if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;

        // vertical movement
        this.y += this.vy;
        if (!this.onGround()) this.vy += this.weight;
        else this.vy = 0;

        // vertical boundaries
        if (this.y > this.game.height - this.height - this.game.groundMargin) this.y = this.game.height - this.height - this.game.groundMargin;

        // sprite animation
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
    }

    takeDamage() {
        this.game.lives -= 1;
        if (this.game.lives <= 0) {
            // Lógica para el jugador derrotado o fin del juego
            this.game.gameOver = true; // Indica que el juego ha terminado
            // Puedes agregar aquí lógica para mostrar la pantalla de "Game Over"
        }
    }
    

    onGround() {
        return (this.y >= this.game.height - this.height - this.game.groundMargin);
    }

    setState(state, speed) {
        this.currentState = this.states[state];
        this.game.speed = this.game.maxSpeed * speed;
        this.currentState.enter();
    }

    // Nueva función para manejar la colisión con enemigos según el estado actual del jugador
    handleEnemyCollision(enemy) {
        enemy.markedForDeletion = true;
        this.game.collisions.push(new CollisionAnimation(this.game, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
    
        if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
            this.game.score++;
            this.game.floatingMessages.push(new FloatingMessage('+1', enemy.x, enemy.y, 150, 50));
        } else {
            this.loseLife();
        }
    
        // Verificamos si el enemigo es el jefe final
        if (enemy instanceof FinalBoss1) {
            const boss = enemy;
            if (!boss.isUsingSpecial) {
                // El jefe no está usando su habilidad especial, el jugador pierde 2 vidas
                this.loseLife();
            } else {
                // El jefe está usando su habilidad especial, el jefe pierde 10 de vida
                boss.takeDamage(10);
            }
        }
    }
    

    // Función para perder una vida
    loseLife() {
        this.game.lives--;
        if (this.game.lives <= 0) {
            this.game.gameOver = true;
        }
    }

    checkCollision(checkWithBoss = false) {
        const entitiesToCheck = checkWithBoss ? [this.game.finalBoss] : this.game.enemies;
        entitiesToCheck.forEach(entity => {
            if (
                entity.x < this.x + this.width &&
                entity.x + entity.width > this.x &&
                entity.y < this.y + this.height &&
                entity.y + entity.height > this.y
            ) {
                if (checkWithBoss) {
                    // Colisión con el jefe
                    const boss = this.game.finalBoss;
                    if (boss && !boss.isUsingSpecial) {
                        if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
                            // El jugador está en estado ROLLING o DIVING, el jefe pierde 10 de vida
                            boss.takeDamage(10);
                        } else {
                            // El jugador no está en estado ROLLING o DIVING, el jugador pierde una vida
                            this.game.player.loseLife();
                        }
                    }
                } else {
                    // Colisión con un enemigo común
                    entity.markedForDeletion = true;
                    this.game.collisions.push(new CollisionAnimation(this.game, entity.x + entity.width * 0.5, entity.y + entity.height * 0.5));
                    if (this.currentState === this.states[4] || this.currentState === this.states[5]) {
                        this.game.score++;
                        this.game.floatingMessages.push(new FloatingMessage('+1', entity.x, entity.y, 150, 50));
                    } else {
                        this.setState(6, 0);
                        this.game.lives--;
                        if (this.game.lives <= 0) this.game.gameOver = true;
                    }
                }
            }
        });
    }
}    