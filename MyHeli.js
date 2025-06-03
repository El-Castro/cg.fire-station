import { CGFobject, CGFappearance } from "./lib/CGF.js";
import { MySphere } from "./MySphere.js";
import { MyUnitCubeQuad } from "./MyUnitCubeQuad.js";
import { MyBucket } from "./MyBucket.js";
import { MyCylinder } from "./MyCylinder.js";

export class MyHeli extends CGFobject {
    constructor(scene, width, cabinTexture, topTailTexture, leftTailTexture, rightTailTexture, propellerTexture, landingGearTexture, bucketTexture, glassTexture, waterTexture) {
        super(scene);
        this.width = width;
        this.hasWater = false;

        // Textures
        this.cabinTexture = cabinTexture;
        this.topTailTexture = topTailTexture;
        this.leftTailTexture = leftTailTexture;
        this.rightTailTexture = rightTailTexture;
        this.propellerTexture = propellerTexture;
        this.landingGearTexture = landingGearTexture;
        this.bucketTexture = bucketTexture;
        this.glassTexture = glassTexture;
        this.waterTexture = waterTexture;

        this.fallingWater = false;
        this.fallingWaterTimer = 0;
        this.fallingWaterDuration = 1.0;
        this.fallingWaterParticles = [];
        this.fallingWaterParticleCount = 60;

        // Altitudes
        this.helipadHeight = this.scene.building.height + this.scene.buildin_pos[1] + 6.5;
        this.cruiseHeight = this.helipadHeight + 10;
        this.groundHeight = 30;
        this.lakeHeight = 10;
        this.currentHeight = this.helipadHeight;


        this.propellerAngle = 0;
        this.tiltAngle = 0;

        // Position, orientation, and velocity
        this.position = { x: this.scene.buildin_pos[0], y: this.helipadHeight, z: this.scene.buildin_pos[2] };
        this.orientation = 0;
        this.velocity = { x: 0, y: 0, z: 0 }; // Velocity vector 

        this.autoLanding = false;

        this.bucketSpawnAltitude = this.helipadHeight;
        this.bucketAttached = false;
        this.bucketSpawnAnimating = false;
        this.bucketDespawnAnimating = false;
        this.bucketSpawnY = 0; // Offset for animation
        this.bucketSpawnDuration = 1.0;
        this.bucketSpawnElapsed = 0;

        this.lockedOnHelipad = true; // Locked until P is pressed

        
        this.metalComponents = {
            ambient:  [0.65, 0.65, 0.70, 1.0],
            diffuse:  [0.80, 0.80, 0.85, 1.0],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 200.0
        };

        this.glassComponents = {
            ambient:  [0.60, 0.62, 0.65, 0.6],
            diffuse:  [0.70, 0.70, 0.72, 0.7],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 500.0
        };


        this.ropeComponents = {
            ambient:  [0.30, 0.20, 0.10, 1.0],
            diffuse:  [0.80, 0.65, 0.40, 1.0],
            specular: [0.05, 0.05, 0.05, 1.0],
            shininess: 8.0
        };

        this.waterComponents = {
            ambient:  [0.00, 0.00, 0.00, 0.7],
            diffuse:  [0.10, 0.15, 0.20, 0.8],
            specular: [1.0, 1.0, 1.0, 1.0],
            shininess: 800.0
        };


        this.initComponents();

    }
    
    initComponents() {
        // Helicopter parts
        this.cabin = new MySphere(this.scene, 16, 16, this.cabinTexture, true, this.metalComponents); // Main body
        this.glass = new MySphere(this.scene, 16, 16, this.glassTexture, true, this.glassComponents); // Glass part
        this.tail = new MyUnitCubeQuad(this.scene, this.topTailTexture, this.cabinTexture, this.rightTailTexture, this.cabinTexture, this.leftTailTexture, this.topTailTexture, this.metalComponents); // Tail
        this.upperPropeller = new MyUnitCubeQuad(this.scene, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.metalComponents); // Upper propeller
        this.rearPropeller = new MyUnitCubeQuad(this.scene, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.propellerTexture, this.metalComponents); // Rear propeller
        this.landingGear = new MyUnitCubeQuad(this.scene, this.landingGearTexture, this.landingGearTexture, this.landingGearTexture, this.landingGearTexture, this.landingGearTexture, this.landingGearTexture, this.metalComponents); // Landing gear
        this.bucket = new MyBucket(this.scene, 16, 8, this.bucketTexture, this.waterTexture, this.hasWater, this.metalComponents, this.waterComponents); // Bucket
        this.rope = new MyCylinder(this.scene, 8, 1, this.cabinTexture, this.ropeComponents); // Bucket's ropes
    }

