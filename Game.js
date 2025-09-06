import { Scene } from 'phaser';
import { Enemy } from '../Enemy.js';
import { Effects } from '../Effects.js';
import { WeatherSystem } from '../WeatherSystem.js';
import { MissionSystem } from '../MissionSystem.js';
import { LanguageManager } from '../LanguageManager.js';

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        // Initialize language manager
        this.langManager = new LanguageManager();
        
        // Set background
        this.cameras.main.setBackgroundColor(0x2c3e50);
        
        // Add background image
        this.background = this.add.image(640, 360, 'ruined_city_environment_2d_concept');
        this.background.setScale(1.5);
        
        // Initialize effects system
        this.effects = new Effects(this);
        
        // Initialize weather system
        this.weatherSystem = new WeatherSystem(this);
        
        // Initialize mission system
        this.missionSystem = new MissionSystem(this);
        
        // Create player
        this.player = this.add.sprite(100, 360, 'player_walk_animation_2d');
        this.player.setScale(0.8);
        this.player.setTint(0xffffff); // Ensure player is clearly visible
        
        // Player physics
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setSize(64, 64); // Set collision box
        
        // Player properties
        this.playerSpeed = 200;
        this.playerHealth = 100;
        this.playerMaxHealth = 100;
        
        // Game score
        this.score = 0;
        
        // Create cursor keys for movement
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD keys
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Shooting key
        this.shootKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Settings key
        this.settingsKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        
        // Language toggle key
        this.langToggleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
        
        // Bullets group
        this.bullets = this.physics.add.group({
            defaultKey: 'assault_rifle_2d_concept',
            maxSize: 20
        });
        
        // Enemies array
        this.enemies = [];
        this.spawnEnemies();
        
        // UI Elements
        this.createUI();
        
        // Mobile controls
        this.createMobileControls();
        
        // Enable physics
        this.physics.world.setBounds(0, 0, 1280, 720);
        
        // Collision detection
        this.setupCollisions();
        
        // Audio setup
        this.setupAudio();
    }
    
    setupAudio() {
        // Background battle sounds
        if (this.sound.get('battle_sounds')) {
            this.battleMusic = this.sound.add('battle_sounds', { 
                loop: true, 
                volume: 0.3 
            });
            this.battleMusic.play();
        }
        
        // Voice sounds
        this.soldierVoice = this.sound.add('soldier_voice_male', { volume: 0.5 });
        this.commanderVoice = this.sound.add('commander_voice_female', { volume: 0.5 });
    }
    
    spawnEnemies() {
        // Spawn initial enemies
        for (let i = 0; i < 5; i++) {
            let x = Phaser.Math.Between(400, 1200);
            let y = Phaser.Math.Between(100, 620);
            let enemy = new Enemy(this, x, y, 'enemy');
            this.enemies.push(enemy);
        }
        
        // Spawn new enemies periodically
        this.enemySpawnTimer = this.time.addEvent({
            delay: 10000, // 10 seconds
            callback: this.spawnNewEnemy,
            callbackScope: this,
            loop: true
        });
    }
    
    spawnNewEnemy() {
        if (this.enemies.length < 8) { // Max 8 enemies
            let x = Phaser.Math.Between(600, 1200);
            let y = Phaser.Math.Between(100, 620);
            let enemy = new Enemy(this, x, y, 'enemy');
            this.enemies.push(enemy);
        }
    }
    
    setupCollisions() {
        // Bullet vs Enemy collision
        this.physics.add.overlap(this.bullets, this.enemies.map(e => e.sprite), (bullet, enemySprite) => {
            let enemy = enemySprite.enemyRef;
            if (enemy && enemy.takeDamage(25)) {
                // Enemy died - create explosion effect
                this.effects.createExplosion(enemy.sprite.x, enemy.sprite.y, 0.8);
                this.effects.createBloodSplatter(enemy.sprite.x, enemy.sprite.y);
                
                this.score += 100;
                this.removeEnemy(enemy);
                
                // Update mission progress
                this.missionSystem.onEnemyKilled();
                
                // Play voice line occasionally
                if (Math.random() < 0.3) {
                    this.soldierVoice.play();
                }
            } else if (enemy) {
                // Enemy hit but not dead - show damage number
                this.effects.createDamageNumber(enemy.sprite.x, enemy.sprite.y - 20, 25);
                this.effects.createBloodSplatter(enemy.sprite.x, enemy.sprite.y);
            }
            
            // Remove bullet
            bullet.setActive(false);
            bullet.setVisible(false);
        });
    }
    
    removeEnemy(enemy) {
        let index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
            enemy.destroy();
        }
    }
    
    damagePlayer(damage) {
        this.playerHealth -= damage;
        if (this.playerHealth < 0) {
            this.playerHealth = 0;
        }
        
        // Game over check
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }
    
    createUI() {
        // Health bar background
        this.healthBarBg = this.add.rectangle(100, 50, 200, 20, 0x000000);
        this.healthBarBg.setStrokeStyle(2, 0xffffff);
        
        // Health bar
        this.healthBar = this.add.rectangle(100, 50, 196, 16, 0x00ff00);
        
        // Health text
        this.healthText = this.add.text(16, 16, this.langManager.getText('health') + ': 100/100', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: this.langManager.getFontFamily()
        });
        
        // Score text
        this.scoreText = this.add.text(16, 680, this.langManager.getText('score') + ': 0', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: this.langManager.getFontFamily()
        });
        
        // Language indicator
        this.langIndicator = this.add.text(1200, 16, this.langManager.getCurrentLanguage().toUpperCase(), {
            fontSize: '16px',
            fill: '#ffff00',
            fontFamily: 'Arial'
        });
        
        this.score = 0;
    }
    
    createMobileControls() {
        // Movement joystick area
        this.leftJoystick = this.add.circle(120, 600, 60, 0x000000, 0.3);
        this.leftJoystickKnob = this.add.circle(120, 600, 25, 0xffffff, 0.8);
        
        // Shooting button
        this.shootButton = this.add.circle(1160, 600, 50, 0xff0000, 0.7);
        this.add.text(1160, 600, this.langManager.getText('shoot'), {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: this.langManager.getFontFamily()
        }).setOrigin(0.5);
        
        // Language toggle button
        this.langButton = this.add.circle(1160, 100, 30, 0x4CAF50, 0.8);
        this.langButtonText = this.add.text(1160, 100, this.langManager.getCurrentLanguage().toUpperCase(), {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Make controls interactive
        this.leftJoystick.setInteractive();
        this.shootButton.setInteractive();
        this.langButton.setInteractive();
        
        // Touch controls
        this.setupTouchControls();
    }
    
    setupTouchControls() {
        let isDragging = false;
        let joystickCenter = { x: 120, y: 600 };
        
        this.leftJoystick.on('pointerdown', (pointer) => {
            isDragging = true;
        });
        
        this.input.on('pointermove', (pointer) => {
            if (isDragging) {
                let distance = Phaser.Math.Distance.Between(
                    joystickCenter.x, joystickCenter.y,
                    pointer.x, pointer.y
                );
                
                if (distance <= 60) {
                    this.leftJoystickKnob.x = pointer.x;
                    this.leftJoystickKnob.y = pointer.y;
                } else {
                    let angle = Phaser.Math.Angle.Between(
                        joystickCenter.x, joystickCenter.y,
                        pointer.x, pointer.y
                    );
                    this.leftJoystickKnob.x = joystickCenter.x + Math.cos(angle) * 60;
                    this.leftJoystickKnob.y = joystickCenter.y + Math.sin(angle) * 60;
                }
            }
        });
        
        this.input.on('pointerup', () => {
            isDragging = false;
            this.leftJoystickKnob.x = joystickCenter.x;
            this.leftJoystickKnob.y = joystickCenter.y;
        });
        
        // Shoot button
        this.shootButton.on('pointerdown', () => {
            this.shoot();
        });
        
        // Language toggle button
        this.langButton.on('pointerdown', () => {
            this.toggleLanguage();
        });
    }
    
    update() {
        this.handleMovement();
        this.handleShooting();
        this.updateUI();
    }
    
    handleMovement() {
        let velocityX = 0;
        let velocityY = 0;
        
        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -this.playerSpeed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = this.playerSpeed;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -this.playerSpeed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = this.playerSpeed;
        }
        
        // Mobile joystick controls
        let joystickX = this.leftJoystickKnob.x - 120;
        let joystickY = this.leftJoystickKnob.y - 600;
        
        if (Math.abs(joystickX) > 10 || Math.abs(joystickY) > 10) {
            velocityX = (joystickX / 60) * this.playerSpeed;
            velocityY = (joystickY / 60) * this.playerSpeed;
        }
        
        // Apply movement
        this.player.body.setVelocity(velocityX, velocityY);
        
        // Player animation based on movement
        if (velocityX !== 0 || velocityY !== 0) {
            // Moving animation would go here
            this.player.setTint(0xffffff);
        } else {
            // Idle animation
            this.player.setTint(0xcccccc);
        }
    }
    
    handleShooting() {
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.shoot();
        }
    }
    
    shoot() {
        let bullet = this.bullets.get();
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setPosition(this.player.x + 30, this.player.y);
            bullet.setScale(0.3);
            bullet.body.setVelocity(400, 0);
            
            // Add muzzle flash effect
            this.effects.createMuzzleFlash(this.player.x + 30, this.player.y);
            
            // Apply weather effects
            let weatherEffects = this.weatherSystem.getWeatherEffects();
            if (weatherEffects.accuracy < 1.0) {
                // Add some randomness to bullet trajectory in bad weather
                let randomY = (Math.random() - 0.5) * 100 * (1 - weatherEffects.accuracy);
                bullet.body.setVelocityY(randomY);
            }
            
            // Remove bullet when it goes off screen
            this.time.delayedCall(2000, () => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
        }
    }
    
    updateUI() {
        // Update health bar
        let healthPercent = this.playerHealth / this.playerMaxHealth;
        this.healthBar.width = 196 * healthPercent;
        
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xffff00; // Yellow
        } else {
            this.healthBar.fillColor = 0xff0000; // Red
        }
        
        // Update text with current language
        this.healthText.setText(`${this.langManager.getText('health')}: ${this.playerHealth}/${this.playerMaxHealth}`);
        this.scoreText.setText(`${this.langManager.getText('score')}: ${this.score}`);
        this.langIndicator.setText(this.langManager.getCurrentLanguage().toUpperCase());
    }
    
    toggleLanguage() {
        let currentLang = this.langManager.getCurrentLanguage();
        let newLang = currentLang === 'ar' ? 'en' : 'ar';
        this.langManager.setLanguage(newLang);
        
        // Update UI texts
        this.updateUI();
        
        // Update button text
        if (this.langButtonText) {
            this.langButtonText.setText(newLang.toUpperCase());
        }
        
        // Update mission system language
        if (this.missionSystem) {
            this.missionSystem.updateLanguage(this.langManager);
        }
        
        // Update weather system language
        if (this.weatherSystem) {
            this.weatherSystem.updateLanguage(this.langManager);
        }
    }
    
    update() {
        this.handleMovement();
        this.handleShooting();
        this.updateUI();
        
        // Handle settings key
        if (Phaser.Input.Keyboard.JustDown(this.settingsKey)) {
            this.scene.pause();
            this.scene.launch('Settings');
        }
        
        // Handle language toggle
        if (Phaser.Input.Keyboard.JustDown(this.langToggleKey)) {
            this.toggleLanguage();
        }
        
        // Update enemies
        this.enemies.forEach(enemy => {
            enemy.update(this.time.now, this.game.loop.delta);
        });
        
        // Update mission system
        this.missionSystem.update();
    }
    
    handleMovement() {
        let velocityX = 0;
        let velocityY = 0;
        
        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -this.playerSpeed;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = this.playerSpeed;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -this.playerSpeed;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = this.playerSpeed;
        }
        
        // Mobile joystick controls
        let joystickX = this.leftJoystickKnob.x - 120;
        let joystickY = this.leftJoystickKnob.y - 600;
        
        if (Math.abs(joystickX) > 10 || Math.abs(joystickY) > 10) {
            velocityX = (joystickX / 60) * this.playerSpeed;
            velocityY = (joystickY / 60) * this.playerSpeed;
        }
        
        // Apply movement
        this.player.body.setVelocity(velocityX, velocityY);
        
        // Player animation based on movement
        if (velocityX !== 0 || velocityY !== 0) {
            // Moving animation would go here
            this.player.setTint(0xffffff);
        } else {
            // Idle animation
            this.player.setTint(0xcccccc);
        }
    }
    
    handleShooting() {
        if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
            this.shoot();
        }
    }
    
    shoot() {
        let bullet = this.bullets.get();
        
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.setPosition(this.player.x + 30, this.player.y);
            bullet.setScale(0.3);
            bullet.body.setVelocity(400, 0);
            
            // Add muzzle flash effect
            this.effects.createMuzzleFlash(this.player.x + 30, this.player.y);
            
            // Apply weather effects
            let weatherEffects = this.weatherSystem.getWeatherEffects();
            if (weatherEffects.accuracy < 1.0) {
                // Add some randomness to bullet trajectory in bad weather
                let randomY = (Math.random() - 0.5) * 100 * (1 - weatherEffects.accuracy);
                bullet.body.setVelocityY(randomY);
            }
            
            // Remove bullet when it goes off screen
            this.time.delayedCall(2000, () => {
                if (bullet.active) {
                    bullet.setActive(false);
                    bullet.setVisible(false);
                }
            });
        }
    }
    
    updateUI() {
        // Update health bar
        let healthPercent = this.playerHealth / this.playerMaxHealth;
        this.healthBar.width = 196 * healthPercent;
        
        if (healthPercent > 0.6) {
            this.healthBar.fillColor = 0x00ff00; // Green
        } else if (healthPercent > 0.3) {
            this.healthBar.fillColor = 0xffff00; // Yellow
        } else {
            this.healthBar.fillColor = 0xff0000; // Red
        }
        
        // Update text with current language
        this.healthText.setText(`${this.langManager.getText('health')}: ${this.playerHealth}/${this.playerMaxHealth}`);
        this.scoreText.setText(`${this.langManager.getText('score')}: ${this.score}`);
        this.langIndicator.setText(this.langManager.getCurrentLanguage().toUpperCase());
    }
    
    toggleLanguage() {
        let currentLang = this.langManager.getCurrentLanguage();
        let newLang = currentLang === 'ar' ? 'en' : 'ar';
        this.langManager.setLanguage(newLang);
        
        // Update UI texts
        this.updateUI();
        
        // Update button text
        if (this.langButtonText) {
            this.langButtonText.setText(newLang.toUpperCase());
        }
        
        // Update mission system language
        if (this.missionSystem) {
            this.missionSystem.updateLanguage(this.langManager);
        }
        
        // Update weather system language
        if (this.weatherSystem) {
            this.weatherSystem.updateLanguage(this.langManager);
        }
    }
}

