attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 uNMatrix;

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vEyeVector;
varying vec3 vLightDirection;

uniform sampler2D uSampler4;
uniform float timeFactor;

void main() {
    // Side-to-side wave effect
    float waveSpeed = 0.0006;
    float animatedX = mod(aTextureCoord.x + timeFactor * waveSpeed, 0.0);

    vTextureCoord = vec2(animatedX, aTextureCoord.y);

    // Calculate displacement for water waves
    float displacement = texture2D(uSampler4, vTextureCoord).r * 2.0;
    vec3 offset = aVertexNormal * displacement;
    
    // Transform vertex position
    vec4 vertexPosition = uMVMatrix * vec4(aVertexPosition + offset, 1.0);
    
    // Calculate normal in view space
    vNormal = normalize(vec3(uNMatrix * vec4(aVertexNormal, 0.0)));
    
    // Calculate eye vector (from vertex to camera)
    vEyeVector = normalize(-vertexPosition.xyz);
    
    // Calculate light direction (assuming light at infinity in view space)
    vLightDirection = normalize(vec3(0.0, 10.0, 10.0));  // Light from above and slightly forward
    
    gl_Position = uPMatrix * vertexPosition;
}