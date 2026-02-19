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

        const padding = 20;
        const mobileBreakpoint = 600;
        const width = window.innerWidth;
        const isMobile = width < mobileBreakpoint;

        // Dynamic maxWidth based on screen size
        const maxWidth = isMobile ? width - 60 : Math.min(width - 120, 800);
        const lineHeight = isMobile ? 80 : 100;
        const baseFontSize = isMobile ? 18 : 24;

        // Glassmorphic Backdrop
        const bg = new Graphics()
            .roundRect(0, 0, maxWidth + padding * 2, 500, 24)
            .fill({ color: 0x1e293b, alpha: 0.6 })
            .stroke({ width: 2, color: 0xffffff, alpha: 0.2 });

        this._contentContainer.addChild(bg);

        const innerContainer = new Container();
        innerContainer.x = padding;
        innerContainer.y = padding;
        this._contentContainer.addChild(innerContainer);

        let currentX = 0;
        let currentY = 0;

        for (const [index, item] of this._items.entries()) {
            const itemContainer = new Container();

            if (item.type === 'text') {
                // Scale font size for mobile if it's too large
                let fontSize = item.size || baseFontSize;
                if (isMobile && fontSize > 24) fontSize *= 0.75;

                const style = new TextStyle({
                    fill: item.color || '#ffffff',
                    fontSize: fontSize,
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

                    const scale = (lineHeight * 0.7) / sprite.height;
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
            itemContainer.y += 10;
            innerContainer.addChild(itemContainer);

            gsap.to(itemContainer, {
                alpha: 1,
                y: itemContainer.y - 10,
                duration: 0.4,
                delay: index * 0.1,
                ease: 'power2.out'
            });
        }

        bg.height = currentY + lineHeight + padding * 2;
        this.resize(window.innerWidth, window.innerHeight);
    }

    public update(_delta: number): void { }

    public resize(width: number, height: number): void {
        // Scale the entire container if it's still too big for the height
        const margin = 40;
        const availableHeight = height - margin * 2;
        if (this._contentContainer.height > availableHeight) {
            const scale = availableHeight / this._contentContainer.height;
            this._contentContainer.scale.set(scale);
        } else {
            this._contentContainer.scale.set(1);
        }

        this._contentContainer.x = width / 2 - this._contentContainer.width / 2;
        this._contentContainer.y = height / 2 - this._contentContainer.height / 2;
    }
}
