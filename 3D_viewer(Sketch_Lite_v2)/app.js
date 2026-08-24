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

import {
  EffectComposer
} from "three/addons/postprocessing/EffectComposer.js";

import {
  RenderPass
} from "three/addons/postprocessing/RenderPass.js";

import {
  OutlinePass
} from "three/addons/postprocessing/OutlinePass.js";


// =====================================================
// DOM
// =====================================================

const container =
  document.getElementById(
    "viewer"
  );

const fileInput =
  document.getElementById(
    "fileInput"
  );

const textureInput =
  document.getElementById(
    "textureInput"
  );

const dropText =
  document.getElementById(
    "dropText"
  );

const inspector =
  document.getElementById(
    "inspector"
  );

const modelInfo =
  document.getElementById(
    "modelInfo"
  );

const materialInfo =
  document.getElementById(
    "materialInfo"
  );

const textureMaps =
  document.getElementById(
    "textureMaps"
  );

const animationInfo =
  document.getElementById(
    "animationInfo"
  );

const animationSelect =
  document.getElementById(
    "animationSelect"
  );

const loadingOverlay =
  document.getElementById(
    "loadingOverlay"
  );

const loadingProgress =
  document.getElementById(
    "loadingProgress"
  );

const loadingPercent =
  document.getElementById(
    "loadingPercent"
  );

const loadingTitle =
  document.getElementById(
    "loadingTitle"
  );


// =====================================================
// THREE
// =====================================================

let scene;

let camera;

let renderer;

let controls;

let composer;

let outlinePass;

let currentModel = null;

let mixer = null;

let currentAnimations = [];

let activeAction = null;

let clock =
  new THREE.Clock();

let gridHelper;

let keyLight;

let fillLight;

let rimLight;

let ambientLight;

let wireframeMode = false;

let darkMode = false;

let lightAngle = 45;


// =====================================================
// SHOWCASE
// =====================================================

let showcaseEnabled = false;

let showcaseSpeed = .5;


// =====================================================
// OUTLINE
// =====================================================

let outlineEnabled = false;


// =====================================================
// SHADER
// =====================================================

let shaderEnabled = false;

const originalMaterials =
  new Map();


// =====================================================
// LOADING OVERLAY
// =====================================================

let overlayEnabled = true;


// =====================================================
// LIGHT ROTATION
// =====================================================

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

  showcase: "a",

  outline: "f",

  shader: "s",

  overlay: "o",

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
      JSON.parse(
        savedKeys
      );

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

      .01,

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
    .08;

  controls.enablePan =
    true;

  controls.enableZoom =
    true;

  controls.minDistance =
    .05;

  controls.maxDistance =
    100;


  createLights();

  createGrid();

  createPostProcessing();

  setupEvents();

}


// =====================================================
// LIGHTS
// =====================================================

