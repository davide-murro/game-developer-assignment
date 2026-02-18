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

    private numberOfCards: number = 144;
    private distanceBetweenCards: number = 3;

    constructor() {
        super();
        this._cardContainer = new Container();
        this.addChild(this._cardContainer);
        this._cardTexture = this.createCardTexture();
        this.setup();
        this.createBackButton();
    }

    private createCardTexture(): Texture {
        const g = new Graphics()
            .roundRect(0, 0, 100, 150, 10)
            .fill(0xffffff)
            .stroke({ width: 2, color: 0x000000 });

        // Add a simple design on the card
        g.circle(50, 75, 20).fill(0xff0000);

        return App.app.renderer.generateTexture(g);
    }

    private setup() {
        for (let i = 0; i < this.numberOfCards; i++) {
            const card = new Sprite(this._cardTexture);
            card.anchor.set(0.5);
            // Stack A position (left)
            card.x = -100;
            card.y = 200 - i * this.distanceBetweenCards;
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
        const cardsMoved = this._stackB.length + (this.numberOfCards - (this._stackA.length + this._stackB.length)) // make sure to get also the card that is moving
        const targetX = 100;
        const targetY = 200 - cardsMoved * this.distanceBetweenCards;

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
    }
}
