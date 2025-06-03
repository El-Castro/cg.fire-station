import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFobject, CGFlight } from "./lib/CGF.js";
import { MyFlame } from "./MyFlame.js";
/**
 * MyQuad
 * @constructor
 * @param {MyScene} scene
 * @param {Array} coords
 */
function linearDistance(a, b) {
    return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
}

function getRandomInt(min, max) {
    min = Math.ceil(min); // Arrotonda il minimo verso l'alto
    max = Math.floor(max); // Arrotonda il massimo verso il basso
    return Math.floor(Math.random() * (max - min + 1)) + min; // Genera un numero intero tra min e max (inclusi)
}

export class MyFire extends CGFobject {
    constructor(scene, texture, shader) {
        super(scene);
        this.initBuffers();
        this.num_tree = this.scene.forest.num_tree

        this.trees = this.scene.forest.trees
        this.treePos = this.scene.forest.treePos

        this.x_forest = this.scene.forest.x_lenght
        this.z_forest = this.scene.forest.z_lenght

        this.flames = [
            new MyFlame(this.scene),
            new MyFlame(this.scene),
            new MyFlame(this.scene)
        ];

        this.texture = texture;
        this.shader = shader;

        console.log("Fire text: ")
        console.log(this.texture)
        console.log("Fire shader: ")
        console.log(this.shader)

        this.material = new CGFappearance(this.scene);
        this.material.setAmbient(0.65, 0.07, 0.14, 1.0);
        this.material.setDiffuse(0.65, 0.07, 0.14, 1.0);
        this.material.setSpecular(0.65, 0.07, 0.14, 1.0);
        this.material.setEmission(0.8, 0.3, 0.05, 1.0);
        this.material.setTexture(this.texture);
        this.material.setShininess(1000.0);

        this.num_fire = 1

        this.firePos = [getRandomInt(1, this.x_forest), getRandomInt(1, this.z_forest)]
        console.log("FirePos" + this.firePos)
        this.fireRange = getRandomInt(3, 6)
        this.shader.setUniformsValues({ uSampler3: 2, uSampler4: 3, timeFactor: 0 });
        this.randomValues = [];
    }

    display() {
        this.scene.scale(10, 10, 10);

        for (let i = 0; i < this.num_tree; i++) {
            const [x_p, z_p] = this.treePos[i];

            if (linearDistance([x_p, z_p], this.firePos) < this.fireRange) {
                this.scene.pushMatrix();
                this.material.apply();
                this.scene.translate(x_p, 0, z_p);
                this.scene.rotate(Math.PI / 2, 0, 1, 0);
                this.scene.scale(0.5, 0.5, 0.5);

                for (let j = 0; j < 3; j++) {
                    this.scene.pushMatrix();
                    if (j === 1) this.scene.translate(0, 0.5, 0.5);
                    if (j === 2) {
                        this.scene.rotate(-Math.PI * 2 / 3, 0, 1, 0);
                        this.scene.translate(0.2, 1, 0.5);
                    }
                    this.scene.setActiveShader(this.shader);
                    this.shader.setUniformsValues({ flameRandom: Math.random()});
                    this.flames[j].display();
                    this.scene.popMatrix();
                }

                this.scene.popMatrix();
            }
        }
    }
}

