import { CGFscene, CGFcamera, CGFaxis, CGFappearance, CGFtexture, CGFobject } from "./lib/CGF.js";
import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";
import { MyWindow } from "./MyWindow.js";
import { MyHelipadLight } from "./MyHelipadLight.js";

export class MyBuilding extends CGFobject {
    constructor(scene, floors, width, windows_num, windows_type, color, wallTexture, doorTexture, helipadTexture, upTexture, downTexture, lightBaseTexture, lightTexture) {
        super(scene);
        this.width = width;
        this.height = width *(0.4 + 0.3*floors) 
        this.floors = floors; // Central module has one more floor
        this.windows_num = windows_num; // Number of windows per floor
        this.color = color;
        this.wallTexture = wallTexture
        this.doorTexture = doorTexture
        this.helipadTexture = helipadTexture
        this.upTexture = upTexture;
        this.downTexture = downTexture;
        this.lightBaseTexture = lightBaseTexture;
        this.lightTexture = lightTexture;

        this.currentHelipadTexture = helipadTexture;

        this.wallComponents = {
            ambient: [1, 1, 1, 1.0],
            diffuse: [1, 1, 1, 1.0],
            specular: [0.2, 0.2, 0.2, 1.0],
            shininess: 50.0
        };

        this.windowComponents = {
            ambient:  [0.85, 0.88, 0.95, 0.8],
            diffuse:  [0.7, 0.8, 1.0, 0.8],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 600.0
        };

        this.lightBaseComponents = {
            ambient:  [0.5, 0.5, 0.55, 1.0],
            diffuse:  [0.7, 0.7, 0.8, 1.0],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 180.0
        };

        this.lightComponents = {
            ambient:  [1.0, 1.0, 0.85, 1.0],
            diffuse:  [1.0, 1.0, 0.7, 1.0],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 100.0
        };

        this.window = new MyWindow(scene, windows_type, this.windowComponents);
        this.initComponents();

        this.helipadLights = [
            new MyHelipadLight(scene, this.lightBaseTexture, this.lightTexture, this.lightBaseComponents, this.lightComponents),
            new MyHelipadLight(scene, this.lightBaseTexture, this.lightTexture, this.lightBaseComponents, this.lightComponents),
            new MyHelipadLight(scene, this.lightBaseTexture, this.lightTexture, this.lightBaseComponents, this.lightComponents),
            new MyHelipadLight(scene, this.lightBaseTexture, this.lightTexture, this.lightBaseComponents, this.lightComponents)
        ];

        this.helipadShader = null;
        this.helipadTexA = null;
        this.helipadTexB = null;
        this.helipadMix = 0.0;
    }

    setHelipadShader(shader, texA, texB, mix) {
        this.helipadShader = shader;
        this.helipadTexA = texA;
        this.helipadTexB = texB;
        this.helipadMix = mix;
    }

    setHelipadTexture(tex) {
        this.currentHelipadTexture = tex;
        if (this.centralfloorCube) this.centralfloorCube.updateFaceTexture(0, tex);
        if (this.centralCube) this.centralCube.updateFaceTexture(0, tex);
    }

    setHelipadLightsActive(active) {
        for (let light of this.helipadLights) {
            light.setActive(active);
        }
    }

    updateHelipadLights(t) {
        for (let light of this.helipadLights) {
            light.update(t);
        }
    }

    initComponents() {
        // Initialize materials
        this.centralfloorCube = new MyUnitCubeQuad(this.scene, this.helipadTexture, this.doorTexture, this.wallTexture, this.doorTexture, this.wallTexture, this.wallTexture, this.wallComponents);
        this.centralCube = new MyUnitCubeQuad(this.scene, this.helipadTexture, this.wallTexture, this.wallTexture, this.wallTexture, this.wallTexture, this.wallTexture, this.wallComponents);
        this.sideCube = new MyUnitCubeQuad(this.scene, this.wallTexture, this.wallTexture, this.wallTexture, this.wallTexture, this.wallTexture, this.wallTexture, this.wallComponents);
    }

