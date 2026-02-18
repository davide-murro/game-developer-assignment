import { Text, TextStyle, Container, Graphics } from 'pixi.js';
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

        const buttonStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontWeight: '600',
            fill: '#e2e8f0',
        });

        const tasks = [
            { name: 'Ace of Shadows', scene: () => new AceOfShadowsScene() },
            { name: 'Magic Words', scene: () => new MagicWordsScene() },
            { name: 'Phoenix Flame', scene: () => new PhoenixFlameScene() },
        ];

        tasks.forEach((task, index) => {
            const buttonGroup = new Container();

            const bg = new Graphics()
                .roundRect(-200, -30, 400, 60, 15)
                .fill({ color: 0x334155, alpha: 0.8 });

            bg.stroke({ width: 2, color: 0x475569 });

            const text = new Text({ text: task.name, style: buttonStyle });
            text.anchor.set(0.5);

            buttonGroup.addChild(bg, text);
            buttonGroup.eventMode = 'static';
            buttonGroup.cursor = 'pointer';

            buttonGroup.on('pointerdown', () => SceneManager.changeScene(task.scene()));

            buttonGroup.on('pointerover', () => {
                gsap.to(buttonGroup.scale, { x: 1.05, y: 1.05, duration: 0.2 });
            });

            buttonGroup.on('pointerout', () => {
                gsap.to(buttonGroup.scale, { x: 1, y: 1, duration: 0.2 });
            });

            buttonGroup.y = index * 80;
            this.addChild(buttonGroup);
            this._buttons.push(buttonGroup);
        });
    }

    public update(_delta: number): void {
        // No update logic needed for static menu
    }

    public resize(width: number, height: number): void {
        this.x = width / 2;
        this.y = height / 2;
    }
}
