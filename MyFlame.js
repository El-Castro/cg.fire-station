import { CGFobject } from './lib/CGF.js';
/**
 * MyQuad
 * @constructor
 * @param {MyScene} scene
 * @param {Array} coords
 */
export class MyFlame extends CGFobject {
    constructor(scene) {
        super(scene);
        this.randomValue = Math.random();
        this.initBuffers();
    }

    initBuffers() {
        // Flame triangle vertices
        this.vertices = [
            // Center flame
            0, 1.5, 0,      // 0 top
            -0.5, 0, 0,     // 1 bottom left
            0.5, 0, 0,      // 2 bottom right

            // Left flame
            -0.3, 1.2, 0,   // 3 top
            -0.7, 0, 0,     // 4 bottom left
            -0.1, 0, 0,     // 5 bottom right

            // Right flame
            0.3, 1.2, 0,    // 6 top
            0.1, 0, 0,      // 7 bottom left
            0.7, 0, 0,      // 8 bottom right

            // Small center flame
            0, 0.8, 0,      // 9 top
            -0.3, 0, 0,     // 10 bottom left
            0.3, 0, 0       // 11 bottom right
        ];

        this.normals = [];
        for (let i = 0; i < this.vertices.length / 3; i++) {
            this.normals.push(0, 0, 1);
        }

        this.indices = [
            0, 1, 2,    // Center flame
            2, 1, 0,    // Back face
            3, 4, 5,    // Left flame
            5, 4, 3,    // Back face
            6, 7, 8,    // Right flame
            8, 7, 6,    // Back face
            9, 10, 11,  // Small center flame
            11, 10, 9   // Back face
        ];

        this.texCoords = [
            0.5, 0,     // 0
            0, 1,       // 1
            1, 1,       // 2

            0.5, 0,     // 3
            0, 1,       // 4
            1, 1,       // 5

            0.5, 0,     // 6
            0, 1,       // 7
            1, 1,       // 8

            0.5, 0.2,   // 9
            0.2, 1,     // 10
            0.8, 1      // 11
        ];

        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }
}

