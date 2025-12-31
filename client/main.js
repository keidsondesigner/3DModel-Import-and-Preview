/**
 * Awesome 3D Importer - Main Application Script
 * Handles GLB file loading, preview, color modification, and communication with After Effects
 */

// Initialize CSInterface for communication with After Effects
const csInterface = new CSInterface();

// Global variables
let scene, camera, renderer, controls;
let currentModel = null;
let currentModelPath = null;
let currentColor = '#ffffff';
let modelMaterials = [];

// DOM Elements
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const importBtn = document.getElementById('importBtn');
const colorPicker = document.getElementById('colorPicker');
const colorValue = document.getElementById('colorValue');
const fileName = document.getElementById('fileName');
const statusMessage = document.getElementById('status');
const previewContainer = document.getElementById('preview');

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Awesome 3D Importer initialized');
    initThreeJS();
    setupEventListeners();
});

/**
 * Initialize Three.js scene, camera, renderer
 */
function initThreeJS() {
    try {
        // Create scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e1e1e);

        // Setup camera
        camera = new THREE.PerspectiveCamera(
            45,
            previewContainer.clientWidth / previewContainer.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0, 0);

        // Setup renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
        renderer.shadowMap.enabled = true;
        previewContainer.innerHTML = '';
        previewContainer.appendChild(renderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
        fillLight.position.set(-5, 0, -5);
        scene.add(fillLight);

        // Start animation loop
        animate();

        console.log('Three.js initialized successfully');
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        showStatus('Error initializing 3D preview', 'error');
    }
}

/**
 * Animation loop for Three.js
 */
function animate() {
    requestAnimationFrame(animate);

    // Rotate model slowly for better preview
    if (currentModel) {
        currentModel.rotation.y += 0.005;
    }

    renderer.render(scene, camera);
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    // Browse button
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Color picker
    colorPicker.addEventListener('input', handleColorChange);

    // Import button
    importBtn.addEventListener('click', handleImport);

    // Window resize
    window.addEventListener('resize', handleResize);
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.glb') && !file.name.toLowerCase().endsWith('.gltf')) {
        showStatus('Please select a valid GLB or GLTF file', 'error');
        return;
    }

    fileName.textContent = file.name;
    currentModelPath = file.path || URL.createObjectURL(file);

    showStatus('Loading 3D model...', 'info');
    loadGLBModel(currentModelPath);
}

/**
 * Load GLB model using GLTFLoader
 */
function loadGLBModel(path) {
    try {
        const loader = new THREE.GLTFLoader();

        loader.load(
            path,
            // Success callback
            function(gltf) {
                console.log('Model loaded successfully', gltf);

                // Remove previous model if exists
                if (currentModel) {
                    scene.remove(currentModel);
                }

                currentModel = gltf.scene;
                modelMaterials = [];

                // Center and scale the model
                const box = new THREE.Box3().setFromObject(currentModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;

                currentModel.position.x = -center.x * scale;
                currentModel.position.y = -center.y * scale;
                currentModel.position.z = -center.z * scale;
                currentModel.scale.setScalar(scale);

                // Collect all materials from the model
                currentModel.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (Array.isArray(child.material)) {
                            modelMaterials.push(...child.material);
                        } else {
                            modelMaterials.push(child.material);
                        }
                    }
                });

                scene.add(currentModel);

                // Apply current color
                applyColorToModel(currentColor);

                // Enable import button
                importBtn.disabled = false;

                showStatus('Model loaded successfully!', 'success');
            },
            // Progress callback
            function(xhr) {
                const percentComplete = (xhr.loaded / xhr.total) * 100;
                console.log('Loading: ' + Math.round(percentComplete) + '%');
            },
            // Error callback
            function(error) {
                console.error('Error loading model:', error);
                showStatus('Error loading model. Please check the file.', 'error');
                importBtn.disabled = true;
            }
        );
    } catch (error) {
        console.error('Error in loadGLBModel:', error);
        showStatus('Failed to load model', 'error');
    }
}

/**
 * Handle color picker change
 */
function handleColorChange(event) {
    currentColor = event.target.value;
    colorValue.textContent = currentColor;

    if (currentModel) {
        applyColorToModel(currentColor);
    }
}

/**
 * Apply color to all materials in the model
 */
function applyColorToModel(hexColor) {
    try {
        const color = new THREE.Color(hexColor);

        modelMaterials.forEach(material => {
            if (material.color) {
                material.color.copy(color);
            }
            // Also apply to emissive for better visibility
            if (material.emissive) {
                material.emissive.copy(color).multiplyScalar(0.1);
            }
        });

        console.log('Color applied:', hexColor);
    } catch (error) {
        console.error('Error applying color:', error);
    }
}

/**
 * Handle window resize
 */
function handleResize() {
    if (camera && renderer) {
        camera.aspect = previewContainer.clientWidth / previewContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(previewContainer.clientWidth, previewContainer.clientHeight);
    }
}

/**
 * Handle import to After Effects
 */
function handleImport() {
    if (!currentModelPath) {
        showStatus('No model selected', 'error');
        return;
    }

    showStatus('Importing to After Effects...', 'info');

    // Get the actual file path (for CEP extensions, we need the real path)
    let filePath = currentModelPath;

    // If it's a blob URL, we need to get the actual file path
    if (filePath.startsWith('blob:')) {
        // In CEP, the file input should give us the real path via file.path
        const files = fileInput.files;
        if (files && files[0]) {
            filePath = files[0].path || currentModelPath;
        }
    }

    // Prepare data to send to JSX
    const importData = {
        filePath: filePath,
        color: currentColor,
        fileName: fileName.textContent
    };

    console.log('Importing with data:', importData);

    // Call JSX function
    csInterface.evalScript(
        `importGLBToComposition(${JSON.stringify(importData)})`,
        function(result) {
            console.log('Import result:', result);

            try {
                const response = JSON.parse(result);

                if (response.success) {
                    showStatus('Successfully imported to After Effects!', 'success');
                } else {
                    showStatus('Import failed: ' + response.message, 'error');
                }
            } catch (error) {
                console.error('Error parsing result:', error);
                showStatus('Import completed (check After Effects)', 'info');
            }
        }
    );
}

/**
 * Show status message to user
 */
function showStatus(message, type = 'info') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;

    console.log(`[${type.toUpperCase()}] ${message}`);

    // Auto-clear success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    }
}

/**
 * Utility function to convert file path for cross-platform compatibility
 */
function normalizePath(path) {
    // Convert backslashes to forward slashes for consistency
    return path.replace(/\\/g, '/');
}
