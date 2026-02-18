import { Container, Sprite, Text, TextStyle, Assets } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import { MenuScene } from './MenuScene';

interface ContentItem {
    type: 'text' | 'image';
    value: string;
    size?: number;
    color?: string;
}

export class MagicWordsScene extends BaseScene {
    private _contentContainer: Container;
    private _items: ContentItem[] = [];

    constructor() {
        super();
        this._contentContainer = new Container();
        this.addChild(this._contentContainer);
        this.createBackButton();
        this.loadData();
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

    private async loadData() {
        // Mocking API call
        this._items = [
            { type: 'text', value: 'Welcome to the Magic Words!', size: 36, color: '#ffff00' },
            { type: 'image', value: 'https://pixijs.io/examples/examples/assets/bunny.png' },
            { type: 'text', value: ' This is an example of ', size: 24, color: '#ffffff' },
            { type: 'image', value: 'https://pixijs.io/examples/examples/assets/p2.jpeg' },
            { type: 'text', value: ' mixing text and images dynamically.', size: 18, color: '#00ff00' },
            { type: 'image', value: 'https://pixijs.io/examples/examples/assets/flowerTop.png' },
            { type: 'text', value: ' Pretty cool, right?', size: 30, color: '#ff00ff' }
        ];

        await this.renderContent();
    }

    private async renderContent() {
        this._contentContainer.removeChildren();
        let currentX = 0;
        let currentY = 0;
        const maxWidth = window.innerWidth - 100;
        const lineHeight = 100;

        for (const item of this._items) {
            if (item.type === 'text') {
                const style = new TextStyle({
                    fill: item.color || '#ffffff',
                    fontSize: item.size || 24,
                    fontFamily: 'Arial',
                });
                const text = new Text({ text: item.value, style });

                // Wrapping logic
                if (currentX + text.width > maxWidth) {
                    currentX = 0;
                    currentY += lineHeight;
                }

                text.x = currentX;
                text.y = currentY + (lineHeight - text.height) / 2;
                this._contentContainer.addChild(text);
                currentX += text.width;
            } else if (item.type === 'image') {
                try {
                    const texture = await Assets.load(item.value);
                    const sprite = new Sprite(texture);

                    // Scale image to fit line height roughly
                    const scale = (lineHeight * 0.8) / sprite.height;
                    sprite.scale.set(scale);

                    if (currentX + sprite.width > maxWidth) {
                        currentX = 0;
                        currentY += lineHeight;
                    }

                    sprite.x = currentX;
                    sprite.y = currentY + (lineHeight - sprite.height) / 2;
                    this._contentContainer.addChild(sprite);
                    currentX += sprite.width + 10; // margin
                } catch (e) {
                    console.error('Failed to load image:', item.value);
                }
            }
        }

        this.resize(window.innerWidth, window.innerHeight);
    }

    public update(_delta: number): void {
        // No per-frame update needed
    }

    public resize(width: number, height: number): void {
        this._contentContainer.x = width / 2 - this._contentContainer.width / 2;
        this._contentContainer.y = height / 2 - this._contentContainer.height / 2;
    }
}
