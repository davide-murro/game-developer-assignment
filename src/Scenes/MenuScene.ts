import { Text, TextStyle, Container } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import { AceOfShadowsScene } from './AceOfShadowsScene';
import { MagicWordsScene } from './MagicWordsScene';
import { PhoenixFlameScene } from './PhoenixFlameScene';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);

export class MenuScene extends BaseScene {
    private _buttons: Container[] = [];

    constructor() {
        super();
        this.createMenu();
    }

    private createMenu() {
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fontWeight: '900',
            fill: '#ffffff',
            dropShadow: {
                alpha: 0.3,
                blur: 10,
                color: '#000000',
                distance: 0,
            }
        });

        const title = new Text({ text: 'GAME ASSIGNMENT', style: titleStyle });
        title.anchor.set(0.5);
        title.y = -150;
        this.addChild(title);

        const tasks = [
            { name: 'Ace of Shadows', scene: () => new AceOfShadowsScene() },
            { name: 'Magic Words', scene: () => new MagicWordsScene() },
            { name: 'Phoenix Flame', scene: () => new PhoenixFlameScene() },
        ];

        tasks.forEach((task, index) => {
            const button = this.createButton(task.name, () => SceneManager.changeScene(task.scene()));
            button.y = index * 80;
            this.addChild(button);
            this._buttons.push(button);
        });
    }


    public update(_delta: number): void { }

    public resize(width: number, height: number): void {
        this.x = width / 2;
        this.y = height / 2;

        // Mobile responsiveness: scale down if screen is narrow
        const mobileBreakpoint = 600;
        const minScale = 0.6;
        if (width < mobileBreakpoint) {
            const scale = width / mobileBreakpoint;
            this.scale.set(Math.max(scale, minScale));
        } else {
            this.scale.set(1);
        }
    }
}
