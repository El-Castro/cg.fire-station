import { CGFscene, CGFcamera, CGFaxis, CGFtexture, CGFappearance, CGFshader } from "./lib/CGF.js";
import { MyPlane } from "./MyPlane.js";
import { MyPanorama } from "./MyPanorama.js";
import { MyBuilding } from "./MyBuilding.js"
import { MyForest } from "./MyForest.js";
import { MyHeli } from "./MyHeli.js";
import { MyLake } from "./MyLake.js";
import { MyFire } from "./MyFire.js";

/**
 * MyScene
 * @constructor
 */
export class MyScene extends CGFscene {
  constructor() {
    super();
    this.speedFactor = 1;
  }

  init(application) {
    super.init(application);

    this.initCameras();
    this.initLights();

    //Background color
    this.gl.clearColor(0, 0, 0, 1.0);

    this.gl.clearDepth(100.0);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.enableTextures(true);

    this.fixCameraHeli = false;
    this.waterShader = null;
    this.waterTime = 0;
    this.buildingWindowsNum = 3;
    this.buildingFloors = 4;

    // Landscape/nature textures
    this.earthTexture = new CGFtexture(this, 'textures/sky.jpg');
    this.floorTexture = new CGFtexture(this, 'textures/grass.jpg');
    this.waterTexture = new CGFtexture(this, 'textures/waterTex.jpg');
    this.fireTexture = new CGFtexture(this, "textures/fire.jpeg");
    this.waterMapTexture = new CGFtexture(this, 'textures/waterMap.jpg');
    this.trunkTexture = new CGFtexture(this, 'textures/treeTexture.jpg');
    this.leafTexture = new CGFtexture(this, 'textures/leafTexture.jpg');
    // Building textures
    this.windowTexture = new CGFtexture(this, 'textures/window.jpg');
    this.wallTexture = new CGFtexture(this, 'textures/wall.png');
    this.doorTexture = new CGFtexture(this, 'textures/door.png');
    this.helipadTexture = new CGFtexture(this, 'textures/helipad.png');
    this.upTexture = new CGFtexture(this, 'textures/UP.png');
    this.downTexture = new CGFtexture(this, 'textures/DOWN.png');
    // Helicopter textures
    this.heliTexture = new CGFtexture(this, 'textures/heli.png');
    this.landingGearTexture = new CGFtexture(this, 'textures/landingGear.png');
    this.propellerTexture = new CGFtexture(this, 'textures/propeller.png');
    this.leftSideTailTexture = new CGFtexture(this, 'textures/leftSideTail.png');
    this.rightSideTailTexture = new CGFtexture(this, 'textures/rightSideTail.png');
    this.topHeliTexture = new CGFtexture(this, 'textures/top.png');
    this.glassTexture = new CGFtexture(this, 'textures/glass.jpg');


    // Water shader
    this.waterShader = new CGFshader(this.gl, "shaders/water.vert", "shaders/water.frag");
    this.waterShader.setUniformsValues({ uSampler3: 2, uSampler4: 3, timeFactor: 0 });
    // Fire shader 
    this.fireShader = new CGFshader(this.gl, "shaders/fire.vert", "shaders/fire.frag");
    this.fireShader.setUniformsValues({ uSampler3: 0, timeFactor: 0, flameRandom: 0}); // Modified this line
    this.fireShader.setUniformsValues({ uSampler3: 0, timeFactor: 0 });
    // Helipad shader for helipad H/UP/DOWN transitions
    this.helipadShader = new CGFshader(this.gl, "shaders/helipad.vert", "shaders/helipad.frag");
    this.helipadShader.setUniformsValues({ uHelipadTexA: 4, uHelipadTexB: 5, uMixFactor: 0.0 });

    this.setUpdatePeriod(50);

    this.forest_fire_pos = [-250, 0, -100];
    this.buildin_pos = [100, 0, -100];

    //Initialize scene objects
    this.axis = new CGFaxis(this, 20, 1);
    this.plane = new MyPlane(this, this.floorTexture, 64, 0, 1, 0, 1, 100);
    this.panorama = new MyPanorama(this, this.earthTexture);
    this.building = new MyBuilding(this, this.buildingFloors, 30, this.buildingWindowsNum, this.windowTexture, [0, 0, 0], this.wallTexture, this.doorTexture, this.helipadTexture, this.upTexture, this.downTexture, this.heliTexture, this.glassTexture);
    this.forest = new MyForest(this, 400, 20, 30, this.trunkTexture, this.leafTexture);
    this.heli = new MyHeli(this, 4, this.heliTexture, this.topHeliTexture, this.leftSideTailTexture, this.rightSideTailTexture, this.propellerTexture, this.landingGearTexture, this.heliTexture, this.glassTexture, this.waterTexture);
    this.lake = new MyLake(this, 100, this.waterTexture);
    this.fire = new MyFire(this, this.fireTexture, this.fireShader);

    this.speed = 0;
    this.displayNormals = false;
    this.displayAxis = false;
    this.heli.helipadHeight = this.building.height + this.buildin_pos[1] + 6.5;
    this.heli.cruiseHeight = this.heli.helipadHeight + 10;
    this.heli.currentHeight = this.heli.helipadHeight;
    this.heli.position.y = this.heli.helipadHeight;

    this.helipadState = "IDLE"; // "IDLE", "TAKEOFF", "LANDING"
    this.currentHelipadTexture = this.helipadTexture;
    this.wasOnHelipad = true; // Track previous helipad state
  }

