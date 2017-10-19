'use strict';

define(['shaders/fragment-shader.glsl', 'shaders/vertex-shader.glsl', 'shaders/vertex-shader-common.glsl'], function (fragmentShader, vertexShader, vertexShaderCommon) {
    return {
        fragmentShader: fragmentShader,
        vertexShader: vertexShaderCommon + vertexShader
    };
});
//# sourceMappingURL=shader.js.map