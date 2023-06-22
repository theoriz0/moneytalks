import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


export default function drawPopUp() {
    //init canvas, renderer, camera, scene
    const canvas = document.querySelector('#intro');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 3;
    const scene = new THREE.Scene();

    //init light
    const color = 0xFFFFFF;
    const intensity = 2;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    //load and draw font
    const loader = new FontLoader();
    function loadFont(url) {
        return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
    }

    function createLetter(letter, x, y, font) {
        const geometry = new TextGeometry(letter, {
            font: font,
            size: 0.7,
            height: .2,
            curveSegments: 40,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: .05,
            bevelSegments: 1,
        });
        const mesh = new THREE.Mesh(geometry, createMaterial());
        geometry.computeBoundingBox();
        geometry.boundingBox.getCenter(mesh.position).multiplyScalar(-1);

        const parent = new THREE.Object3D();
        parent.add(mesh);
        parent.position.x = x;
        parent.position.y = y;

        parent.rotation.x = -0.3;

        parent.rotation.z = 0.3;
        return parent;
    }
    let letters;
    async function drawFont() {
        const font = await loadFont('typeface.json');
        letters = [
            createLetter('M', -3, 1, font),
            createLetter('O', -2, 1, font),
            createLetter('N', -1, 1, font),
            createLetter('E', 0, 1, font),
            createLetter('Y', 1, 1, font),
            createLetter('T', -2.5, -0.5, font),
            createLetter('A', -1.5, -0.5, font),
            createLetter('L', -0.5, -0.5, font),
            createLetter('K', 0.5, -0.5, font),
            createLetter('S', 1.5, -0.5, font),
            
        ];

        letters.forEach(l => scene.add(l));
        let letter = createLetter('. icu', 3, -0.5, font);
        letter.rotation.x = 0.03;
        letter.rotation.z = 0.1;
        scene.add(letter);
    }

    function render(time) {
        time *= 0.0005;  // convert time to seconds
        // set canvas to window size
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }
        if (letters !==  undefined) {
            letters.forEach((letter, ndx) => {
                const speed = 1 + ndx * .1;
                const rot = time * speed;
                letter.rotation.y = rot;
            });
        }

        renderer.render(scene, camera);

        requestAnimationFrame(render);
    }

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    function createMaterial() {
        const material = new THREE.MeshStandardMaterial({
            color: 0xffb06a,
            emissive: 0xf0904a,
            metalness: 0.7,
            roughness: 0.1,
        });

        return material;
    }
    drawFont();
    requestAnimationFrame(render);
}