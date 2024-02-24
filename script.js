let scene, camera, renderer, linesGroup;
let lines = []; // Track lines
const maxLineLength = 1000; // Maximum length a line can grow to
const lineSpeed = 0.01; // Speed at which lines grow/move

function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color('black');

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    // Renderer setup
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lines group
    linesGroup = new THREE.Group();
    scene.add(linesGroup);

    // Generate lines
    generateLines();

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Animation loop
    animate();
}

function generateLines() {
    const numLines = 100;
    const material = new THREE.LineBasicMaterial({ color: 'green' });

    for (let i = 0; i < numLines; i++) {
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(6); // Initially no vertices

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        const line = new THREE.Line(geometry, material);
        linesGroup.add(line);

        // Use your original method to set starting position, with some modifications
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 100;
        const endRadius = radius + Math.random() * 10;
        const endAngle = angle + (Math.PI * 2 * Math.random());

        // Add line info, with delay property
        lines.push({
            mesh: line,
            length: 0,
            delay: Math.random() * 200, // Random delay before start growing
            growing: true, // Is the line currently growing
            angle,
            radius,
            endRadius,
            endAngle,
            speed: lineSpeed
        });
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Update each line based on its delay and length
    lines.forEach((lineInfo, index) => {
        if (lineInfo.delay > 0) {
            lineInfo.delay -= 1;
            return; // Wait for the delay to pass
        }

        if (lineInfo.growing) {
            lineInfo.length += lineInfo.speed;
            if (lineInfo.length > maxLineLength) {
                lineInfo.growing = false; // Stop growing
            }
        } else {
            // Move the line outward
            lineInfo.radius += lineInfo.speed;
        }

        if (lineInfo.radius > 50) { // Arbitrary value; adjust based on your scene size
            // Remove the line if it goes off the visible area
            linesGroup.remove(lineInfo.mesh);
            lineInfo.mesh.geometry.dispose();
            lineInfo.mesh.material.dispose();
            lines.splice(index, 1);
        } else {
            // Update geometry
            updateLineGeometry(lineInfo);
        }
    });

    // Generate new lines if necessary to maintain constant count
    if (lines.length < 100) {
        generateLines();
    }

    renderer.render(scene, camera);
}

function updateLineGeometry(lineInfo) {
    const vertices = lineInfo.mesh.geometry.attributes.position.array;

    const startX = lineInfo.radius * Math.cos(lineInfo.angle);
    const startY = lineInfo.radius * Math.sin(lineInfo.angle);
    const endX = lineInfo.endRadius * Math.cos(lineInfo.endAngle);
    const endY = lineInfo.endRadius * Math.sin(lineInfo.endAngle);

    // Start point
    vertices[0] = startX;
    vertices[1] = startY;
    vertices[2] = (Math.random() - 0.5) * 100; // Random Z for depth variation

    // End point - line grows in length
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const ratio = lineInfo.growing ? Math.min(lineInfo.length, deltaLength) / deltaLength : 1;

    vertices[3] = startX + deltaX * ratio;
    vertices[4] = startY + deltaY * ratio;
    vertices[5] = vertices[2]; // Same Z for straight lines

    lineInfo.mesh.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();