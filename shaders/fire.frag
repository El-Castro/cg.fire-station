#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler3;
uniform float timeFactor;
uniform float flameRandom; // Valore casuale unico per ogni fiamma

void main() {
    // Distort texture coordinates based on time and random value
    vec2 distortedCoords = vTextureCoord;
    float distortionSpeed = 0.01 + flameRandom * 0.005;
    float distortionAmount = 0.02 + flameRandom * 0.01;
    
    distortedCoords.x += sin(timeFactor * distortionSpeed + vTextureCoord.y * 10.0) * distortionAmount;
    distortedCoords.y += cos(timeFactor * (distortionSpeed * 1.5) + vTextureCoord.x * 10.0) * distortionAmount;
    
    // Sample the fire texture with distorted coordinates
    vec4 baseColor = texture2D(uSampler3, distortedCoords);
    
    // Add flickering intensity based on time and random value
    float flicker = 0.8 + 0.2 * sin(0.15 * timeFactor + 3.14 * flameRandom);
    
    // Enhance red and yellow components for fire effect with random variation
    float redIntensity = 1.8 + flameRandom * 0.03;
    float greenIntensity = 1.5 + flameRandom * 0.02;
    float blueIntensity = 0.8 + flameRandom * 0.01;
    
    // Add brightness variation based on height (more bright at the bottom)
    float brightness = 1.5 + (1.0 - vTextureCoord.y) * 0.5;
    
    vec4 fireColor = vec4(
        baseColor.r * redIntensity * flicker * 0.9 * brightness,
        baseColor.g * greenIntensity * flicker * 0.09 * brightness,
        baseColor.b * blueIntensity * flicker * 0.07 * brightness,
        baseColor.a
    );
    
    // Add a subtle glow effect
    float glowIntensity = 0.15 * (1.0 - vTextureCoord.y);
    fireColor.rgb += vec3(1.0, 0.6, 0.2) * glowIntensity;
    
    // Ensure color values stay in valid range
    gl_FragColor = clamp(fireColor, 0.0, 1.0);
}