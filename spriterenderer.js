define([
    'threejs',
    'utils',
    'spriteobject',
    'spritesheet',
    'camera',
    'turbosort',
    'shader',
    'loop',
], function(THREE, Utils, SpriteObject, SpriteSheet, Camera, turboSort, Shader, Loop) {
    'use strict';

    const planeGeometry = new THREE.PlaneBufferGeometry(1, 1);
    const pointCount = planeGeometry.attributes.position.count;
    const indices = planeGeometry.index.array;
    let spriteRenderers = [];
    let uniforms = null;
    let indexProcessor = function(){};

    /**
     *  CLASS DEFINITIONS
     */

    function SpriteRenderer() {
        this.images = [];
        this.imageOrder = [];
        this.imageCount = 0;
        this.mesh = createMesh(this);
        this.curvature = 0;
        this.bigwave = 0;

        const self = this;

        this.display = function (spriteObject) {
            const index = self.imageCount;
            let image = self.images[index];

            const cut = spriteObject && spriteObject.visible
                ? SpriteSheet.getCut(spriteObject.img, image ? image.time + Loop.time : Loop.time)
                : null;
            if (cut && cut.ready) {
                if(!image) {
                    image = self.images[index] = new SpriteImage();
                    image.index = index;
                    image.time = Math.random()*10000+Loop.time;

                    for (let j=0; j<indices.length; j++) {
                        image.indexArray[j] = indices[j] + image.index*4;
                    }
                }

                const quat = spriteObject.hasQuaternionArray
                    ? spriteObject.quaternionArray : Camera.getCameraQuaternionData().array;
                if (image.quaternionArray[0] !== quat[0]
                    || image.quaternionArray[1] !== quat[1]
                    || image.quaternionArray[2] !== quat[2]
                    || image.quaternionArray[3] !== quat[3]
                ) {
                    quat.splatter(image.quaternionArray,0)
                        .splatter(image.quaternionArray,4)
                        .splatter(image.quaternionArray,8)
                        .splatter(image.quaternionArray,12);
                    image.quatDirty = true;
                }

                if (spriteObject.position.x !== image.position.x
                    || spriteObject.position.y !== image.position.y
                    || spriteObject.position.z !== image.position.z
                ) {
                    image.position.x = spriteObject.position.x;
                    image.position.y = spriteObject.position.y;
                    image.position.z = spriteObject.position.z;
                    for(let i=0; i<4; i++) {
                        image.spotArray[i*3] = image.position.x;
                        image.spotArray[i*3+1] = image.position.y;
                        image.spotArray[i*3+2] = image.position.z;
                    }
                    image.positionDirty = true;
                }

                if (spriteObject.size[0] !== image.size[0]
                    || spriteObject.size[1] !== image.size[1]
                    || spriteObject.size[2] !== image.size[2]
                    || image.positionDirty
                ) {
                    image.size[0] = spriteObject.size[0];
                    image.size[1] = spriteObject.size[1];
                    image.size[2] = spriteObject.size[2];
                    const vertices = planeGeometry.attributes.position.array;
                    for(let v=0; v<vertices.length; v++) {
                        image.vertices[v] = vertices[v] * spriteObject.size[v%3] + image.spotArray[v];
                    }
                    image.verticesDirty = true;
                }

                if(image.uv !== cut.uv) {
                    image.uv = cut.uv;
                    image.uvDirty = true;
                }

                if(image.tex !== cut.tex) {
                    image.tex = cut.tex;
                    image.texDirty = true;
                }

                if(image.light !== spriteObject.light) {
                    image.light = spriteObject.light;
                    image.lightDirty = true;
                }

                if(image.wave !== spriteObject.wave) {
                    image.wave = spriteObject.wave;
                    image.waveDirty = true;
                }

                image.spriteObject = spriteObject;
                self.imageOrder[index] = image;
                self.imageCount++;
            }
            return image;
        };

        spriteRenderers.push(this);
    }

    SpriteRenderer.prototype.destroy = destroySprite;
    SpriteRenderer.prototype.render = render;
    SpriteRenderer.prototype.updateGraphics = updateGraphics;
    SpriteRenderer.prototype.clear = clear;
    SpriteRenderer.prototype.processGraphics = processGraphics;
    SpriteRenderer.prototype.display = null;

    function SpriteImage() {
        this.position = new THREE.Vector3();
        this.spotArray = new Float32Array(3 * pointCount);
        this.size = new Float32Array(3);
        this.vertices = new Float32Array(planeGeometry.attributes.position.array.length);
        this.quaternionArray = new Float32Array(4 * pointCount);
        this.indexArray = new Uint16Array(indices.length);
    }
    SpriteImage.prototype.index = 0;
    SpriteImage.prototype.position = null;
    SpriteImage.prototype.spotArray = null;
    SpriteImage.prototype.indexArray = null;
    SpriteImage.prototype.tex = -1;
    SpriteImage.prototype.size = null;
    SpriteImage.prototype.uv = null;
    SpriteImage.prototype.vertices = null;
    SpriteImage.prototype.light = 1;
    SpriteImage.prototype.wave = 0;
    SpriteImage.prototype.zIndex = 0;
    SpriteImage.prototype.quaternionArray = null;
    SpriteImage.prototype.positionDirty = true;
    SpriteImage.prototype.verticesDirty = true;
    SpriteImage.prototype.texDirty = true;
    SpriteImage.prototype.uvDirty = true;
    SpriteImage.prototype.lightDirty = true;
    SpriteImage.prototype.waveDirty = true;
    SpriteImage.prototype.quatDirty = true;

    /**
     *  FUNCTION DEFINITIONS
     */

    function clear() {
        this.imageCount = 0;
        SpriteObject.clear();
    }

    function createMesh(spriteRenderer) {
        const mesh = new THREE.Mesh(createGeometry(), new THREE.MeshBasicMaterial());

        mesh.material = new THREE.ShaderMaterial( {
            uniforms: uniforms = {
                texture:  {
                    type: 'tv',
                    get value() { return SpriteSheet.getTextures(); },
                },
                vCam : {
                    type: "v3",
                    get value() { return Camera.getCamera().position; },
                },
                curvature: {
                    type: "f",
                    get value() { return spriteRenderer.curvature; },
                },
                time: {
                    type: "f",
                    get value() { return performance.now()/100; },
                },
                bigwave: {
                    type: "f",
                    get value() { return spriteRenderer.bigwave; },
                },
            },
            vertexShader: Shader.vertexShader,
            fragmentShader: Shader.fragmentShader,
            transparent:true,
            depthWrite: false,
            depthTest: true,
        } );

        mesh.frustumCulled = false;
        return mesh;
    }

    function createGeometry() {
        const geometry = new THREE.BufferGeometry();
        geometry.attributes.position = new THREE.BufferAttribute(new Float32Array(0), 3);
        geometry.attributes.spot = new THREE.BufferAttribute(new Float32Array(0), 3);
        geometry.attributes.quaternion = new THREE.BufferAttribute(new Float32Array(0), 4);
        geometry.attributes.uv = new THREE.BufferAttribute(new Float32Array(0), 2);
        geometry.attributes.tex = new THREE.BufferAttribute(new Float32Array(0), 1);
        geometry.attributes.light = new THREE.BufferAttribute(new Float32Array(0), 1);
        geometry.attributes.wave = new THREE.BufferAttribute(new Float32Array(0), 1);
        geometry.index = new THREE.BufferAttribute(new Uint16Array(0), 1);
        return geometry;
    }

    function sortImages(images,count) {
        const camera = Camera.getCamera();
        for (let i = 0; i < count; i++) {
            images[i].zIndex = -camera.position.distanceToManhattan(images[i].position);
        }
        indexProcessor(images, count);
        turboSort(images,count,indexFunction);
    }

    function setIndexProcessor(fun) {
        indexProcessor = fun ? fun : function(){};
    }

    function indexFunction(a) {
        return a.zIndex;
    }

    function render() {
        const imageCount = this.imageCount;
        const totalPointCount = imageCount * pointCount;
        let previousAttribute;

        const mesh = this.mesh;
        const geometry = mesh.geometry;
        if (geometry.attributes.position.count < totalPointCount) {
            previousAttribute = geometry.attributes.position;
            geometry.attributes.position = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            if(previousAttribute)
                geometry.attributes.position.copyArray(previousAttribute.array);
            geometry.attributes.position.setDynamic(true);
        }
        if (geometry.attributes.spot.count < totalPointCount) {
            previousAttribute = geometry.attributes.spot;
            geometry.attributes.spot = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 3), 3
            );
            if(previousAttribute)
                geometry.attributes.spot.copyArray(previousAttribute.array);
            geometry.attributes.spot.setDynamic(true);
        }
        if (geometry.attributes.quaternion.count < totalPointCount) {
            previousAttribute = geometry.attributes.quaternion;
            geometry.attributes.quaternion = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 4), 4
            );
            if(previousAttribute)
                geometry.attributes.quaternion.copyArray(previousAttribute.array);
            geometry.attributes.quaternion.setDynamic(true);
        }
        if (geometry.attributes.uv.count < totalPointCount) {
            previousAttribute = geometry.attributes.uv;
            geometry.attributes.uv = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount * 2), 2
            );
            if(previousAttribute)
                geometry.attributes.uv.copyArray(previousAttribute.array);
            geometry.attributes.uv.setDynamic(true);
        }
        if (geometry.attributes.tex.count < totalPointCount) {
            previousAttribute = geometry.attributes.tex;
            geometry.attributes.tex = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.tex.copyArray(previousAttribute.array);
            geometry.attributes.tex.setDynamic(true);
        }
        if (geometry.attributes.light.count < totalPointCount) {
            previousAttribute = geometry.attributes.light;
            geometry.attributes.light = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.light.copyArray(previousAttribute.array);
            geometry.attributes.light.setDynamic(true);
        }
        if (geometry.attributes.wave.count < totalPointCount) {
            previousAttribute = geometry.attributes.wave;
            geometry.attributes.wave = new THREE.BufferAttribute(
                new Float32Array(imageCount * pointCount), 1
            );
            if(previousAttribute)
                geometry.attributes.wave.copyArray(previousAttribute.array);
            geometry.attributes.wave.setDynamic(true);
        }
        if (geometry.index.count < imageCount * planeGeometry.index.array.length) {
            previousAttribute = geometry.index;
            const indices = planeGeometry.index.array;
            geometry.index = new THREE.BufferAttribute(new Uint16Array(imageCount * indices.length), 1);
            if(previousAttribute)
                geometry.index.copyArray(previousAttribute.array);
            geometry.index.setDynamic(true);
        }

        sortImages(this.imageOrder, imageCount);
    }

    function updateGraphics() {
        this.render();
        this.processGraphics();
    }

    function processGraphics() {
        const images = this.images;
        const imageOrder = this.imageOrder;
        const imageCount = this.imageCount;
        const geometry = this.mesh.geometry;
        const geo_quaternion = geometry.attributes.quaternion.array;
        const geo_spot = geometry.attributes.spot.array;
        const geo_pos = geometry.attributes.position.array;
        const geo_tex = geometry.attributes.tex.array;
        const geo_light = geometry.attributes.light.array;
        const geo_wave = geometry.attributes.wave.array;
        const geo_uv = geometry.attributes.uv.array;
        const geo_index = geometry.index.array;

        let quatChanged = false;
        let positionChanged = false;
        let texChanged = false;
        let verticesChanged = false;
        let uvChanged = false;
        let lightChanged = false;
        let waveChanged = false;

        for(let i=0;i<imageCount;i++) {
            const image = images[i];
            const index = image.index;

            if (image.quatDirty) {
                image.quaternionArray.splatter(geo_quaternion, index * 16);
                image.quatDirty = false;
                quatChanged = true;
            }

            if (image.positionDirty) {
                image.spotArray.splatter(geo_spot, index * 12);
                image.positionDirty = false;
                positionChanged = true;
            }

            if (image.verticesDirty) {
                image.vertices.splatter(geo_pos, index * 12);
                image.verticesDirty = false;
                verticesChanged = true;
            }

            if (image.uvDirty) {
                image.uv.splatter(geo_uv, index * 8);
                image.uvDirty = false;
                uvChanged = true;
            }

            if (image.texDirty) {
                geo_tex.fill(image.tex, index * 4, index * 4 + 4);
                image.texDirty = false;
                texChanged = true;
            }

            if (image.lightDirty) {
                geo_light.fill(image.light, index * 4, index * 4 + 4);
                image.lightDirty = false;
                lightChanged = true;
            }

            if (image.waveDirty) {
                geo_wave.fill(image.wave, index * 4, index * 4 + 4);
                image.waveDirty = false;
                waveChanged = true;
            }
        }

        for(let i=0;i<imageCount;i++) {
            imageOrder[i].indexArray.splatter(geo_index, i * 6);
        }

        if(geometry.drawRange.start !== 0 || geometry.drawRange.count !== imageCount*planeGeometry.index.count) {
            geometry.setDrawRange(0, imageCount*planeGeometry.index.count);
        }

        if(lightChanged) {
            geometry.attributes.light.needsUpdate = true;
        }
        if(waveChanged) {
            geometry.attributes.wave.needsUpdate = true;
        }
        if(quatChanged) {
            geometry.attributes.quaternion.needsUpdate = true;
        }
        if(positionChanged) {
            geometry.attributes.spot.needsUpdate = true;
        }
        if(verticesChanged) {
            geometry.attributes.position.needsUpdate = true;
        }
        if(texChanged) {
            geometry.attributes.tex.needsUpdate = true;
        }
        if(uvChanged) {
            geometry.attributes.uv.needsUpdate = true;
        }
        geometry.index.needsUpdate = true;
        this.clear();
    }

    function destroyEverything() {
        for(let i=0; i<spriteRenderers.length; i++) {
            spriteRenderers[i].destroy();
        }
        spriteRenderers.length = 0;
    }

    function destroySprite() {
        if(this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        this.mesh = null;
        this.images.length = 0;
        this.imageCount = 0;
    }

    /**
     *  PUBLIC DECLARATIONS
     */
    SpriteRenderer.setIndexProcessor = setIndexProcessor;
    Utils.onDestroy(destroyEverything);

    /**
     *   PROCESSES
     */


    return SpriteRenderer;
 });
