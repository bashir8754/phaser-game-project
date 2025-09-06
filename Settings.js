import { Scene } from 'phaser';

export class Settings extends Scene {
    constructor() {
        super('Settings');
    }
    
    create() {
        // Background
        this.cameras.main.setBackgroundColor(0x2c3e50);
        
        // Title
        this.add.text(640, 100, 'الإعدادات', {
            fontSize: '48px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        
        // Settings categories
        this.createAudioSettings();
        this.createControlSettings();
        this.createGraphicsSettings();
        this.createLanguageSettings();
        
        // Back button
        this.createBackButton();
        
        // Load saved settings
        this.loadSettings();
    }
    
    createAudioSettings() {
        // Audio section title
        this.add.text(200, 200, 'الصوت', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        });
        
        // Master volume
        this.add.text(200, 240, 'مستوى الصوت الرئيسي:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.masterVolumeSlider = this.createSlider(200, 270, 0.5);
        this.masterVolumeText = this.add.text(450, 270, '50%', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // Music volume
        this.add.text(200, 320, 'مستوى الموسيقى:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.musicVolumeSlider = this.createSlider(200, 350, 0.3);
        this.musicVolumeText = this.add.text(450, 350, '30%', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // SFX volume
        this.add.text(200, 400, 'مستوى المؤثرات الصوتية:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.sfxVolumeSlider = this.createSlider(200, 430, 0.5);
        this.sfxVolumeText = this.add.text(450, 430, '50%', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
    }
    
    createControlSettings() {
        // Controls section title
        this.add.text(600, 200, 'التحكم', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        });
        
        // Mobile controls toggle
        this.add.text(600, 240, 'أزرار التحكم للهاتف:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.mobileControlsToggle = this.createToggle(600, 270, true);
        
        // Control sensitivity
        this.add.text(600, 320, 'حساسية التحكم:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.sensitivitySlider = this.createSlider(600, 350, 0.5);
        this.sensitivityText = this.add.text(850, 350, '50%', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // Vibration toggle
        this.add.text(600, 400, 'الاهتزاز:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.vibrationToggle = this.createToggle(600, 430, true);
    }
    
    createGraphicsSettings() {
        // Graphics section title
        this.add.text(200, 500, 'الرسومات', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        });
        
        // Effects toggle
        this.add.text(200, 540, 'المؤثرات البصرية:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.effectsToggle = this.createToggle(200, 570, true);
        
        // Weather effects toggle
        this.add.text(200, 610, 'مؤثرات الطقس:', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        this.weatherToggle = this.createToggle(200, 640, true);
    }
    
    createLanguageSettings() {
        // Language section title
        this.add.text(600, 500, 'اللغة', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        });
        
        // Language buttons
        this.arabicButton = this.add.rectangle(650, 550, 120, 40, 0x4CAF50)
            .setInteractive()
            .on('pointerdown', () => this.setLanguage('ar'));
        
        this.add.text(650, 550, 'العربية', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.englishButton = this.add.rectangle(780, 550, 120, 40, 0x2196F3)
            .setInteractive()
            .on('pointerdown', () => this.setLanguage('en'));
        
        this.add.text(780, 550, 'English', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.currentLanguage = 'ar'; // Default to Arabic
    }
    
    createSlider(x, y, initialValue) {
        // Slider background
        let sliderBg = this.add.rectangle(x, y, 200, 10, 0x666666);
        
        // Slider handle
        let handle = this.add.circle(x + (initialValue * 200) - 100, y, 15, 0xffffff)
            .setInteractive({ draggable: true });
        
        // Drag functionality
        handle.on('drag', (pointer, dragX) => {
            let clampedX = Phaser.Math.Clamp(dragX, x - 100, x + 100);
            handle.x = clampedX;
            
            let value = (clampedX - (x - 100)) / 200;
            this.updateSliderValue(handle, value);
        });
        
        handle.sliderValue = initialValue;
        return handle;
    }
    
    createToggle(x, y, initialState) {
        let toggle = this.add.rectangle(x, y, 60, 30, initialState ? 0x4CAF50 : 0x666666)
            .setInteractive()
            .on('pointerdown', () => {
                toggle.toggleState = !toggle.toggleState;
                toggle.setFillStyle(toggle.toggleState ? 0x4CAF50 : 0x666666);
                this.updateToggleValue(toggle);
            });
        
        toggle.toggleState = initialState;
        return toggle;
    }
    
    updateSliderValue(slider, value) {
        slider.sliderValue = value;
        let percentage = Math.round(value * 100);
        
        // Update corresponding text
        if (slider === this.masterVolumeSlider) {
            this.masterVolumeText.setText(percentage + '%');
            // Apply master volume
            this.sound.volume = value;
        } else if (slider === this.musicVolumeSlider) {
            this.musicVolumeText.setText(percentage + '%');
        } else if (slider === this.sfxVolumeSlider) {
            this.sfxVolumeText.setText(percentage + '%');
        } else if (slider === this.sensitivitySlider) {
            this.sensitivityText.setText(percentage + '%');
        }
    }
    
    updateToggleValue(toggle) {
        // Handle toggle changes
        if (toggle === this.mobileControlsToggle) {
            // Update mobile controls visibility
        } else if (toggle === this.vibrationToggle) {
            // Update vibration setting
        } else if (toggle === this.effectsToggle) {
            // Update effects setting
        } else if (toggle === this.weatherToggle) {
            // Update weather effects setting
        }
    }
    
    setLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update button colors
        this.arabicButton.setFillStyle(lang === 'ar' ? 0x4CAF50 : 0x666666);
        this.englishButton.setFillStyle(lang === 'en' ? 0x4CAF50 : 0x666666);
        
        // Save language preference
        localStorage.setItem('gameLanguage', lang);
    }
    
    createBackButton() {
        let backButton = this.add.rectangle(640, 650, 200, 50, 0xFF5722)
            .setInteractive()
            .on('pointerdown', () => {
                this.saveSettings();
                this.scene.start('MainMenu');
            });
        
        this.add.text(640, 650, 'العودة', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        
        // Hover effect
        backButton.on('pointerover', () => {
            backButton.setFillStyle(0xE64A19);
        });
        
        backButton.on('pointerout', () => {
            backButton.setFillStyle(0xFF5722);
        });
    }
    
    saveSettings() {
        let settings = {
            masterVolume: this.masterVolumeSlider.sliderValue,
            musicVolume: this.musicVolumeSlider.sliderValue,
            sfxVolume: this.sfxVolumeSlider.sliderValue,
            mobileControls: this.mobileControlsToggle.toggleState,
            sensitivity: this.sensitivitySlider.sliderValue,
            vibration: this.vibrationToggle.toggleState,
            effects: this.effectsToggle.toggleState,
            weather: this.weatherToggle.toggleState,
            language: this.currentLanguage
        };
        
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        let savedSettings = localStorage.getItem('gameSettings');
        if (savedSettings) {
            let settings = JSON.parse(savedSettings);
            
            // Apply loaded settings
            this.updateSliderValue(this.masterVolumeSlider, settings.masterVolume || 0.5);
            this.updateSliderValue(this.musicVolumeSlider, settings.musicVolume || 0.3);
            this.updateSliderValue(this.sfxVolumeSlider, settings.sfxVolume || 0.5);
            this.updateSliderValue(this.sensitivitySlider, settings.sensitivity || 0.5);
            
            // Update slider positions
            this.masterVolumeSlider.x = 200 + (settings.masterVolume * 200) - 100;
            this.musicVolumeSlider.x = 200 + (settings.musicVolume * 200) - 100;
            this.sfxVolumeSlider.x = 200 + (settings.sfxVolume * 200) - 100;
            this.sensitivitySlider.x = 600 + (settings.sensitivity * 200) - 100;
            
            // Update toggles
            this.mobileControlsToggle.toggleState = settings.mobileControls !== false;
            this.vibrationToggle.toggleState = settings.vibration !== false;
            this.effectsToggle.toggleState = settings.effects !== false;
            this.weatherToggle.toggleState = settings.weather !== false;
            
            this.mobileControlsToggle.setFillStyle(this.mobileControlsToggle.toggleState ? 0x4CAF50 : 0x666666);
            this.vibrationToggle.setFillStyle(this.vibrationToggle.toggleState ? 0x4CAF50 : 0x666666);
            this.effectsToggle.setFillStyle(this.effectsToggle.toggleState ? 0x4CAF50 : 0x666666);
            this.weatherToggle.setFillStyle(this.weatherToggle.toggleState ? 0x4CAF50 : 0x666666);
            
            // Set language
            this.setLanguage(settings.language || 'ar');
        }
    }
}

