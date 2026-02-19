import { Container, Ticker } from 'pixi.js';
import { BaseScene } from '../Scenes/BaseScene';

export class SceneManager {
    private static _stage: Container;
    private static _currentScene: BaseScene;

    public static get currentScene(): BaseScene {
        return this._currentScene;
    }

    public static initialize(stage: Container) {
        this._stage = stage;
    }

    public static changeScene(scene: BaseScene) {
        if (this._currentScene) {
            this._stage.removeChild(this._currentScene);
            this._currentScene.destroy({ children: true });
        }

        this._currentScene = scene;
        this._stage.addChild(this._currentScene);

        // Initial resize for the new scene
        this._currentScene.resize(window.innerWidth, window.innerHeight);
    }

    public static update(ticker: Ticker) {
        if (this._currentScene) {
            this._currentScene.update(ticker.deltaMS);
        }
    }

    public static resize(width: number, height: number) {
        if (this._currentScene) {
            this._currentScene.resize(width, height);
        }
    }
}

