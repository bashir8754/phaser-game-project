// Main game configuration and initialization
const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        min: {
            width: 800,
            height: 450
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    scene: [
        PreloaderScene,
        GameScene
    ]
};

// Initialize the game when the page loads
window.addEventListener('load', () => {
    const game = new Phaser.Game(config);
});


