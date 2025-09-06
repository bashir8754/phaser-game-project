export class MissionSystem {
    constructor(scene) {
        this.scene = scene;
        this.currentMissions = [];
        this.completedMissions = [];
        this.missionCounter = 0;
        
        // Mission types
        this.missionTypes = [
            {
                id: 'kill_enemies',
                nameAr: 'قضاء على الأعداء',
                nameEn: 'Eliminate Enemies',
                descriptionAr: 'اقضِ على {target} من الأعداء',
                descriptionEn: 'Eliminate {target} enemies',
                reward: 200,
                targetRange: [3, 8]
            },
            {
                id: 'survive_time',
                nameAr: 'البقاء على قيد الحياة',
                nameEn: 'Survive',
                descriptionAr: 'ابق على قيد الحياة لمدة {target} ثانية',
                descriptionEn: 'Survive for {target} seconds',
                reward: 150,
                targetRange: [30, 60]
            },
            {
                id: 'collect_score',
                nameAr: 'جمع النقاط',
                nameEn: 'Collect Points',
                descriptionAr: 'اجمع {target} نقطة',
                descriptionEn: 'Collect {target} points',
                reward: 100,
                targetRange: [500, 1000]
            }
        ];
        
        this.init();
    }
    
    init() {
        // Generate initial missions
        this.generateMission();
        this.generateMission();
        
        // Create UI
        this.createMissionUI();
        
        // Mission generation timer
        this.missionTimer = this.scene.time.addEvent({
            delay: 45000, // 45 seconds
            callback: this.generateMission,
            callbackScope: this,
            loop: true
        });
    }
    
    generateMission() {
        if (this.currentMissions.length >= 3) return; // Max 3 active missions
        
        let missionType = this.missionTypes[Math.floor(Math.random() * this.missionTypes.length)];
        let target = Phaser.Math.Between(missionType.targetRange[0], missionType.targetRange[1]);
        
        let mission = {
            id: this.missionCounter++,
            type: missionType.id,
            name: missionType.nameAr, // Default to Arabic
            description: missionType.descriptionAr.replace('{target}', target),
            target: target,
            progress: 0,
            reward: missionType.reward,
            startTime: this.scene.time.now,
            completed: false
        };
        
        this.currentMissions.push(mission);
        this.updateMissionUI();
        
        // Show mission notification
        this.showMissionNotification(mission);
    }
    
    updateMissionProgress(type, amount = 1) {
        this.currentMissions.forEach(mission => {
            if (mission.type === type && !mission.completed) {
                mission.progress += amount;
                
                if (mission.progress >= mission.target) {
                    this.completeMission(mission);
                }
            }
        });
        
        this.updateMissionUI();
    }
    
    completeMission(mission) {
        mission.completed = true;
        mission.progress = mission.target;
        
        // Add reward
        this.scene.score += mission.reward;
        
        // Move to completed missions
        this.completedMissions.push(mission);
        
        // Remove from current missions
        let index = this.currentMissions.indexOf(mission);
        if (index > -1) {
            this.currentMissions.splice(index, 1);
        }
        
        // Show completion notification
        this.showCompletionNotification(mission);
        
        // Play completion sound
        if (this.scene.commanderVoice) {
            this.scene.commanderVoice.play();
        }
    }
    
    createMissionUI() {
        // Mission panel background
        this.missionPanel = this.scene.add.rectangle(1150, 150, 250, 200, 0x000000, 0.7);
        this.missionPanel.setStrokeStyle(2, 0xffffff);
        
        // Mission title
        this.missionTitle = this.scene.add.text(1150, 80, 'المهام', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);
        
        // Mission texts (will be updated dynamically)
        this.missionTexts = [];
        for (let i = 0; i < 3; i++) {
            let text = this.scene.add.text(1030, 110 + (i * 60), '', {
                fontSize: '14px',
                fill: '#ffffff',
                fontFamily: 'Arial',
                wordWrap: { width: 220 }
            });
            this.missionTexts.push(text);
        }
    }
    
    updateMissionUI() {
        // Clear existing texts
        this.missionTexts.forEach(text => text.setText(''));
        
        // Update with current missions
        this.currentMissions.forEach((mission, index) => {
            if (index < 3) {
                let progressText = `${mission.progress}/${mission.target}`;
                let missionText = `${mission.name}\n${mission.description}\n${progressText} - ${mission.reward} نقطة`;
                
                this.missionTexts[index].setText(missionText);
                
                // Color based on progress
                let progress = mission.progress / mission.target;
                if (progress >= 1.0) {
                    this.missionTexts[index].setFill('#00ff00'); // Green - completed
                } else if (progress >= 0.5) {
                    this.missionTexts[index].setFill('#ffff00'); // Yellow - half done
                } else {
                    this.missionTexts[index].setFill('#ffffff'); // White - just started
                }
            }
        });
    }
    
    showMissionNotification(mission) {
        let notification = this.scene.add.text(640, 200, `مهمة جديدة: ${mission.name}`, {
            fontSize: '22px',
            fill: '#00ff00',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Animate notification
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 180,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.scene.time.delayedCall(4000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                y: 160,
                duration: 500,
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    
    showCompletionNotification(mission) {
        let notification = this.scene.add.text(640, 200, `مهمة مكتملة! +${mission.reward} نقطة`, {
            fontSize: '24px',
            fill: '#ffff00',
            fontFamily: 'Arial Black',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Animate notification
        notification.setAlpha(0);
        this.scene.tweens.add({
            targets: notification,
            alpha: 1,
            y: 180,
            scale: 1.2,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: notification,
                alpha: 0,
                y: 160,
                scale: 1,
                duration: 500,
                onComplete: () => {
                    notification.destroy();
                }
            });
        });
    }
    
    // Update mission progress based on game events
    update() {
        // Update survive time missions
        this.currentMissions.forEach(mission => {
            if (mission.type === 'survive_time' && !mission.completed) {
                let elapsedTime = Math.floor((this.scene.time.now - mission.startTime) / 1000);
                mission.progress = Math.min(elapsedTime, mission.target);
                
                if (mission.progress >= mission.target) {
                    this.completeMission(mission);
                }
            }
        });
        
        // Update collect score missions
        this.currentMissions.forEach(mission => {
            if (mission.type === 'collect_score' && !mission.completed) {
                mission.progress = Math.min(this.scene.score, mission.target);
                
                if (mission.progress >= mission.target) {
                    this.completeMission(mission);
                }
            }
        });
        
        this.updateMissionUI();
    }
    
    // Call this when enemy is killed
    onEnemyKilled() {
        this.updateMissionProgress('kill_enemies', 1);
    }
    
    cleanup() {
        if (this.missionTimer) {
            this.missionTimer.destroy();
        }
        
        if (this.missionPanel) {
            this.missionPanel.destroy();
        }
        
        if (this.missionTitle) {
            this.missionTitle.destroy();
        }
        
        this.missionTexts.forEach(text => {
            if (text) {
                text.destroy();
            }
        });
    }
}

