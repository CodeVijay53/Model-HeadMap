import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdddddd);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
const loader = new GLTFLoader();
const controls = new OrbitControls(camera, renderer.domElement);

// Set up scene, camera, and renderer
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("model-container").appendChild(renderer.domElement);

const heatmapMaterial = new THREE.MeshBasicMaterial({
  vertexColors: true,
});

// Load GLB model
loader.load("./public/bin.glb", (gltf) => {
  const model = gltf.scene;

  model.traverse((child) => {
    if (child.isMesh) {
      const geometry = child.geometry;
      const positions = geometry.attributes.position.array;
      const colors = new Float32Array(positions.length);

      const minZ = Math.min(...positions.filter((_, i) => i % 3 === 2));
      const maxZ = Math.max(...positions.filter((_, i) => i % 3 === 2));

      // Set up colors based on z-axis position
      for (let i = 0; i < positions.length; i += 3) {
        const z = positions[i + 2];
        const normalizedZ = (z - minZ) / (maxZ - minZ);

        const color = new THREE.Color();
        color.setRGB(normalizedZ, 0, 1 - normalizedZ); // Red to Blue

        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }

      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      // Apply heatmap material to each mesh
      child.material = heatmapMaterial;
    }
  });

  scene.add(model);

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };

  animate();
});

// Set up camera position
camera.position.z = 5;

// Set up orbit controls
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;
