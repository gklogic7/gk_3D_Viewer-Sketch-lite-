// app.js

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("viewer");
const fileInput = document.getElementById("fileInput");
const dropText = document.getElementById("dropText");

let scene;
let camera;
let renderer;
let controls;

let currentModel = null;
let gridHelper = null;

let wireframeMode = false;
let darkLight = false;

init();
animate();

function init() {

  // -----------------------------
  // SCENE
  // -----------------------------

  scene = new THREE.Scene();

  scene.background = new THREE.Color(0x202124);


  // -----------------------------
  // CAMERA
  // -----------------------------

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );

  camera.position.set(3, 2, 5);


  // -----------------------------
  // RENDERER
  // -----------------------------

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  renderer.outputColorSpace = THREE.SRGBColorSpace;

  renderer.shadowMap.enabled = true;

  container.appendChild(renderer.domElement);


  // -----------------------------
  // ORBIT CONTROLS
  // -----------------------------

  controls = new OrbitControls(
    camera,
    renderer.domElement
  );

  controls.enableDamping = true;

  controls.dampingFactor = 0.08;

  controls.enablePan = true;

  controls.enableZoom = true;

  controls.minDistance = 0.1;

  controls.maxDistance = 100;


  // -----------------------------
  // LIGHTS
  // -----------------------------

  createLights();


  // -----------------------------
  // GRID
  // -----------------------------

  gridHelper = new THREE.GridHelper(
    10,
    20,
    0x555555,
    0x333333
  );

  scene.add(gridHelper);


  // -----------------------------
  // EVENTS
  // -----------------------------

  window.addEventListener(
    "resize",
    onResize
  );

  fileInput.addEventListener(
    "change",
    handleFile
  );

  document
    .getElementById("resetBtn")
    .addEventListener(
      "click",
      resetCamera
    );

  document
    .getElementById("wireBtn")
    .addEventListener(
      "click",
      toggleWireframe
    );

  document
    .getElementById("gridBtn")
    .addEventListener(
      "click",
      toggleGrid
    );

  document
    .getElementById("lightBtn")
    .addEventListener(
      "click",
      toggleLight
    );


  // -----------------------------
  // DRAG & DROP
  // -----------------------------

  window.addEventListener(
    "dragover",
    event => {
      event.preventDefault();

      document.body.classList.add(
        "dragover"
      );
    }
  );

  window.addEventListener(
    "dragleave",
    () => {
      document.body.classList.remove(
        "dragover"
      );
    }
  );

  window.addEventListener(
    "drop",
    event => {

      event.preventDefault();

      document.body.classList.remove(
        "dragover"
      );

      const file =
        event.dataTransfer.files[0];

      if (file) {
        loadModel(file);
      }
    }
  );
}


// =====================================================
// LIGHTING
// =====================================================

function createLights() {

  const ambient =
    new THREE.HemisphereLight(
      0xffffff,
      0x444444,
      2
    );

  scene.add(ambient);


  const keyLight =
    new THREE.DirectionalLight(
      0xffffff,
      3
    );

  keyLight.position.set(
    5,
    8,
    5
  );

  keyLight.castShadow = true;

  scene.add(keyLight);


  const fillLight =
    new THREE.DirectionalLight(
      0xffffff,
      1.5
    );

  fillLight.position.set(
    -5,
    3,
    -5
  );

  scene.add(fillLight);
}


// =====================================================
// FILE INPUT
// =====================================================

function handleFile(event) {

  const file =
    event.target.files[0];

  if (!file) return;

  loadModel(file);
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

  if (
    extension !== "glb" &&
    extension !== "gltf"
  ) {

    alert(
      "Please select a GLB or GLTF model."
    );

    return;
  }


  dropText.style.display = "none";


  // Remove old model

  if (currentModel) {

    scene.remove(
      currentModel
    );

    disposeObject(
      currentModel
    );

    currentModel = null;
  }


  const loader =
    new GLTFLoader();


  const url =
    URL.createObjectURL(file);


  loader.load(
    url,

    function(gltf) {

      currentModel =
        gltf.scene;

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


      URL.revokeObjectURL(
        url
      );
    },

    function(progress) {

      if (
        progress.total
      ) {

        const percent =
          Math.round(
            progress.loaded /
            progress.total *
            100
          );

        dropText.textContent =
          "Loading " +
          percent +
          "%";
      }
    },

    function(error) {

      console.error(error);

      alert(
        "Could not load model."
      );

      dropText.style.display =
        "block";

      dropText.textContent =
        "Drop GLB / GLTF model here";

      URL.revokeObjectURL(
        url
      );
    }
  );
}


// =====================================================
// PREPARE MODEL
// =====================================================

function prepareModel(model) {

  model.traverse(
    object => {

      if (
        object.isMesh
      ) {

        object.castShadow = true;

        object.receiveShadow = true;

        object.frustumCulled = true;


        if (
          object.material
        ) {

          if (
            Array.isArray(
              object.material
            )
          ) {

            object.material
              .forEach(
                material => {

                  material
                    .side =
                    THREE.FrontSide;
                }
              );

          } else {

            object.material
              .side =
              THREE.FrontSide;
          }
        }
      }
    }
  );
}


// =====================================================
// CENTER MODEL
// =====================================================

function centerModel(model) {

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

function fitCamera(model) {

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
    maxSize * 2.5;


  camera.position.set(
    center.x + distance,
    center.y + distance * 0.6,
    center.z + distance
  );


  camera.near =
    Math.max(
      maxSize / 1000,
      0.001
    );

  camera.far =
    maxSize * 1000;

  camera.updateProjectionMatrix();


  controls.target.copy(
    center
  );

  controls.update();
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
// WIREFRAME
// =====================================================

function toggleWireframe() {

  wireframeMode =
    !wireframeMode;


  if (
    !currentModel
  ) return;


  currentModel.traverse(
    object => {

      if (
        object.isMesh &&
        object.material
      ) {

        if (
          Array.isArray(
            object.material
          )
        ) {

          object.material
            .forEach(
              material => {

                material.wireframe =
                  wireframeMode;
              }
            );

        } else {

          object.material
            .wireframe =
            wireframeMode;
        }
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
// LIGHT
// =====================================================

function toggleLight() {

  darkLight =
    !darkLight;


  if (darkLight) {

    scene.background =
      new THREE.Color(
        0x080808
      );

  } else {

    scene.background =
      new THREE.Color(
        0x202124
      );
  }
}


// =====================================================
// DISPOSE
// =====================================================

function disposeObject(object) {

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

        if (
          Array.isArray(
            child.material
          )
        ) {

          child.material.forEach(
            material => {

              disposeMaterial(
                material
              );
            }
          );

        } else {

          disposeMaterial(
            child.material
          );
        }
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
// GAME / RENDER LOOP
// =====================================================

function animate() {

  requestAnimationFrame(
    animate
  );

  controls.update();

  renderer.render(
    scene,
    camera
  );
}
