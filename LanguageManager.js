export class LanguageManager {
    constructor() {
        this.currentLanguage = 'ar'; // Default to Arabic
        this.translations = {
            ar: {
                // UI Elements
                health: 'الصحة',
                score: 'النقاط',
                missions: 'المهام',
                settings: 'الإعدادات',
                back: 'العودة',
                
                // Game Actions
                shoot: 'إطلاق',
                move: 'تحرك',
                
                // Mission Types
                kill_enemies: 'قضاء على الأعداء',
                survive_time: 'البقاء على قيد الحياة',
                collect_score: 'جمع النقاط',
                
                // Mission Descriptions
                kill_enemies_desc: 'اقضِ على {target} من الأعداء',
                survive_time_desc: 'ابق على قيد الحياة لمدة {target} ثانية',
                collect_score_desc: 'اجمع {target} نقطة',
                
                // Notifications
                new_mission: 'مهمة جديدة',
                mission_complete: 'مهمة مكتملة!',
                points_earned: 'نقطة',
                
                // Weather
                clear_weather: 'طقس صافٍ',
                rain: 'مطر',
                wind: 'رياح قوية',
                fog: 'ضباب',
                
                // Time of Day
                day: 'نهار',
                evening: 'مساء',
                night: 'ليل',
                
                // Settings
                audio: 'الصوت',
                controls: 'التحكم',
                graphics: 'الرسومات',
                language: 'اللغة',
                master_volume: 'مستوى الصوت الرئيسي',
                music_volume: 'مستوى الموسيقى',
                sfx_volume: 'مستوى المؤثرات الصوتية',
                mobile_controls: 'أزرار التحكم للهاتف',
                control_sensitivity: 'حساسية التحكم',
                vibration: 'الاهتزاز',
                visual_effects: 'المؤثرات البصرية',
                weather_effects: 'مؤثرات الطقس',
                
                // Menu
                play: 'لعب',
                quit: 'خروج',
                game_over: 'انتهت اللعبة',
                final_score: 'النتيجة النهائية',
                play_again: 'لعب مرة أخرى',
                main_menu: 'القائمة الرئيسية'
            },
            en: {
                // UI Elements
                health: 'Health',
                score: 'Score',
                missions: 'Missions',
                settings: 'Settings',
                back: 'Back',
                
                // Game Actions
                shoot: 'Shoot',
                move: 'Move',
                
                // Mission Types
                kill_enemies: 'Eliminate Enemies',
                survive_time: 'Survive',
                collect_score: 'Collect Points',
                
                // Mission Descriptions
                kill_enemies_desc: 'Eliminate {target} enemies',
                survive_time_desc: 'Survive for {target} seconds',
                collect_score_desc: 'Collect {target} points',
                
                // Notifications
                new_mission: 'New Mission',
                mission_complete: 'Mission Complete!',
                points_earned: 'points',
                
                // Weather
                clear_weather: 'Clear Weather',
                rain: 'Rain',
                wind: 'Strong Wind',
                fog: 'Fog',
                
                // Time of Day
                day: 'Day',
                evening: 'Evening',
                night: 'Night',
                
                // Settings
                audio: 'Audio',
                controls: 'Controls',
                graphics: 'Graphics',
                language: 'Language',
                master_volume: 'Master Volume',
                music_volume: 'Music Volume',
                sfx_volume: 'SFX Volume',
                mobile_controls: 'Mobile Controls',
                control_sensitivity: 'Control Sensitivity',
                vibration: 'Vibration',
                visual_effects: 'Visual Effects',
                weather_effects: 'Weather Effects',
                
                // Menu
                play: 'Play',
                quit: 'Quit',
                game_over: 'Game Over',
                final_score: 'Final Score',
                play_again: 'Play Again',
                main_menu: 'Main Menu'
            }
        };
        
        // Load saved language preference
        this.loadLanguagePreference();
    }
    
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('gameLanguage', lang);
        }
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    getText(key, replacements = {}) {
        let text = this.translations[this.currentLanguage][key] || key;
        
        // Replace placeholders
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        });
        
        return text;
    }
    
    loadLanguagePreference() {
        let savedLang = localStorage.getItem('gameLanguage');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
    }
    
    // Get font family based on language
    getFontFamily() {
        switch (this.currentLanguage) {
            case 'ar':
                return 'Arial'; // You can use Arabic fonts here
            case 'en':
            default:
                return 'Arial';
        }
    }
    
    // Get text alignment based on language
    getTextAlign() {
        switch (this.currentLanguage) {
            case 'ar':
                return 'right'; // Arabic is RTL
            case 'en':
            default:
                return 'left';
        }
    }
    
    // Check if current language is RTL
    isRTL() {
        return this.currentLanguage === 'ar';
    }
}

