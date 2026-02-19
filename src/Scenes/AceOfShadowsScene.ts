import { Container, Graphics, Sprite, Texture, Text, TextStyle } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import { MenuScene } from './MenuScene';
import { App } from '../Core/App';
import gsap from 'gsap';

export class AceOfShadowsScene extends BaseScene {
    private _stackA: Sprite[] = [];
    private _stackB: Sprite[] = [];
    private _cardTexture: Texture;
    private _cardContainer: Container;
    private _timer: number = 0;
    private _isFinished: boolean = false;
    private _numberOfCards: number = 144;
    private _distanceBetweenCards: number = 2;

    constructor() {
        super();
        this._cardContainer = new Container();
        this.addChild(this._cardContainer);
        this._cardTexture = this.createCardTexture();
        this.setup();
        this.createBackButton();
    }

    private createCardTexture(): Texture {
        const width = 100;
        const height = 150;
        const g = new Graphics()
            // Card Base
            .roundRect(0, 0, width, height, 12)
            .fill(0x372020) // brown base
            .stroke({ width: 1, color: 0xf59e0b }); // Gold border

        // Inner Decorative Border
        g.roundRect(8, 8, width - 16, height - 16, 8)
            .stroke({ width: 1, color: 0xd97706, alpha: 0.5 });

        // Magic Sigil (Procedural design)
        const centerX = width / 2;
        const centerY = height / 2;

        g.circle(centerX, centerY, 25).stroke({ width: 1, color: 0xf59e0b, alpha: 0.8 });

        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            g.moveTo(centerX, centerY)
                .lineTo(centerX + Math.cos(angle) * 35, centerY + Math.sin(angle) * 35)
                .stroke({ width: 1, color: 0xfde68a, alpha: 0.6 });
        }

        g.star(centerX, centerY, 5, 15, 8).fill(0xf59e0b);

        return App.app.renderer.generateTexture(g);
    }

    private setup() {
        for (let i = 0; i < this._numberOfCards; i++) {
            const card = new Sprite(this._cardTexture);
            card.anchor.set(0.5);
            // Stack A position (left)
            card.x = -100;
            card.y = 150 - i * this._distanceBetweenCards;
            this._cardContainer.addChild(card);
            this._stackA.push(card);
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
        text.on('pointerdown', () => {
            gsap.killTweensOf(this._cardContainer.children);
            SceneManager.changeScene(new MenuScene());
        });
        this.addChild(text);
    }

    private moveCard() {
        if (this._stackA.length === 0) {
            this._isFinished = true;
            return;
        }

        const card = this._stackA.pop()!;
        const cardsMoved = this._stackB.length + (this._numberOfCards - (this._stackA.length + this._stackB.length)) // make sure to get also the card that is moving
        const targetX = 100;
        const targetY = 150 - cardsMoved * this._distanceBetweenCards;

        // Bring to top
        this._cardContainer.setChildIndex(card, this._cardContainer.children.length - 1);

        gsap.to(card, {
            x: targetX,
            y: targetY,
            duration: 2,
            ease: 'power2.inOut',
            onComplete: () => {
                this._stackB.push(card);
            }
        });
    }

    public update(deltaMS: number): void {
        if (this._isFinished) return;

        this._timer += deltaMS;
        if (this._timer >= 1000) {
            this._timer -= 1000;
            this.moveCard();
        }
    }

    public resize(width: number, height: number): void {
        this._cardContainer.x = width / 2;
        this._cardContainer.y = height / 2;

        // Mobile responsiveness: scale down card stack if screen is narrow
        const mobileBreakpoint = 600;
        const maxScale = 0.6;
        if (width < mobileBreakpoint) {
            const scale = width / mobileBreakpoint;
            this._cardContainer.scale.set(Math.max(scale, maxScale));
        } else {
            this._cardContainer.scale.set(1);
        }
    }
}
