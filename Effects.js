export class Effects {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
    }
    
    // Muzzle flash effect
    createMuzzleFlash(x, y) {
        // Create particles for muzzle flash
        let particles = this.scene.add.particles(x, y, 'explosion_effects_2d', {
            scale: { start: 0.3, end: 0 },
            speed: { min: 50, max: 100 },
            lifespan: 200,
            quantity: 5,
            tint: [0xffff00, 0xff8800, 0xff0000]
        });
        
        // Remove after animation
        this.scene.time.delayedCall(300, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    // Explosion effect
    createExplosion(x, y, scale = 1) {
        // Main explosion sprite
        let explosion = this.scene.add.sprite(x, y, 'explosion_effects_2d');
        explosion.setScale(scale);
        explosion.setTint(0xff6600);
        
        // Explosion particles
        let particles = this.scene.add.particles(x, y, 'explosion_effects_2d', {
            scale: { start: 0.5 * scale, end: 0 },
            speed: { min: 100, max: 200 },
            lifespan: 500,
            quantity: 15,
            tint: [0xffff00, 0xff8800, 0xff0000, 0x888888]
        });
        
        // Animate explosion
        this.scene.tweens.add({
            targets: explosion,
            scaleX: scale * 2,
            scaleY: scale * 2,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
                explosion.destroy();
            }
        });
        
        // Screen shake
        this.scene.cameras.main.shake(200, 0.02 * scale);
        
        // Remove particles
        this.scene.time.delayedCall(600, () => {
            particles.destroy();
        });
        
        return { explosion, particles };
    }
    
    // Dust effect
    createDust(x, y, direction = 0) {
        let particles = this.scene.add.particles(x, y, 'explosion_effects_2d', {
            scale: { start: 0.1, end: 0 },
            speed: { min: 20, max: 60 },
            lifespan: 1000,
            quantity: 3,
            tint: [0x888888, 0x666666, 0x444444],
            angle: { min: direction - 30, max: direction + 30 }
        });
        
        this.scene.time.delayedCall(1200, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    // Wind effect
    createWind() {
        if (this.windParticles) {
            this.windParticles.destroy();
        }
        
        this.windParticles = this.scene.add.particles(0, 0, 'explosion_effects_2d', {
            x: { min: -50, max: 1330 },
            y: { min: 0, max: 720 },
            scale: { start: 0.05, end: 0 },
            speedX: { min: 50, max: 150 },
            speedY: { min: -20, max: 20 },
            lifespan: 3000,
            frequency: 100,
            tint: [0xcccccc, 0x888888],
            alpha: { start: 0.3, end: 0 }
        });
        
        return this.windParticles;
    }
    
    // Rain effect
    createRain() {
        if (this.rainParticles) {
            this.rainParticles.destroy();
        }
        
        this.rainParticles = this.scene.add.particles(0, -50, 'explosion_effects_2d', {
            x: { min: -100, max: 1380 },
            scale: { start: 0.02, end: 0.01 },
            speedX: { min: -50, max: -20 },
            speedY: { min: 300, max: 500 },
            lifespan: 2000,
            frequency: 20,
            tint: [0x4488ff, 0x6699ff],
            alpha: { start: 0.8, end: 0.3 }
        });
        
        return this.rainParticles;
    }
    
    // Blood effect
    createBloodSplatter(x, y) {
        let particles = this.scene.add.particles(x, y, 'explosion_effects_2d', {
            scale: { start: 0.1, end: 0 },
            speed: { min: 30, max: 80 },
            lifespan: 800,
            quantity: 8,
            tint: [0xff0000, 0xaa0000, 0x660000]
        });
        
        this.scene.time.delayedCall(1000, () => {
            particles.destroy();
        });
        
        return particles;
    }
    
    // Bullet trail effect
    createBulletTrail(startX, startY, endX, endY) {
        let trail = this.scene.add.line(0, 0, startX, startY, endX, endY, 0xffff00);
        trail.setLineWidth(2);
        trail.setAlpha(0.8);
        
        this.scene.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                trail.destroy();
            }
        });
        
        return trail;
    }
    
    // Damage number effect
    createDamageNumber(x, y, damage, color = 0xff0000) {
        let text = this.scene.add.text(x, y, `-${damage}`, {
            fontSize: '20px',
            fill: `#${color.toString(16).padStart(6, '0')}`,
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 2
        });
        
        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                text.destroy();
            }
        });
        
        return text;
    }
    
    // Cleanup all effects
    cleanup() {
        if (this.windParticles) {
            this.windParticles.destroy();
        }
        if (this.rainParticles) {
            this.rainParticles.destroy();
        }
        this.particles.forEach(particle => {
            if (particle && particle.destroy) {
                particle.destroy();
            }
        });
        this.particles = [];
    }
}

