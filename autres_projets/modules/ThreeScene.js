export default class ThreeScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = [];
        this.selectedObject = null;
        this.objectCounter = 0;
        
        // Configuration
        this.cameraConfig = {
            fov: 75,
            near: 0.1,
            far: 1000,
            position: { x: 0, y: 2, z: 10 }
        };
        
        // Éclairage
        this.lights = [];
    }
    
    init() {
        // 1. Créer la scène
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020617);
        this.scene.fog = new THREE.Fog(0x020617, 10, 100);
        
        // 2. Créer la caméra
        this.camera = new THREE.PerspectiveCamera(
            this.cameraConfig.fov,
            this.canvas.clientWidth / this.canvas.clientHeight,
            this.cameraConfig.near,
            this.cameraConfig.far
        );
        this.camera.position.set(
            this.cameraConfig.position.x,
            this.cameraConfig.position.y,
            this.cameraConfig.position.z
        );
        
        // 3. Créer le renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // 4. Ajouter l'éclairage
        this.setupLights();
        
        // 5. Ajouter des objets par défaut
        this.addDefaultObjects();
        
        // 6. Ajouter des effets
        this.setupEffects();
        
        // 7. Gérer le redimensionnement
        this.setupResizeHandler();
    }
    
    setupLights() {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        // Lumière directionnelle principale
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 20, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Lumières d'accentuation
        const pointLight1 = new THREE.PointLight(0x4f46e5, 0.8, 100);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x10b981, 0.6, 100);
        pointLight2.position.set(-10, 5, -10);
        this.scene.add(pointLight2);
    }
    
    addDefaultObjects() {
        // Sol
        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1e293b,
            roughness: 0.8,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        
        // Objets 3D initiaux
        this.addObject('cube', 'Cube Principal', 0x6366f1, { x: 0, y: 1, z: 0 });
        this.addObject('sphere', 'Sphère', 0x10b981, { x: -3, y: 1, z: 2 });
        this.addObject('torus', 'Tore', 0x8b5cf6, { x: 3, y: 1, z: 2 });
        
        // Système de particules
        this.createParticleSystem();
    }
    
    addObject(type, name, color, position) {
        let geometry, material;
        
        switch(type) {
            case 'cube':
                geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
                break;
            case 'cone':
                geometry = new THREE.ConeGeometry(1, 2, 32);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                break;
            default:
                geometry = new THREE.DodecahedronGeometry(1.3);
        }
        
        material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.3,
            metalness: 0.7,
            emissive: new THREE.Color(color).multiplyScalar(0.1),
            emissiveIntensity: 0.5
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Propriétés personnalisées
        mesh.userData = {
            id: ++this.objectCounter,
            name: name,
            type: type,
            color: color,
            originalColor: color,
            selected: false,
            hovered: false,
            animations: []
        };
        
        this.scene.add(mesh);
        this.objects.push(mesh);
        
        // Mettre à jour l'UI
        this.updateObjectList();
        
        return mesh.userData.id;
    }
    
    addRandomObject() {
        const types = ['cube', 'sphere', 'torus', 'cone', 'cylinder', 'dodecahedron'];
        const colors = [
            0x6366f1, 0x10b981, 0x8b5cf6, 0xf59e0b, 0xef4444, 0xec4899
        ];
        
        const type = types[Math.floor(Math.random() * types.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const name = `${type.charAt(0).toUpperCase() + type.slice(1)} ${this.objectCounter + 1}`;
        
        const position = {
            x: (Math.random() - 0.5) * 8,
            y: 1 + Math.random() * 3,
            z: (Math.random() - 0.5) * 8
        };
        
        return this.addObject(type, name, color, position);
    }
    
    createParticleSystem() {
        const particleCount = 500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for(let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = Math.random() * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            
            colors[i * 3] = 0.4 + Math.random() * 0.6;
            colors[i * 3 + 1] = 0.4 + Math.random() * 0.6;
            colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
        
        // Animation des particules
        particleSystem.userData.animate = () => {
            particleSystem.rotation.y += 0.001;
        };
    }
    
    setupEffects() {
        // Ajouter un effet de brillance aux objets sélectionnés
        const outlineShader = {
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(1.0, 0.5, 0.0, 1.0) * intensity;
                }
            `
        };
        
        // Post-processing (à implémenter si besoin)
    }
    
    rotateObjects(x, y) {
        const rotationSpeed = 0.1;
        
        this.objects.forEach(obj => {
            if (obj.userData.selected) {
                obj.rotation.x += y * rotationSpeed;
                obj.rotation.y += x * rotationSpeed;
            } else {
                obj.rotation.x += y * rotationSpeed * 0.3;
                obj.rotation.y += x * rotationSpeed * 0.3;
            }
        });
    }
    
    zoomCamera(distance) {
        const targetZ = 3 + distance * 10;
        this.camera.position.z += (targetZ - this.camera.position.z) * 0.1;
    }
    
    selectObject(screenPosition) {
        // Convertir la position de l'écran en coordonnées 3D
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (screenPosition.x / window.innerWidth) * 2 - 1,
            -(screenPosition.y / window.innerHeight) * 2 + 1
        );
        
        raycaster.setFromCamera(mouse, this.camera);
        
        const intersects = raycaster.intersectObjects(this.objects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // Désélectionner l'objet précédent
            if (this.selectedObject) {
                this.selectedObject.material.emissive.setHex(0x000000);
                this.selectedObject.userData.selected = false;
            }
            
            // Sélectionner le nouvel objet
            this.selectedObject = object;
            this.selectedObject.material.emissive.setHex(0x444444);
            this.selectedObject.userData.selected = true;
            
            // Animation de sélection
            this.animateSelection(object);
            
            return object.userData;
        } else {
            // Désélectionner si on clique dans le vide
            if (this.selectedObject) {
                this.selectedObject.material.emissive.setHex(0x000000);
                this.selectedObject.userData.selected = false;
                this.selectedObject = null;
            }
        }
        
        return null;
    }
    
    animateSelection(object) {
        const scale = { x: 1, y: 1, z: 1 };
        const originalScale = object.scale.clone();
        
        // Animation de pulsation
        const pulse = () => {
            const time = Date.now() * 0.001;
            const pulseScale = 1 + Math.sin(time * 5) * 0.1;
            object.scale.set(
                originalScale.x * pulseScale,
                originalScale.y * pulseScale,
                originalScale.z * pulseScale
            );
        };
        
        // Stocker l'animation
        object.userData.animations.push(pulse);
    }
    
    resetCamera() {
        gsap.to(this.camera.position, {
            x: this.cameraConfig.position.x,
            y: this.cameraConfig.position.y,
            z: this.cameraConfig.position.z,
            duration: 1,
            ease: "power2.out"
        });
        
        gsap.to(this.camera.rotation, {
            x: 0,
            y: 0,
            z: 0,
            duration: 1,
            ease: "power2.out"
        });
    }
    
    nextObject() {
        if (this.objects.length === 0) return;
        
        const currentIndex = this.selectedObject 
            ? this.objects.indexOf(this.selectedObject)
            : -1;
        
        const nextIndex = (currentIndex + 1) % this.objects.length;
        const nextObject = this.objects[nextIndex];
        
        this.selectObject({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });
        
        // Animer la caméra vers l'objet
        gsap.to(this.camera.position, {
            x: nextObject.position.x,
            y: nextObject.position.y + 2,
            z: nextObject.position.z + 5,
            duration: 1,
            ease: "power2.out"
        });
    }
    
    previousObject() {
        if (this.objects.length === 0) return;
        
        const currentIndex = this.selectedObject 
            ? this.objects.indexOf(this.selectedObject)
            : -1;
        
        const prevIndex = currentIndex <= 0 
            ? this.objects.length - 1
            : currentIndex - 1;
        
        const prevObject = this.objects[prevIndex];
        
        this.selectObject({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        });
        
        // Animer la caméra vers l'objet
        gsap.to(this.camera.position, {
            x: prevObject.position.x,
            y: prevObject.position.y + 2,
            z: prevObject.position.z + 5,
            duration: 1,
            ease: "power2.out"
        });
    }
    
    updateObjectList() {
        // Cette méthode sera appelée par l'UI pour mettre à jour la liste
        if (typeof window.updateObjectList === 'function') {
            window.updateObjectList(this.objects.map(obj => obj.userData));
        }
    }
    
    animate() {
        // Animer les objets
        this.objects.forEach(obj => {
            if (obj.userData.animations) {
                obj.userData.animations.forEach(animation => animation());
            }
        });
        
        // Animation des particules
        this.scene.children.forEach(child => {
            if (child.userData && child.userData.animate) {
                child.userData.animate();
            }
        });
        
        // Rendu
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    }
    
    setupResizeHandler() {
        const resizeObserver = new ResizeObserver(() => {
            this.onWindowResize();
        });
        resizeObserver.observe(this.canvas);
    }
}