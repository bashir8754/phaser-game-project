export class WeatherSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentWeather = 'clear';
        this.timeOfDay = 'day'; // day, evening, night
        this.weatherTimer = 0;
        this.dayTimer = 0;
        
        // Weather effects
        this.rainEffect = null;
        this.windEffect = null;
        this.fogOverlay = null;
        
        // Time effects
        this.dayNightOverlay = null;
        
        this.init();
    }
    
    init() {
        // Create day/night overlay
        this.dayNightOverlay = this.scene.add.rectangle(640, 360, 1280, 720, 0x000000, 0);
        this.dayNightOverlay.setDepth(1000);
        
        // Start with random weather
        this.changeWeather();
        
        // Weather change timer (every 30 seconds)
        this.weatherChangeTimer = this.scene.time.addEvent({
            delay: 30000,
            callback: this.changeWeather,
            callbackScope: this,
            loop: true
        });
        
        // Day/night cycle timer (every 45 seconds)
        this.dayNightTimer = this.scene.time.addEvent({
            delay: 45000,
            callback: this.changeTimeOfDay,
            callbackScope: this,
            loop: true
        });
    }
    
    changeWeather() {
        // Clear current weather effects
        this.clearWeatherEffects();
        
        // Random weather selection
        const weathers = ['clear', 'rain', 'wind', 'fog'];
        const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
        
        this.currentWeather = newWeather;
        this.applyWeatherEffect();
        
        // Notify player
        this.showWeatherNotification();
    }
    
    changeTimeOfDay() {
        const times = ['day', 'evening', 'night'];
        let currentIndex = times.indexOf(this.timeOfDay);
        currentIndex = (currentIndex + 1) % times.length;
        this.timeOfDay = times[currentIndex];
        
        this.applyTimeEffect();
        this.showTimeNotification();
    }
    
    applyWeatherEffect() {
        switch (this.currentWeather) {
            case 'rain':
                this.createRainEffect();
                break;
            case 'wind':
                this.createWindEffect();
                break;
            case 'fog':
                this.createFogEffect();
                break;
            case 'clear':
            default:
                // No special effects for clear weather
                break;
        }
    }
    
    applyTimeEffect() {
        let alpha = 0;
        let tint = 0x000000;
        
        switch (this.timeOfDay) {
            case 'day':
                alpha = 0;
                break;
            case 'evening':
                alpha = 0.3;
                tint = 0xff8800;
                break;
            case 'night':
                alpha = 0.6;
                tint = 0x000044;
                break;
        }
        
        // Animate the overlay
        this.scene.tweens.add({
            targets: this.dayNightOverlay,
            alpha: alpha,
            duration: 2000,
            ease: 'Power2'
        });
        
        this.dayNightOverlay.setFillStyle(tint);
    }
    
    createRainEffect() {
        this.rainEffect = this.scene.add.particles(0, -50, 'explosion_effects_2d', {
            x: { min: -100, max: 1380 },
            scale: { start: 0.02, end: 0.01 },
            speedX: { min: -50, max: -20 },
            speedY: { min: 300, max: 500 },
            lifespan: 2000,
            frequency: 15,
            tint: [0x4488ff, 0x6699ff],
            alpha: { start: 0.8, end: 0.3 }
        });
        
        // Rain sound effect would go here
        // this.scene.sound.play('rain_sound', { loop: true, volume: 0.3 });
    }
    
    createWindEffect() {
        this.windEffect = this.scene.add.particles(0, 0, 'explosion_effects_2d', {
            x: { min: -50, max: 1330 },
            y: { min: 0, max: 720 },
            scale: { start: 0.05, end: 0 },
            speedX: { min: 100, max: 200 },
            speedY: { min: -30, max: 30 },
            lifespan: 2000,
            frequency: 50,
            tint: [0xcccccc, 0x888888],
            alpha: { start: 0.4, end: 0 }
        });
        
        // Wind sound effect would go here
        // this.scene.sound.play('wind_sound', { loop: true, volume: 0.2 });
    }
    
    createFogEffect() {
        this.fogOverlay = this.scene.add.rectangle(640, 360, 1280, 720, 0xcccccc, 0.3);
        this.fogOverlay.setDepth(500);
        
        // Animate fog density
        this.scene.tweens.add({
            targets: this.fogOverlay,
            alpha: 0.5,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    clearWeatherEffects() {
        if (this.rainEffect) {
            this.rainEffect.destroy();
            this.rainEffect = null;
        }
        
        if (this.windEffect) {
            this.windEffect.destroy();
            this.windEffect = null;
        }
        
        if (this.fogOverlay) {
            this.fogOverlay.destroy();
            this.fogOverlay = null;
        }
        
        // Stop weather sounds
        // this.scene.sound.stopByKey('rain_sound');
        // this.scene.sound.stopByKey('wind_sound');
    }
    
    showWeatherNotification() {
        const weatherNames = {
            'clear': 'طقس صافٍ',
            'rain': 'مطر',
            'wind': 'رياح قوية',
            'fog': 'ضباب'
        };
        
        let notification = this.scene.add.text(640, 100, weatherNames[this.currentWeather], {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Animate notification
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 80,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                y: 60,
                duration: 500,
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    
    showTimeNotification() {
        const timeNames = {
            'day': 'نهار',
            'evening': 'مساء',
            'night': 'ليل'
        };
        
        let notification = this.scene.add.text(640, 140, timeNames[this.timeOfDay], {
            fontSize: '20px',
            fill: '#ffff00',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Animate notification
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 120,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.scene.time.delayedCall(2000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                y: 100,
                duration: 500,
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    
    // Get weather effects on gameplay
    getWeatherEffects() {
        let effects = {
            visibility: 1.0,
            movement: 1.0,
            accuracy: 1.0
        };
        
        switch (this.currentWeather) {
            case 'rain':
                effects.visibility = 0.8;
                effects.movement = 0.9;
                break;
            case 'wind':
                effects.accuracy = 0.8;
                break;
            case 'fog':
                effects.visibility = 0.6;
                effects.accuracy = 0.9;
                break;
        }
        
        switch (this.timeOfDay) {
            case 'evening':
                effects.visibility *= 0.9;
                break;
            case 'night':
                effects.visibility *= 0.7;
                break;
        }
        
        return effects;
    }
    
    cleanup() {
        this.clearWeatherEffects();
        
        if (this.weatherChangeTimer) {
            this.weatherChangeTimer.destroy();
        }
        
        if (this.dayNightTimer) {
            this.dayNightTimer.destroy();
        }
        
        if (this.dayNightOverlay) {
            this.dayNightOverlay.destroy();
        }
    }
}

