// ==UserScript==
// @name        glTFWireframeMode
// @namespace   aplesch
// @description allow wireframe display for meshes
// @version     0.57
// @include     *
// @grant       none
// @run-at       document-end

// ==/UserScript==
/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */
/* ### Shape ### */
debugger;

x3dom.glTF.glTFKHRMaterialCommons.prototype.updateTransforms = function(uniform, value)
{
    var matrix4f = new x3dom.fields.SFMatrix4f();
    
    function glMultMatrix4 (gl, m) {
        matrix4f.setFromArray(gl);
        return matrix4f.mult(m).toGL(); //optimize by multiplying gl matrixes directly
    };
    switch(uniform){
                case "modelViewMatrix":
                    return glMultMatrix4(value, this.worldTransform);
                    break;
                case "viewMatrix":
                    return value;
                    break;
                case "modelViewInverseTransposeMatrix":
                    //var mat = shaderParameter.normalMatrix;
                    //do modelviewinverse
                    var worldInverse = this.worldTransform.inverse();
                    matrix4f.setFromArray(value);
                    //mult in, transpose and to GL
                    var mat = worldInverse.mult(matrix4f).transpose().toGL();

                    var model_view_inv_gl =
                        [mat[0], mat[1], mat[2],
                            mat[4],mat[5],mat[6],
                            mat[8],mat[9],mat[10]];

                    return model_view_inv_gl;
                    break;
                case "modelViewInverseMatrix":
                    // work with worldTransform.inverse
                    // (VM x W)-1 = W-1 x VM-1
                    var worldInverse = this.worldTransform.inverse();
                    matrix4f.setFromArray(value);
                    return worldInverse.mult(matrix4f);
                    break;
                case "modelViewProjectionMatrix":
                    return glMultMatrix4(value, this.worldTransform);
                    break;
                case "modelMatrix":
                    return glMultMatrix4(value, this.worldTransform);
                    break;
                case "model":
                    return glMultMatrix4(value, this.worldTransform);
                    break;
                case "projectionMatrix":
                    return value;
                    break;
                default:
		    return value;
                    break;
            }
	console.warn("switch default not encountered ?");
	return value;
};

x3dom.glTF.glTFKHRMaterialCommons.prototype.bind = function(gl, shaderProgram)
{
    this.program.bind();


    // set all used Shader Parameter
    for(var key in shaderProgram){
        if(!shaderProgram.hasOwnProperty(key))
            continue;

        if(this.program.hasOwnProperty(key)) {
            this.program[key] = this.updateTransforms(key, shaderProgram[key]);
	}
    }

    if(this.diffuseTex != null)
        this.diffuseTex.bind(gl, 0, this.program.program, "diffuseTex");
    else
        this.program.diffuse = this.diffuse;

    if(this.emissionTex != null)
        this.emissionTex.bind(gl, 0, this.program.program, "emissionTex");
    else
        this.program.emission = this.emission;

    if(this.specularTex != null)
        this.specularTex.bind(gl, 0, this.program.program, "specularTex");
    else
        this.program.specular = this.specular;

    this.program.shininess = this.shininess;
    this.program.transparency = this.transparency;
    this.program.globalAmbient = this.globalAmbient;
    this.program.lightVector = this.lightVector;

    this.program.technique = this.technique;
};


x3dom.registerNodeType(
    "Shape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,

		/**
         * Constructor for Shape
         * @constructs x3dom.nodeTypes.Shape
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DShapeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Shape node has two fields, appearance and geometry, that are used to create rendered objects in the world.
         * The appearance field contains an Appearance node that specifies the visual attributes (e.g., material and texture) to be applied to the geometry.
         * The geometry field contains a geometry node. The specified geometry node is rendered with the specified appearance nodes applied.
         */
        function (ctx) {
            x3dom.nodeTypes.Shape.superClass.call(this, ctx);

		// custom, only WIREFRAME for gltf recognized, needs to go into X3DShapeNode

            this.addField_SFString(ctx, 'shading', 'PHONG');

        },
        {
            nodeChanged: function () {
                //TODO delete this if all works fine
                if (!this._cf.appearance.node) {
                    //Unlit
                    //this.addChild(x3dom.nodeTypes.Appearance.defaultNode());
                }
                if (!this._cf.geometry.node) {
                    if (this._DEF)
                        x3dom.debug.logError("No geometry given in Shape/" + this._DEF);
                }
                else if (!this._objectID) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
                this.invalidateVolume();
            }
        }
    )
);
/** Static class ID counter (needed for caching) */
x3dom.nodeTypes.Shape.shaderPartID = 0;

/** Static class ID counter (needed for picking) */
x3dom.nodeTypes.Shape.objectID = 0;

