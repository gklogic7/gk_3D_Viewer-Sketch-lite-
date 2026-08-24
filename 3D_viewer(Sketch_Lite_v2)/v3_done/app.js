// app.js

import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";

import {
  FBXLoader
} from "three/addons/loaders/FBXLoader.js";

import {
  OBJLoader
} from "three/addons/loaders/OBJLoader.js";

import {
  STLLoader
} from "three/addons/loaders/STLLoader.js";

import {
  PLYLoader
} from "three/addons/loaders/PLYLoader.js";

import {
  ColladaLoader
} from "three/addons/loaders/ColladaLoader.js";

import {
  ThreeMFLoader
} from "three/addons/loaders/3MFLoader.js";


// =====================================================
// DOM
// =====================================================

const container =
  document.getElementById("viewer");

const fileInput =
  document.getElementById("fileInput");

const dropText =
  document.getElementById("dropText");

const inspector =
  document.getElementById("inspector");

const textureMaps =
  document.getElementById("textureMaps");

const modelInfo =
  document.getElementById("modelInfo");

const materialInfo =
  document.getElementById("materialInfo");

const animationInfo =
  document.getElementById("animationInfo");

const animationSelect =
  document.getElementById("animationSelect");


// =====================================================
// THREE VARIABLES
// =====================================================

let scene;
let camera;
let renderer;
let controls;

let currentModel = null;

let currentAnimations = [];

let mixer = null;

let activeAction = null;

let animationClock =
  new THREE.Clock();

let gridHelper = null;

let keyLight = null;

let fillLight = null;

let rimLight = null;

let wireframeMode = false;

let darkMode = false;

let lightAngle = 45;

let rotatingLight = false;

let lastMouseX = 0;


// =====================================================
// KEYBOARD
// =====================================================

const defaultKeys = {

  reset: "r",
  wire: "w",
  grid: "g",
  inspector: "i",
  light: "l",
  help: "h"

};

let keys = {
  ...defaultKeys
};

const savedKeys =
  localStorage.getItem(
    "viewerShortcuts"
  );

if (savedKeys) {

  try {

    keys =
      JSON.parse(savedKeys);

  } catch {

    keys = {
      ...defaultKeys
    };

  }

}


// =====================================================
// INIT
// =====================================================

init();

animate();


// =====================================================
// INIT
// =====================================================

function init() {

  scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(
      0x202124
    );


  camera =
    new THREE.PerspectiveCamera(
      45,
      window.innerWidth /
      window.innerHeight,
      0.01,
      1000
    );

  camera.position.set(
    3,
    2,
    5
  );


  renderer =
    new THREE.WebGLRenderer({

      antialias: true

    });

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.shadowMap.enabled =
    true;

  container.appendChild(
    renderer.domElement
  );


  controls =
    new OrbitControls(
      camera,
      renderer.domElement
    );

  controls.enableDamping =
    true;

  controls.dampingFactor =
    0.08;

  controls.enablePan =
    true;

  controls.enableZoom =
    true;

  controls.minDistance =
    0.05;

  controls.maxDistance =
    100;


  createLights();


  gridHelper =
    new THREE.GridHelper(
      10,
      20,
      0x555555,
      0x333333
    );

  scene.add(
    gridHelper
  );


  setupEvents();

}


// =====================================================
// LIGHTS
// =====================================================

function createLights() {

  const ambient =
    new THREE.HemisphereLight(
      0xffffff,
      0x444444,
      2
    );

  scene.add(
    ambient
  );


  keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  keyLight.position.set(
    5,
    8,
    5
  );

  keyLight.castShadow =
    true;

  scene.add(
    keyLight
  );


  fillLight =
    new THREE.DirectionalLight(
      0xffffff,
      1.5
    );

  fillLight.position.set(
    -5,
    3,
    -5
  );

  scene.add(
    fillLight
  );


  rimLight =
    new THREE.DirectionalLight(
      0xffffff,
      1
    );

  rimLight.position.set(
    0,
    5,
    -6
  );

  scene.add(
    rimLight
  );

}


