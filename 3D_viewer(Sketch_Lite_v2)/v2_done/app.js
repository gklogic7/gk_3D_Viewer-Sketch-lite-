// app.js

import * as THREE from "three";

import {
  OrbitControls
} from "three/addons/controls/OrbitControls.js";

import {
  GLTFLoader
} from "three/addons/loaders/GLTFLoader.js";


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


// =====================================================
// THREE VARIABLES
// =====================================================

let scene;
let camera;
let renderer;
let controls;

let currentModel = null;

let gridHelper = null;

let keyLight = null;
let fillLight = null;
let rimLight = null;

let wireframeMode = false;

let darkMode = false;

let lightAngle = 45;


// =====================================================
// LIGHT ROTATION STATE
// =====================================================

let rotatingLight = false;

let lastMouseX = 0;


// =====================================================
// KEYBOARD SHORTCUTS
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

    keys = JSON.parse(
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

  // SCENE

  scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(
      0x202124
    );


  // CAMERA

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


  // RENDERER

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


  // CONTROLS

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


  // LIGHTS

  createLights();


  // GRID

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


  // EVENTS

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
    e => {

      const file =
        e.target.files[0];

      if (file) {

        loadModel(file);

      }

    }
  );


  // BUTTONS

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


  // MOUSE

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


  // DROP

  window.addEventListener(
    "dragover",
    e => {

      e.preventDefault();

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
    e => {

      e.preventDefault();

      document.body.classList.remove(
        "dragover"
      );

      const file =
        e.dataTransfer.files[0];

      if (file) {

        loadModel(file);

      }

    }
  );


  // KEYBOARD

  window.addEventListener(
    "keydown",
    onKeyboard
  );


  // REMAPPING BUTTONS

  document
    .querySelectorAll(
      ".keyRow button"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => startKeyRemap(button)
      );

    });

}


// =====================================================
// MOUSE LIGHT ROTATION
//
// Shift + Left Mouse
// = Rotate Studio Light
//
// Normal Left Mouse
// = Orbit Camera
// =====================================================

function onMouseDown(event) {

  if (
    event.button === 0 &&
    event.shiftKey
  ) {

    rotatingLight = true;

    lastMouseX =
      event.clientX;

    controls.enabled =
      false;

    renderer.domElement.style.cursor =
      "ew-resize";

  }

}


function onMouseMove(event) {

  if (!rotatingLight)
    return;


  const delta =
    event.clientX -
    lastMouseX;


  lastMouseX =
    event.clientX;


  lightAngle +=
    delta * 0.5;


  rotateStudioLight();

}


function onMouseUp() {

  if (!rotatingLight)
    return;


  rotatingLight = false;

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

    Math.cos(radians + Math.PI) *
    5,

    3,

    Math.sin(radians + Math.PI) *
    5

  );


  fillLight.lookAt(
    0,
    0,
    0
  );
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
      "Please load a GLB or GLTF model."
    );

    return;

  }


  dropText.style.display =
    "none";


  if (currentModel) {

    scene.remove(
      currentModel
    );

    disposeObject(
      currentModel
    );

    currentModel =
      null;

  }


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


      updateInspector();


      URL.revokeObjectURL(
        url
      );

    },

    progress => {

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

    error => {

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

        object.castShadow =
          true;

        object.receiveShadow =
          true;

        object.userData.viewerMesh =
          true;


        if (
          object.material
        ) {

          if (
            Array.isArray(
              object.material
            )
          ) {

            object.material.forEach(
              material => {

                material.side =
                  THREE.FrontSide;

              }
            );

          } else {

            object.material.side =
              THREE.FrontSide;

          }

        }

      }

    }
  );

}


// =====================================================
// CENTER
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
// CAMERA FIT
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
// RESET
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
  )
    return;


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

          object.material.forEach(
            material => {

              material.wireframe =
                wireframeMode;

            }
          );

        } else {

          object.material.wireframe =
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

  let materials = 0;


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

          if (position) {

            vertices +=
              position.count;

          }

        }


        if (
          object.material
        ) {

          if (
            Array.isArray(
              object.material
            )
          ) {

            object.material.forEach(
              material =>
                materialSet.add(
                  material
                )
            );

          } else {

            materialSet.add(
              object.material
            );

          }

        }

      }

    }
  );


  materials =
    materialSet.size;


  modelInfo.innerHTML = `

    <div>Meshes: ${meshes}</div>

    <div>Vertices: ${vertices.toLocaleString()}</div>

    <div>Materials: ${materials}</div>

  `;


  updateTextureMaps(
    materialSet
  );


  updateMaterialInfo(
    materialSet
  );

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
            texture.image.toDataURL?.();

        } catch {

          image.alt =
            "Texture";

        }

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


      div.innerHTML = `

        <strong>
          ${index}. ${material.name || "Material"}
        </strong>

        <br>

        Type:
        ${material.type}

        <br>

        Color:
        ${material.color
          ? "#" +
            material.color
              .getHexString()
          : "N/A"}

        <br>

        Roughness:
        ${material.roughness ?? "N/A"}

        <br>

        Metalness:
        ${material.metalness ?? "N/A"}

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
    .getElementById("helpPanel")
    .classList.add("open");

}


function closeHelp() {

  document
    .getElementById("helpPanel")
    .classList.remove("open");

}


// =====================================================
// KEYBOARD REMAPPING
// =====================================================

function openKeys() {

  closeHelp();

  document
    .getElementById("keyPanel")
    .classList.add("open");

  refreshKeyButtons();

}


function closeKeys() {

  document
    .getElementById("keyPanel")
    .classList.remove("open");

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
        key === "shift" ||
        key === "control" ||
        key === "alt" ||
        key === "meta"
      ) {

        return;

      }


      keys[
        remappingAction
      ] = key;


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

function onKeyboard(event) {

  if (
    event.target.tagName ===
    "INPUT"
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

        if (
          Array.isArray(
            child.material
          )
        ) {

          child.material.forEach(
            disposeMaterial
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
// LOOP
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