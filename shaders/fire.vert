attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;
uniform float timeFactor;
uniform float flameRandom;

varying vec2 vTextureCoord;

float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {

    float oscillationX = 0.1 * flameRandom *sin(timeFactor *0.1);
    float oscillationY = 0.3 * flameRandom *cos(timeFactor *0.3);
    float oscillationZ = 0.1 * flameRandom *sin(timeFactor *0.1);
    
 
    // Apply the oscillation to the vertex position
    vec3 newPosition = aVertexPosition;
    newPosition.x += oscillationX;
    newPosition.y += oscillationY;
    newPosition.z += oscillationZ;
    
    // Pass texture coordinates to fragment shader
    vTextureCoord = aTextureCoord;
    
    // Calculate final position
    gl_Position = uPMatrix * uMVMatrix * vec4(newPosition, 1.0);
}