// =====================================================
// EVENTS
// =====================================================

function setupEvents() {

  window.addEventListener(
    "resize",
    onResize
  );


  fileInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (file) {

        loadModel(file);

      }

    }
  );


  document
    .getElementById("resetBtn")
    .onclick =
    resetCamera;


  document
    .getElementById("wireBtn")
    .onclick =
    toggleWireframe;


  document
    .getElementById("gridBtn")
    .onclick =
    toggleGrid;


  document
    .getElementById("lightBtn")
    .onclick =
    toggleLight;


  document
    .getElementById("inspectorBtn")
    .onclick =
    toggleInspector;


  document
    .getElementById("closeInspector")
    .onclick =
    toggleInspector;


  document
    .getElementById("helpBtn")
    .onclick =
    openHelp;


  document
    .getElementById("closeHelp")
    .onclick =
    closeHelp;


  document
    .getElementById("openKeys")
    .onclick =
    openKeys;


  document
    .getElementById("closeKeys")
    .onclick =
    closeKeys;


  document
    .getElementById("resetKeys")
    .onclick =
    resetKeys;


  document
    .getElementById("playAnimation")
    .onclick =
    playAnimation;


  document
    .getElementById("pauseAnimation")
    .onclick =
    pauseAnimation;


  document
    .getElementById("stopAnimation")
    .onclick =
    stopAnimation;


  animationSelect.addEventListener(
    "change",
    changeAnimation
  );


  document
    .getElementById("animationSpeed")
    .addEventListener(
      "input",
      changeAnimationSpeed
    );


  renderer.domElement.addEventListener(
    "mousedown",
    onMouseDown
  );


  renderer.domElement.addEventListener(
    "mousemove",
    onMouseMove
  );


  renderer.domElement.addEventListener(
    "mouseup",
    onMouseUp
  );


  renderer.domElement.addEventListener(
    "mouseleave",
    onMouseUp
  );


  window.addEventListener(
    "dragover",
    event => {

      event.preventDefault();

    }
  );


  window.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      const file =
        event.dataTransfer.files[0];

      if (file) {

        loadModel(file);

      }

    }
  );


  window.addEventListener(
    "keydown",
    onKeyboard
  );


  document
    .querySelectorAll(
      ".keyRow button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () =>
          startKeyRemap(button)
      );

    });

}


// =====================================================
// LOAD MODEL
// =====================================================

function loadModel(file) {

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  dropText.style.display =
    "none";


  clearCurrentModel();


  switch (extension) {

    // --------------------------------
    // GLB / GLTF
    // --------------------------------

    case "glb":
    case "gltf":

      loadGLTF(file);

      break;


    // --------------------------------
    // FBX
    // --------------------------------

    case "fbx":

      loadFBX(file);

      break;


    // --------------------------------
    // OBJ
    // --------------------------------

    case "obj":

      loadOBJ(file);

      break;


    // --------------------------------
    // STL
    // --------------------------------

    case "stl":

      loadSTL(file);

      break;


    // --------------------------------
    // PLY
    // --------------------------------

    case "ply":

      loadPLY(file);

      break;


    // --------------------------------
    // DAE
    // --------------------------------

    case "dae":

      loadDAE(file);

      break;


    // --------------------------------
    // 3MF
    // --------------------------------

    case "3mf":

      load3MF(file);

      break;


    default:

      showError(
        "Unsupported 3D format."
      );

  }

}


// =====================================================
// GLTF / GLB
//
// GLB is the best format for:
// ✔ Materials
// ✔ Textures
// ✔ PBR
// ✔ Animations
// ✔ Cameras
// ✔ Skeletons
// =====================================================

