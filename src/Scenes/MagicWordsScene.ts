import { Container, Sprite, Text, TextStyle, Assets, Graphics, Rectangle } from 'pixi.js';
import { BaseScene } from './BaseScene';
import { SceneManager } from '../Core/SceneManager';
import gsap from 'gsap';
import { MenuScene } from './MenuScene';

export class MagicWordsScene extends BaseScene {
    // UI Hierarchy: viewport (clips content) -> background & scrollContainer (moves up/down)
    private _scrollContainer = new Container();
    private _mask = new Graphics();
    private _background = new Graphics();
    private _viewport = new Container();

    private _data: any = null;
    private _emojiTextures = new Map<string, any>();
    private _avatarTextures = new Map<string, any>();

    // Scrolling state
    private _isDragging = false;
    private _lastY = 0;
    private _velocityY = 0;
    private _currentScrollY = 0;
    private _contentHeight = 0;

    constructor() {
        super();

        // Setup the scrolling hierarchy
        // viewport is the 'window' through which we see the scrolling content
        this.addChild(this._viewport);
        this._viewport.addChild(this._background);
        this._viewport.addChild(this._scrollContainer);
        this._viewport.addChild(this._mask);

        // Initialize mask with content to prevent rendering warnings in PixiJS v8
        this._mask.rect(0, 0, 1, 1).fill(0xffffff);
        this._scrollContainer.mask = this._mask;

        this.createBackButton(() => {
            gsap.killTweensOf(this); // Clean up any active scroll animations
            SceneManager.changeScene(new MenuScene());
        });
        this.setupScrolling();
        this.loadData();
    }

    /**
     * Initializes drag-to-scroll and touch scrolling listeners
     */
    private setupScrolling() {
        this.eventMode = 'static';
        this._viewport.eventMode = 'static';

        const onStart = (e: any) => {
            this._isDragging = true;
            this._lastY = e.global ? e.global.y : 0;
            this._velocityY = 0;
            gsap.killTweensOf(this); // Stop active inertia animation when user touches screen
        };

        const onMove = (e: any) => {
            if (!this._isDragging) return;
            const currentY = e.global ? e.global.y : 0;
            const delta = currentY - this._lastY;
            this._lastY = currentY;
            this._velocityY = delta;
            this.scroll(delta);
        };

        const onEnd = () => {
            if (!this._isDragging) return;
            this._isDragging = false;

            // Apply inertia if the drag was fast enough
            if (Math.abs(this._velocityY) > 1) {
                gsap.to(this, {
                    _currentScrollY: this._currentScrollY + this._velocityY * 10,
                    duration: 0.8,
                    ease: 'power3.out',
                    onUpdate: () => this.clampScroll()
                });
            }
        };

        this._viewport.on('pointerdown', onStart);
        this.on('globalpointermove', onMove);
        this.on('pointerup', onEnd);
        this.on('pointerupoutside', onEnd);

        window.addEventListener('wheel', this.onWheel, { passive: false });
    }

    private onWheel = (e: WheelEvent) => {
        if (SceneManager.currentScene === this) {
            e.preventDefault(); // Prevent page scrolling
            this.scroll(-e.deltaY);
        }
    };

    private scroll(d: number) {
        this._currentScrollY += d;
        this.clampScroll();
    }

    /**
     * Keeps the scrollContainer within bounds (top and bottom)
     */
    private clampScroll() {
        const min = Math.min(0, this._mask.height - this._contentHeight);
        this._currentScrollY = Math.max(min, Math.min(0, this._currentScrollY));
        this._scrollContainer.y = this._currentScrollY;
    }

    /**
     * Fetches dialogue and assets from the API
     */
    private async loadData() {
        try {
            const res = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            this._data = await res.json();
            if (!this._data) return;

            const assets: any[] = [];
            this._data.emojies.forEach((e: any) => assets.push({ alias: `e_${e.name}`, src: e.url }));
            this._data.avatars.forEach((a: any) => assets.push({ alias: `a_${a.name}`, src: a.url }));

            assets.forEach(a => {
                // reaching into resolver to check for existing keys
                if (!Assets.resolver.hasKey(a.alias)) {
                    Assets.add({ ...a, parser: 'loadTextures' });
                }
            });
            const bundle = await Assets.load(assets.map(a => a.alias));

            this._data.emojies.forEach((e: any) => this._emojiTextures.set(e.name, bundle[`e_${e.name}`]));
            this._data.avatars.forEach((a: any) => this._avatarTextures.set(a.name, bundle[`a_${a.name}`]));

            this.renderDialogue();
        } catch (e) {
            console.error('MagicWords error:', e);
        }
    }

