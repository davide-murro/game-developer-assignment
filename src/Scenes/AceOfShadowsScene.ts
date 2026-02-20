import { Container, Texture, Sprite, Graphics } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { App } from '../Core/App';
import gsap from 'gsap';
import { SceneManager } from '../Core/SceneManager';
import { MenuScene } from './MenuScene';

export class AceOfShadowsScene extends BaseScene {
    private _stackA: Sprite[] = [];
    private _stackB: Sprite[] = [];
    private _cardTexture: Texture;
    private _shadowTexture: Texture;
    private _cardContainer: Container;
    private _timer: number = 0;
    private _isFinished: boolean = false;
    private _numberOfCards: number = 144;
    private _distanceBetweenCards: number = 2;
    private _activeTimelines: gsap.core.Timeline[] = [];

    constructor() {
        super();

        this._cardContainer = new Container();
        this.addChild(this._cardContainer);

        // Perspective squashing
        this._cardContainer.scale.y = 0.5;

        this._cardTexture = this.createCardTexture();
        this._shadowTexture = this.createShadowTexture();
        this.setup();

        this.createHeader(() => {
            // Robust cleanup of all active animations
            this._activeTimelines.forEach(tl => tl.kill());
            this._activeTimelines = [];
            gsap.killTweensOf(this._cardContainer.children);

            SceneManager.changeScene(new MenuScene());
        });
    }

    private createCardTexture(): Texture {
        const width = 100;
        const height = 150;
        const g = new Graphics()
            .roundRect(0, 0, width, height, 12)
            .fill(0x372020) // brown base
            .stroke({ width: 1, color: 0xf59e0b });

        g.roundRect(8, 8, width - 16, height - 16, 8)
            .stroke({ width: 1, color: 0xd97706, alpha: 0.5 });

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

    private createShadowTexture(): Texture {
        const width = 100;
        const height = 150;
        const g = new Graphics()
            .roundRect(0, 0, width, height, 12)
            .fill({ color: 0x000000, alpha: 0.4 });

        return App.app.renderer.generateTexture(g);
    }

    private setup() {
        for (let i = 0; i < this._numberOfCards; i++) {
            const card = new Sprite(this._cardTexture);
            card.anchor.set(0.5);
            // Stack A position (left)
            card.x = -150;
            card.y = 150 - i * this._distanceBetweenCards;
            this._cardContainer.addChild(card);
            this._stackA.push(card);
        }
    }

    private moveCard() {
        if (this._stackA.length === 0) {
            this._isFinished = true;
            return;
        }

        const card = this._stackA.pop()!;
        const cardsMoved = this._stackB.length + (this._numberOfCards - (this._stackA.length + this._stackB.length)) // make sure to get also the card that is moving
        const targetX = 150;
        const targetY = 150 - cardsMoved * this._distanceBetweenCards;

        // Bring to top
        this._cardContainer.setChildIndex(card, this._cardContainer.children.length - 1);

        // Create Shadow
        const shadow = new Sprite(this._shadowTexture);
        shadow.anchor.set(0.5);
        shadow.x = card.x;
        shadow.y = card.y;
        shadow.alpha = 0;
        this._cardContainer.addChildAt(shadow, 0);

        const duration = 2;
        const tl = gsap.timeline({
            onComplete: () => {
                this._stackB.push(card);
                this._cardContainer.removeChild(shadow);
                card.rotation = 0; // Natural ending at 360 is same as 0
                // Remove from active list
                const index = this._activeTimelines.indexOf(tl);
                if (index > -1) this._activeTimelines.splice(index, 1);
            }
        });

        this._activeTimelines.push(tl);

        // 1. Horizontal movement
        tl.to([card, shadow], {
            x: targetX,
            y: targetY,
            duration: duration,
            ease: 'power2.inOut'
        }, 0);

        // 2. Vertical Jump (Arc)
        tl.to(card, {
            y: '-=250',
            duration: duration / 2,
            ease: 'power1.out'
        }, 0);
        tl.to(card, {
            y: targetY,
            duration: duration / 2,
            ease: 'power1.in'
        }, duration / 2);

        // 3. Shadow Fade In
        tl.to(shadow, {
            alpha: 1,
            duration: duration / 4,
            ease: 'none'
        }, 0);

        // 4. Scale up for depth
        tl.to(card.scale, {
            x: 1.5,
            y: 1.5,
            duration: duration / 2,
            ease: 'power1.out'
        }, 0);
        tl.to(card.scale, {
            x: 1,
            y: 1,
            duration: duration / 2,
            ease: 'power1.in'
        }, duration / 2);

        // 5. Synchronized Rotation/Flip (360 degrees to avoid snap)
        tl.to([card, shadow], {
            rotation: Math.PI * 2,
            duration: duration,
            ease: 'power1.inOut'
        }, 0);
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

        const mobileBreakpoint = 600;
        const maxScale = 0.6;
        if (width < mobileBreakpoint) {
            const scale = (width / mobileBreakpoint) * 0.8;
            const resizeScale = Math.max(scale, maxScale);
            this._cardContainer.scale.set(resizeScale, resizeScale * 0.5);
        } else {
            this._cardContainer.scale.set(1, 0.5);
        }

        this.resizeHeader(width);
    }
}
