#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vEyeVector;
varying vec3 vLightDirection;

uniform sampler2D uSampler3;
uniform sampler2D uSampler4;

void main() {
    // Get base water color from texture
    vec4 color = texture2D(uSampler3, vTextureCoord) - texture2D(uSampler4, vTextureCoord) * 0.35;

    // Ensure color components are not negative
    color = max(color, 0.0);
    
    // Normalize vectors
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    vec3 eyeDir = normalize(vEyeVector);
    
    // Calculate diffuse lighting
    float diffuseStrength = 0.7;  // Intensity of diffuse lighting
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diffuseStrength * diff * color.rgb;
    
    // Calculate reflection vector for specular
    vec3 reflectDir = reflect(-lightDir, normal);
    
    // Calculate specular lighting
    float specularStrength = 1.2;
    float shininess = 64.0;
    float spec = pow(max(dot(eyeDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * vec3(1.0, 1.0, 1.0);
    
    // Ambient light to ensure water is never completely dark
    float ambientStrength = 0.2;
    vec3 ambient = ambientStrength * color.rgb;
    
    // Combine all lighting components
    color.rgb = ambient + diffuse + specular;
    color.a = 1.0;

    gl_FragColor = color;
}