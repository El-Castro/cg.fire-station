import { CGFinterface, dat } from './lib/CGF.js';

/**
* MyInterface
* @constructor
*/
export class MyInterface extends CGFinterface {
    constructor() {
        super();
    }

    init(application) {
        // call CGFinterface init
        super.init(application);

        // init GUI. For more information on the methods, check:
        // https://github.com/dataarts/dat.gui/blob/master/API.md
        this.gui = new dat.GUI();

        this.gui.add(this.scene, 'displayAxis').name('Display Axis');

        this.gui.add(this.scene, 'speedFactor', 0.1, 3).name('Speed Factor');

        this.gui.add(this.scene, 'speed').name('Heli Speed').listen();

        this.gui.add(this.scene, 'fixCameraHeli').name('Fix camera to Heli');

        this.gui.add(this.scene, 'displayNormals').name("Display normals");

        this.gui.add(this.scene, 'buildingWindowsNum', 1, 6, 1).name('Building Windows')
            .onChange((value) => {
                this.scene.building.windows_num = value;
            });
        this.gui.add(this.scene, 'buildingFloors', 1, 4, 1).name('Building Floors')
            .onChange((value) => {
                this.scene.building.floors = value;
                this.scene.building.height = this.scene.building.width * (0.4 + 0.3 * value);
                // Update helicopter helipadHeight and adjust position if on helipad
                if (this.scene.heli) {
                    this.scene.heli.helipadHeight = this.scene.building.height + this.scene.buildin_pos[1] + 6.5;
                    // If heli is on helipad, move it to new height
                    if (this.scene.heli.isOnHelipad()) {
                        this.scene.heli.position.y = this.scene.heli.helipadHeight;
                        this.scene.heli.currentHeight = this.scene.heli.helipadHeight;
                    }
                }
            });

        this.initKeys();

        return true;
    }

    initKeys() {
        this.scene.gui = this;

        this.processKeyboard = function () {}; // Define as an empty function to avoid errors

        this.activeKeys = {};
    }

    processKeyDown(event) {
        this.activeKeys[event.code] = true;
    }

    processKeyUp(event) {
        this.activeKeys[event.code] = false;
    }

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

}