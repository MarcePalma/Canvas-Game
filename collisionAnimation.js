export class CollisionAnimation {
    constructor(game, x, y) {
        this.game = game;
        this.image = document.getElementById('collisionAnimation');
        this.spriteWidth = 100;
        this.spriteHeight = 90;
        this.sizeModifier = Math.random() + 0.5;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = x - this.width * 0.5;
        this.y = y - this.height * 0.5;
        this.frameX = 0;
        this.maxFrame = 4;
        this.markedForDeletion = false;
        this.fps = Math.random() * 10 + 5;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;

        // Verificar colisión con el jefe
        this.checkCollisionWithBoss();
    }

    checkCollisionWithBoss() {
        const boss = this.game.finalBoss;
        if (boss && !boss.isUsingSpecial) {
            if (this.collidesWith(boss)) {
                // Si el jugador está en estado ROLLING o DIVING, el jefe pierde 10 de vida
                if (
                    this.game.player.currentState === this.game.player.states[2] || // Player State ROLLING
                    this.game.player.currentState === this.game.player.states[3] // Player State DIVING
                ) {
                    boss.takeDamage(10);
                } else {
                    // Si el jugador no está en estado ROLLING o DIVING, el jugador pierde una vida
                    this.game.player.loseLife();
                }
            }
        }
    }
    

    update(deltaTime) {
        this.x -= this.game.speed;
        if (this.frameTimer > this.frameInterval) {
            this.frameX++;
            this.frameTimer = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        if (this.frameX > this.maxFrame) this.markedForDeletion = true;
    }

    draw(context) {
        context.drawImage(
            this.image,
            this.frameX * this.spriteWidth,
            0,
            this.spriteWidth,
            this.spriteHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }

    collidesWith(entity) {
        return (
            this.x < entity.x + entity.width &&
            this.x + this.width > entity.x &&
            this.y < entity.y + entity.height &&
            this.y + this.height > entity.y
        );
    }
}
