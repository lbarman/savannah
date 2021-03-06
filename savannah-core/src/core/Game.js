import * as prefabs from '../prefabs.js';
import {Log} from './Log.js';
import Timer from './Timer.js';

class Game {

  constructor() {
    this._scenes = {};
    this._activeScenes = {};
    this._components = {};
    this.isMaster = false;
    this._timer = new Timer((dt) => this.update(dt));
    this.playerId = null;

    // Registering prefab components
    for (const i of Object.keys(prefabs)) {
      for (const compDef of prefabs[i]) {
        this.registerComponent(compDef.comp);
      }
    }
  }

  get scenes() {
    return this._activeScenes;
  }

  getScene(id) {
    return this._activeScenes[id];
  }

  get currentScene() {
    var keys = Object.keys(this._activeScenes);
    if (keys.length > 1) {
      Log.warn('Game has multiple active scenes, picking the first one as "current"');
    }
    return (keys.length === 0) ? null : this._activeScenes[keys[0]];
  }

  registerScene(Scene) {
    this._scenes[Scene.name] = Scene;
  }

  createScene(name, id = null) {
    if (!this._scenes.hasOwnProperty(name)) {
      throw new Error(`Scene ${name} is not registered. Use game.registerScene() before loading a scene`);
    }
    Log.info(`Creating scene ${name}`);
    const scene = new this._scenes[name](id);
    this._activeScenes[scene.id] = scene;

    const scEnt = scene.newEntity(scene.id);
    scEnt.addComponentInstance(scene);
    scene.onCreate();
    return scene;
  }

  removeScene(name) {

  }


  registerComponent(Comp) {
    this._components[Comp.name] = Comp;
  }

  getComponent(name) {
    if (!this._components.hasOwnProperty(name)) {
      console.log(this._components);
      throw new Error(`Component ${name} is not registered!`);
    }
    return this._components[name];
  }

  start() {
    this._timer.start();
  }

  stop() {
    this._timer.stop();
  }

  update(dt) {
    for (let i of Object.keys(this._activeScenes)) {
      const currScene = this._activeScenes[i];
      currScene.update(dt);
      const newSceneRef = currScene.getFreshRef();
      // TODO: this is so shitty, handle this differently
      if (newSceneRef != currScene) {
        newSceneRef._systems.length = 0;
        for (let sys of currScene._systems) {
          newSceneRef._systems.push(sys);
        }
        this._activeScenes[i] = newSceneRef;
      }
    }
  }

}

export default new Game();
