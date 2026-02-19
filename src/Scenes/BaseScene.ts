import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';

export abstract class BaseScene extends Container {
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

        buttonGroup.on('pointerdown', onClick);

        buttonGroup.on('pointerover', () => {
            gsap.to(buttonGroup.scale, { x: buttonGroup.scale.x + 0.05, y: buttonGroup.scale.y + 0.05, duration: 0.2 });
        });

        buttonGroup.on('pointerout', () => {
            gsap.to(buttonGroup.scale, { x: buttonGroup.scale.x - 0.05, y: buttonGroup.scale.y - 0.05, duration: 0.2 });
        });

        return buttonGroup;
    }

    protected createBackButton(onBack?: () => void): void {
        this._backButton = this.createButton('Back', () => {
            if (onBack) onBack();
        }, 120, 50, 18);

        this.addChild(this._backButton);
        this.resizeBackButton(window.innerWidth);
    }

    protected resizeBackButton(width: number): void {
        if (!this._backButton) return;

        const mobileBreakpoint = 600;
        const minScale = 0.6;
        let scale = 1;

        if (width < mobileBreakpoint) {
            scale = Math.max(width / mobileBreakpoint, minScale);
        }
        this._backButton.x = (window.innerWidth / 2);
        this._backButton.y = 50;

        this._backButton.scale.set(scale);

    }
}

