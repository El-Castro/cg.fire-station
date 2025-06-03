import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFobject } from "./lib/CGF.js";
import { color } from "./lib/dat.gui.module.min.js";
import { MyTriangle } from "./MyTriangle.js";
import { MyTree } from './MyTree.js';
/**
 * MyQuad
 * @constructor
 * @param {MyScene} scene
 * @param {Array} coords
 */

function getRandomInt(min, max) {
    min = Math.ceil(min); // Arrotonda il minimo verso l'alto
    max = Math.floor(max); // Arrotonda il massimo verso il basso
    return Math.floor(Math.random() * (max - min + 1)) + min; // Genera un numero intero tra min e max (inclusi)
}
export class MyForest extends CGFobject {
    constructor(scene, num_tree, x_lenght, z_lenght, trunkTexture, leafTexture) {
        super(scene);
        this.initBuffers();
        this.num_tree=num_tree
        this.trunkTexture = trunkTexture
        this.leafTexture = leafTexture
        this.x_lenght = x_lenght
        this.z_lenght = z_lenght

        // Create array tree variants
        this.treeVariants = [];
        for (let v = 0; v < 5; v++) {
            this.treeVariants.push(
                new MyTree(this.scene, getRandomInt(1, 5), Math.random()*2, [Math.PI/(getRandomInt(30, 100)), Math.random(), 0, Math.random()], 1 , this.trunkTexture, this.leafTexture)
            );
        }
        this.trees = []
        this.treePos = []
        for (let i=0; i< num_tree; i++){
            // Selects a random tree variant
            this.trees.push(this.treeVariants[getRandomInt(0, this.treeVariants.length-1)]);
            this.treePos.push([Math.random()*x_lenght, Math.random()*z_lenght])

        }
    }


    display() {
        this.scene.scale(10, 10, 10)

        for (let i=0; i< this.num_tree; i++){
            const [x_p, z_p] = this.treePos[i]
            let tree = this.trees[i]

            this.scene.pushMatrix()
            this.scene.translate(x_p, 0, z_p)
            tree.display()
            this.scene.popMatrix()
        }

    }
}