function createLights() {

  ambientLight =
    new THREE.HemisphereLight(

      0xffffff,

      0x444444,

      2

    );


  scene.add(
    ambientLight
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
// GRID
// =====================================================

function createGrid() {

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

}


// =====================================================
// POST PROCESSING
// =====================================================

function createPostProcessing() {

  composer =
    new EffectComposer(
      renderer
    );


  const renderPass =
    new RenderPass(

      scene,

      camera

    );


  composer.addPass(
    renderPass
  );


  outlinePass =
    new OutlinePass(

      new THREE.Vector2(

        window.innerWidth,

        window.innerHeight

      ),

      scene,

      camera

    );


  outlinePass.edgeStrength =
    4;

  outlinePass.edgeGlow =
    .5;

  outlinePass.edgeThickness =
    2;

  outlinePass.visibleEdgeColor.set(
    0xffffff
  );

  outlinePass.hiddenEdgeColor.set(
    0x000000
  );


  composer.addPass(
    outlinePass
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


  textureInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if (file) {

        loadExternalTexture(
          file
        );

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
    .getElementById("showcaseBtn")
    .onclick =
    toggleShowcase;


  document
    .getElementById("showcaseBottom")
    .onclick =
    toggleShowcase;


  document
    .getElementById("outlineBtn")
    .onclick =
    toggleOutline;


  document
    .getElementById("outlineBottom")
    .onclick =
    toggleOutline;


  document
    .getElementById("shaderBtn")
    .onclick =
    toggleShader;


  document
    .getElementById("shaderBottom")
    .onclick =
    toggleShader;


  document
    .getElementById(
      "overlayBtnInspector"
    )
    .onclick =
    toggleOverlay;


  document
    .getElementById(
      "overlayBottom"
    )
    .onclick =
    toggleOverlay;


  document
    .getElementById("hideLoading")
    .onclick =
    toggleOverlay;


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
    .getElementById(
      "playAnimation"
    )
    .onclick =
    playAnimation;


  document
    .getElementById(
      "pauseAnimation"
    )
    .onclick =
    pauseAnimation;


  document
    .getElementById(
      "stopAnimation"
    )
    .onclick =
    stopAnimation;


  animationSelect.addEventListener(
    "change",
    playAnimation
  );


  document
    .getElementById(
      "animationSpeed"
    )
    .addEventListener(
      "input",
      changeAnimationSpeed
    );


  document
    .getElementById(
      "rotationSpeed"
    )
    .addEventListener(
      "input",
      event => {

        showcaseSpeed =
          Number(
            event.target.value
          );


        document
          .getElementById(
            "rotationValue"
          )
          .textContent =
          showcaseSpeed.toFixed(
            1
          ) + "x";

      }
    );


  // SHIFT + LEFT MOUSE
  // ROTATE LIGHT

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


  // DROP MODEL

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

      if (!file)
        return;


      const ext =
        file.name
          .split(".")
          .pop()
          .toLowerCase();


      if (
        [
          "png",
          "jpg",
          "jpeg",
          "webp"
        ].includes(ext)
      ) {

        loadExternalTexture(
          file
        );

      } else {

        loadModel(
          file
        );

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
          startKeyRemap(
            button
          )
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


  showLoading(
    "Loading Model"
  );


  clearCurrentModel();


  switch (extension) {

    case "glb":
    case "gltf":

      loadGLTF(file);

      break;


    case "fbx":

      loadFBX(file);

      break;


    case "obj":

      loadOBJ(file);

      break;


    case "stl":

      loadSTL(file);

      break;


    case "ply":

      loadPLY(file);

      break;


    case "dae":

      loadDAE(file);

      break;


    case "3mf":

      load3MF(file);

      break;


    default:

      hideLoading();

      showError(
        "Unsupported 3D format."
      );

  }

}


// =====================================================
// GLTF / GLB
// =====================================================

function loadGLTF(file) {

  const loader =
    new GLTFLoader();


  const url =
    URL.createObjectURL(
      file
    );


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


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    progress => {

      updateLoading(
        progress
      );

    },

    error => {

      console.error(
        error
      );


      hideLoading();


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
    URL.createObjectURL(
      file
    );


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


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    updateLoading,

    error => {

      console.error(
        error
      );


      hideLoading();


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
    URL.createObjectURL(
      file
    );


  loader.load(

    url,

    object => {

      currentModel =
        object;


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


      currentAnimations =
        [];


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    updateLoading,

    error => {

      console.error(
        error
      );


      hideLoading();


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
    URL.createObjectURL(
      file
    );


  loader.load(

    url,

    geometry => {

      geometry.computeVertexNormals();


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


      currentAnimations =
        [];


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    updateLoading,

    error => {

      console.error(
        error
      );


      hideLoading();


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
    URL.createObjectURL(
      file
    );


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


      currentAnimations =
        [];


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    updateLoading,

    error => {

      console.error(
        error
      );


      hideLoading();


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
// DAE
// =====================================================

function loadDAE(file) {

  const loader =
    new ColladaLoader();


  const url =
    URL.createObjectURL(
      file
    );


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


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    updateLoading,

    error => {

      console.error(
        error
      );


      hideLoading();


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
    URL.createObjectURL(
      file
    );


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


      setupAnimations();


      updateInspector();


      hideLoading();


      URL.revokeObjectURL(
        url
      );

    },

    updateLoading,

    error => {

      console.error(
        error
      );


      hideLoading();


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
// EXTERNAL TEXTURE
//
// Select model first.
// Then select PNG/JPG/WebP.
//
// Texture is applied to meshes that use
// MeshStandard / MeshPhysical material.
// =====================================================

function loadExternalTexture(
  file
) {

  if (
    !currentModel
  ) {

    alert(
      "Load a 3D model first."
    );

    return;

  }


  showLoading(
    "Loading Texture"
  );


  const url =
    URL.createObjectURL(
      file
    );


  const loader =
    new THREE.TextureLoader();


  loader.load(

    url,

    texture => {

      texture.colorSpace =
        THREE.SRGBColorSpace;


      texture.flipY =
        false;


      let count = 0;


      currentModel.traverse(
        object => {

          if (
            !object.isMesh ||
            !object.material
          )
            return;


          const materials =
            Array.isArray(
              object.material
            )
              ? object.material
              : [
                  object.material
                ];


          materials.forEach(
            material => {

              if (
                material.map !==
                undefined
              ) {

                material.map =
                  texture;


                material.needsUpdate =
                  true;


                count++;

              }

            }
          );

        }
      );


      hideLoading();


      URL.revokeObjectURL(
        url
      );


      updateInspector();


      if (
        count === 0
      ) {

        alert(
          "No compatible material found."
        );

      }

    },

    undefined,

    error => {

      console.error(
        error
      );


      hideLoading();


      URL.revokeObjectURL(
        url
      );

      alert(
        "Could not load texture."
      );

    }

  );

}


// =====================================================
// PREPARE MODEL
// =====================================================

function prepareModel(
  model
) {

  originalMaterials.clear();


  model.traverse(
    object => {

      if (
        object.isMesh
      ) {

        object.castShadow =
          true;

        object.receiveShadow =
          true;


        const materials =
          Array.isArray(
            object.material
          )
            ? object.material
            : [
                object.material
              ];


        materials.forEach(
          material => {

            originalMaterials.set(
              material,
              material
            );

            material.side =
              THREE.FrontSide;

          }
        );

      }

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
// CENTER
// =====================================================

function centerModel(
  model
) {

  const box =
    new THREE.Box3()
      .setFromObject(
        model
      );


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
      .setFromObject(
        model
      );


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
// ANIMATION
// =====================================================

function setupAnimations() {

  stopAnimation();


  animationSelect.innerHTML =
    "";


  if (
    !currentAnimations.length
  ) {

    animationInfo.textContent =
      "No animations";


    animationSelect.style.display =
      "none";


    mixer = null;

    return;

  }


  animationSelect.style.display =
    "block";


  animationInfo.textContent =
    `${currentAnimations.length} animation(s) found`;


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
      currentModel
    );


  animationSelect.value =
    "0";


  playAnimation();

}


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
    currentAnimations[
      index
    ];


  if (!clip)
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


function pauseAnimation() {

  if (
    activeAction
  ) {

    activeAction.paused =
      !activeAction.paused;

  }

}


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
    speed.toFixed(1) +
    "x";


  if (
    mixer
  ) {

    mixer.timeScale =
      speed;

  }

}


// =====================================================
// SHOWCASE AUTO ROTATION
// =====================================================

function toggleShowcase() {

  showcaseEnabled =
    !showcaseEnabled;


  const text =
    showcaseEnabled
      ? "⟳ Auto Rotate ON"
      : "⟳ Auto Rotate OFF";


  document
    .getElementById(
      "showcaseBtn"
    )
    .textContent =
    text;


  document
    .getElementById(
      "showcaseBottom"
    )
    .textContent =
    showcaseEnabled
      ? "⟳ Showcase ON"
      : "⟳ Showcase";

}


// =====================================================
// OUTLINE
// =====================================================

function toggleOutline() {

  outlineEnabled =
    !outlineEnabled;


  const text =
    outlineEnabled
      ? "◇ Outline ON"
      : "◇ Outline OFF";


  document
    .getElementById(
      "outlineBtn"
    )
    .textContent =
    text;


  document
    .getElementById(
      "outlineBottom"
    )
    .textContent =
    outlineEnabled
      ? "◇ Outline ON"
      : "◇ Outline";


  updateOutline();

}


function updateOutline() {

  if (
    outlineEnabled &&
    currentModel
  ) {

    outlinePass.selectedObjects =
      [
        currentModel
      ];

  } else {

    outlinePass.selectedObjects =
      [];

  }

}


// =====================================================
// SHADER VIEW
//
// Simple realtime shader preview.
// Does not destroy the original
// material. Toggle OFF restores it.
// =====================================================

function toggleShader() {

  shaderEnabled =
    !shaderEnabled;


  const text =
    shaderEnabled
      ? "✦ Shader ON"
      : "✦ Shader OFF";


  document
    .getElementById(
      "shaderBtn"
    )
    .textContent =
    text;


  document
    .getElementById(
      "shaderBottom"
    )
    .textContent =
    shaderEnabled
      ? "✦ Shader ON"
      : "✦ Shader";


  if (
    !currentModel
  )
    return;


  currentModel.traverse(
    object => {

      if (
        !object.isMesh
      )
        return;


      if (
        shaderEnabled
      ) {

        if (
          !object.userData.shaderMaterial
        ) {

          object.userData.originalMaterial =
            object.material;


          const shaderMaterial =
            new THREE.MeshNormalMaterial({

              flatShading: false

            });


          object.userData.shaderMaterial =
            shaderMaterial;

        }


        object.material =
          object.userData.shaderMaterial;

      } else {

        if (
          object.userData.originalMaterial
        ) {

          object.material =
            object.userData.originalMaterial;

        }

      }

    }
  );

}


// =====================================================
// OVERLAY TOGGLE
// =====================================================

function toggleOverlay() {

  overlayEnabled =
    !overlayEnabled;


  if (
    overlayEnabled
  ) {

    loadingOverlay.classList.remove(
      "hidden"
    );

  } else {

    loadingOverlay.classList.add(
      "hidden"
    );

  }


  updateOverlayButtons();

}


function updateOverlayButtons() {

  const text =
    overlayEnabled
      ? "◉ Loading Overlay ON"
      : "◉ Loading Overlay OFF";


  document
    .getElementById(
      "overlayBtnInspector"
    )
    .textContent =
    text;


  document
    .getElementById(
      "overlayBottom"
    )
    .textContent =
    overlayEnabled
      ? "◉ Overlay ON"
      : "◉ Overlay OFF";

}


// =====================================================
// LOADING
// =====================================================

function showLoading(
  title
) {

  if (!overlayEnabled)
    return;


  loadingOverlay.classList.remove(
    "hidden"
  );


  loadingTitle.textContent =
    title;


  loadingProgress.style.width =
    "0%";


  loadingPercent.textContent =
    "0%";

}


function updateLoading(
  progress
) {

  if (!overlayEnabled)
    return;


  if (
    !progress ||
    !progress.total
  )
    return;


  const percent =
    Math.round(

      progress.loaded /
      progress.total *
      100

    );


  loadingProgress.style.width =
    percent + "%";


  loadingPercent.textContent =
    percent + "%";

}


function hideLoading() {

  loadingOverlay.classList.add(
    "hidden"
  );

}


function showError(
  message
) {

  dropText.style.display =
    "block";


  dropText.innerHTML =
    `${message}
     <small>
       GLB GLTF FBX OBJ STL PLY DAE 3MF
     </small>`;

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
        !object.isMesh
      )
        return;


      const materials =
        Array.isArray(
          object.material
        )
          ? object.material
          : [
              object.material
            ];


      materials.forEach(
        material => {

          if (
            "wireframe" in
            material
          ) {

            material.wireframe =
              wireframeMode;

          }

        }
      );

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
// SHIFT + LEFT MOUSE
// ROTATE LIGHT
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


  const radius = 6;


  keyLight.position.set(

    Math.cos(
      radians
    ) * radius,

    7,

    Math.sin(
      radians
    ) * radius

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
              : [
                  object.material
                ];


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


  updateOutline();

}


// =====================================================
// TEXTURE MAP VIEWER
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


      if (
        texture.image
      ) {

        try {

          image.src =
            texture.image.currentSrc ||
            texture.image.src ||
            "";

        } catch {}

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
// MATERIAL INSPECTOR
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
// CLEAR MODEL
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


  mixer = null;

  activeAction = null;


  animationSelect.innerHTML =
    "";


  animationSelect.style.display =
    "none";


  animationInfo.textContent =
    "No animations";


  outlinePass.selectedObjects =
    [];

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
        JSON.stringify(
          keys
        )
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
    .forEach(
      button => {

        const action =
          button.dataset.action;


        button.textContent =
          keys[action]
            .toUpperCase();

      }
    );

}


function resetKeys() {

  keys = {
    ...defaultKeys
  };


  localStorage.setItem(
    "viewerShortcuts",
    JSON.stringify(
      keys
    )
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
    key === keys.showcase
  ) {

    toggleShowcase();

  }

  else if (
    key === keys.outline
  ) {

    toggleOutline();

  }

  else if (
    key === keys.shader
  ) {

    toggleShader();

  }

  else if (
    key === keys.overlay
  ) {

    toggleOverlay();

  }

  else if (
    key === keys.help
  ) {

    openHelp();

  }

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
            : [
                child.material
              ];


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


  composer.setSize(
    window.innerWidth,
    window.innerHeight
  );

}


// =====================================================
// MAIN LOOP
// =====================================================

function animate() {

  requestAnimationFrame(
    animate
  );


  const delta =
    clock.getDelta();


  if (
    mixer
  ) {

    mixer.update(
      delta
    );

  }


  // Whole model showcase rotation

  if (
    showcaseEnabled &&
    currentModel
  ) {

    currentModel.rotation.y +=
      delta *
      showcaseSpeed;

  }


  controls.update();


  if (
    composer
  ) {

    composer.render();

  } else {

    renderer.render(
      scene,
      camera
    );

  }

}