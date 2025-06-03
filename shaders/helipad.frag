#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uHelipadTexA;
uniform sampler2D uHelipadTexB;
uniform float uMixFactor;

void main() {
    vec4 baseColor = mix(
        texture2D(uHelipadTexA, vTextureCoord),
        texture2D(uHelipadTexB, vTextureCoord),
        uMixFactor
    );

    vec3 normal = vec3(0.0, 1.0, 0.0);
    vec3 lightDir = normalize(vec3(0.3, 1.0, 0.5));
    vec3 viewDir = normalize(vec3(0.0, 1.0, 2.0));

    float ambientStrength = 0.12;
    float diffuseStrength = 0.65;
    float specularStrength = 0.18;
    float shininess = 50.0;

    vec3 ambient = ambientStrength * baseColor.rgb;
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diffuseStrength * diff * baseColor.rgb;

    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * vec3(1.0);

    vec3 color = ambient + diffuse + specular;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, baseColor.a);
}
