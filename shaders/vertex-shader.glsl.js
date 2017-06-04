define(function() {
    return `
    
varying vec2 vUv;
attribute float tex;
attribute float light;
attribute vec3 spot;
attribute vec4 quaternion;
varying float vTex;
varying float vLight;
uniform vec3 vCam;
uniform float curvature;

void main()  {
    vTex = tex;
    vUv = uv;

    vec3 newPosition = rotateVectorByQuaternion( position - spot, quaternion ) + spot;
    vLight = 1.0/ sqrt(500.0 / distance(newPosition, vCam)) * light;

    float dist = distance(newPosition, vCam);
    newPosition.z = newPosition.z - curvature * (dist*dist)/20000.0;

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}    

    `;
});