  initLights() {
    // Moon light
    this.lights[0].setPosition(-100, 250, 80, 1);
    this.lights[0].setDiffuse(0.6, 0.6, 0.8, 1);
    this.lights[0].setSpecular(1.0, 1.0, 1.0, 1.0);
    this.lights[0].setVisible(true);
    this.lights[0].enable();
    this.lights[0].update();

    // Sunset light
    this.lights[1].setPosition(-80, 75, -230, 1);
    this.lights[1].setDiffuse(1.0, 0.7, 0.4, 1);
    this.lights[1].setSpecular(1.0, 0.7, 0.4, 1);
    this.lights[1].setVisible(true);
    this.lights[1].enable();
    this.lights[1].update();
  }

  initCameras() {
    this.camera = new CGFcamera(
      0.7,
      0.2,
      1000,
      vec3.fromValues(190, 100, -170),
      vec3.fromValues(0, 0, 0)
    );
  }

  checkKeys() {
    var keysPressed = false;

    // Helicopter controls
    if (this.gui.isKeyPressed("KeyW")) {
      if (!this.heli.lockedOnHelipad) {
        this.heli.accelerate(0.3 * this.speedFactor); // Increase speed
        keysPressed = true;
      }
    }
    if (this.gui.isKeyPressed("KeyS")) {
      if (!this.heli.lockedOnHelipad) {
        this.heli.accelerate(-0.3 * this.speedFactor); // Decrease speed
        keysPressed = true;
      }
    }
    if (this.gui.isKeyPressed("KeyA")) {
      if (!this.heli.lockedOnHelipad) {
        this.heli.turn(0.05 * this.speedFactor); // Turn left
        keysPressed = true;
      }
    }
    if (this.gui.isKeyPressed("KeyD")) {
      if (!this.heli.lockedOnHelipad) {
        this.heli.turn(-0.05 * this.speedFactor); // Turn right
        keysPressed = true;
      }
    }
    if (this.gui.isKeyPressed("KeyP")) {
      if (this.heli.lockedOnHelipad) {
        this.heli.unlockFromHelipad(); // Unlock movement
        this.helipadState = "TAKEOFF";
      } else {
        this.heli.currentHeight = this.heli.cruiseHeight;
      }
      keysPressed = true;
    }
    if (this.gui.isKeyPressed("KeyL")) {
      // If at cruiseHeight and on helipad, auto-land
      if (Math.abs(this.heli.position.y - this.heli.cruiseHeight) < 0.2 && this.heli.isOnHelipad()) {
        this.heli.startAutoLanding();
        this.helipadState = "LANDING";
      } else {
        this.heli.currentHeight = this.heli.determineTargetAltitude();
      }
      keysPressed = true;
    }
    if (this.gui.isKeyPressed("KeyR")) {
      this.heli.reset(); // Reset the helicopter
      keysPressed = true;
    }
    if (this.gui.isKeyPressed("KeyO")) {
      if (this.heli.isOnFire() && this.heli.hasWater) {
        this.heli.hasWater = false;
        this.fire.fireRange -= 1;
        this.heli.triggerFallingWater();
      }
      keysPressed = true;
    }

    if (keysPressed) console.log("Keys pressed for helicopter control.");
  }

  update(t) {
    super.update(t);

    const delta_t = this.lastUpdateTime ? (t - this.lastUpdateTime) / 1000 : 0;
    this.lastUpdateTime = t;

    this.checkKeys();
    this.heli.update(delta_t); // Pass delta_t to update the helicopter's position

    // Update speed based on helicopter velocity
    const velocity = this.heli.velocity;
    this.speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2).toFixed(2);

    // Handle bucket visibility based on helipad status
    if (this.heli.isOnHelipad() && this.heli.bucketAttached) {
      this.heli.toggleBucket(); // Hide bucket when on the helipad
    } else if (!this.heli.isOnHelipad() && !this.heli.bucketAttached) {
      this.heli.toggleBucket(); // Show bucket when off the helipad
    }

    if (this.fixCameraHeli) {
      this.updateCamera();
    }

    this.waterTime = t / 100 % 25600;
    if (this.waterShader)
      this.waterShader.setUniformsValues({ timeFactor: this.waterTime });
    if (this.fireShader)
      this.fireShader.setUniformsValues({ timeFactor: t / 100 % 25600});

    const isCurrentlyOnHelipad = this.heli.isOnHelipad();

    // Helipad textures state transitions
    if (this.helipadState === "TAKEOFF" && !isCurrentlyOnHelipad && this.wasOnHelipad) {
      this.helipadState = "IDLE";
    }
    if (this.helipadState === "LANDING" && !this.heli.autoLanding && isCurrentlyOnHelipad) {
      this.helipadState = "IDLE";
      this.heli.lockedOnHelipad = true;
    }

