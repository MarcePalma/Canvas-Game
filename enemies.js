class Enemy {
    constructor() {
        this.frameX = 0;
        this.frameY = 0;
        this.fps = 20;
        this.frameInterval = 1000 / this.fps;
        this.frameTimer = 0;
        this.markedForDeletion = false;
    }
    changeAnimation(newAnimation) {
        if (this.currentAnimation !== newAnimation) {
            this.currentAnimation = newAnimation;
            this.frameX = 0;
        }
    }
    // Nueva función para manejar las animaciones
    animate(maxFrame, animationSpeed, onEnd = null, deltaTime) {
        if (this.currentAnimation !== this.lastAnimation) {
            this.frameX = 0;
            this.lastAnimation = this.currentAnimation;
        }
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < maxFrame) this.frameX++;
            else {
                this.frameX = 0;
                if (onEnd) onEnd();
            }
        } else {
            this.frameTimer += deltaTime;
        }
    }

    update(deltaTime) {
        // movement
        this.x -= this.speedX + this.game.speed;
        this.y += this.speedY;
        if (this.frameTimer > this.frameInterval) {
            this.frameTimer = 0;
            if (this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        } else {
            this.frameTimer += deltaTime;
        }
        // check if off screen
        if (this.x + this.width < 0) this.markedForDeletion = true;
    }

    draw(context) {
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.width,
            this.height,
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}  

export class FlyingEnemy extends Enemy {
    constructor(game){
        super();
        this.game = game;
        this.width = 60;
        this.height = 44;
        this.x = this.game.width + Math.random() * this.game.width * 0.5;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = Math.random() + 1;
        this.speedY = 0;
        this.maxFrame = 5;
        this.image = document.getElementById('enemy_fly');
        this.angle = 0;
        this.va = Math.random() * 0.1 + 0.1;
    }
    update(deltaTime){
        super.update(deltaTime);
        this.angle += this.va;
        this.y += Math.sin(this.angle);
    }
}

export class GroundEnemy extends Enemy {
    constructor(game){
        super();
        this.game = game;
        this.width = 60;
        this.height = 87;
        this.x = this.game.width;
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.speedX = 0;
        this.speedY = 0;
        this.maxFrame = 1;
        this.image = document.getElementById('enemy_plant');
    }
}

export class ClimbingEnemy extends Enemy {
    constructor(game){
        super();
        this.game = game;
        this.width = 120;
        this.height = 144;
        this.x = this.game.width;
        this.y = Math.random() * this.game.height * 0.5;
        this.speedX = 0;
        this.speedY = Math.random() > 0.5 ? 1 : -1;
        this.maxFrame = 5;
        this.image = document.getElementById('enemy_spider_big');
    }
    update(deltaTime){
        super.update(deltaTime);
        if (this.y > this.game.height - this.height - this.game.groundMargin) this.speedY *= -1;
        if (this.y < -this.height) this.markedForDeletion = true;
    }
    draw(context){
        super.draw(context);
        context.strokeStyle = 'white';
        context.beginPath();
        context.moveTo(this.x + this.width*0.5, 0);
        context.lineTo(this.x + this.width*0.5, this.y + 45);
        context.stroke();
    }
}

export class FinalBoss1 extends Enemy {
    constructor(game) {
        super();
        this.game = game;
        this.width = 100;
        this.height = 91.3;
        this.x = this.game.width / 2; // Centrar el jefe horizontalmente en el canvas
        this.y = this.game.height - this.height - this.game.groundMargin;
        this.speedX = 0; // Velocidad horizontal inicial (el jefe está quieto al inicio)
        this.speedY = 0;
        this.maxFrame = 6;
        this.image = document.getElementById('boss1');
        this.health = 100;
        this.attackDamage = 25;
        this.attackCooldown = 3000;
        this.lastAttackTime = 0;
        this.followSpeed = 0.1;
        this.followPlayer = false;
        this.targetPlayer = null;
        this.isUsingSpecial = false;
        this.isAttacking = false;
        this.isVisible = true;
        this.attackTimer = 0;
        this.currentFrame = 0;
        this.currentFrameTime = 0;
        this.frameDuration = 100; // Duración de cada fotograma en milisegundos (ajustar según la velocidad de la animación)
        this.animationLoop = true; // Bandera para indicar si la animación se repite en un ciclo
        this.currentAnimation = 'IDLE'; // Animación actual (comienza con IDLE)
    }

    takeDamage(damage) {
        if (this.isUsingSpecial) return;
        this.health -= damage;
        if (this.health <= 0) {
            this.changeAnimation('DEATH', 6, false); // El 6 es la cantidad de fotogramas de la animación
        } else {
            this.changeAnimation('HURT', 6, false); // El 6 es la cantidad de fotogramas de la animación
        }
    }

    update(deltaTime) {
        // Llamar a la función update de la clase Enemy (la clase base)
        super.update(deltaTime);

        // Actualizar temporizador para ataques (aún no implementado)
        this.attackTimer += deltaTime;

        // Actualizar la animación actual
        this.updateAnimation(deltaTime);
    }

     // Métodos de ataque
     attack1() {
        // Ataque 1: Implementación del ataque
        if (this.currentAnimation !== 'ATTACK1') {
            this.isAttacking = true;
            this.changeAnimation('ATTACK1', 6, false); // El 6 es la cantidad de fotogramas de la animación
            this.speedX = 0; // Detener el movimiento horizontal durante el ataque
            this.speedY = 0; // Detener el movimiento vertical durante el ataque
            // Agregar aquí la lógica del ataque 1, por ejemplo, infligir daño al jugador, etc.
            this.game.player.takeDamage(this.attackDamage); // Ejemplo: hacer daño al jugador
            setTimeout(() => {
                this.resetAttackTimer();
                this.stopAttack();
            }, this.attackCooldown);
        }
    }

    attack2() {
        // Ataque 2: Implementación del ataque
        if (this.currentAnimation !== 'ATTACK2') {
            this.isAttacking = true;
            this.changeAnimation('ATTACK2', 6, false); // El 6 es la cantidad de fotogramas de la animación
            this.speedX = 0; // Detener el movimiento horizontal durante el ataque
            this.speedY = 0; // Detener el movimiento vertical durante el ataque
            // Agregar aquí la lógica del ataque 2, por ejemplo, infligir daño al jugador, etc.
            this.game.player.takeDamage(this.attackDamage); // Ejemplo: hacer daño al jugador
            setTimeout(() => {
                this.resetAttackTimer();
                this.stopAttack();
            }, this.attackCooldown);
        }
    }

    attack3() {
        // Ataque 3: Embestida hacia el jugador
        if (this.currentAnimation !== 'ATTACK3') {
            this.isAttacking = true;
            this.changeAnimation('ATTACK3', 6, false); // El 6 es la cantidad de fotogramas de la animación
            this.speedX = 3; // Velocidad de embestida (puedes ajustar este valor)
        }
    }

    attack4() {
        // Ataque 4: Embestida hacia el jugador mientras muerde con la primera cabeza
        if (this.currentAnimation !== 'ATTACK4') {
            this.isAttacking = true;
            this.changeAnimation('ATTACK4', 6, false); // El 6 es la cantidad de fotogramas de la animación
            this.speedX = 2; // Velocidad de embestida (puedes ajustar este valor)
        }
    }
    updateAnimation(deltaTime) {
        if (!this.animationLoop && this.currentFrame === this.maxFrame - 1) {
            // Si la animación no se repite y se ha alcanzado el último fotograma, detener la animación
            this.isAttacking = false;
            this.currentFrameTime = 0;
            this.currentFrame = 0;
            this.speedX = this.followSpeed; // Reanudar el movimiento horizontal normal
            return;
        }

        this.currentFrameTime += deltaTime;
        if (this.currentFrameTime >= this.frameDuration) {
            this.currentFrame++;
            this.currentFrameTime = 0;
            if (this.currentFrame >= this.maxFrame) {
                // Si se ha alcanzado el último fotograma, volver al inicio de la animación
                this.currentFrame = 0;
            }
        }
        if (this.isAttacking && !this.animationLoop && this.currentFrame === this.maxFrame - 1) {
            // Si la animación no se repite y se ha alcanzado el último fotograma del ataque, detener el ataque
            this.isAttacking = false;
            this.currentFrameTime = 0;
            this.currentFrame = 0;
            this.speedX = this.followSpeed; // Reanudar el movimiento horizontal normal
        }
    }
        draw(context) {
        if (!this.isVisible) return;

        if (this.game.debug) {
            // Dibujar el hitbox del jefe para fines de depuración
            context.strokeStyle = 'red';
            context.strokeRect(this.x, this.y, this.width, this.height);
        }

        // Escalamos el jefe en el canvas usando el valor deseado de escala (por ejemplo, 1.2 para un 20% más grande)
        const scale = 2;
        const scaledWidth = this.width * scale;
        const scaledHeight = this.height * scale;

        context.drawImage(
            this.image,
            this.currentFrame * this.width, // Usamos el fotograma actual para obtener la porción correcta de la spritesheet
            0,
            this.width,
            this.height,
            this.x - (scaledWidth - this.width) / 2, // Centramos la imagen escalada en X
            this.y - (scaledHeight - this.height) / 2, // Centramos la imagen escalada en Y
            scaledWidth,
            scaledHeight
        );

        // Dibujar la barra de vida del jefe
        context.fillStyle = 'red';
        context.fillRect(this.x, this.y - 10, (this.health / 500) * scaledWidth, 5);
    }
    
    stopAttack() {
        this.isAttacking = false;
        this.speedX = this.followSpeed; // Reanudar el movimiento horizontal normal
    }

    changeAnimation(animationName, maxFrame, animationLoop) {
        this.currentAnimation = animationName;
        this.maxFrame = maxFrame;
        this.animationLoop = animationLoop;
        this.currentFrame = 0;
        this.currentFrameTime = 0;
    }
}
