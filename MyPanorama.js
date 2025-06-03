import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFobject } from "./lib/CGF.js";
import { MySphere } from "./MySphere.js";

/**
 * MyPanorama
 * @constructor
 * @param scene
 */
export class MyPanorama extends CGFobject {
    constructor(scene, texture) {
        super(scene);
        this.texture = texture;
        this.light_component = {
            ambient: [1, 1, 1, 1.0],
            diffuse: [0.8, 0.8, 0.8, 1.0],
            specular: [0.5, 0.5, 0.5, 1.0],
            shininess: 10.0
        };
        this.sphere = new MySphere(this.scene, 100, 100, this.texture, false, this.light_component);
    }


    display() {
        this.x = this.scene.camera.position[0]
        this.y = this.scene.camera.position[1]
        this.z = this.scene.camera.position[2]
        this.scene.pushMatrix();
        this.scene.translate(this.x, this.y, this.z);
        this.scene.scale(600, 600, 600);
        this.scene.rotate(Math.PI, 1,0,0);
        this.sphere.display();
        //super.enableNormalViz();
        this.scene.popMatrix();

    }


}
