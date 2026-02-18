import { Text, TextStyle, Container } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import { AceOfShadowsScene } from './AceOfShadowsScene';
import { MagicWordsScene } from './MagicWordsScene';
import { PhoenixFlameScene } from './PhoenixFlameScene';

export class MenuScene extends BaseScene {
    private _buttons: Container[] = [];

    constructor() {
        super();
        this.createMenu();
    }

    private createMenu() {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: '#ffffff',
            dropShadow: {
                alpha: 0.5,
                angle: Math.PI / 6,
                blur: 4,
                color: '#000000',
                distance: 6,
            }
        });

        const tasks = [
            { name: '1. Ace of Shadows', scene: () => new AceOfShadowsScene() },
            { name: '2. Magic Words', scene: () => new MagicWordsScene() },
            { name: '3. Phoenix Flame', scene: () => new PhoenixFlameScene() },
        ];

        tasks.forEach((task, index) => {
            const button = new Container();
            const text = new Text({ text: task.name, style });

            button.addChild(text);
            button.eventMode = 'static';
            button.cursor = 'pointer';

            button.on('pointerdown', () => {
                SceneManager.changeScene(task.scene());
            });

            button.on('pointerover', () => {
                button.scale.set(1.1);
            });

            button.on('pointerout', () => {
                button.scale.set(1.0);
            });

            button.y = index * 80;
            this.addChild(button);
            this._buttons.push(button);
        });
    }

    public update(_delta: number): void {
        // No update logic needed for static menu
    }

    public resize(width: number, height: number): void {
        // Use bounds if width is 0, or just center roughly
        const w = this.width || 400;
        const h = this.height || 300;
        this.x = width / 2 - w / 2;
        this.y = height / 2 - h / 2;
    }
}
