"use strict";

define(function () {
    return "\n    \nvarying vec2 vUv;\nattribute float tex;\nattribute float light;\nattribute float wave;\nattribute vec3 spot;\nattribute vec4 quaternion;\nvarying float vTex;\nvarying float vLight;\nuniform vec3 vCam;\nuniform float curvature;\nuniform float time;\n\nvoid main()  {\n    vTex = tex;\n    vUv = uv;\n\n    vec3 newPosition = rotateVectorByQuaternion( position - spot, quaternion ) + spot;\n    vLight = 1.0/ sqrt(500.0 / distance(newPosition, vCam)) * light;\n\n    float dist = distance(newPosition, vCam);\n    if (curvature > 0.0) {\n        newPosition.z = newPosition.z - curvature * (dist*dist)/20000.0;\n    }\n    if (wave > 0.0) {\n        newPosition.z = newPosition.z + wave * sin(newPosition.x*5.0 - newPosition.y*7.0 + time);\n    }\n\n    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0 );\n    gl_Position = projectionMatrix * mvPosition;\n}    \n\n    ";
});
//# sourceMappingURL=vertex-shader.glsl.js.map