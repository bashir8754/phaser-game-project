import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here
        this.add.image(512, 384, 'background');

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        this.load.image('logo', 'logo.png');
        this.load.image('player_walk_animation_2d', 'player_walk_animation_2d.png');
        this.load.image('ruined_city_environment_2d_concept', 'ruined_city_environment_2d_concept.png');
        this.load.image('enemy', 'enemy.png');
        this.load.image('explosion_effects_2d', 'explosion_effects_2d.png');
        this.load.image('assault_rifle_2d_concept', 'assault_rifle_2d_concept.png');
        this.load.image('initial_base_2d_concept', 'initial_base_2d_concept.png');
        
        // Load audio files
        this.load.audio('battle_sounds', 'battle_sounds.wav');
        this.load.audio('soldier_voice_male', 'soldier_voice_male.wav');
        this.load.audio('commander_voice_female', 'commander_voice_female.wav');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}