    determineTargetAltitude() {
        const helipadX = this.scene.buildin_pos[0];
        const helipadZ = this.scene.buildin_pos[2];
        const helipadRadius = 10;

        const distanceToHelipad = Math.sqrt(
            (this.position.x - helipadX) ** 2 + (this.position.z - helipadZ) ** 2
        );

        if (distanceToHelipad <= helipadRadius) {
            return this.helipadHeight;
        } else if (this.isOnLake()) {
            return this.lakeHeight;
        } else {
            return this.groundHeight;
        }
    }

    isOnHelipad() {
        const helipadX = this.scene.buildin_pos[0];
        const helipadZ = this.scene.buildin_pos[2];
        const helipadRadius = 30;

        const distanceToHelipad = Math.sqrt(
            (this.position.x - helipadX) ** 2 + (this.position.z - helipadZ) ** 2
        );

        return distanceToHelipad <= helipadRadius;
    }

    isOnLake() {
        const lakeX = 70;
        const lakeZ = 70;
        const lakeRadius = 70;

        const distanceToLake = Math.sqrt(
            (this.position.x - lakeX) ** 2 + (this.position.z - lakeZ) ** 2
        );

        return distanceToLake <= lakeRadius;
    }

    isOnFire() {
        const fireX = (this.scene.fire.firePos[0] * 10) + this.scene.forest_fire_pos[0];
        const fireZ = (this.scene.fire.firePos[1] * 10) + this.scene.forest_fire_pos[2];
        const fireRadius = this.scene.fire.fireRange * 10;

        const distanceToFire = Math.sqrt(
            (this.position.x - fireX) ** 2 + (this.position.z - fireZ) ** 2
        );

        return distanceToFire <= fireRadius + 10;
    }

    turn(v) {
        if (this.lockedOnHelipad) return;

        this.orientation += v;

        // Determine the current speed and direction
        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        const direction = (this.velocity.x * Math.sin(this.orientation) + this.velocity.z * Math.cos(this.orientation)) >= 0 ? 1 : -1;

        // Update velocity based on the new orientation and direction
        this.velocity.x = direction * speed * Math.sin(this.orientation);
        this.velocity.z = direction * speed * Math.cos(this.orientation);
    }

    accelerate(v) {
        if (this.lockedOnHelipad) return;

        // Apply acceleration directly to velocity
        this.velocity.x += v * Math.sin(this.orientation);
        this.velocity.z += v * Math.cos(this.orientation);
    }