    display() {
        this.scene.pushMatrix();
        this.scene.scale(this.width, this.width, this.width);

        // Ground floor (central module)
        this.scene.pushMatrix();
        this.scene.translate(0, 0.2, 0);
        this.scene.scale(2, 0.4, 1);
        this.centralfloorCube.display();
        this.scene.popMatrix();

        // Central module floors
        for (let i = 0; i < this.floors; i++) {
            this.scene.pushMatrix();
            this.scene.translate(0, 0.55 + i * 0.3, 0);
            this.scene.scale(2, 0.3, 1);

            if (this.helipadShader && this.helipadTexA && this.helipadTexB && i === this.floors - 1) {
                // Draw all faces except the top face
                if (this.centralCube.displayExceptFace) {
                    this.centralCube.displayExceptFace(0);
                } else {
                    this.centralCube.display();
                }
                // Draw the top face with the helipad shader
                this.scene.setActiveShader(this.helipadShader);
                this.helipadTexA.bind(4);
                this.helipadTexB.bind(5);
                this.helipadShader.setUniformsValues({ uMixFactor: this.helipadMix });
                if (this.centralCube.displayFace) {
                    this.centralCube.displayFace(0);
                }
                this.scene.setActiveShader(this.scene.defaultShader);
            } else {
                this.centralCube.display();
            }

            this.scene.popMatrix();

            for (let j = 0; j < this.windows_num; j++) {
                // Front side
                this.scene.pushMatrix();
                this.scene.translate(-0.7 + j * (1.4 / (this.windows_num - 1)), 0.55 + i * 0.3, 0.48);
                this.window.display();
                this.scene.popMatrix();

                // Back side
                this.scene.pushMatrix();
                this.scene.translate(-0.7 + j * (1.4 / (this.windows_num - 1)), 0.55 + i * 0.3, -0.48);
                this.window.display();
                this.scene.popMatrix();
            }
        }

        // Side modules
        const sideScale = 1.5; // 75% of central module width
        for (let side of [-1, 1]) { // Left (-1) and right (1) modules
            for (let i = 0; i < this.floors; i++) {
                this.scene.pushMatrix();
                this.scene.translate(side * 1.75, 0.15 + i * 0.3, 0);
                this.scene.scale(sideScale, 0.3, 0.8);
                this.sideCube.display();
                this.scene.popMatrix();

                const windowXStart = side * 2.3;
                const windowXEnd = side * 1.2;
                for (let j = 0; j < this.windows_num; j++) {

                    const xPos = windowXStart + (windowXEnd - windowXStart) * (j / (this.windows_num - 1));

                    // Front side
                    this.scene.pushMatrix();
                    this.scene.translate(xPos, 0.15 + i * 0.3, 0.38);
                    this.window.display();
                    this.scene.popMatrix();

                    // Back side
                    this.scene.pushMatrix();
                    this.scene.translate(xPos, 0.15 + i * 0.3, -0.38);
                    this.window.display();
                    this.scene.popMatrix();
                }

                // Left or right side (depending on module)
                for (let k = 0; k < Math.ceil(this.windows_num / 2); k++) {
                    this.scene.pushMatrix();
                    this.scene.translate(side * 1.98, 0.15 + i * 0.3, -0.2 + k * (0.4 / (Math.ceil(this.windows_num / 2) - 1)));
                    this.scene.scale(0.05, 0.2, 0.2);
                    this.window.display();
                    this.scene.popMatrix();
                }
            }
        }

        // Helipad lights position
        const helipadY = 0.55 + (this.floors - 1) * 0.3 + 0.15; // Top of building in local coords
        const helipadHalfWidth = 0.5;
        const helipadHalfDepth = 0.2;
        const lightOffset = 0.18;

        const positions = [
            [ helipadHalfWidth + lightOffset, helipadY,  helipadHalfDepth + lightOffset], // Front-right
            [-helipadHalfWidth - lightOffset, helipadY,  helipadHalfDepth + lightOffset], // Front-left
            [ helipadHalfWidth + lightOffset, helipadY, -helipadHalfDepth - lightOffset], // Back-right
            [-helipadHalfWidth - lightOffset, helipadY, -helipadHalfDepth - lightOffset]  // Back-left
        ];

        for (let i = 0; i < 4; i++) {
            this.scene.pushMatrix();
            this.scene.translate(positions[i][0], positions[i][1], positions[i][2]);
            this.helipadLights[i].display();
            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }

    enableNormalViz() {
        // UnitCubeQuads
        if (this.centralfloorCube && this.centralfloorCube.enableNormalViz) this.centralfloorCube.enableNormalViz();
        if (this.centralCube && this.centralCube.enableNormalViz) this.centralCube.enableNormalViz();
        if (this.sideCube && this.sideCube.enableNormalViz) this.sideCube.enableNormalViz();
        // Windows
        if (this.window && this.window.enableNormalViz) this.window.enableNormalViz();
        // Helipad lights
        if (this.helipadLights && Array.isArray(this.helipadLights)) {
            for (let light of this.helipadLights) {
                if (light && light.enableNormalViz) light.enableNormalViz();
            }
        }
    }

    disableNormalViz() {
        // UnitCubeQuads
        if (this.centralfloorCube && this.centralfloorCube.disableNormalViz) this.centralfloorCube.disableNormalViz();
        if (this.centralCube && this.centralCube.disableNormalViz) this.centralCube.disableNormalViz();
        if (this.sideCube && this.sideCube.disableNormalViz) this.sideCube.disableNormalViz();
        // Windows
        if (this.window && this.window.disableNormalViz) this.window.disableNormalViz();
        // Helipad lights
        if (this.helipadLights && Array.isArray(this.helipadLights)) {
            for (let light of this.helipadLights) {
                if (light && light.disableNormalViz) light.disableNormalViz();
            }
        }
    }
}
