import {CGFobject, CGFappearance} from './lib/CGF.js';
import { MyQuad } from './MyQuad.js';
/**
 * MyUnitCubeQuad
 * @constructor
 * @param scene
 */
export class MyUnitCubeQuad extends CGFobject {
    // Add materialProps as an optional parameter
    constructor(scene, top, front, right, back, left, botton, materialProps = {}) {
        super(scene);
        // Store textures in array
        this.textures = [top, botton, front, back, left, right];

        this.materialProps = materialProps;

        this.initBuffers();
        this.cube1 = new MyQuad(this.scene);
        this.cube2 = new MyQuad(this.scene);
        this.cube3 = new MyQuad(this.scene);
        this.cube4 = new MyQuad(this.scene);
        this.cube5 = new MyQuad(this.scene);
        this.cube6 = new MyQuad(this.scene);

        this.initMaterials(top, front, right, back, left, botton);
    }


    initMaterials(top, front, right, back, left, botton) {

        const {
            ambient = [1, 1, 1, 1.0],
            diffuse = [1, 1, 1, 1.0],
            specular = [0.2, 0.2, 0.2, 1.0],
            shininess = 50.0
        } = this.materialProps;

        this.materialCube1 = new CGFappearance(this.scene);
        this.materialCube1.setTexture(front);
        this.materialCube1.setTextureWrap('REPEAT', 'REPEAT');
        this.materialCube1.setAmbient(...ambient);
        this.materialCube1.setDiffuse(...diffuse);
        this.materialCube1.setSpecular(...specular);
        this.materialCube1.setShininess(shininess);

        this.materialCube2 = new CGFappearance(this.scene);
        this.materialCube2.setTexture(back);
        this.materialCube2.setTextureWrap('REPEAT', 'REPEAT');
        this.materialCube2.setAmbient(...ambient);
        this.materialCube2.setDiffuse(...diffuse);
        this.materialCube2.setSpecular(...specular);
        this.materialCube2.setShininess(shininess);

        this.materialCube3 = new CGFappearance(this.scene);
        this.materialCube3.setTexture(left);
        this.materialCube3.setTextureWrap('REPEAT', 'REPEAT');
        this.materialCube3.setAmbient(...ambient);
        this.materialCube3.setDiffuse(...diffuse);
        this.materialCube3.setSpecular(...specular);
        this.materialCube3.setShininess(shininess);

        this.materialCube4 = new CGFappearance(this.scene);
        this.materialCube4.setTexture(right);
        this.materialCube4.setTextureWrap('REPEAT', 'REPEAT');
        this.materialCube4.setAmbient(...ambient);
        this.materialCube4.setDiffuse(...diffuse);
        this.materialCube4.setSpecular(...specular);
        this.materialCube4.setShininess(shininess);

        this.materialCube5 = new CGFappearance(this.scene);
        this.materialCube5.setTexture(top);
        this.materialCube5.setTextureWrap('REPEAT', 'REPEAT');
        this.materialCube5.setAmbient(...ambient);
        this.materialCube5.setDiffuse(...diffuse);
        this.materialCube5.setSpecular(...specular);
        this.materialCube5.setShininess(shininess);

        this.materialCube6 = new CGFappearance(this.scene);
        this.materialCube6.setTexture(botton);
        this.materialCube6.setTextureWrap('REPEAT', 'REPEAT');
        this.materialCube6.setAmbient(...ambient);
        this.materialCube6.setDiffuse(...diffuse);
        this.materialCube6.setSpecular(...specular);
        this.materialCube6.setShininess(shininess);
    }

    
    display(){
        
        //Quad 1
        this.scene.pushMatrix();
        this.scene.translate(0,0,0.5);
        this.materialCube1.apply();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.cube1.display();
        this.scene.popMatrix();

        //Quad 2
        this.scene.pushMatrix();
        this.scene.translate(0,0,-0.5);
        this.scene.rotate(Math.PI, 0, 1, 0);
        this.materialCube2.apply();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.cube2.display();
        this.scene.popMatrix();

        //Quad 3
        this.scene.pushMatrix();
        this.scene.translate(0.5,0,0);
        this.scene.rotate(Math.PI/2, 0, 1, 0);
        this.materialCube3.apply();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.cube3.display();
        this.scene.popMatrix();

        //Quad 4
        this.scene.pushMatrix();
        this.scene.translate(-0.5,0,0);
        this.scene.rotate(-Math.PI/2, 0, 1, 0);
        this.materialCube4.apply();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.cube4.display();
        this.scene.popMatrix();

        //Quad 5
        this.scene.pushMatrix();
        this.scene.translate(0,0.5,0);
        this.scene.rotate(-Math.PI/2, 1, 0, 0);
        this.materialCube5.apply()
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.cube5.display();
        this.scene.popMatrix();

        //Quad 6
        this.scene.pushMatrix();
        this.scene.translate(0,-0.5,0);
        this.scene.rotate(Math.PI/2, 1, 0, 0);
        this.materialCube6.apply();
        this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
        this.cube6.display();
        this.scene.popMatrix();

    }
    
