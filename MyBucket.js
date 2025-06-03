import { CGFobject, CGFappearance } from './lib/CGF.js';

/**
 * MyBucket
 * @constructor
 * @param scene
 */
export class MyBucket extends CGFobject {
    constructor(scene, slices, stacks, bucketTexture, waterTexture, hasWater = false, bucketMaterialProps = {}, waterMaterialProps = {}) {
        super(scene);
        this.slices = slices;
        this.stacks = stacks;
        this.bucketTexture = bucketTexture;
        this.waterTexture = waterTexture;
        this.hasWater = hasWater;
        this.bucketMaterialProps = bucketMaterialProps;
        this.waterMaterialProps = waterMaterialProps;
        this.initBuffers();
        this.initMaterials();
    }

    initMaterials() {

        const {
            bucketAmbient = [0.8, 0.8, 0.8, 1.0],
            bucketDiffuse = [0.9, 0.9, 0.9, 1.0],
            bucketSpecular = [0.1, 0.1, 0.1, 1.0],
            bucketShininess = 10.0
        } = this.bucketMaterialProps;

        const {
            waterAmbient = [0.8, 0.8, 0.8, 1.0],
            waterDiffuse = [0.9, 0.9, 0.9, 1.0],
            waterSpecular = [0.1, 0.1, 0.1, 1.0],
            waterShininess = 10.0
        } = this.waterMaterialProps;

        this.bucketMaterial = new CGFappearance(this.scene);
        this.bucketMaterial.setTexture(this.bucketTexture);
        this.bucketMaterial.setAmbient(...bucketAmbient);
        this.bucketMaterial.setDiffuse(...bucketDiffuse);
        this.bucketMaterial.setSpecular(...bucketSpecular);
        this.bucketMaterial.setShininess(bucketShininess);

        this.waterMaterial = new CGFappearance(this.scene);
        this.waterMaterial.setTexture(this.waterTexture);
        this.waterMaterial.setAmbient(...waterAmbient);
        this.waterMaterial.setDiffuse(...waterDiffuse);
        this.waterMaterial.setSpecular(...waterSpecular);
        this.waterMaterial.setShininess(waterShininess);
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];
        this.alpha = (2 * Math.PI) / this.slices;

        // Generate vertices, normals, and texture coordinates for the sides
        for (let j = 0; j <= this.stacks; j++) {
            const stackHeight = j / this.stacks;
            for (let i = 0; i <= this.slices; i++) {
                const angle = this.alpha * i;
                const x = Math.cos(angle);
                const y = Math.sin(angle);

                this.vertices.push(x, y, stackHeight);
                this.normals.push(x, y, 0);
                this.texCoords.push(i / this.slices, stackHeight);
            }
        }

        // Generate indices for the sides (inverted order for outside)
        for (let j = 0; j < this.stacks; j++) {
            for (let i = 0; i < this.slices; i++) {
                const first = j * (this.slices + 1) + i;
                const second = first + this.slices + 1;

                this.indices.push(first + 1, second, first);
                this.indices.push(first + 1, second + 1, second);
            }
        }

        // Add bottom cap (outside)
        const bottomCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0); // Center
        this.normals.push(0, 0, -1); // Normal pointing down
        this.texCoords.push(0.5, 0.5); // Texture coordinate for center

        for (let i = 0; i <= this.slices; i++) {
            const angle = this.alpha * i;
            const x = Math.cos(angle);
            const y = Math.sin(angle);

            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, -1);
            this.texCoords.push(0.5 + x * 0.5, 0.5 - y * 0.5);

            if (i > 0) {
                this.indices.push(bottomCenterIndex + i + 1, bottomCenterIndex + i, bottomCenterIndex);
            }
        }

        // Generate indices for the inside of the sides (reverse order)
        for (let j = 0; j < this.stacks; j++) {
            for (let i = 0; i < this.slices; i++) {
                const first = j * (this.slices + 1) + i;
                const second = first + this.slices + 1;

                this.indices.push(first, second, first + 1);
                this.indices.push(second, second + 1, first + 1);
            }
        }

        // Add bottom cap (inside)
        const bottomInsideCenterIndex = this.vertices.length / 3;
        this.vertices.push(0, 0, 0); // Center
        this.normals.push(0, 0, 1); // Normal pointing up (reverse for inside)
        this.texCoords.push(0.5, 0.5); // Texture coordinate for the center

        for (let i = 0; i <= this.slices; i++) {
            const angle = this.alpha * i;
            const x = Math.cos(angle);
            const y = Math.sin(angle);

            this.vertices.push(x, y, 0);
            this.normals.push(0, 0, 1); // Normal pointing up (reverse for inside)
            this.texCoords.push(0.5 + x * 0.5, 0.5 - y * 0.5); // Map to texture space

            if (i > 0) {
                this.indices.push(bottomInsideCenterIndex, bottomInsideCenterIndex + i, bottomInsideCenterIndex + i + 1);
            }
        }

        // Add top cap (water)
        this.topVertices = [];
        this.topIndices = [];
        this.topNormals = [];
        this.topTexCoords = [];

        const topCenterIndex = 0;
        const topCapZ = 0.80; // Water level more inside
        this.topVertices.push(0, 0, topCapZ); // Center
        this.topNormals.push(0, 0, 1); // Normal pointing up
        this.topTexCoords.push(0.5, 0.5); // Texture coordinate for the center

        for (let i = 0; i <= this.slices; i++) {
            const angle = this.alpha * i;
            const x = Math.cos(angle);
            const y = Math.sin(angle);

            this.topVertices.push(x, y, topCapZ);
            this.topNormals.push(0, 0, 1);
            this.topTexCoords.push(0.5 + x * 0.5, 0.5 - y * 0.5);

            if (i > 0) {
                this.topIndices.push(topCenterIndex, i, i + 1);
            }
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
        this.initTopCapBuffers();
    }

    initTopCapBuffers() {
        this.topCap = new CGFobject(this.scene);
        this.topCap.vertices = this.topVertices;
        this.topCap.indices = this.topIndices;
        this.topCap.normals = this.topNormals;
        this.topCap.texCoords = this.topTexCoords;
        this.topCap.primitiveType = this.scene.gl.TRIANGLES;
        this.topCap.initGLBuffers();
    }

    enableNormalViz() {
        super.enableNormalViz && super.enableNormalViz();
        if (this.topCap && this.topCap.enableNormalViz)
            this.topCap.enableNormalViz();
    }

    disableNormalViz() {
        super.disableNormalViz && super.disableNormalViz();
        if (this.topCap && this.topCap.disableNormalViz)
            this.topCap.disableNormalViz();
    }

    display() {
        this.scene.pushMatrix();

        this.bucketMaterial.apply();
        this.scene.rotate(Math.PI, 0, 1, 1);
        this.scene.scale(0.7, 0.7, 1.2);
        super.display();

        if (this.hasWater) {
            console.log("Displaying water in the bucket.");
            this.waterMaterial.apply();
            this.topCap.display();
        } else {
            console.log("Bucket is empty.");
        }

        this.scene.popMatrix();
    }
}