function loadGLTF(file) {

  const loader =
    new GLTFLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    gltf => {

      currentModel =
        gltf.scene;

      currentAnimations =
        gltf.animations || [];


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        currentAnimations
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    progress => {

      showLoading(
        progress
      );

    },

    error => {

      console.error(error);

      showError(
        "Could not load GLB / GLTF."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// FBX
// =====================================================

function loadFBX(file) {

  const loader =
    new FBXLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    object => {

      currentModel =
        object;


      currentAnimations =
        object.animations || [];


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        currentAnimations
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    showLoading,

    error => {

      console.error(error);

      showError(
        "Could not load FBX."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// OBJ
// =====================================================

function loadOBJ(file) {

  const loader =
    new OBJLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    object => {

      currentModel =
        object;

      currentAnimations =
        [];


      applyDefaultMaterial(
        currentModel
      );


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        []
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    showLoading,

    error => {

      console.error(error);

      showError(
        "Could not load OBJ."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// STL
// =====================================================

function loadSTL(file) {

  const loader =
    new STLLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    geometry => {

      const material =
        new THREE.MeshStandardMaterial({

          color: 0xb8b8b8,

          roughness: .65,

          metalness: .05

        });


      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );


      currentModel =
        new THREE.Group();


      currentModel.add(
        mesh
      );


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        []
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    showLoading,

    error => {

      console.error(error);

      showError(
        "Could not load STL."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// PLY
// =====================================================

function loadPLY(file) {

  const loader =
    new PLYLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    geometry => {

      geometry.computeVertexNormals();


      const material =
        new THREE.MeshStandardMaterial({

          color: 0xb8b8b8,

          roughness: .7,

          metalness: .05

        });


      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );


      currentModel =
        new THREE.Group();


      currentModel.add(
        mesh
      );


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        []
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    showLoading,

    error => {

      console.error(error);

      showError(
        "Could not load PLY."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// COLLADA DAE
// =====================================================

function loadDAE(file) {

  const loader =
    new ColladaLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    result => {

      currentModel =
        result.scene;


      currentAnimations =
        result.animations || [];


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        currentAnimations
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    showLoading,

    error => {

      console.error(error);

      showError(
        "Could not load DAE."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// 3MF
// =====================================================

function load3MF(file) {

  const loader =
    new ThreeMFLoader();

  const url =
    URL.createObjectURL(file);


  loader.load(

    url,

    object => {

      currentModel =
        object;

      currentAnimations =
        [];


      scene.add(
        currentModel
      );


      prepareModel(
        currentModel
      );


      centerModel(
        currentModel
      );


      fitCamera(
        currentModel
      );


      setupAnimations(
        currentModel,
        []
      );


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    showLoading,

    error => {

      console.error(error);

      showError(
        "Could not load 3MF."
      );

      URL.revokeObjectURL(
        url
      );

    }

  );

}


// =====================================================
// DEFAULT MATERIAL
// =====================================================

function applyDefaultMaterial(
  object
) {

  object.traverse(
    child => {

      if (
        child.isMesh &&
        !child.material
      ) {

        child.material =
          new THREE.MeshStandardMaterial({

            color: 0xb8b8b8,

            roughness: .7

          });

      }

    }
  );

}


// =====================================================
// ANIMATION SYSTEM
// =====================================================

function setupAnimations(
  model,
  animations
) {

  stopAnimation();


  currentAnimations =
    animations || [];


  animationSelect.innerHTML =
    "";


  if (
    !currentAnimations.length
  ) {

    animationInfo.textContent =
      "No animations";

    animationSelect.style.display =
      "none";

    return;

  }


  animationSelect.style.display =
    "block";


  animationInfo.innerHTML =

    `${currentAnimations.length}
     animation(s) found`;


  currentAnimations.forEach(
    (clip, index) => {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        index;


      option.textContent =
        `${index + 1}. ${
          clip.name ||
          "Animation " +
          (index + 1)
        }`;


      animationSelect.appendChild(
        option
      );

    }
  );


  mixer =
    new THREE.AnimationMixer(
      model
    );


  animationSelect.value =
    "0";


  playAnimation();

}


// =====================================================
// PLAY
// =====================================================

function playAnimation() {

  if (
    !mixer ||
    !currentAnimations.length
  )
    return;


  const index =
    Number(
      animationSelect.value
    );


  const clip =
    currentAnimations[index];


  if (
    !clip
  )
    return;


  if (
    activeAction
  ) {

    activeAction.stop();

  }


  activeAction =
    mixer.clipAction(
      clip
    );


  activeAction.reset();

  activeAction.setLoop(
    THREE.LoopRepeat,
    Infinity
  );

  activeAction.play();

}


// =====================================================
// PAUSE
// =====================================================

function pauseAnimation() {

  if (
    activeAction
  ) {

    activeAction.paused =
      !activeAction.paused;

  }

}


// =====================================================
// STOP
// =====================================================

function stopAnimation() {

  if (
    activeAction
  ) {

    activeAction.stop();

    activeAction =
      null;

  }


  if (
    mixer
  ) {

    mixer.stopAllAction();

  }

}


// =====================================================
// CHANGE ANIMATION
// =====================================================

function changeAnimation() {

  playAnimation();

}


// =====================================================
// SPEED
// =====================================================

function changeAnimationSpeed(
  event
) {

  const speed =
    Number(
      event.target.value
    );


  document
    .getElementById(
      "speedValue"
    )
    .textContent =
    speed.toFixed(1) + "x";


  if (
    mixer
  ) {

    mixer.timeScale =
      speed;

  }

}


// =====================================================
// PREPARE MODEL
// =====================================================

function prepareModel(
  model
) {

  model.traverse(
    object => {

      if (
        object.isMesh
      ) {

        object.castShadow =
          true;

        object.receiveShadow =
          true;

        object.frustumCulled =
          true;

        object.userData.viewerMesh =
          true;


        if (
          object.material
        ) {

          const materials =
            Array.isArray(
              object.material
            )
              ? object.material
              : [object.material];


          materials.forEach(
            material => {

              material.side =
                THREE.FrontSide;

            }
          );

        }

      }

    }
  );

}


// =====================================================
// CENTER MODEL
// =====================================================

function centerModel(
  model
) {

  const box =
    new THREE.Box3()
      .setFromObject(model);


  const center =
    box.getCenter(
      new THREE.Vector3()
    );


  model.position.sub(
    center
  );

}


// =====================================================
// FIT CAMERA
// =====================================================

function fitCamera(
  model
) {

  const box =
    new THREE.Box3()
      .setFromObject(model);


  const size =
    box.getSize(
      new THREE.Vector3()
    );


  const center =
    box.getCenter(
      new THREE.Vector3()
    );


  const maxSize =
    Math.max(
      size.x,
      size.y,
      size.z
    );


  const distance =
    Math.max(
      maxSize * 2.5,
      2
    );


  camera.position.set(

    center.x + distance,

    center.y +
    distance * .55,

    center.z + distance

  );


  camera.near =
    Math.max(
      maxSize / 1000,
      .001
    );


  camera.far =
    Math.max(
      maxSize * 1000,
      1000
    );


  camera.updateProjectionMatrix();


  controls.target.copy(
    center
  );


  controls.update();

}


// =====================================================
// CLEAR OLD MODEL
// =====================================================

function clearCurrentModel() {

  stopAnimation();


  if (
    currentModel
  ) {

    scene.remove(
      currentModel
    );


    disposeObject(
      currentModel
    );


    currentModel =
      null;

  }


  currentAnimations =
    [];


  animationSelect.innerHTML =
    "";


  animationSelect.style.display =
    "none";


  animationInfo.textContent =
    "No animations";


  mixer =
    null;

}


// =====================================================
// WIREFRAME
// =====================================================

function toggleWireframe() {

  wireframeMode =
    !wireframeMode;


  if (
    !currentModel
  )
    return;


  currentModel.traverse(
    object => {

      if (
        object.isMesh &&
        object.material
      ) {

        const materials =
          Array.isArray(
            object.material
          )
            ? object.material
            : [object.material];


        materials.forEach(
          material => {

            material.wireframe =
              wireframeMode;

          }
        );

      }

    }
  );

}


// =====================================================
// GRID
// =====================================================

function toggleGrid() {

  gridHelper.visible =
    !gridHelper.visible;

}


// =====================================================
// LIGHT MODE
// =====================================================

function toggleLight() {

  darkMode =
    !darkMode;


  scene.background =
    new THREE.Color(

      darkMode
        ? 0x080808
        : 0x202124

    );

}


// =====================================================
// LIGHT ROTATION
// Shift + Left Mouse
// =====================================================

function onMouseDown(
  event
) {

  if (
    event.button === 0 &&
    event.shiftKey
  ) {

    rotatingLight =
      true;

    lastMouseX =
      event.clientX;

    controls.enabled =
      false;

    renderer.domElement.style.cursor =
      "ew-resize";

  }

}


function onMouseMove(
  event
) {

  if (
    !rotatingLight
  )
    return;


  const delta =
    event.clientX -
    lastMouseX;


  lastMouseX =
    event.clientX;


  lightAngle +=
    delta * .5;


  rotateStudioLight();

}


function onMouseUp() {

  if (
    !rotatingLight
  )
    return;


  rotatingLight =
    false;


  controls.enabled =
    true;


  renderer.domElement.style.cursor =
    "default";

}


function rotateStudioLight() {

  const radians =
    THREE.MathUtils.degToRad(
      lightAngle
    );


  const radius =
    6;


  keyLight.position.set(

    Math.cos(radians) *
    radius,

    7,

    Math.sin(radians) *
    radius

  );


  keyLight.lookAt(
    0,
    0,
    0
  );


  fillLight.position.set(

    Math.cos(
      radians + Math.PI
    ) * 5,

    3,

    Math.sin(
      radians + Math.PI
    ) * 5

  );


  fillLight.lookAt(
    0,
    0,
    0
  );

}


// =====================================================
// INSPECTOR
// =====================================================

function toggleInspector() {

  inspector.classList.toggle(
    "open"
  );

}


function updateInspector() {

  if (
    !currentModel
  ) {

    modelInfo.textContent =
      "No model loaded";

    return;

  }


  let meshes = 0;

  let vertices = 0;

  let triangles = 0;

  const materialSet =
    new Set();


  currentModel.traverse(
    object => {

      if (
        object.isMesh
      ) {

        meshes++;


        if (
          object.geometry
        ) {

          const position =
            object.geometry
              .attributes
              ?.position;


          if (
            position
          ) {

            vertices +=
              position.count;

          }


          if (
            object.geometry.index
          ) {

            triangles +=
              object.geometry.index.count /
              3;

          } else if (
            position
          ) {

            triangles +=
              position.count /
              3;

          }

        }


        if (
          object.material
        ) {

          const materials =
            Array.isArray(
              object.material
            )
              ? object.material
              : [object.material];


          materials.forEach(
            material =>
              materialSet.add(
                material
              )
          );

        }

      }

    }
  );


  modelInfo.innerHTML = `

    <div>
      Type: 3D Model
    </div>

    <div>
      Meshes: ${meshes}
    </div>

    <div>
      Vertices:
      ${vertices.toLocaleString()}
    </div>

    <div>
      Triangles:
      ${Math.floor(
        triangles
      ).toLocaleString()}
    </div>

    <div>
      Materials:
      ${materialSet.size}
    </div>

    <div>
      Animations:
      ${currentAnimations.length}
    </div>

  `;


  updateTextureMaps(
    materialSet
  );


  updateMaterialInfo(
    materialSet
  );

}


// =====================================================
// TEXTURE MAPS
// =====================================================

function updateTextureMaps(
  materialSet
) {

  textureMaps.innerHTML =
    "";


  const textures =
    new Map();


  materialSet.forEach(
    material => {

      addTexture(
        textures,
        "Albedo / Base Color",
        material.map
      );

      addTexture(
        textures,
        "Normal",
        material.normalMap
      );

      addTexture(
        textures,
        "Roughness",
        material.roughnessMap
      );

      addTexture(
        textures,
        "Metalness",
        material.metalnessMap
      );

      addTexture(
        textures,
        "AO",
        material.aoMap
      );

      addTexture(
        textures,
        "Emissive",
        material.emissiveMap
      );

      addTexture(
        textures,
        "Displacement",
        material.displacementMap
      );

      addTexture(
        textures,
        "Alpha",
        material.alphaMap
      );

    }
  );


  if (
    textures.size === 0
  ) {

    textureMaps.innerHTML =
      `<div class="empty">
        No texture maps found
      </div>`;

    return;

  }


  textures.forEach(
    (texture, name) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "textureItem";


      const title =
        document.createElement(
          "div"
        );

      title.className =
        "textureTitle";

      title.textContent =
        name;


      const preview =
        document.createElement(
          "div"
        );

      preview.className =
        "texturePreview";


      const image =
        document.createElement(
          "img"
        );


      try {

        if (
          texture.image
        ) {

          image.src =
            texture.image.currentSrc ||
            texture.image.src ||
            "";

        }

      } catch {

        image.alt =
          "Texture";

      }


      preview.appendChild(
        image
      );


      item.appendChild(
        title
      );

      item.appendChild(
        preview
      );


      textureMaps.appendChild(
        item
      );

    }
  );

}


function addTexture(
  map,
  name,
  texture
) {

  if (
    texture &&
    !map.has(name)
  ) {

    map.set(
      name,
      texture
    );

  }

}


// =====================================================
// MATERIAL INFO
// =====================================================

function updateMaterialInfo(
  materialSet
) {

  if (
    materialSet.size === 0
  ) {

    materialInfo.textContent =
      "No material";

    return;

  }


  materialInfo.innerHTML =
    "";


  let index = 1;


  materialSet.forEach(
    material => {

      const div =
        document.createElement(
          "div"
        );


      div.style.marginBottom =
        "14px";


      div.innerHTML = `

        <strong>
          ${index}.
          ${material.name ||
            "Material"}
        </strong>

        <br>

        Type:
        ${material.type}

        <br>

        Color:
        ${
          material.color
            ? "#" +
              material.color
                .getHexString()
            : "N/A"
        }

        <br>

        Roughness:
        ${material.roughness ??
          "N/A"}

        <br>

        Metalness:
        ${material.metalness ??
          "N/A"}

      `;


      materialInfo.appendChild(
        div
      );


      index++;

    }
  );

}


// =====================================================
// HELP
// =====================================================

function openHelp() {

  document
    .getElementById(
      "helpPanel"
    )
    .classList.add(
      "open"
    );

}


function closeHelp() {

  document
    .getElementById(
      "helpPanel"
    )
    .classList.remove(
      "open"
    );

}


// =====================================================
// KEYBOARD REMAPPING
// =====================================================

function openKeys() {

  closeHelp();


  document
    .getElementById(
      "keyPanel"
    )
    .classList.add(
      "open"
    );


  refreshKeyButtons();

}


function closeKeys() {

  document
    .getElementById(
      "keyPanel"
    )
    .classList.remove(
      "open"
    );

}


let remappingAction =
  null;


function startKeyRemap(
  button
) {

  remappingAction =
    button.dataset.action;


  button.classList.add(
    "listening"
  );


  button.textContent =
    "PRESS KEY";


  const listener =
    event => {

      event.preventDefault();


      const key =
        event.key.toLowerCase();


      if (
        [
          "shift",
          "control",
          "alt",
          "meta"
        ].includes(key)
      ) {

        return;

      }


      keys[
        remappingAction
      ] =
        key;


      localStorage.setItem(
        "viewerShortcuts",
        JSON.stringify(keys)
      );


      button.classList.remove(
        "listening"
      );


      remappingAction =
        null;


      refreshKeyButtons();


      window.removeEventListener(
        "keydown",
        listener,
        true
      );

    };


  window.addEventListener(
    "keydown",
    listener,
    true
  );

}


function refreshKeyButtons() {

  document
    .querySelectorAll(
      ".keyRow button"
    )
    .forEach(button => {

      const action =
        button.dataset.action;


      button.textContent =
        keys[action]
          .toUpperCase();

    });

}


function resetKeys() {

  keys = {
    ...defaultKeys
  };


  localStorage.setItem(
    "viewerShortcuts",
    JSON.stringify(keys)
  );


  refreshKeyButtons();

}


// =====================================================
// KEYBOARD
// =====================================================

function onKeyboard(
  event
) {

  if (
    event.target.tagName ===
    "INPUT" ||
    event.target.tagName ===
    "SELECT"
  )
    return;


  const key =
    event.key.toLowerCase();


  if (
    key === keys.reset
  ) {

    resetCamera();

  }

  else if (
    key === keys.wire
  ) {

    toggleWireframe();

  }

  else if (
    key === keys.grid
  ) {

    toggleGrid();

  }

  else if (
    key === keys.inspector
  ) {

    toggleInspector();

  }

  else if (
    key === keys.light
  ) {

    toggleLight();

  }

  else if (
    key === keys.help
  ) {

    openHelp();

  }

}


// =====================================================
// RESET CAMERA
// =====================================================

function resetCamera() {

  if (
    currentModel
  ) {

    fitCamera(
      currentModel
    );

  } else {

    camera.position.set(
      3,
      2,
      5
    );

    controls.target.set(
      0,
      0,
      0
    );

    controls.update();

  }

}


// =====================================================
// LOADING UI
// =====================================================

function showLoading(
  progress
) {

  if (
    progress &&
    progress.total
  ) {

    const percent =
      Math.round(
        progress.loaded /
        progress.total *
        100
      );


    dropText.style.display =
      "block";


    dropText.innerHTML =
      `Loading ${percent}%`;

  }

}


function showError(
  message
) {

  dropText.style.display =
    "block";


  dropText.innerHTML =
    `${message}
     <small>
       Supported:
       GLB GLTF FBX OBJ STL PLY DAE 3MF
     </small>`;

}


// =====================================================
// DISPOSE
// =====================================================

function disposeObject(
  object
) {

  object.traverse(
    child => {

      if (
        child.geometry
      ) {

        child.geometry.dispose();

      }


      if (
        child.material
      ) {

        const materials =
          Array.isArray(
            child.material
          )
            ? child.material
            : [child.material];


        materials.forEach(
          disposeMaterial
        );

      }

    }
  );

}


function disposeMaterial(
  material
) {

  for (
    const key in material
  ) {

    const value =
      material[key];


    if (
      value &&
      value.isTexture
    ) {

      value.dispose();

    }

  }


  material.dispose();

}


// =====================================================
// RESIZE
// =====================================================

function onResize() {

  camera.aspect =
    window.innerWidth /
    window.innerHeight;


  camera.updateProjectionMatrix();


  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

}


// =====================================================
// RENDER LOOP
// =====================================================

function animate() {

  requestAnimationFrame(
    animate
  );


  const delta =
    animationClock.getDelta();


  if (
    mixer
  ) {

    mixer.update(
      delta
    );

  }


  controls.update();


  renderer.render(
    scene,
    camera
  );

}