import { CGFobject, CGFappearance } from "./lib/CGF.js";

export class MyLake extends CGFobject {
    constructor(scene, radius, texture, segments = 64) {
        super(scene);
        this.radius = radius;
        this.texture = texture;
        this.segments = segments;
        this.initAppearance();
        this.initBuffers();
    }

    initAppearance() {
        this.material = new CGFappearance(this.scene);
        this.material.setTexture(this.texture);
        this.material.setTextureWrap("REPEAT", "REPEAT");
        this.material.setAmbient(0.2, 0.2, 0.2, 1.0);
        this.material.setDiffuse(0.4, 0.4, 0.4, 1.0);
        this.material.setSpecular(1, 1, 1, 1.0);
        this.material.setShininess(100.0);
        
    }

    initBuffers() {
        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.texCoords = [];

        // Center vertex
        this.vertices.push(0, 0, 0);
        this.normals.push(0, 1, 0);
        this.texCoords.push(0.5, 0.5);

        const outerPoints = [];
        const innerRings = [[], [], [], [], [], [], [], []];

        // Generate outer and inner points
        for (let i = 0; i <= this.segments; i++) {
            const angle = (2 * Math.PI * i) / this.segments;
            // Noise for less edgy border
            const noise =
                0.92
                + 0.06 * Math.sin(3 * angle)
                + 0.04 * Math.sin(7 * angle + 2.0)
                + 0.02 * Math.sin(13 * angle + 5.0);
            const r = this.radius * noise;
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            outerPoints.push({x, z});

            for (let k = 1; k <= 8; k++) {
                innerRings[k-1].push({x: x * (k/9), z: z * (k/9)});
            }
        }

        // Inner rings
        for (let ring = 0; ring < 8; ring++) {
            for (let i = 0; i <= this.segments; i++) {
                const {x, z} = innerRings[ring][i];
                this.vertices.push(x, 0, z);
                this.normals.push(0, 1, 0);
                this.texCoords.push(0.5 + 0.5 * x / this.radius, 0.5 + 0.5 * z / this.radius);
            }
        }

        // Outer ring
        for (let i = 0; i <= this.segments; i++) {
            const {x, z} = outerPoints[i];
            this.vertices.push(x, 0, z);
            this.normals.push(0, 1, 0);
            this.texCoords.push(0.5 + 0.5 * x / this.radius, 0.5 + 0.5 * z / this.radius);
        }

        const ringStarts = [
            1,
            this.segments + 2,
            2 * this.segments + 3,
            3 * this.segments + 4,
            4 * this.segments + 5,
            5 * this.segments + 6,
            6 * this.segments + 7,
            7 * this.segments + 8
        ];
        const outerStart = 8 * this.segments + 9;

        for (let i = 1; i <= this.segments; i++) {
            this.indices.push(0, i + 1, i);
        }

        // Connect inner rings in sequence
        for (let ring = 0; ring < 7; ring++) {
            const startA = ringStarts[ring];
            const startB = ringStarts[ring + 1];
            for (let i = 0; i < this.segments; i++) {
                const i0 = startA + i;
                const i1 = startA + i + 1;
                const j0 = startB + i;
                const j1 = startB + i + 1;
                // Triangle 1
                this.indices.push(i0, j1, j0);
                // Triangle 2
                this.indices.push(i0, i1, j1);
            }
        }

        // Last inner ring to outer ring
        const lastInnerStart = ringStarts[7];
        for (let i = 0; i < this.segments; i++) {
            const i0 = lastInnerStart + i;
            const i1 = lastInnerStart + i + 1;
            const o0 = outerStart + i;
            const o1 = outerStart + i + 1;
            // Triangle 1
            this.indices.push(i0, o1, o0);
            // Triangle 2
            this.indices.push(i0, i1, o1);
        }

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }

    display() {
        this.scene.pushMatrix();
        this.material.apply();
        super.display();
        this.scene.popMatrix();
    }
}
