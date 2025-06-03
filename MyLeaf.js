import { CGFobject } from './lib/CGF.js';
/**
 * MyQuad
 * @constructor
 * @param {MyScene} scene
 * @param {Array} coords
 */
export class MyLeaf extends CGFobject {
    constructor(scene, size, height, radius, trunkLeafBool, texture) {
        super(scene);
        this.size = size;
        this.alpha = (Math.PI * 2) / this.size;
        this.height = height;
        this.r = radius;
        this.trunkLeafBool = trunkLeafBool;
        this.texture = texture;
        this.initBuffers();
    }


    initBuffers() {
        // Vertici della piramide: base e vertice superiore
        this.vertices = [
            0, 0, 0,
            0, this.height, 0,
        ];

        // Aggiunta dei vertici della base
        for (let i = 0; i < this.size; i++) {
            this.vertices.push(
                this.r * Math.cos(this.alpha * i), 0, this.r * Math.sin(this.alpha * i) // Vertici della base
            );
        }

        // Normali per i vertici
        this.normals = [
            0, -1, 0, // Normale per il centro della base
            0, 1, 0,  // Normale per il vertice superiore
        ];

        for (let i = 0; i < this.size; i++) {
            const x = Math.cos(this.alpha * i);
            const z = Math.sin(this.alpha * i);
            this.normals.push(x, 0, z); // Normali per i vertici della base
        }

        // Indici per i triangoli
        this.indices = [];

        for (let i = 0; i < this.size; i++) {
            // Triangoli tra il centro della base e i vertici della base
            if (i == this.size - 1) {
                this.indices.push(0, i + 2, 2); // Ultimo triangolo della base
            } else {
                this.indices.push(0, i + 2, i + 3); // Triangoli della base
            }

            // Triangoli tra il vertice superiore e i vertici della base
            if (i == this.size - 1) {
                this.indices.push(2, i + 2, 1); // Ultimo triangolo laterale
            } else {
                this.indices.push(i + 3, i + 2, 1); // Triangoli laterali
            }
        }

        // Generate texture coordinates for each vertex
        // Center of base
        this.texCoords = [0.5, 0.5];
        // Apex (top)
        this.texCoords.push(0.5, 0);

        // Base vertices: distribute around the base circle
        for (let i = 0; i < this.size; i++) {
            // Map circle to [0,1] range for texture
            const u = 0.5 + 0.5 * Math.cos(this.alpha * i);
            const v = 0.5 + 0.5 * Math.sin(this.alpha * i);
            this.texCoords.push(u, v);
        }
        this.updateTexCoordsGLBuffers();

        

        // Impostazione del tipo di primitiva e inizializzazione dei buffer
        this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
    }




}

