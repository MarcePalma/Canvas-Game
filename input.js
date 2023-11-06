// InputHandler class
export class InputHandler {
    constructor(game) {
        this.game = game;
        this.keys = [];

        window.addEventListener('keydown', (e) => {
            if (this.keys.indexOf(e.key) === -1) {
                this.keys.push(e.key);
            } else if (e.key === 'ArrowRight') {
                if (!this.game.finalBoss.isAttacking) { // Solo detenemos el juego si el jefe final no está atacando
                    this.game.debug = !this.game.debug;
                    this.game.isPaused = !this.game.isPaused; // Agregamos la propiedad isPaused al juego
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys.splice(this.keys.indexOf(e.key), 1);
        });
    }

    getKeys() {
        return this.keys;
    }
}