    // Set current helipad textures and mix factor based on state
    let helipadTexA = this.helipadTexture;
    let helipadTexB = this.helipadTexture;
    let mixFactor = 0.0;
    if (this.helipadState === "TAKEOFF" && isCurrentlyOnHelipad) {
      helipadTexA = this.helipadTexture;
      helipadTexB = this.upTexture;
      mixFactor = 0.5 + 0.5 * Math.sin(t / 250);
    } else if (this.helipadState === "LANDING") {
      helipadTexA = this.helipadTexture;
      helipadTexB = this.downTexture;
      mixFactor = 0.5 + 0.5 * Math.sin(t / 250);
    }
    this.currentHelipadTexA = helipadTexA;
    this.currentHelipadTexB = helipadTexB;
    this.currentHelipadMix = mixFactor;

    this.wasOnHelipad = isCurrentlyOnHelipad;

    // Update helipad lights
    let heliManeuvering = false;
    if (this.helipadState === "TAKEOFF" && isCurrentlyOnHelipad) {
      heliManeuvering = true; // Taking off, still on helipad area
    } else if (this.helipadState === "LANDING" || this.heli.autoLanding) {
      heliManeuvering = true; // Auto-landing
    }
    if (this.building && this.building.setHelipadLightsActive) {
      this.building.setHelipadLightsActive(heliManeuvering);
      this.building.updateHelipadLights(t);
    }
  }

  updateCamera() {
    const heliPosition = this.heli.getPosition();
    const heliDirection = this.heli.getDirection();

    const cameraOffset = 110;
    const cameraHeight = 90;

    const cameraPosition = [
      heliPosition.x - heliDirection.x * cameraOffset,
      heliPosition.y + cameraHeight,
      heliPosition.z - heliDirection.z * cameraOffset
    ];

    const targetYOffset = 0;
    const target = [
      heliPosition.x + heliDirection.x * 20,
      heliPosition.y + targetYOffset,
      heliPosition.z + heliDirection.z * 20
    ];

    this.camera.setPosition(cameraPosition);
    this.camera.setTarget(target);
  }

  setDefaultAppearance() {
    this.setAmbient(0.7, 0.7, 0.7, 1.0);
    this.setDiffuse(0.5, 0.5, 0.5, 1.0);
    this.setSpecular(0.5, 0.5, 0.5, 1.0);
    this.setShininess(10.0);
  }

  display() {
    // ---- BEGIN Background, camera and axis setup
    // Clear image and depth buffer everytime we update the scene
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    // Initialize Model-View matrix as identity (no transformation
    this.updateProjectionMatrix();
    this.loadIdentity();
    // Apply transformations corresponding to the camera position relative to the origin
    this.applyViewMatrix();
    this.lights[0].update();
    this.lights[1].update();

    // Draw axis
    if(this.displayAxis) {this.axis.display();}

    if (this.displayNormals) {
      if (this.lake.enableNormalViz) this.lake.enableNormalViz();
      if (this.building.enableNormalViz) this.building.enableNormalViz();
      if (this.heli.enableNormalViz) this.heli.enableNormalViz();
    } else {
      if (this.lake.disableNormalViz) this.lake.disableNormalViz();
      if (this.building.disableNormalViz) this.building.disableNormalViz();
      if (this.heli.disableNormalViz) this.heli.disableNormalViz();
    }

    // Reset to default appearance to avoid applying the sphere's material to other objects
    this.setDefaultAppearance();

    // Render the plane
    this.pushMatrix();
    this.scale(2000, 1, 2000);
    this.rotate(-Math.PI / 2, 1, 0, 0);
    this.plane.display();
    this.popMatrix();

    // Panorama
    this.pushMatrix();
    this.panorama.display();
    this.popMatrix();

    // Helicopter
    this.pushMatrix();
    this.heli.display();
    this.popMatrix();

    // Building
    this.pushMatrix();
    this.translate(this.buildin_pos[0], this.buildin_pos[1], this.buildin_pos[2])
    // Pass the current helipad textures and mix factor to the building
    this.building.setHelipadShader(this.helipadShader, this.currentHelipadTexA, this.currentHelipadTexB, this.currentHelipadMix);
    this.building.display();
    this.popMatrix();

    // Forest
    this.pushMatrix();
    this.translate(this.forest_fire_pos[0], this.forest_fire_pos[1], this.forest_fire_pos[2]);
    this.forest.display();
    this.popMatrix();

    // Fire
    this.pushMatrix();
    this.translate(this.forest_fire_pos[0], this.forest_fire_pos[1], this.forest_fire_pos[2]);
    this.fire.display();
    this.popMatrix();

    // Lake
    this.pushMatrix();
    this.translate(70, 0.1, 70);
    this.setActiveShader(this.waterShader);
    this.waterTexture.bind(2); // Water texture
    this.waterMapTexture.bind(3); // Water map

    this.lake.display();

    // Restore default shader
    this.setActiveShader(this.defaultShader);
    this.popMatrix();
  }
}
