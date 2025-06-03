import { CGFobject, CGFappearance } from "./lib/CGF.js";

export class MyCylinder extends CGFobject {
    constructor(scene, slices, stacks, texture,  materialProps = {}) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.texture = texture;
        this.materialProps = materialProps;
        this.initBuffers();
        this.initMaterials();
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        const angleIncrement = (2 * Math.PI) / this.slices;

        for (let stack = 0; stack <= this.stacks; stack++) {
            const z = stack / this.stacks;

            for (let slice = 0; slice <= this.slices; slice++) {
                const angle = slice * angleIncrement;
                const x = Math.cos(angle);
                const y = Math.sin(angle);

                this.vertices.push(x, y, z);

                this.normals.push(x, y, 0);

                this.texCoords.push(slice / this.slices, stack / this.stacks);
            }
        }

        for (let stack = 0; stack < this.stacks; stack++) {
            for (let slice = 0; slice < this.slices; slice++) {
                const first = stack * (this.slices + 1) + slice;
                const second = first + this.slices + 1;

                this.indices.push(first, second, second + 1);
                this.indices.push(first, second + 1, first + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    initMaterials() {

        const {
            ambient = [1, 1, 1, 1.0],
            diffuse = [0.8, 0.8, 0.8, 1.0],
            specular = [0.5, 0.5, 0.5, 1.0],
            shininess = 10.0
        } = this.materialProps;

        this.cylinderMaterial = new CGFappearance(this.scene);
        this.cylinderMaterial.setTexture(this.texture);
        this.cylinderMaterial.setAmbient(...ambient);
        this.cylinderMaterial.setDiffuse(...diffuse);
        this.cylinderMaterial.setSpecular(...specular);
        this.cylinderMaterial.setShininess(shininess);
    }

    enableNormalViz() {
        super.enableNormalViz && super.enableNormalViz();
    }

    disableNormalViz() {
        super.disableNormalViz && super.disableNormalViz();
    }
}
