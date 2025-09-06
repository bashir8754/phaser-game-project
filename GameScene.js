class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        // Game world bounds
        this.physics.world.setBounds(0, 0, 1280, 720);

        // Add background
        this.background = this.add.image(640, 360, 'background');
        this.background.setDisplaySize(1280, 720);

        // Create bullet graphics for reuse
        this.createBulletGraphics();

        // Create player
        this.createPlayer();
        
        // Create enemies
        this.createEnemies();
        
        // Create bullets group
        this.bullets = this.physics.add.group({
            maxSize: 50
        });

        // Create enemy bullets group
        this.enemyBullets = this.physics.add.group({
            maxSize: 50
        });

        // Create input controls
        this.createControls();
        
        // Create UI
        this.createUI();
        
        // Create collisions
        this.createCollisions();
        
        // Game variables
        this.score = 0;
        this.playerHealth = 100;
        this.gameTime = 0;
        this.playerInvulnerable = false;
        
        // Start enemy spawning
        this.enemySpawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        // Play background music
        if (this.sound.get('battleSounds')) {
            this.battleMusic = this.sound.add('battleSounds', { volume: 0.3, loop: true });
            this.battleMusic.play();
        }
    }

    createBulletGraphics() {
        // Create bullet texture
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('bullet', 16, 16);
        graphics.destroy();

        // Create enemy bullet texture
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0xff0000);
        enemyGraphics.fillCircle(8, 8, 8);
        enemyGraphics.generateTexture('enemyBullet', 16, 16);
        enemyGraphics.destroy();
    }

    createPlayer() {
        // Create player sprite
        this.player = this.physics.add.sprite(100, 360, 'player');
        this.player.setScale(0.6);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(80, 100);
        
        // Player properties
        this.playerSpeed = 250;
        this.canShoot = true;
        this.shootDelay = 300;
    }

    createEnemies() {
        // Create enemies group
        this.enemies = this.physics.add.group();
    }

    spawnEnemy() {
        // Spawn enemy from right side
        const y = Phaser.Math.Between(100, 620);
        const enemy = this.physics.add.sprite(1200, y, 'enemy');
        enemy.setScale(0.5);
        enemy.body.setSize(80, 100);
        
        // Enemy properties
        enemy.health = 50;
        enemy.speed = Phaser.Math.Between(50, 100);
        enemy.shootTimer = 0;
        
        // Add to enemies group
        this.enemies.add(enemy);
        
        // Enemy AI - move towards player and shoot
        enemy.moveTimer = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (enemy.active) {
                    // Move towards player
                    const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                    if (distance > 200) {
                        this.physics.moveToObject(enemy, this.player, enemy.speed);
                    } else {
                        enemy.body.setVelocity(0, 0);
                        // Shoot at player
                        enemy.shootTimer += 100;
                        if (enemy.shootTimer >= 2000) {
                            this.enemyShoot(enemy);
                            enemy.shootTimer = 0;
                        }
                    }
                }
            },
            loop: true
        });
    }

    enemyShoot(enemy) {
        if (!enemy.active) return;
        
        // Create enemy bullet
        const bullet = this.physics.add.sprite(enemy.x, enemy.y, 'enemyBullet');
        bullet.setScale(0.8);
        this.enemyBullets.add(bullet);
        
        // Aim at player
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        bullet.setRotation(angle);
        
        // Set velocity
        const speed = 300;
        bullet.body.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
        
        // Destroy bullet after 3 seconds
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
    }

    createControls() {
        // Keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
        
        // Touch controls for mobile
        this.input.on('pointerdown', (pointer) => {
            if (pointer.x > this.player.x) {
                this.shootBullet();
            }
        });
    }

    createUI() {
        // Health bar background
        this.healthBarBg = this.add.rectangle(100, 50, 200, 20, 0x000000);
        this.healthBarBg.setOrigin(0, 0.5);
        
        // Health bar
        this.healthBar = this.add.rectangle(100, 50, 200, 20, 0x00ff00);
        this.healthBar.setOrigin(0, 0.5);
        
        // Score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // Health text
        this.healthText = this.add.text(16, 80, 'Health: 100', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });

        // Mobile controls
        if (this.sys.game.device.input.touch) {
            this.createMobileControls();
        }
    }

    createMobileControls() {
        // Virtual joystick for movement
        this.joystick = this.add.circle(100, 600, 50, 0x333333, 0.5);
        this.joystickKnob = this.add.circle(100, 600, 25, 0xffffff, 0.8);
        
        // Shoot button
        this.shootButton = this.add.circle(1180, 600, 60, 0xff0000, 0.7);
        this.add.text(1180, 600, 'FIRE', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Make controls interactive
        this.joystick.setInteractive();
        this.shootButton.setInteractive();
        
        // Joystick input
        this.input.on('pointermove', (pointer) => {
            if (pointer.isDown && this.joystick.getBounds().contains(pointer.x, pointer.y)) {
                const distance = Phaser.Math.Distance.Between(this.joystick.x, this.joystick.y, pointer.x, pointer.y);
                if (distance <= 50) {
                    this.joystickKnob.setPosition(pointer.x, pointer.y);
                } else {
                    const angle = Phaser.Math.Angle.Between(this.joystick.x, this.joystick.y, pointer.x, pointer.y);
                    this.joystickKnob.setPosition(
                        this.joystick.x + Math.cos(angle) * 50,
                        this.joystick.y + Math.sin(angle) * 50
                    );
                }
            }
        });
        
        this.input.on('pointerup', () => {
            this.joystickKnob.setPosition(this.joystick.x, this.joystick.y);
        });
        
        // Shoot button
        this.shootButton.on('pointerdown', () => {
            this.shootBullet();
        });
    }

    createCollisions() {
        // Player bullets hit enemies
        this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
            this.hitEnemy(bullet, enemy);
        });
        
        // Enemy bullets hit player
        this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
            this.hitPlayer(bullet);
        });
        
        // Player collides with enemies
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            this.playerEnemyCollision(enemy);
        });
    }

    hitEnemy(bullet, enemy) {
        // Destroy bullet
        bullet.destroy();
        
        // Damage enemy
        enemy.health -= 25;
        enemy.setTint(0xff0000);
        
        this.time.delayedCall(100, () => {
            if (enemy.active) {
                enemy.clearTint();
            }
        });
        
        if (enemy.health <= 0) {
            // Destroy enemy
            if (enemy.moveTimer) {
                enemy.moveTimer.destroy();
            }
            enemy.destroy();
            
            // Add score
            this.score += 100;
            this.updateUI();
            
            // Play sound effect
            if (this.sound.get('soldierVoice')) {
                this.sound.play('soldierVoice', { volume: 0.5 });
            }
        }
    }

    hitPlayer(bullet) {
        // Add cooldown to prevent multiple hits
        if (this.playerInvulnerable) return;
        
        // Destroy bullet
        bullet.destroy();
        
        this.playerInvulnerable = true;
        
        // Damage player (reduced damage)
        this.playerHealth -= 5;
        this.player.setTint(0xff0000);
        
        this.time.delayedCall(200, () => {
            this.player.clearTint();
        });
        
        // Reset invulnerability after 0.5 seconds
        this.time.delayedCall(500, () => {
            this.playerInvulnerable = false;
        });
        
        this.updateUI();
        
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    playerEnemyCollision(enemy) {
        // Add cooldown to prevent multiple hits
        if (this.playerInvulnerable) return;
        
        this.playerInvulnerable = true;
        
        // Damage player on contact
        this.playerHealth -= 2; // Reduced damage
        this.player.setTint(0xff0000);
        
        this.time.delayedCall(200, () => {
            this.player.clearTint();
        });
        
        // Reset invulnerability after 1 second
        this.time.delayedCall(1000, () => {
            this.playerInvulnerable = false;
        });
        
        this.updateUI();
        
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    shootBullet() {
        if (!this.canShoot) return;
        
        this.canShoot = false;
        
        // Create bullet
        const bullet = this.physics.add.sprite(this.player.x + 40, this.player.y, 'bullet');
        bullet.setScale(0.8);
        this.bullets.add(bullet);
        bullet.body.setVelocity(500, 0);
        
        // Destroy bullet when it goes off screen
        this.time.delayedCall(3000, () => {
            if (bullet.active) {
                bullet.destroy();
            }
        });
        
        // Reset shoot cooldown
        this.time.delayedCall(this.shootDelay, () => {
            this.canShoot = true;
        });
    }

    updateUI() {
        this.scoreText.setText('Score: ' + this.score);
        this.healthText.setText('Health: ' + this.playerHealth);
        
        // Update health bar
        const healthPercent = this.playerHealth / 100;
        this.healthBar.setScale(healthPercent, 1);
        
        if (healthPercent > 0.6) {
            this.healthBar.setFillStyle(0x00ff00);
        } else if (healthPercent > 0.3) {
            this.healthBar.setFillStyle(0xffff00);
        } else {
            this.healthBar.setFillStyle(0xff0000);
        }
    }

    gameOver() {
        // Stop all timers
        if (this.enemySpawnTimer) {
            this.enemySpawnTimer.destroy();
        }
        
        // Stop music
        if (this.battleMusic) {
            this.battleMusic.stop();
        }
        
        // Show game over screen
        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.8);
        this.add.text(640, 300, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(640, 380, 'Final Score: ' + this.score, {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.add.text(640, 450, 'Click to Restart', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        // Restart on click
        this.input.once('pointerdown', () => {
            this.scene.restart();
        });
    }

    update() {
        // Player movement
        this.player.body.setVelocity(0);
        
        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.body.setVelocityX(-this.playerSpeed);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.body.setVelocityX(this.playerSpeed);
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.body.setVelocityY(-this.playerSpeed);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.body.setVelocityY(this.playerSpeed);
        }
        
        // Shooting
        if (this.cursors.space.isDown || this.wasd.SPACE.isDown) {
            this.shootBullet();
        }
        
        // Mobile joystick movement
        if (this.joystickKnob) {
            const joystickDistance = Phaser.Math.Distance.Between(
                this.joystick.x, this.joystick.y,
                this.joystickKnob.x, this.joystickKnob.y
            );
            
            if (joystickDistance > 10) {
                const angle = Phaser.Math.Angle.Between(
                    this.joystick.x, this.joystick.y,
                    this.joystickKnob.x, this.joystickKnob.y
                );
                
                const speed = (joystickDistance / 50) * this.playerSpeed;
                this.player.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            }
        }
        
        // Clean up off-screen bullets
        this.bullets.children.entries.forEach(bullet => {
            if (bullet.active && bullet.x > 1300) {
                bullet.destroy();
            }
        });
        
        this.enemyBullets.children.entries.forEach(bullet => {
            if (bullet.active && (bullet.x < -20 || bullet.x > 1300 || bullet.y < -20 || bullet.y > 740)) {
                bullet.destroy();
            }
        });
        
        // Clean up off-screen enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.x < -100) {
                if (enemy.moveTimer) {
                    enemy.moveTimer.destroy();
                }
                enemy.destroy();
            }
        });
    }
}

