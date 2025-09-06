class PreloaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloaderScene' });
    }

    preload() {
        // Create loading bar
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // Loading text
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px Arial',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);

        // Progress bar background
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 50);

        // Progress text
        const percentText = this.add.text(width / 2, height / 2 + 25, '0%', {
            font: '18px Arial',
            fill: '#ffffff'
        });
        percentText.setOrigin(0.5, 0.5);

        // Update progress bar
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 10, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        // Load assets
        this.load.setPath('assets/');
        
        // Load images
        this.load.image('player', 'images/player_character_2d_concept.png');
        this.load.image('enemy', 'images/enemy.png');
        this.load.image('background', 'images/ruined_city_environment_2d_concept.png');
        this.load.image('weapon', 'images/assault_rifle_2d_concept.png');
        this.load.image('base', 'images/initial_base_concept.png');
        this.load.image('playerWalk', 'images/player_walk_animation_2d.png');
        
        // Load audio
        this.load.audio('battleSounds', 'audio/battle_sounds.wav');
        this.load.audio('soldierVoice', 'audio/soldier_voice_male.wav');
        this.load.audio('commanderVoice', 'audio/commander_voice_female.wav');
    }

    create() {
        // Start the main game scene
        this.scene.start('GameScene');
    }
}

