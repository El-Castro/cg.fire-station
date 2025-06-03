import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFobject } from "./lib/CGF.js";

/**
 * MySphere
 * @constructor
 * @param scene
 */
export class MySphere extends CGFobject {
    constructor(scene, slices, stacks, texture, inverted = false, materialProps = {}) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.texture = texture;
        this.inverted = inverted;
        this.materialProps = materialProps;
        this.initBuffers();
        this.initMaterials();
    }

    initMaterials() {

        const {
            ambient = [1, 1, 1, 1.0],
            diffuse = [0.8, 0.8, 0.8, 1.0],
            specular = [0.5, 0.5, 0.5, 1.0],
            shininess = 10.0
        } = this.materialProps;

        this.earthMaterial = new CGFappearance(this.scene);
        this.earthMaterial.setTexture(this.texture);
        this.earthMaterial.setAmbient(...ambient);
        this.earthMaterial.setDiffuse(...diffuse);
        this.earthMaterial.setSpecular(...specular);
        this.earthMaterial.setShininess(shininess);
        this.earthMaterial.setEmission(0, 0, 0, 1.0);
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const deltaPhi = Math.PI / (2 * this.stacks); // Angular increment for stacks
        const deltaTheta = (2 * Math.PI) / this.slices; // Angular increment for slices

        // Generate vertices, normals, and texture coordinates
        for (let stack = 0; stack <= 2 * this.stacks; stack++) {
            const phi = -Math.PI / 2 + stack * deltaPhi; // Angle from the equator
            const cosPhi = Math.cos(phi);
            const sinPhi = Math.sin(phi);

            for (let slice = 0; slice <= this.slices; slice++) {
                const theta = slice * deltaTheta; // Angle around the Y-axis
                const cosTheta = Math.cos(theta);
                const sinTheta = Math.sin(theta);

                const x = cosPhi * cosTheta;
                const y = sinPhi;
                const z = cosPhi * sinTheta;

                this.vertices.push(x, y, z);

                // If inverted
                if (this.inverted) {
                    this.normals.push(x, y, z);
                } else {
                    this.normals.push(-x, -y, -z);
                }

                this.texCoords.push(slice / this.slices, stack / (2 * this.stacks));
            }
        }

        // Generate indices
        for (let stack = 0; stack < 2 * this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const first = stack * (this.slices + 1) + slice;
                const second = first + this.slices + 1;

                if (this.inverted) {
                    this.indices.push(first, first + 1, second);
                    this.indices.push(first + 1, second + 1, second);
                } else {
                    this.indices.push(first, first + 1, second);
                    this.indices.push(first + 1, second + 1, second);
                }
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    setEmission(r, g, b, a) {
        if (this.earthMaterial && this.earthMaterial.setEmission)
            this.earthMaterial.setEmission(r, g, b, a);
    }

    enableNormalViz() {
        super.enableNormalViz && super.enableNormalViz();
    }

    disableNormalViz() {
        super.disableNormalViz && super.disableNormalViz();
    }

    display() {
        this.scene.pushMatrix();
        this.earthMaterial.apply();

        if (this.inverted) {
            this.scene.scale(-1, -1, -1);
        }

        super.display();
        this.scene.popMatrix();
    }
}
