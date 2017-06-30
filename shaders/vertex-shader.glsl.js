define(function() {
    return `
    
varying vec2 vUv;
attribute float tex;
attribute float light;
attribute float wave;
attribute vec3 spot;
attribute vec4 quaternion;
varying float vTex;
varying float vLight;
uniform vec3 vCam;
uniform float curvature;
uniform float time;
uniform float bigwave;

void main()  {
    vTex = tex;
    vUv = uv;

    vec3 newPosition = rotateVectorByQuaternion( position - spot, quaternion ) + spot;
    vLight = 1.0/ sqrt(500.0 / distance(newPosition, vCam)) * light;

    float dist = distance(newPosition, vCam);
    if (curvature > 0.0) {
        newPosition.z = newPosition.z - curvature * (dist*dist)/20000.0;
    }
    if (wave > 0.0) {
        newPosition.z = newPosition.z + wave * (sin(newPosition.x*15.0 + time/2.0) - cos(newPosition.y*7.0 + time/2.0));
        if (bigwave > 0.0) {
            newPosition.z = newPosition.z + wave * bigwave
            * (sin(newPosition.x/500.0 + time/10.0) - sin(newPosition.y/700.0 + time/10.0));
        }
    }

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0 );
    gl_Position = projectionMatrix * mvPosition;
}    

    `;
});