    update(delta_t) {
        if (this.autoLanding) {
            const helipadX = this.scene.buildin_pos[0];
            const helipadZ = this.scene.buildin_pos[2];
            const helipadY = this.helipadHeight;

            const dx = helipadX - this.position.x;
            const dz = helipadZ - this.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            const moveSpeed = 8.0;
            if (dist > 0.1) {
                const moveX = (dx / dist) * moveSpeed * delta_t;
                const moveZ = (dz / dist) * moveSpeed * delta_t;
                this.position.x += moveX;
                this.position.z += moveZ;
                this.velocity.x *= 0.9;
                this.velocity.z *= 0.9;
            } else {
                this.position.x = helipadX;
                this.position.z = helipadZ;
                this.velocity.x = 0;
                this.velocity.z = 0;
            }

            // Descend
            if (Math.abs(this.position.y - helipadY) > 0.1) {
                this.position.y -= 2.0 * delta_t;
                if (this.position.y < helipadY) this.position.y = helipadY;
            }

            // Stop propellers and finish landing when on helipad and at correct height
            if (Math.abs(this.position.x - helipadX) < 0.1 && Math.abs(this.position.z - helipadZ) < 0.1 && Math.abs(this.position.y - helipadY) < 0.1) {
                this.position.x = helipadX;
                this.position.z = helipadZ;
                this.position.y = helipadY;
                this.velocity.x = 0;
                this.velocity.z = 0;
                this.propellerAngle = 0;
                this.autoLanding = false;
                this.currentHeight = this.helipadHeight;
            } else {
                this.propellerAngle += delta_t * 10;
                this.propellerAngle %= Math.PI * 2;
            }
            return;
        }

        // Update position based on velocity and delta_t
        this.position.x += this.velocity.x * delta_t;
        this.position.z += this.velocity.z * delta_t;

        // Smooth altitude adjustment
        const targetAltitude = this.currentHeight;
        const altitudeStep = 0.5;
        if (Math.abs(this.position.y - targetAltitude) > 0.1) {
            this.position.y += altitudeStep * Math.sign(targetAltitude - this.position.y);
        }

        // If at lake height but not over the lake, descend to ground
        if (Math.abs(this.position.y - this.lakeHeight) < 0.1 && !this.isOnLake()) {
            this.currentHeight = this.groundHeight;
        }

        // Check if the helicopter is on the lake and lake height
        if (this.isOnLake() && Math.abs(this.position.y - this.lakeHeight) < 0.1) {
            if (!this.hasWater) {
                console.log("Helicopter is on the lake and collecting water.");
            }
            this.hasWater = true;
        }
        this.bucket.hasWater = this.hasWater;

        if (this.fallingWater) {
            this.fallingWaterTimer -= delta_t;
            if (this.fallingWaterTimer <= 0) {
                this.fallingWater = false;
                this.fallingWaterTimer = 0;
            }
        }
        if (this.fallingWaterParticles.length > 0) {
            for (let p of this.fallingWaterParticles) {
                p.y += p.vy * delta_t;
                p.x += p.vx * delta_t;
                p.z += p.vz * delta_t;
                p.age += delta_t;
            }
            this.fallingWaterParticles = this.fallingWaterParticles.filter(p => p.age < this.fallingWaterDuration);
        }

        // Bucket spawn animation
        if (this.bucketSpawnAnimating) {
            this.bucketSpawnElapsed += delta_t;
            const t = Math.min(this.bucketSpawnElapsed / this.bucketSpawnDuration, 1);
            this.bucketSpawnY = (1 - t) * 3;
            if (t >= 1) {
                this.bucketSpawnAnimating = false;
                this.bucketSpawnY = 0;
            }
        }

        // Bucket despawn animation
        if (this.bucketDespawnAnimating) {
            this.bucketSpawnElapsed += delta_t;
            const t = Math.min(this.bucketSpawnElapsed / this.bucketSpawnDuration, 1);
            this.bucketSpawnY = t * 3;
            if (t >= 1) {
                this.bucketDespawnAnimating = false;
                this.bucketSpawnY = 3;
                this.bucketAttached = false; // Actually hide the bucket after animation
            }
        }

        const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.z ** 2);
        const forwardVelocity =
            this.velocity.x * Math.sin(this.orientation) +
            this.velocity.z * Math.cos(this.orientation);

        // Tilt logic
        if (Math.abs(forwardVelocity) > 10.0 && Math.abs(forwardVelocity) <= 20.0) {
            this.tiltAngle = Math.sign(forwardVelocity) * 0.1;
        } else if (Math.abs(forwardVelocity) > 20.0 && Math.abs(forwardVelocity) <= 30.0) {
            this.tiltAngle = Math.sign(forwardVelocity) * 0.2;
        } else if (Math.abs(forwardVelocity) > 30.0) {
            this.tiltAngle = Math.sign(forwardVelocity) * 0.3;
        } else {
            this.tiltAngle = 0;
        }