    /**
     * Main engine for rendering text mixed with emojis and character avatars
     */
    private renderDialogue() {
        if (!this._data) return;
        this._scrollContainer.removeChildren();

        const width = window.innerWidth, cWidth = Math.min(width - 40, 500), avatarSize = 40, gap = 12;
        const textStyle = new TextStyle({ fill: '#ffffff', fontSize: 16, fontFamily: 'Arial', whiteSpace: 'pre' });

        // Measure the precise width of a space character for this font style
        const spaceW = (new Text({ text: 'A B', style: textStyle }).width - new Text({ text: 'AB', style: textStyle }).width) || 4;

        let dialogueY = 0;

        this._data.dialogue.forEach((entry: any, i: number) => {
            const row = new Container();
            row.alpha = 0;
            row.y = dialogueY;

            const avatar = this._data.avatars.find((a: any) => a.name === entry.name);
            const tex = this._avatarTextures.get(entry.name);
            let bX = 0, bW = cWidth;

            // Handle Character Avatars (left or right positioning)
            if (tex) {
                const s = new Sprite(tex);
                s.width = s.height = avatarSize;
                if (avatar?.position === 'right') {
                    s.x = cWidth - avatarSize;
                    bW -= (avatarSize + gap);
                } else {
                    bX = avatarSize + gap;
                    bW -= (avatarSize + gap);
                }
                row.addChild(s);
            }

            const bubble = new Container();
            bubble.x = bX;
            row.addChild(bubble);

            // Render name
            const name = new Text({ text: entry.name, style: { fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' } });
            bubble.addChild(name);

            const content = new Container();
            content.y = name.height + 4;
            bubble.addChild(content);

            // Parsing Engine: Identify emojis like {satisfied} and normal text
            let lX = 0, lY = 0, lH = 24;
            const regex = /\{([^}]+)\}/g;
            let last = 0, match;
            const chunks: any[] = [];
            while ((match = regex.exec(entry.text))) {
                if (match.index > last) chunks.push({ type: 'text', val: entry.text.substring(last, match.index) });
                chunks.push({ type: 'emoji', val: match[1] });
                last = regex.lastIndex;
            }
            if (last < entry.text.length) chunks.push({ type: 'text', val: entry.text.substring(last) });

            // Layout Engine: Word-wrapping mixed text and emojis
            chunks.forEach(chunk => {
                if (chunk.type === 'text') {
                    // Split by whitespace but keep spaces to render them specifically
                    chunk.val.split(/(\s+)/).forEach((word: string) => {
                        if (!word) return;
                        const t = new Text({ text: word, style: textStyle });
                        // Check for wrap (don't wrap pure whitespace unless at start of line)
                        if (word.trim() && lX + t.width > bW && lX > 0) { lX = 0; lY += lH; }
                        t.position.set(lX, lY); content.addChild(t);
                        lX += (word.trim() === '' ? spaceW * word.length : t.width);
                    });
                } else {
                    const t = this._emojiTextures.get(chunk.val);
                    if (t) {
                        const s = new Sprite(t);
                        s.width = s.height = 20;
                        // Wrap check for emoji
                        if (lX + s.width > bW && lX > 0) { lX = 0; lY += lH; }
                        s.position.set(lX, lY + (lH - s.height) / 2); content.addChild(s);
                        lX += s.width;
                    }
                }
            });

            this._scrollContainer.addChild(row);
            // Calculate next row position based on the tallest element (avatar or text block)
            dialogueY += Math.max(avatarSize, content.y + content.height) + 20;

            // Fade-in animation for smoother appearance
            gsap.to(row, { alpha: 1, duration: 0.4, delay: i * 3 });
        });

        // Store final height (subtracting the last gap for precise bottom clamping)
        this._contentHeight = Math.max(0, dialogueY - 20);
        this.resize(window.innerWidth, window.innerHeight);
    }

    public update() { }

    /**
     * Handles responsive layout adjustments
     */
    public resize(width: number, height: number) {
        const cWidth = Math.min(width - 40, 500); // Max width of 500px, but 100% (-margin) on small screens
        const mHeight = height - 150; // Leave room for top/bottom margins

        // Update mask
        this._mask.clear().rect(0, 0, cWidth, mHeight).fill(0xffffff);

        // Update background
        this._background.clear()
            .roundRect(-15, -15, cWidth + 30, mHeight + 30, 20)
            .fill({ color: 0x000000, alpha: 0.3 })
            .stroke({ width: 2, color: 0xffffff, alpha: 0.1 });

        // Update viewport
        this._viewport.position.set((width - cWidth) / 2, 100);

        // Set hitArea on viewport to allow interactions and scrolling
        this._viewport.hitArea = new Rectangle(-15, -15, cWidth + 30, mHeight + 30);

        this.resizeBackButton(width);
        this.clampScroll();
    }

    public destroy(opt?: any) {
        window.removeEventListener('wheel', this.onWheel);
        super.destroy(opt);
    }
}
