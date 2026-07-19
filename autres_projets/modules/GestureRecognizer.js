export default class GestureRecognizer {
    constructor() {
        this.gestures = new Map();
        this.history = [];
        this.config = {
            historySize: 30,
            recognitionThreshold: 0.8,
            cooldown: 1000
        };
        
        this.defineGestures();
    }
    
    defineGestures() {
        // Geste: Swipe Droite
        this.addGesture('swipe_right', [
            { type: 'movement', direction: 'right', speed: 'fast', minDistance: 0.2 }
        ]);
        
        // Geste: Swipe Gauche
        this.addGesture('swipe_left', [
            { type: 'movement', direction: 'left', speed: 'fast', minDistance: 0.2 }
        ]);
        
        // Geste: Cercle (rotation)
        this.addGesture('circle', [
            { type: 'circular', direction: 'clockwise', minRadius: 0.1 }
        ]);
        
        // Geste: Tap
        this.addGesture('tap', [
            { type: 'still', duration: 'short' },
            { type: 'movement', direction: 'down', speed: 'fast' },
            { type: 'movement', direction: 'up', speed: 'fast' }
        ]);
        
        // Geste: Double Tap
        this.addGesture('double_tap', [
            { type: 'tap' },
            { type: 'pause', duration: 'short' },
            { type: 'tap' }
        ]);
    }
    
    addGesture(name, pattern) {
        this.gestures.set(name, {
            pattern,
            lastRecognized: 0
        });
    }
    
    analyzeHand(landmarks, timestamp) {
        // Ajouter à l'historique
        this.history.push({
            timestamp,
            landmarks: landmarks.map(l => ({ x: l.x, y: l.y, z: l.z })),
            keyPoints: this.extractKeyPoints(landmarks)
        });
        
        // Limiter la taille de l'historique
        if (this.history.length > this.config.historySize) {
            this.history.shift();
        }
        
        // Analyser pour chaque geste
        const recognizedGestures = [];
        
        for (const [gestureName, gestureData] of this.gestures) {
            // Vérifier le cooldown
            if (timestamp - gestureData.lastRecognized < this.config.cooldown) {
                continue;
            }
            
            if (this.recognizeGesture(gestureName, gestureData.pattern)) {
                gestureData.lastRecognized = timestamp;
                recognizedGestures.push(gestureName);
            }
        }
        
        return recognizedGestures;
    }
    
    recognizeGesture(gestureName, pattern) {
        if (this.history.length < 2) return false;
        
        switch(gestureName) {
            case 'swipe_right':
                return this.detectSwipe('right');
            case 'swipe_left':
                return this.detectSwipe('left');
            case 'circle':
                return this.detectCircle();
            case 'tap':
                return this.detectTap();
            case 'double_tap':
                return this.detectDoubleTap();
            default:
                return false;
        }
    }
    
    detectSwipe(direction) {
        const recent = this.history.slice(-5);
        if (recent.length < 3) return false;
        
        const first = recent[0].landmarks[8]; // Index fingertip
        const last = recent[recent.length - 1].landmarks[8];
        
        const dx = last.x - first.x;
        const dy = last.y - first.y;
        
        // Horizontal dominant
        if (Math.abs(dx) < Math.abs(dy) * 2) return false;
        
        if (direction === 'right' && dx > 0.2) return true;
        if (direction === 'left' && dx < -0.2) return true;
        
        return false;
    }
    
    detectCircle() {
        const recent = this.history.slice(-20);
        if (recent.length < 10) return false;
        
        // Extraire les positions de l'index
        const points = recent.map(h => h.landmarks[8]);
        
        // Calculer le centre
        const center = {
            x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
            y: points.reduce((sum, p) => sum + p.y, 0) / points.length
        };
        
        // Calculer les distances et angles
        let consistentRadius = true;
        let consistentDirection = true;
        let lastAngle = null;
        let angleSum = 0;
        
        for (let i = 0; i < points.length; i++) {
            const dx = points[i].x - center.x;
            const dy = points[i].y - center.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);
            
            if (i > 0) {
                const radiusDiff = Math.abs(radius - lastRadius);
                if (radiusDiff > 0.1) consistentRadius = false;
                
                const angleDiff = angle - lastAngle;
                angleSum += angleDiff;
            }
            
            lastRadius = radius;
            lastAngle = angle;
        }
        
        // Vérifier si c'est un cercle complet (≈2π)
        return consistentRadius && Math.abs(angleSum) > 5;
    }
    
    detectTap() {
        const recent = this.history.slice(-10);
        if (recent.length < 5) return false;
        
        // Chercher un mouvement rapide vers le bas puis vers le haut
        let downDetected = false;
        let upDetected = false;
        
        for (let i = 1; i < recent.length; i++) {
            const dy = recent[i].landmarks[8].y - recent[i-1].landmarks[8].y;
            
            if (!downDetected && dy > 0.05) {
                downDetected = true;
            } else if (downDetected && !upDetected && dy < -0.05) {
                upDetected = true;
            }
        }
        
        return downDetected && upDetected;
    }
    
    detectDoubleTap() {
        // Recherche de deux taps rapprochés
        const taps = [];
        
        for (let i = 0; i < this.history.length - 5; i++) {
            const slice = this.history.slice(i, i + 5);
            if (this.detectTapInSlice(slice)) {
                taps.push(this.history[i + 2].timestamp); // Milieu du tap
            }
        }
        
        if (taps.length >= 2) {
            const lastTwo = taps.slice(-2);
            return (lastTwo[1] - lastTwo[0]) < 500; // Deux taps en moins de 500ms
        }
        
        return false;
    }
    
    detectTapInSlice(slice) {
        // Version simplifiée pour détection dans une tranche
        if (slice.length < 3) return false;
        
        const first = slice[0].landmarks[8];
        const middle = slice[Math.floor(slice.length/2)].landmarks[8];
        const last = slice[slice.length-1].landmarks[8];
        
        const downMove = middle.y - first.y > 0.03;
        const upMove = last.y - middle.y < -0.03;
        
        return downMove && upMove;
    }
    
    extractKeyPoints(landmarks) {
        return {
            wrist: landmarks[0],
            thumb: landmarks[4],
            index: landmarks[8],
            middle: landmarks[12],
            ring: landmarks[16],
            pinky: landmarks[20],
            
            // Paume (moyenne des points de la paume)
            palm: {
                x: (landmarks[0].x + landmarks[5].x + landmarks[9].x + landmarks[13].x + landmarks[17].x) / 5,
                y: (landmarks[0].y + landmarks[5].y + landmarks[9].y + landmarks[13].y + landmarks[17].y) / 5,
                z: (landmarks[0].z + landmarks[5].z + landmarks[9].z + landmarks[13].z + landmarks[17].z) / 5
            }
        };
    }
    
    reset() {
        this.history = [];
    }
    
    getStats() {
        return {
            definedGestures: this.gestures.size,
            historySize: this.history.length,
            config: this.config
        };
    }
}