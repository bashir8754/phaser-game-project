export class Enemy {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.sprite = scene.add.sprite(x, y, texture);
        this.sprite.setScale(0.6);
        this.sprite.setTint(0xff6666); // Red tint for enemies
        
        // Add physics
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setSize(64, 64);
        
        // Enemy properties
        this.health = 50;
        this.maxHealth = 50;
        this.speed = 80;
        this.attackDamage = 20;
        this.attackRange = 150;
        this.detectionRange = 200;
        this.lastAttackTime = 0;
        this.attackCooldown = 2000; // 2 seconds
        
        // AI states
        this.state = 'patrol'; // patrol, chase, attack, dead
        this.patrolDirection = Math.random() * Math.PI * 2;
        this.patrolTimer = 0;
        this.patrolDuration = 3000; // 3 seconds
        
        // Target (player)
        this.target = null;
        
        // Health bar
        this.createHealthBar();
        
        // Store reference in sprite for collision detection
        this.sprite.enemyRef = this;
    }
    
    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(
            this.sprite.x, this.sprite.y - 40, 50, 6, 0x000000
        );
        this.healthBar = this.scene.add.rectangle(
            this.sprite.x, this.sprite.y - 40, 46, 4, 0xff0000
        );
    }
    
    update(time, delta) {
        if (this.health <= 0) {
            this.state = 'dead';
            return;
        }
        
        // Update health bar position
        this.healthBarBg.x = this.sprite.x;
        this.healthBarBg.y = this.sprite.y - 40;
        this.healthBar.x = this.sprite.x;
        this.healthBar.y = this.sprite.y - 40;
        
        // Update health bar width
        let healthPercent = this.health / this.maxHealth;
        this.healthBar.width = 46 * healthPercent;
        
        // AI behavior
        this.updateAI(time, delta);
    }
    
    updateAI(time, delta) {
        // Find player
        if (!this.target && this.scene.player) {
            this.target = this.scene.player;
        }
        
        if (!this.target) return;
        
        let distanceToPlayer = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            this.target.x, this.target.y
        );
        
        switch (this.state) {
            case 'patrol':
                this.patrol(time, delta);
                
                // Check if player is in detection range
                if (distanceToPlayer <= this.detectionRange) {
                    this.state = 'chase';
                }
                break;
                
            case 'chase':
                this.chasePlayer();
                
                // Check if player is in attack range
                if (distanceToPlayer <= this.attackRange) {
                    this.state = 'attack';
                }
                
                // Lose target if too far
                if (distanceToPlayer > this.detectionRange * 1.5) {
                    this.state = 'patrol';
                }
                break;
                
            case 'attack':
                this.attackPlayer(time);
                
                // Go back to chase if player moves away
                if (distanceToPlayer > this.attackRange) {
                    this.state = 'chase';
                }
                break;
        }
    }
    
    patrol(time, delta) {
        this.patrolTimer += delta;
        
        if (this.patrolTimer >= this.patrolDuration) {
            // Change direction
            this.patrolDirection = Math.random() * Math.PI * 2;
            this.patrolTimer = 0;
        }
        
        // Move in patrol direction
        let velocityX = Math.cos(this.patrolDirection) * this.speed * 0.5;
        let velocityY = Math.sin(this.patrolDirection) * this.speed * 0.5;
        
        this.sprite.body.setVelocity(velocityX, velocityY);
    }
    
    chasePlayer() {
        // Calculate direction to player
        let angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            this.target.x, this.target.y
        );
        
        // Move towards player
        let velocityX = Math.cos(angle) * this.speed;
        let velocityY = Math.sin(angle) * this.speed;
        
        this.sprite.body.setVelocity(velocityX, velocityY);
        
        // Face player
        if (this.target.x > this.sprite.x) {
            this.sprite.setFlipX(false);
        } else {
            this.sprite.setFlipX(true);
        }
    }
    
    attackPlayer(time) {
        // Stop moving
        this.sprite.body.setVelocity(0, 0);
        
        // Attack if cooldown is over
        if (time - this.lastAttackTime >= this.attackCooldown) {
            this.performAttack();
            this.lastAttackTime = time;
        }
        
        // Visual feedback for attacking
        this.sprite.setTint(0xff3333);
        this.scene.time.delayedCall(200, () => {
            this.sprite.setTint(0xff6666);
        });
    }
    
    performAttack() {
        // Damage player if in range
        let distanceToPlayer = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            this.target.x, this.target.y
        );
        
        if (distanceToPlayer <= this.attackRange) {
            // Deal damage to player
            this.scene.damagePlayer(this.attackDamage);
            
            // Visual effect
            this.scene.cameras.main.shake(100, 0.01);
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Visual feedback
        this.sprite.setTint(0xffffff);
        this.scene.time.delayedCall(100, () => {
            this.sprite.setTint(0xff6666);
        });
        
        // Force chase state when damaged
        if (this.health > 0) {
            this.state = 'chase';
        }
        
        return this.health <= 0;
    }
    
    destroy() {
        this.healthBarBg.destroy();
        this.healthBar.destroy();
        this.sprite.destroy();
    }
}

