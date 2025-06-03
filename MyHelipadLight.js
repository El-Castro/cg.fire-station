import { CGFobject, CGFappearance } from "./lib/CGF.js";
import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";
import { MySphere } from "./MySphere.js";

export class MyHelipadLight extends CGFobject {
    constructor(scene, baseTexture, lightTexture, baseComponents, lightComponents) {
        super(scene);
        this.baseComponents = baseComponents;
        this.lightComponents = lightComponents;
        this.base = new MyUnitCubeQuad(scene, baseTexture, baseTexture, baseTexture, baseTexture, baseTexture, baseTexture, this.baseComponents);
        this.light = new MySphere(scene, 16, 16, lightTexture, true, this.lightComponents);
        this.emissiveStrength = 0.0;
        this.active = false;
    }

    setActive(active) {
        this.active = active;
    }

    update(t) {
        // t in milliseconds
        if (this.active) {
            this.emissiveStrength = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(t / 300));
        } else {
            this.emissiveStrength = 0.0;
        }
        if (this.light && this.light.setEmission)
            this.light.setEmission(this.emissiveStrength, this.emissiveStrength, 0.0, 1.0);
    }

    display() {
        // Base
        this.scene.pushMatrix();
        this.scene.scale(0.08, 0.10, 0.08);
        this.base.display();
        this.scene.popMatrix();

        // Lighbulb
        this.scene.pushMatrix();
        this.scene.translate(0, 0.06, 0);
        this.scene.scale(0.02, 0.04, 0.02);
        this.light.display();
        this.scene.popMatrix();
    }

    enableNormalViz() {
        if (this.base && this.base.enableNormalViz) this.base.enableNormalViz();
        if (this.light && this.light.enableNormalViz) this.light.enableNormalViz();
    }

    disableNormalViz() {
        if (this.base && this.base.disableNormalViz) this.base.disableNormalViz();
        if (this.light && this.light.disableNormalViz) this.light.disableNormalViz();
    }
}
