import { Container, Sprite, Text, TextStyle, Assets, Graphics } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import { MenuScene } from './MenuScene';
import gsap from 'gsap';

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

        const maxWidth = window.innerWidth - 120;
        const lineHeight = 100;

        // Glassmorphic Backdrop for the whole content
        const bg = new Graphics()
            .roundRect(0, 0, maxWidth + 40, 500, 24)
            .fill({ color: 0x1e293b, alpha: 0.4 })
            .stroke({ width: 2, color: 0xffffff, alpha: 0.2 });

        this._contentContainer.addChild(bg);

        const innerContainer = new Container();
        innerContainer.x = 20;
        innerContainer.y = 20;
        this._contentContainer.addChild(innerContainer);

        let currentX = 0;
        let currentY = 0;

        for (const [index, item] of this._items.entries()) {
            const itemContainer = new Container();

            if (item.type === 'text') {
                const style = new TextStyle({
                    fill: item.color || '#ffffff',
                    fontSize: item.size || 24,
                    fontFamily: 'Arial',
                    dropShadow: { alpha: 0.2, blur: 4, color: '#000000', distance: 2 }
                });
                const text = new Text({ text: item.value, style });

                if (currentX + text.width > maxWidth) {
                    currentX = 0;
                    currentY += lineHeight;
                }

                itemContainer.addChild(text);
                itemContainer.x = currentX;
                itemContainer.y = currentY + (lineHeight - text.height) / 2;
                currentX += text.width;
            } else if (item.type === 'image') {
                try {
                    const texture = await Assets.load(item.value);
                    const sprite = new Sprite(texture);

                    const scale = (lineHeight * 0.8) / sprite.height;
                    sprite.scale.set(scale);

                    if (currentX + sprite.width > maxWidth) {
                        currentX = 0;
                        currentY += lineHeight;
                    }

                    itemContainer.addChild(sprite);
                    itemContainer.x = currentX;
                    itemContainer.y = currentY + (lineHeight - sprite.height) / 2;
                    currentX += sprite.width + 10;
                } catch (e) {
                    console.error('Failed to load image:', item.value);
                }
            }

            itemContainer.alpha = 0;
            itemContainer.y += 20;
            innerContainer.addChild(itemContainer);

            gsap.to(itemContainer, {
                alpha: 1,
                y: itemContainer.y - 20,
                duration: 0.5,
                delay: index * 0.2,
                ease: 'back.out(1.7)'
            });
        }

        // Adjust bg height
        bg.height = currentY + lineHeight + 40;

        this.resize(window.innerWidth, window.innerHeight);
    }

    public update(_delta: number): void { }

    public resize(width: number, height: number): void {
        this._contentContainer.x = width / 2 - this._contentContainer.width / 2;
        this._contentContainer.y = height / 2 - this._contentContainer.height / 2;
    }
}
