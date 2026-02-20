import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';

export abstract class BaseScene extends Container {
    protected _headerContainer?: Container;
    protected _backButton?: Container;

    constructor() {
        super();
    }

    public abstract update(deltaMS: number): void;
    public abstract resize(width: number, height: number): void;

    protected createButton(text: string, onClick: () => void, width: number = 400, height: number = 60, fontSize = 28): Container {
        const buttonGroup = new Container();

        const buttonStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: fontSize,
            fontWeight: '600',
            fill: '#e2e8f0',
        });

        const bg = new Graphics()
            .roundRect(-width / 2, -height / 2, width, height, 15)
            .fill({ color: 0x334155, alpha: 0.8 });

        bg.stroke({ width: 2, color: 0x475569 });

        const buttonText = new Text({ text, style: buttonStyle });
        buttonText.anchor.set(0.5);

        buttonGroup.addChild(bg, buttonText);
        buttonGroup.eventMode = 'static';
        buttonGroup.cursor = 'pointer';
        buttonGroup.scale = 1;

        buttonGroup.on('pointerdown', onClick);

        buttonGroup.on('pointerover', () => {
            gsap.to(buttonGroup.scale, { x: 1.05, y: 1.05, duration: 0.2, overwrite: 'auto' });
        });

        buttonGroup.on('pointerout', () => {
            gsap.to(buttonGroup.scale, { x: 1, y: 1, duration: 0.2, overwrite: 'auto' });
        });

        return buttonGroup;
    }

    protected createHeader(onBack: () => void): void {
        this._headerContainer = new Container();
        this._backButton = this.createButton('Back', onBack, 120, 50, 18);

        this._headerContainer.addChild(this._backButton);
        this.addChild(this._headerContainer);
        this.resizeHeader(window.innerWidth);
    }

    protected resizeHeader(width: number): void {
        if (!this._headerContainer) return;

        const mobileBreakpoint = 600;
        const minScale = 0.6;
        let scale = 1;

        if (width < mobileBreakpoint) {
            scale = Math.max(width / mobileBreakpoint, minScale);
        }

        this._headerContainer.x = (window.innerWidth / 2);
        this._headerContainer.y = 50;
        this._headerContainer.scale.set(scale);
    }
}

