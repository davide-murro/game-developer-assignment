import { Application, Ticker } from 'pixi.js';
import { SceneManager } from './SceneManager';
import { MenuScene } from '../Scenes/MenuScene';

export class App {
    private static _app: Application;
    private static _fpsText: HTMLElement;

    public static get app(): Application {
        return this._app;
    }

    public static async initialize() {
        try {
            this._app = new Application();
            await this._app.init({
                resizeTo: window,
                backgroundColor: 0x1e293b,
                sharedTicker: true,
                autoDensity: true,
                resolution: window.devicePixelRatio || 1,
            });

            const appContainer = document.getElementById('app');
            if (appContainer) {
                appContainer.appendChild(this._app.canvas);
            } else {
                document.body.appendChild(this._app.canvas);
            }

            // Ensure canvas is visible
            this._app.canvas.style.display = 'block';
            this._app.canvas.style.width = '100%';
            this._app.canvas.style.height = '100%';

            this.createFpsCounter();
            this.setupResizeListener();

            // Initialize Scene Manager
            SceneManager.initialize(this._app.stage);

            // Start Ticker
            this._app.ticker.add(this.updateFps);
            this._app.ticker.add((ticker) => SceneManager.update(ticker));

            // Go to Menu Scene
            SceneManager.changeScene(new MenuScene());
        } catch (error) {
            console.error('Failed to initialize PixiJS:', error);
            const errorDiv = document.createElement('div');
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '16px';
            errorDiv.style.position = 'absolute';
            errorDiv.style.zIndex = '1000';
            errorDiv.style.backgroundColor = 'white';
            errorDiv.innerText = 'Failed to load game: ' + error;
            document.body.appendChild(errorDiv);
        }
    }

    private static createFpsCounter() {
        this._fpsText = document.createElement('div');
        this._fpsText.style.position = 'absolute';
        this._fpsText.style.top = '8px';
        this._fpsText.style.left = '8px';
        this._fpsText.style.color = 'white';
        this._fpsText.style.fontFamily = 'Arial';
        this._fpsText.style.fontSize = '16px';
        this._fpsText.style.pointerEvents = 'none';
        this._fpsText.style.userSelect = 'none';
        this._fpsText.innerText = 'FPS: 0';
        document.body.appendChild(this._fpsText);
    }

    private static updateFps = (ticker: Ticker) => {
        if (this._fpsText) {
            this._fpsText.innerText = `FPS: ${Math.round(ticker.FPS)}`;
        }
    };

    private static setupResizeListener() {
        window.addEventListener('resize', () => {
            if (this._app) {
                this._app.resize();
                SceneManager.resize(this._app.screen.width, this._app.screen.height);
            }
        });
    }
}