/** Map for Shape node IDs (needed for picking) */
x3dom.nodeTypes.Shape.idMap = {
    nodeID: {},
    remove: function(obj) {
        for (var prop in this.nodeID) {
            if (this.nodeID.hasOwnProperty(prop)) {
                var val = this.nodeID[prop];
                if (val._objectID  && obj._objectID &&
                    val._objectID === obj._objectID)
                {
                    delete this.nodeID[prop];
                    x3dom.debug.logInfo("Unreg " + val._objectID);
                    // FIXME; handle node removal to unreg from map,
                    // and put free'd ID back to ID pool for reuse
                }
            }
        }
    }
};

/** @namespace x3dom.nodeTypes */
/**
 * Created by Sven Kluge on 27.06.2016.
 */
x3dom.registerNodeType(
    "ExternalShape",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DShapeNode,

        /**
         * Constructor for ExternalShape
         * @constructs x3dom.nodeTypes.ExternalShape
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DShapeNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc
         */
        function (ctx) {
            x3dom.nodeTypes.ExternalShape.superClass.call(this, ctx);

            // custom, only WIREFRAME for gltf recognized, into X3DShapeNode

            this.addField_SFString(ctx, 'shading', 'PHONG'); //'WIREFFRME',..

            /**
             * Defines the url to the openGL Transfer Format (glTF) file.
             * A suffix with a leading # can be used to reference single meshes inside a SRC: "path/to/data.src#mesh0".
             * Multiple urls specify alternatives (if downloading fails).
             *
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.ExternalGeometry
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'url', []);

            this._currentURLIdx = 0;
            this._cf.geometry.node = new x3dom.nodeTypes.X3DSpatialGeometryNode(ctx);
            this.loaded = false;
        },
        {
            update: function(shape, shaderProgram, gl, viewarea, context) {
                var that = this;

                if (this._vf['url'].length == 0 ||
                    this._currentURLIdx >= this._vf['url'].length)
                {
                    return;
                }

                var xhr = new XMLHttpRequest();

                xhr.open("GET", this._nameSpace.getURL(this._vf['url'][this._currentURLIdx]), true);

                xhr.responseType = "arraybuffer";

                xhr.send(null);

                xhr.onerror = function() {
                    x3dom.debug.logError("Unable to load SRC data from URL \"" + that._vf['url'][that._currentURLIdx] + "\"");
                };

                xhr.onload = function() {

                    if ((xhr.status == 200 || xhr.status == 0)) {
                        var glTF = new x3dom.glTF.glTFLoader(xhr.response);

                        if (glTF.header.sceneLength > 0)
                        {
                            glTF.loaded = {};
                            glTF.loaded.meshes = {};
                            glTF.loaded.meshCount = 0;

                            that.glTF = glTF;

                            var url = that._vf['url'][that._currentURLIdx];
                            if(url.includes('#'))
                            {
                                var split = url.split('#');
                                var meshName = split[split.length-1];
                                glTF.getMesh(shape, shaderProgram, gl, meshName);
                            }
                            else
                            {
                                glTF.getScene(shape, shaderProgram, gl);
                            }

                            for(var key in glTF._mesh){
                                if(!glTF._mesh.hasOwnProperty(key))continue;
                                that._cf.geometry.node._mesh[key] = glTF._mesh[key];
                            }

                        }
                        else
                        {
                            if ((that._currentURLIdx + 1) < that._vf['url'].length)
                            {
                                x3dom.debug.logWarning("Invalid SRC data, loaded from URL \"" +
                                    that._vf['url'][that._currentURLIdx] +
                                    "\", trying next specified URL");

                                //try next URL
                                ++that._currentURLIdx;
                                that.update(shape, shaderProgram, gl, viewarea, context);
                            }
                            else
                            {
                                x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                                    that._vf['url'][that._currentURLIdx] + "\"," +
                                    " no other URLs left to try.");
                            }
                        }
                    }
                    else
                    {
                        if ((that._currentURLIdx + 1) < that._vf['url'].length)
                        {
                            x3dom.debug.logWarning("Invalid SRC data, loaded from URL \"" +
                                that._vf['url'][that._currentURLIdx] +
                                "\", trying next specified URL");

                            //try next URL
                            ++that._currentURLIdx;
                            that.update(shape, shaderProgram, gl, viewarea, context);
                        }
                        else
                        {
                            x3dom.debug.logError("Invalid SRC data, loaded from URL \"" +
                                that._vf['url'][that._currentURLIdx] + "\"," +
                                " no other URLs left to try.");
                        }
                    }
                };
            },


            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                // attention, in contrast to other collectDrawableObjects()
                // this one has boolean return type to better work with RSG
                var graphState = this.graphState();

                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                if (singlePath && !this._graph.globalMatrix)
                    this._graph.globalMatrix = transform;

                if (this._clipPlanes.length != clipPlanes.length)
                {
                    this._dirty.shader = true;
                }

                this._clipPlanes = clipPlanes;

                drawableCollection.addShape(this, transform, graphState);
                return true;
            },

            getShaderProperties: function(viewarea)
            {

                var properties = x3dom.Utils.generateProperties(viewarea, this);
                properties.CSHADER = -1;

                properties.LIGHTS = viewarea.getLights().length + (viewarea._scene.getNavigationInfo()._vf.headlight);

                properties.EMPTY_SHADER = 1;

                return properties;
            },

            nodeChanged: function ()
            {
                if (!this._objectID) {
                    this._objectID = ++x3dom.nodeTypes.Shape.objectID;
                    x3dom.nodeTypes.Shape.idMap.nodeID[this._objectID] = this;
                }
            }
        }
    )
);

//glTFLoader.js

x3dom.glTF.glTFLoader.prototype.updateMesh = function(shape, shaderProgram, gl, mesh, worldTransform)
{
    var primitives = mesh["primitives"];
    for(var i = 0; i<primitives.length; ++i){
        var primitive = primitives[i];
        this.loadglTFMesh(shape, shaderProgram, gl, primitive, worldTransform, false);
        if (primitive["mode"] == gl.TRIANGLES) { // also load as wireframe
            this.loadglTFMesh(shape, shaderProgram, gl, primitive, worldTransform, true);
        }
    }
};

x3dom.glTF.glTFLoader.prototype.loadglTFMesh =  function(shape, shaderProgram, gl, primitive, worldTransform, asWireframe)
{
    "use strict";

    asWireframe = asWireframe || false; // default

    var mesh = new x3dom.glTF.glTFMesh();

    mesh.primitiveType = primitive["mode"];

    var indexed = (primitive.indices != null && primitive.indices != "");

    if(indexed == true){
        var indicesAccessor = this.scene.accessors[primitive.indices];

        mesh.buffers[glTF_BUFFER_IDX.INDEX] = {};
        mesh.buffers[glTF_BUFFER_IDX.INDEX].offset = indicesAccessor["byteOffset"];
        mesh.buffers[glTF_BUFFER_IDX.INDEX].type =  indicesAccessor["componentType"];
        //check shape if lines
        if (asWireframe) {
            mesh.buffers[glTF_BUFFER_IDX.INDEX].idx = this.loaded.bufferViews[indicesAccessor["bufferView"]+"_line"];
            mesh.buffers[glTF_BUFFER_IDX.INDEX].wireframe = true;
        }
        else {
            mesh.buffers[glTF_BUFFER_IDX.INDEX].idx = this.loaded.bufferViews[indicesAccessor["bufferView"]];
            mesh.buffers[glTF_BUFFER_IDX.INDEX].wireframe = false;
        }

        mesh.drawCount = indicesAccessor["count"];
        this._mesh._numFaces += indicesAccessor["count"] / 3;
    }

    var attributes = primitive["attributes"];

    for (var attributeID in attributes)
    {
        var accessorName = attributes[attributeID];
        var accessor = this.scene.accessors[accessorName];

        var idx = null;

        //the current renderer does not support generic vertex attributes, so simply look for useable cases
        switch (attributeID)
        {
            case "POSITION":
                idx = glTF_BUFFER_IDX.POSITION;

                //for non-indexed rendering, we assume that all attributes have the same count
                if (indexed == false)
                {
                    mesh.drawCount = accessor["count"];
                    this._mesh._numFaces += accessor["count"] / 3;
                }
                this._mesh.numCoords += accessor["count"];
                break;

            case "NORMAL":
                idx = glTF_BUFFER_IDX.NORMAL;
                break;

            case "TEXCOORD_0":
                idx = glTF_BUFFER_IDX.TEXCOORD;
                break;

            case "COLOR":
                idx = glTF_BUFFER_IDX.COLOR;
                break;
        }

        if(idx != null){
            mesh.buffers[idx] = {};
            mesh.buffers[idx].idx = this.loaded.bufferViews[accessor["bufferView"]];
            mesh.buffers[idx].offset = accessor["byteOffset"];
            mesh.buffers[idx].stride = accessor["byteStride"];

            mesh.buffers[idx].type = accessor["componentType"];
            mesh.buffers[idx].numComponents = this.getNumComponentsForType(accessor["type"]);
        }
    }

    this.loaded.meshCount += 1;

    shape._dirty.shader = true;
    shape._nameSpace.doc.needRender = true;
    x3dom.BinaryContainerLoader.checkError(gl);
    if(primitive.material != null && !this.meshOnly) {
		if (asWireframe) {
			//mesh.material = new x3dom.glTF.glTFKHRMaterialCommons();
			mesh.material = this.loadMaterial(gl, mesh.material);// default KHRMaterial
		}
		else { 
			mesh.material = this.loadMaterial(gl, this.scene.materials[primitive.material]);	
		}
		mesh.material.worldTransform = worldTransform;    
    }

    if(shape.meshes == null)
        shape.meshes = [];

    mesh.shape = shape; // attach shape for access later
    shape.meshes.push(mesh);
};

x3dom.glTF.glTFLoader.prototype.loadBufferViews = function(shape, gl)
{
    var buffers = {};

    var bufferViews = this.scene.bufferViews;
    for(var bufferId in bufferViews)
    {
        if(!bufferViews.hasOwnProperty(bufferId)) continue;

        var bufferView = bufferViews[bufferId];

        // do not use Buffer for Skin or animation data
        if(bufferView.target == null && bufferView.target != gl.ARRAY_BUFFER && bufferView.target != gl.ELEMENT_ARRAY_BUFFER)
            continue;

        shape._webgl.externalGeometry = 1;

        var data = new Uint8Array(this.body.buffer,
            this.header.bodyOffset + bufferView["byteOffset"],
            bufferView["byteLength"]);

        var newBuffer = gl.createBuffer();
        gl.bindBuffer(bufferView["target"], newBuffer);
        //upload all chunk data to GPU
        gl.bufferData(bufferView["target"], data, gl.STATIC_DRAW);
        buffers[bufferId] = newBuffer; 

        //check if index buffer
        //by going through all meshes
        var isIndex;
        for (var mesh in this.scene.meshes) {
            isIndex = this.scene.meshes[mesh].primitives.some(function(primitive){
                var indexed = (primitive.indices != null && primitive.indices != "");
                if (!indexed) {return false;}
                var indicesAccessor = this.scene.accessors[primitive.indices];
                return indicesAccessor.bufferView == bufferId;
            }, this);
            if (isIndex) break;
        };
        if (isIndex) {
            //console.log("is indexed:", bufferId, bufferView["byteOffset"]);
            var newBuffer = gl.createBuffer();
            gl.bindBuffer(bufferView["target"], newBuffer);

            var data2 = new Uint8Array(2 * bufferView["byteLength"]);
            //var data16 = new Uint16Array(data.buffer);
            data2.fill(0);
            for (var i=0, j=0; i < data.length; i += 6) {
                j = 2 * i;
                
                data2 [j] = data2 [j+10] = data [i];
                data2 [j+1] = data2 [j+11] = data [i+1];
                data2 [j+2] = data2 [j+4] = data [i+2];
                data2 [j+3] = data2 [j+5] = data [i+3];
                data2 [j+6] = data2 [j+8] = data [i+4];
                data2 [j+7] = data2 [j+9] = data [i+5];
            };
            data = data2;
            bufferId = bufferId + "_line";//_" + bufferView["byteOffset"];
            //console.log(data,bufferId);
            var newBuffer = gl.createBuffer();
            gl.bindBuffer(bufferView["target"], newBuffer);
            gl.bufferData(bufferView["target"], data, gl.STATIC_DRAW);
            buffers[bufferId] = newBuffer; 
        }; 
    }
    return buffers;
};



//glTFContainer.js

x3dom.glTF.glTFMesh.prototype.render = function(gl, polyMode)
{
    if(this.material != null && !this.material.created())
        return;

    if(polyMode == null || polyMode > this.primitiveType)
        polyMode = this.primitiveType;

    //console.log("render polymode:", polyMode);
    var shading = this.shape._vf.shading;
    var indexBuffer = this.buffers[glTF_BUFFER_IDX.INDEX];
    if(indexBuffer) {
        if (shading == "WIREFRAME" || polyMode == gl.LINES) {
                if (indexBuffer.wireframe) {
                    gl.drawElements(gl.LINES, this.drawCount * 2, indexBuffer.type, indexBuffer.offset * 2);
                }
        return;
        }
        if (!indexBuffer.wireframe) {
            gl.drawElements(polyMode, this.drawCount, indexBuffer.type, indexBuffer.offset);
        }
        //really inefficient and assumes 2 bytes per index
        //for(var i=0; i<this.drawCount; i=i+3){
        //    gl.drawElements(gl.LINE_LOOP, 3, this.buffers[glTF_BUFFER_IDX.INDEX].type, this.buffers[glTF_BUFFER_IDX.INDEX].offset + i*2);
        //}
        //create second mesh in loader instead with new indices: i1, i2, i2, i3, i3, i1, i4, i5 ..
        //and perhaps new material: black
    }
    else
        gl.drawArrays(polyMode, 0, this.drawCount);

};