        // Stop propellers if speed < 0.01 and on helipad
        if (speed < 0.01 && this.isOnHelipad() && this.position.y === this.helipadHeight) {
            this.propellerAngle = 0;
        } else {
            this.propellerAngle += delta_t * 10;
            this.propellerAngle %= Math.PI * 2;
        }
    }

    startAutoLanding() {
        this.autoLanding = true;
    }

    triggerFallingWater() {

        this.fallingWaterParticles = [];
        this._fallingWaterOrigin = {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
            orientation: this.orientation,
            tiltAngle: this.tiltAngle,
            width: this.width
        };
        for (let i = 0; i < this.fallingWaterParticleCount; i++) {
            // Randomize initial position around the bucket center
            const angle = Math.random() * 2 * Math.PI;
            const radius = Math.random() * 0.28;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = -1.5;
            // Randomize downward velocity and slight horizontal spread
            const vy = -3.0 - Math.random() * 1.5;
            const vx = (Math.random() - 0.5) * 0.45;
            const vz = (Math.random() - 0.5) * 0.45;
            this.fallingWaterParticles.push({x: x, y: y, z: z, vx: vx, vy: vy, vz: vz, age: 0});
        }
    }

    toggleBucket() {
        if (this.bucketAttached && !this.bucketDespawnAnimating && !this.bucketSpawnAnimating) {
            this.bucketDespawnAnimating = true;
            this.bucketSpawnElapsed = 0;
            this.bucketSpawnY = 0;
        }
        else if (!this.bucketAttached && !this.bucketSpawnAnimating && !this.bucketDespawnAnimating) {
            this.bucketAttached = true;
            this.bucketSpawnAnimating = true;
            this.bucketSpawnElapsed = 0;
            this.bucketSpawnY = 3;
        }
    }

    unlockFromHelipad() {
        this.lockedOnHelipad = false;
        this.currentHeight = this.cruiseHeight;
    }

    reset() {
        // Reset position, orientation, and velocity and recalculate helipadHeight
        this.helipadHeight = this.scene.building.height + this.scene.buildin_pos[1] + 6.5;
        this.cruiseHeight = this.helipadHeight + 10;
        this.bucketSpawnAltitude = this.helipadHeight;
        this.position = { 
            x: this.scene.buildin_pos[0], 
            y: this.helipadHeight, 
            z: this.scene.buildin_pos[2] 
        };
        this.orientation = 0;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.currentHeight = this.helipadHeight;
        this.hasWater = false;
        this.bucket.hasWater = false;
        this.lockedOnHelipad = true;
    }

    display() {
        if (!this.cabin || !this.tail || !this.upperPropeller || !this.rearPropeller || !this.landingGear || !this.bucket) {
            console.error("One or more helicopter components are not initialized.");
            return;
        }

        this.scene.pushMatrix();
        this.scene.translate(this.position.x, this.position.y, this.position.z);
        this.scene.rotate(this.orientation, 0, 1, 0);
        this.scene.rotate(this.tiltAngle, 1, 0, 0); // Tilt based on speed
        this.scene.scale(this.width, this.width, this.width);

        // Display cabin
        this.scene.pushMatrix();
        this.scene.scale(2, 1.5, 3);
        this.cabin.display();
        this.scene.popMatrix();

        // Display glass
        this.scene.pushMatrix();
        this.scene.scale(1.95, 1.4, 3);
        this.scene.translate(0, 0, 0.05);
        this.glass.display();
        this.scene.popMatrix();

        // Display tail
        this.scene.pushMatrix();
        this.scene.translate(0, 0, -5.2);
        this.scene.scale(0.5, 0.6, 5);
        this.tail.display();
        this.scene.popMatrix();

        // Display upper propeller
        this.scene.pushMatrix();
        this.scene.translate(0, 1.5, 0);
        this.scene.rotate(this.propellerAngle, 0, 1, 0);
        this.scene.scale(10, 0.1, 0.4);
        this.upperPropeller.display();
        this.scene.popMatrix();

        // Display rear propeller
        this.scene.pushMatrix();
        this.scene.translate(-0.3, 0, -7);
        this.scene.rotate(this.propellerAngle, 1, 0, 0);
        this.scene.scale(0.1, 1.5, 0.2);
        this.rearPropeller.display();
        this.scene.popMatrix();

        // Display landing gear
        this.scene.pushMatrix();
        this.scene.translate(1, -1.5, 0);
        this.scene.scale(0.25, 0.25, 5);
        this.landingGear.display();
        this.scene.popMatrix();

        this.scene.pushMatrix();
        this.scene.translate(-1, -1.5, 0);
        this.scene.scale(0.25, 0.25, 5);
        this.landingGear.display();
        this.scene.popMatrix();

        // Display bucket if attached or in animation
        if (this.bucketAttached || this.bucketSpawnAnimating || this.bucketDespawnAnimating) {
            this.displayRopes();
            this.scene.pushMatrix();
            this.scene.translate(0, -5 + this.bucketSpawnY, 0);
            this.bucket.display();

            // Display falling water particles if any
            if (this.fallingWaterParticles.length > 0 && this._fallingWaterOrigin) {

                if (!this._fallingWaterSphere) {
                    this._fallingWaterSphere = new MySphere(this.scene, 8, 8, this.waterTexture, true);
                }
                this.waterTexture.bind && this.waterTexture.bind(1); // Bind water texture to texture unit 1 (or just bind)
                // Transform to the world position and orientation at the time of water release
                this.scene.pushMatrix();
                this.scene.translate(
                    (this._fallingWaterOrigin.x - this.position.x) / this.width,
                    (this._fallingWaterOrigin.y - this.position.y) / this.width,
                    (this._fallingWaterOrigin.z - this.position.z) / this.width
                );
                this.scene.rotate(this._fallingWaterOrigin.orientation - this.orientation, 0, 1, 0);
                this.scene.rotate(this._fallingWaterOrigin.tiltAngle - this.tiltAngle, 1, 0, 0);
                this.scene.scale(this._fallingWaterOrigin.width / this.width, this._fallingWaterOrigin.width / this.width, this._fallingWaterOrigin.width / this.width);

                for (let p of this.fallingWaterParticles) {
                    this.scene.pushMatrix();
                    this.scene.translate(p.x, p.y, p.z);
                    this.scene.scale(0.22, 0.22, 0.22);
                    this._fallingWaterSphere.display();
                    this.scene.popMatrix();
                }
                this.scene.popMatrix();
                this.scene.setDefaultAppearance && this.scene.setDefaultAppearance();
            }

            this.scene.popMatrix();
        }

        this.scene.popMatrix();
    }

    displayRopes() {

        const ropeStartPoints = [
            { x: 0.5, y: -2.0, z: 0.5 }, // Front-right
            { x: -0.5, y: -2.0, z: 0.5 }, // Front-left
            { x: 0.5, y: -2.0, z: -0.5 }, // Back-right
            { x: -0.5, y: -2.0, z: -0.5 } // Back-left
        ];

        // Adjusted bucket connection points to be on the outer top rim
        const bucketRadius = 0.53;
        const bucketHeight = -5;
        const bucketConnectionPoints = [
            { x: bucketRadius, y: bucketHeight, z: bucketRadius }, // Front-right
            { x: -bucketRadius, y: bucketHeight, z: bucketRadius }, // Front-left
            { x: bucketRadius, y: bucketHeight, z: -bucketRadius }, // Back-right
            { x: -bucketRadius, y: bucketHeight, z: -bucketRadius } // Back-left
        ];

        for (let i = 0; i < ropeStartPoints.length; i++) {
            const startPoint = ropeStartPoints[i];
            const endPoint = bucketConnectionPoints[i];

            this.scene.pushMatrix();

            // Calculate rope direction and length
            const dx = endPoint.x - startPoint.x;
            const dy = endPoint.y - startPoint.y;
            const dz = endPoint.z - startPoint.z;
            const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Position and orientation
            this.scene.translate(startPoint.x, startPoint.y, startPoint.z);
            const angleXZ = Math.atan2(dx, dz);
            const angleY = Math.acos(dy / length);
            this.scene.rotate(angleXZ, 0, 1, 0);
            this.scene.rotate(angleY, 1, 0, 0);
            this.scene.scale(0.05, length, 0.05);

            this.rope.display();
            this.scene.popMatrix();
        }
    }

    getPosition() {
        return { x: this.position.x, y: this.position.y, z: this.position.z };
    }

    getDirection() {
        return { x: Math.sin(this.orientation), y: 0, z: Math.cos(this.orientation) }; 
    }

    enableNormalViz() {
        if (this.cabin && this.cabin.enableNormalViz) this.cabin.enableNormalViz();
        if (this.glass && this.glass.enableNormalViz) this.glass.enableNormalViz();
        if (this.tail && this.tail.enableNormalViz) this.tail.enableNormalViz();
        if (this.upperPropeller && this.upperPropeller.enableNormalViz) this.upperPropeller.enableNormalViz();
        if (this.rearPropeller && this.rearPropeller.enableNormalViz) this.rearPropeller.enableNormalViz();
        if (this.landingGear && this.landingGear.enableNormalViz) this.landingGear.enableNormalViz();
        if (this.bucket && this.bucket.enableNormalViz) this.bucket.enableNormalViz();
        if (this.rope && this.rope.enableNormalViz) this.rope.enableNormalViz();
    }

    disableNormalViz() {
        if (this.cabin && this.cabin.disableNormalViz) this.cabin.disableNormalViz();
        if (this.glass && this.glass.disableNormalViz) this.glass.disableNormalViz();
        if (this.tail && this.tail.disableNormalViz) this.tail.disableNormalViz();
        if (this.upperPropeller && this.upperPropeller.disableNormalViz) this.upperPropeller.disableNormalViz();
        if (this.rearPropeller && this.rearPropeller.disableNormalViz) this.rearPropeller.disableNormalViz();
        if (this.landingGear && this.landingGear.disableNormalViz) this.landingGear.disableNormalViz();
        if (this.bucket && this.bucket.disableNormalViz) this.bucket.disableNormalViz();
        if (this.rope && this.rope.disableNormalViz) this.rope.disableNormalViz();
    }
}
