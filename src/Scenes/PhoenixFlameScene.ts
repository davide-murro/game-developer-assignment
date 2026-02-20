import { Graphics, BlurFilter, ParticleContainer, Particle } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { App } from '../Core/App';
import { SceneManager } from '../Core/SceneManager';
import { MenuScene } from './MenuScene';

class FireParticle extends Particle {
    public life: number = 0;
    public maxLife: number = 0;
    public speed: number = 0;
    public jitter: number = 0;
    public initialScale: number = 0;

    constructor(options: any) {
        super(options);
    }
}

export class PhoenixFlameScene extends BaseScene {
    private _particles: FireParticle[] = [];
    private _particleContainer: ParticleContainer;
    private _numSprites: number = 10;

    constructor() {
        super();

        // Define which properties are dynamic for optimization
        this._particleContainer = new ParticleContainer({
            dynamicProperties: {
                position: true,
                scale: true,
                alpha: true,
                color: true,
            },
        });

        this.addChild(this._particleContainer);
        this.setup();
        this.createHeader(() => {
            SceneManager.changeScene(new MenuScene());
        });
    }

    private setup() {
        // Create a vibrant flame texture
        const g = new Graphics()
            .ellipse(0, 0, 40, 100)
            .fill({ color: 0xff4400, alpha: 0.4 })
            .ellipse(0, 0, 25, 70)
            .fill({ color: 0xffaa00, alpha: 0.7 })
            .ellipse(0, 0, 12, 40)
            .fill({ color: 0xffffcc, alpha: 1.0 });

        const blur = new BlurFilter();
        blur.strength = 12;
        g.filters = [blur];

        const texture = App.app.renderer.generateTexture(g);

        for (let i = 0; i < this._numSprites; i++) {
            const p = new FireParticle({
                texture,
                anchor: { x: 0.5, y: 0.9 },
            });

            this.resetParticle(p, true);
            this._particleContainer.addParticle(p);
            this._particles.push(p);
        }
    }

    private resetParticle(p: FireParticle, startFull: boolean = false) {
        p.life = startFull ? Math.random() : 0;
        p.maxLife = 1 + Math.random() * 2;
        p.speed = 100 + Math.random() * 150;
        p.jitter = 2 + Math.random() * 5;
        p.x = (Math.random() - 0.5) * 40;
        p.y = 0;
        p.initialScale = 0.3 + Math.random() * 0.3;
        p.scaleX = p.scaleY = p.initialScale;
        p.alpha = 0;

        const tints = [0xff4400, 0xff8800, 0xffaa00, 0xffff00];
        const tint = tints[Math.floor(Math.random() * tints.length)];
        p.color = tint;
    }


    public update(deltaMS: number): void {
        const dt = deltaMS / 1000;

        this._particles.forEach(p => {
            p.life += dt;

            // Rise up
            p.y -= p.speed * dt;

            // Sway/Jitter (Small random horizontal movement)
            p.x += (Math.random() - 0.5) * p.jitter;

            // Lifecycle progress (0 to 1)
            const progress = p.life / p.maxLife;

            // Fade in and out
            if (progress < 0.2) {
                p.alpha = progress / 0.2;
            } else if (progress > 0.6) {
                p.alpha = 1 - (progress - 0.6) / 0.4;
            } else {
                p.alpha = 1;
            }

            // Scale down as it rises
            const currentScale = p.initialScale * (1 - progress * 0.6);
            p.scaleX = p.scaleY = currentScale;

            // Recycling
            if (p.life >= p.maxLife) {
                this.resetParticle(p);
            }
        });
    }

    public resize(width: number, height: number): void {
        this._particleContainer.x = width / 2;
        this._particleContainer.y = height * 0.8;

        // Mobile responsiveness: scale down flame if screen is narrow
        const mobileBreakpoint = 600;
        const minScale = 0.6;
        if (width < mobileBreakpoint) {
            const scale = width / mobileBreakpoint;
            this._particleContainer.scale.set(Math.max(scale, minScale));
        } else {
            this._particleContainer.scale.set(1);
        }

        this.resizeHeader(width);
    }
}