    // Method to allow updating a face's texture
    updateFaceTexture(faceIndex, texture) {
        // faceIndex: 0=top, 1=bottom, 2=front, 3=back, 4=left, 5=right
        if (this.textures && this.textures.length > faceIndex) {
            this.textures[faceIndex] = texture;
            // Update the corresponding material's texture as well
            switch(faceIndex) {
                case 0: // top
                    this.materialCube5.setTexture(texture);
                    break;
                case 1: // bottom
                    this.materialCube6.setTexture(texture);
                    break;
                case 2: // front
                    this.materialCube1.setTexture(texture);
                    break;
                case 3: // back
                    this.materialCube2.setTexture(texture);
                    break;
                case 4: // left
                    this.materialCube3.setTexture(texture);
                    break;
                case 5: // right
                    this.materialCube4.setTexture(texture);
                    break;
            }
        }
    }

    enableNormalViz() {
        if (this.cube1.enableNormalViz) this.cube1.enableNormalViz();
        if (this.cube2.enableNormalViz) this.cube2.enableNormalViz();
        if (this.cube3.enableNormalViz) this.cube3.enableNormalViz();
        if (this.cube4.enableNormalViz) this.cube4.enableNormalViz();
        if (this.cube5.enableNormalViz) this.cube5.enableNormalViz();
        if (this.cube6.enableNormalViz) this.cube6.enableNormalViz();
    }

    disableNormalViz() {
        if (this.cube1.disableNormalViz) this.cube1.disableNormalViz();
        if (this.cube2.disableNormalViz) this.cube2.disableNormalViz();
        if (this.cube3.disableNormalViz) this.cube3.disableNormalViz();
        if (this.cube4.disableNormalViz) this.cube4.disableNormalViz();
        if (this.cube5.disableNormalViz) this.cube5.disableNormalViz();
        if (this.cube6.disableNormalViz) this.cube6.disableNormalViz();
    }

    displayFace(faceIndex) {
        // 0: top, 1: bottom, 2: front, 3: back, 4: left, 5: right
        this.scene.pushMatrix();
        switch(faceIndex) {
            case 0: // top
                this.scene.translate(0, 0.5, 0);
                this.scene.rotate(-Math.PI/2, 1, 0, 0);
                this.materialCube5.apply();
                this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
                this.cube5.display();
                break;
            case 1: // bottom
                this.scene.translate(0, -0.5, 0);
                this.scene.rotate(Math.PI/2, 1, 0, 0);
                this.materialCube6.apply();
                this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
                this.cube6.display();
                break;
            case 2: // front
                this.scene.translate(0, 0, 0.5);
                this.materialCube1.apply();
                this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
                this.cube1.display();
                break;
            case 3: // back
                this.scene.translate(0, 0, -0.5);
                this.scene.rotate(Math.PI, 0, 1, 0);
                this.materialCube2.apply();
                this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
                this.cube2.display();
                break;
            case 4: // left
                this.scene.translate(-0.5, 0, 0);
                this.scene.rotate(-Math.PI/2, 0, 1, 0);
                this.materialCube3.apply();
                this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
                this.cube3.display();
                break;
            case 5: // right
                this.scene.translate(0.5, 0, 0);
                this.scene.rotate(Math.PI/2, 0, 1, 0);
                this.materialCube4.apply();
                this.scene.gl.texParameteri(this.scene.gl.TEXTURE_2D, this.scene.gl.TEXTURE_MAG_FILTER, this.scene.gl.NEAREST);
                this.cube4.display();
                break;
        }
        this.scene.popMatrix();
    }
}

