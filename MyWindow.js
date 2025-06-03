import { CGFobject } from "./lib/CGF.js";
import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";

export class MyWindow extends CGFobject {
    constructor(scene, texture, windowComponents) {
        super(scene);
        this.texture = texture;
        this.windowComponents = windowComponents;
        this.initComponents();
    }

    initComponents() {
        this.windowCube = new MyUnitCubeQuad(this.scene, this.texture, this.texture, this.texture, this.texture, this.texture, this.texture, this.windowComponents);
    }

    enableNormalViz() {
        if (this.windowCube && this.windowCube.enableNormalViz)
            this.windowCube.enableNormalViz();
    }

    disableNormalViz() {
        if (this.windowCube && this.windowCube.disableNormalViz)
            this.windowCube.disableNormalViz();
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(0.2, 0.2, 0.05); // Default window size
        this.windowCube.display();
        this.scene.popMatrix();
    }
}
