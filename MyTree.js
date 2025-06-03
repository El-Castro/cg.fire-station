import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFobject } from "./lib/CGF.js";
import { MyLeaf } from './MyLeaf.js';
/**
 * MyTree
 * @constructor
 * @param {MyScene} scene
 * @param {Array} coords
 */

export class MyTree extends CGFobject {
	constructor(scene, num_leaf, hight, tilt, radius, trunkTexture, leafTexture, color) {
		super(scene);
		this.initBuffers();

		this.trunkTexture = trunkTexture;
		this.leafTexture = leafTexture;

		this.num_leaf = num_leaf;
		this.hight = hight;
		this.tilt = tilt;
		if (tilt == undefined){
			this.tilt = [Math.PI/100, 1, 0, 0.5]
		}
		this.radius = radius;
		this.color = color;
		if (color == undefined){
			this.color = [0.2, 0.8, 0.2, 1]
		}
		this.randomValue = []
		for (let i = 0; i < this.num_leaf + 1; i++) {
			this.randomValue.push(Math.random());
		}

		this.trunk = new MyLeaf(this.scene, 100, 1, 0.1);
		this.leaf = new MyLeaf(this.scene, 5, 0.5, 0.3 + 0.1 * this.randomValue[0])

		
		this.materialLeaf = new CGFappearance(this.scene);
		this.materialLeaf.setTexture(this.leafTexture);
		this.materialLeaf.setTextureWrap("REPEAT", "REPEAT");
		const [r, g, b, a] = this.color;
		this.materialLeaf.setAmbient(r, g, b, a);
		this.materialLeaf.setDiffuse(r, g, b, a);
		this.materialLeaf.setSpecular(r, g, b, a);
		this.materialLeaf.setShininess(10.0);

		this.materialTrunk = new CGFappearance(this.scene);
		this.materialTrunk.setTexture(this.trunkTexture);
		this.materialTrunk.setTextureWrap("REPEAT", "REPEAT");
		this.materialTrunk.setAmbient(0.55, 0.27, 0.07, 1);
		this.materialTrunk.setDiffuse(0.55, 0.27, 0.07, 1);
		this.materialTrunk.setSpecular(0.1, 0.1, 0.1, 1.0);
		this.materialTrunk.setShininess(10.0);


	}


	display() {

		const [r, x, y, z] = this.tilt
		this.scene.rotate(r, x, y, z)
		this.scene.pushMatrix()
		this.materialTrunk.apply()
		this.trunk.display();
		this.scene.popMatrix()
		

		for (let i = 1; i <= this.num_leaf; i++) {
			this.scene.pushMatrix();
			this.scene.translate(0, 1 / (this.num_leaf + 1) * i, 0);
			this.scene.rotate(Math.PI * this.randomValue[i], 0, 1, 0);
			this.materialLeaf.apply()
			this.leaf.display();
			this.scene.popMatrix();
		}
	}
}

