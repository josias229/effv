export default class GestureController {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.video = null;
        
        this.config = {
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
            smoothFactor: 0.5
        };
        
        this.state = {
            isInitialized: false,
            handsDetected: false,
            currentGesture: null,
            lastGestureTime: 0,
            gestureCooldown: 500 // ms
        };
        
        this.gestureCallbacks = {
            rotate: [],
            zoom: [],
            select: [],
            menu: [],
            swipe: []
        };
        
        this.history = {
            positions: [],
            gestures: [],
            timestamps: []
        };
        
        // Configuration des gestes
        this.gestureConfig = {
            rotationSensitivity: 1.0,
            zoomSensitivity: 1.0,
            enableRotation: true,
            enableZoom: true,
            enableSelection: true
        };
        
        // Dernière position des mains pour détection de swipe
        this.lastHandPositions = new Map();
    }
    
    async init() {
        try {
            // Initialiser la vidéo
            this.video = document.getElementById('video');
            await this.initVideo();
            
            // Initialiser MediaPipe Hands
            await this.initMediaPipe();
            
            // Démarrer la détection
            this.startDetection();
            
            this.state.isInitialized = true;
            console.log('✅ GestureController initialisé');
            
        } catch (error) {
            console.error('❌ Erreur initialisation GestureController:', error);
            throw error;
        }
    }
    
    async initVideo() {
        const constraints = {
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 }
            }
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = stream;
            
            return new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.video.play();
                    resolve();
                };
            });
        } catch (error) {
            console.error('Erreur accès caméra:', error);
            throw new Error('Impossible d\'accéder à la caméra');
        }
    }
    
    async initMediaPipe() {
        return new Promise((resolve) => {
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                }
            });
            
            this.hands.setOptions({
                maxNumHands: this.config.maxNumHands,
                modelComplexity: this.config.modelComplexity,
                minDetectionConfidence: this.config.minDetectionConfidence,
                minTrackingConfidence: this.config.minTrackingConfidence
            });
            
            this.hands.onResults((results) => {
                this.processResults(results);
            });
            
            resolve();
        });
    }
    
    startDetection() {
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.hands) {
                    await this.hands.send({ image: this.video });
                }
            },
            width: 640,
            height: 480
        });
        
        this.camera.start();
    }
    
    processResults(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
            this.state.handsDetected = false;
            this.triggerCallbacks('hand_lost', null);
            return;
        }
        
        this.state.handsDetected = true;
        
        // Traiter chaque main détectée
        results.multiHandLandmarks.forEach((landmarks, index) => {
            const handedness = results.multiHandedness[index].label;
            this.analyzeHand(landmarks, handedness, index);
        });
        
        // Historique
        this.updateHistory(results);
    }
    
    analyzeHand(landmarks, handedness, handIndex) {
        // Extraire les points clés
        const wrist = landmarks[0];
        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];
        const ring = landmarks[16];
        const pinky = landmarks[20];
        
        // Calculer les distances
        const thumbIndexDistance = this.calculateDistance(thumb, index);
        const indexMiddleDistance = this.calculateDistance(index, middle);
        
        // Détecter les gestes
        this.detectGestures(landmarks, handedness, {
            thumbIndexDistance,
            indexMiddleDistance
        });
        
        // Mettre à jour la position pour détection de swipe
        this.updateHandPosition(handIndex, wrist);
        
        // Détection de swipe
        this.detectSwipe(handIndex, wrist);
    }
    
    detectGestures(landmarks, handedness, distances) {
        const now = Date.now();
        
        // Vérifier le cooldown
        if (now - this.state.lastGestureTime < this.state.gestureCooldown) {
            return;
        }
        
        // 1. Geste de pincement (zoom)
        if (distances.thumbIndexDistance < 0.05) {
            this.state.currentGesture = 'pinch';
            this.state.lastGestureTime = now;
            
            if (this.gestureConfig.enableZoom) {
                this.triggerCallbacks('zoom', {
                    distance: distances.thumbIndexDistance * 10 * this.gestureConfig.zoomSensitivity,
                    handedness: handedness
                });
            }
        }
        
        // 2. Poing fermé (sélection)
        const isFist = this.isFist(landmarks);
        if (isFist && this.state.currentGesture !== 'fist') {
            this.state.currentGesture = 'fist';
            this.state.lastGestureTime = now;
            
            if (this.gestureConfig.enableSelection) {
                this.triggerCallbacks('select', {
                    position: {
                        x: landmarks[8].x * window.innerWidth,
                        y: landmarks[8].y * window.innerHeight
                    },
                    handedness: handedness
                });
            }
        }
        
        // 3. Signe "V" (menu)
        const isVSign = this.isVSign(landmarks);
        if (isVSign && this.state.currentGesture !== 'v_sign') {
            this.state.currentGesture = 'v_sign';
            this.state.lastGestureTime = now;
            
            this.triggerCallbacks('menu', {
                position: {
                    x: landmarks[8].x * window.innerWidth,
                    y: landmarks[8].y * window.innerHeight
                },
                handedness: handedness
            });
        }
        
        // 4. Rotation (mouvement de l'index)
        if (!isFist && !isVSign && distances.thumbIndexDistance > 0.1) {
            if (this.gestureConfig.enableRotation) {
                this.triggerCallbacks('rotate', {
                    x: landmarks[8].x * this.gestureConfig.rotationSensitivity,
                    y: landmarks[8].y * this.gestureConfig.rotationSensitivity,
                    handedness: handedness
                });
            }
        }
    }
    
    isFist(landmarks) {
        // Vérifier si tous les doigts sont repliés
        const fingerTips = [8, 12, 16, 20]; // Index, Middle, Ring, Pinky
        const fingerMCPs = [5, 9, 13, 17]; // Articulations des doigts
        
        for (let i = 0; i < fingerTips.length; i++) {
            const tip = landmarks[fingerTips[i]];
            const mcp = landmarks[fingerMCPs[i]];
            
            // Si le bout du doigt est plus haut que l'articulation (replié)
            if (tip.y < mcp.y) {
                return false;
            }
        }
        
        return true;
    }
    
    isVSign(landmarks) {
        const index = landmarks[8];
        const middle = landmarks[12];
        const ring = landmarks[16];
        const pinky = landmarks[20];
        
        // Index et majeur étendus, annulaire et auriculaire repliés
        const indexExtended = index.y < landmarks[6].y; // Index étendu
        const middleExtended = middle.y < landmarks[10].y; // Majeur étendu
        const ringFolded = ring.y > landmarks[14].y; // Annulaire replié
        const pinkyFolded = pinky.y > landmarks[18].y; // Auriculaire replié
        
        return indexExtended && middleExtended && ringFolded && pinkyFolded;
    }
    
    updateHandPosition(handIndex, wrist) {
        const position = { x: wrist.x, y: wrist.y, timestamp: Date.now() };
        
        if (!this.lastHandPositions.has(handIndex)) {
            this.lastHandPositions.set(handIndex, []);
        }
        
        const positions = this.lastHandPositions.get(handIndex);
        positions.push(position);
        
        // Garder seulement les dernières 10 positions
        if (positions.length > 10) {
            positions.shift();
        }
    }
    
    detectSwipe(handIndex, wrist) {
        const positions = this.lastHandPositions.get(handIndex);
        if (!positions || positions.length < 5) return;
        
        const first = positions[0];
        const last = positions[positions.length - 1];
        const timeDiff = last.timestamp - first.timestamp;
        
        if (timeDiff < 500) { // Swipe rapide
            const xDiff = last.x - first.x;
            const yDiff = last.y - first.y;
            
            // Seuil de détection
            if (Math.abs(xDiff) > 0.2) {
                if (xDiff > 0) {
                    this.triggerCallbacks('swipe', { direction: 'right', magnitude: xDiff });
                } else {
                    this.triggerCallbacks('swipe', { direction: 'left', magnitude: -xDiff });
                }
                
                // Réinitialiser les positions
                this.lastHandPositions.set(handIndex, []);
            }
        }
    }
    
    calculateDistance(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = point1.z - point2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    updateHistory(results) {
        const timestamp = Date.now();
        
        this.history.positions.push({
            timestamp,
            hands: results.multiHandLandmarks ? results.multiHandLandmarks.length : 0
        });
        
        this.history.gestures.push({
            timestamp,
            gesture: this.state.currentGesture
        });
        
        // Limiter la taille de l'historique
        if (this.history.positions.length > 100) {
            this.history.positions.shift();
            this.history.gestures.shift();
        }
    }
    
    triggerCallbacks(type, data) {
        if (this.gestureCallbacks[type]) {
            this.gestureCallbacks[type].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Erreur callback ${type}:`, error);
                }
            });
        }
        
        // Callbacks généraux
        if (type === 'rotate' || type === 'zoom' || type === 'select' || type === 'menu') {
            this.gestureCallbacks.gesture?.forEach(callback => {
                callback(type, data);
            });
        }
    }
    
    // API publique
    onGesture(callback) {
        this.gestureCallbacks.gesture.push(callback);
    }
    
    onHandDetected(callback) {
        this.gestureCallbacks.hand_detected = [callback];
    }
    
    onHandLost(callback) {
        this.gestureCallbacks.hand_lost = [callback];
    }
    
    setRotationSensitivity(value) {
        this.gestureConfig.rotationSensitivity = value;
    }
    
    setZoomSensitivity(value) {
        this.gestureConfig.zoomSensitivity = value;
    }
    
    enableRotation(enabled) {
        this.gestureConfig.enableRotation = enabled;
    }
    
    enableZoom(enabled) {
        this.gestureConfig.enableZoom = enabled;
    }
    
    enableSelection(enabled) {
        this.gestureConfig.enableSelection = enabled;
    }
    
    getStats() {
        return {
            initialized: this.state.isInitialized,
            handsDetected: this.state.handsDetected,
            currentGesture: this.state.currentGesture,
            historySize: this.history.positions.length,
            config: this.gestureConfig
        };
    }
}