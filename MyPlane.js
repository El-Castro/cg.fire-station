import { CGFobject, CGFappearance } from './lib/CGF.js';
/**
* MyPlane
* @constructor
 * @param scene - Reference to MyScene object
 * @param nDivs - number of divisions in both directions of the surface
 * @param minS - minimum texture coordinate in S
 * @param maxS - maximum texture coordinate in S
 * @param minT - minimum texture coordinate in T
 * @param maxT - maximum texture coordinate in T
 * @param tilingFactor - factor to control texture tiling
*/
export class MyPlane extends CGFobject {
	constructor(scene, texture, nrDivs, minS, maxS, minT, maxT, tilingFactor = 1) {
		super(scene);
		// nrDivs = 1 if not provided
		this.texture = texture;
		nrDivs = typeof nrDivs !== 'undefined' ? nrDivs : 1;
		this.nrDivs = nrDivs;
		this.patchLength = 1 / nrDivs;
		this.minS = minS || 0;
		this.maxS = maxS || 1;
		this.minT = minT || 0;
		this.maxT = maxT || 1;
		this.q = (this.maxS - this.minS) / this.nrDivs;
		this.w = (this.maxT - this.minT) / this.nrDivs;
		this.tilingFactor = tilingFactor; // New parameter for texture tiling
		this.initMaterials();
		this.initBuffers();
	}

	initMaterials() {
		if (!this.texture) {
			console.warn("Texture not provided for MyPlane.");
			return;
		}
		this.material = new CGFappearance(this.scene);
		this.material.setTexture(this.texture);
		this.material.setTextureWrap('REPEAT', 'REPEAT');
		this.material.setAmbient(1.0, 1.0, 1.0, 1.0);
		this.material.setDiffuse(0.8, 0.8, 0.8, 1.0);
		this.material.setSpecular(0.1, 0.1, 0.1, 1.0);
		this.material.setShininess(1.0);
	}

	initBuffers() {
		// Generate vertices, normals, and texCoords
		this.vertices = [];
		this.normals = [];
		this.texCoords = [];
		var yCoord = 0.5;
		for (var j = 0; j <= this.nrDivs; j++) {
			var xCoord = -0.5;
			for (var i = 0; i <= this.nrDivs; i++) {
				this.vertices.push(xCoord, yCoord, 0);
				this.normals.push(0, 0, 1);
				this.texCoords.push(
					(this.minS + i * this.q) * this.tilingFactor,
					(this.minT + j * this.w) * this.tilingFactor
				);
				xCoord += this.patchLength;
			}
			yCoord -= this.patchLength;
		}

		this.indices = [];

		var ind = 0;
		for (var j = 0; j < this.nrDivs; j++) {
			for (var i = 0; i <= this.nrDivs; i++) {
				this.indices.push(ind);
				this.indices.push(ind + this.nrDivs + 1);
				ind++;
			}
			if (j + 1 < this.nrDivs) {
				this.indices.push(ind + this.nrDivs);
				this.indices.push(ind);
			}
		}
		this.primitiveType = this.scene.gl.TRIANGLE_STRIP;
		this.initGLBuffers();
	}

	display() {
		this.scene.pushMatrix();
		this.material.apply();
		super.display();
		this.scene.popMatrix();
	}

	setFillMode() {
		this.primitiveType = this.scene.gl.TRIANGLE_STRIP;
	}

	setLineMode() {
		this.primitiveType = this.scene.gl.LINES;
	};

}


