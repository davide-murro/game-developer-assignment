import { Container, Graphics, Sprite, Text, TextStyle, BlurFilter } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import { MenuScene } from './MenuScene';
import { App } from '../Core/App';

export class PhoenixFlameScene extends BaseScene {
    private _flames: Sprite[] = [];
    private _flameContainer: Container;

    private numberOfImages: number = 10;

    constructor() {
        super();
        this._flameContainer = new Container();
        this.addChild(this._flameContainer);
        this.setup();
        this.createBackButton();
    }

    private setup() {
        // Create a flame texture: a blurred ellipse
        const g = new Graphics()
            .ellipse(0, 0, 30, 80)
            .fill({ color: 0xff4400, alpha: 0.8 });

        // Add a core
        g.ellipse(0, 0, 15, 40).fill({ color: 0xffaa00, alpha: 1.0 });

        const blur = new BlurFilter();
        blur.blur = 10;
        g.filters = [blur];

        const texture = App.app.renderer.generateTexture(g);

        // Create exactly this.numberOfImages sprites
        for (let i = 0; i < this.numberOfImages; i++) {
            const flame = new Sprite(texture);
            flame.anchor.set(0.5, 1); // Bottom anchor
            flame.blendMode = 'add';
            flame.x = 0;
            flame.y = 0;
            this._flameContainer.addChild(flame);
            this._flames.push(flame);
        }
    }

    private createBackButton() {
        const text = new Text({
            text: 'Back to Menu',
            style: new TextStyle({ fill: 'white', fontSize: 24 })
        });
        text.eventMode = 'static';
        text.cursor = 'pointer';
        text.x = 8;
        text.y = 32;
        text.on('pointerdown', () => SceneManager.changeScene(new MenuScene()));
        this.addChild(text);
    }

    public update(_delta: number): void {
        this._flames.forEach((flame, i) => {
            const time = Date.now() / 1000;

            // Jitter and sway
            flame.x = Math.sin(time * 10 + i) * 10;
            flame.scale.set(
                0.8 + Math.random() * 0.4,
                1.0 + Math.sin(time * 5 + i) * 0.5
            );
            flame.alpha = 0.5 + Math.random() * 0.5;

            // Rising effect (simulated by vertical oscillation)
            // Just shifting the position slightly to look like flickering flames
            flame.y = Math.random() * 5;
        });
    }

    public resize(width: number, height: number): void {
        this._flameContainer.x = width / 2;
        this._flameContainer.y = height * 0.8; // Position at bottom area
    }
}
