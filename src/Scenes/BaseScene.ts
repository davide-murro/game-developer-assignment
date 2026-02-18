import { Container } from 'pixi.js';

export abstract class BaseScene extends Container {
    constructor() {
        super();
    }

    public abstract update(deltaMS: number): void;
    public abstract resize(width: number, height: number): void;
}
