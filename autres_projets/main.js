// main.js - Point d'entrée principal
import ThreeScene from './modules/ThreeScene.js';
import GestureController from './modules/GestureController.js';
import UIOverlay from './modules/UIOverlay.js';

class GestureSpatialUI {
    constructor() {
        this.scene = null;
        this.gestureController = null;
        this.ui = null;
        
        this.isInitialized = false;
        this.lastFrameTime = 0;
        this.fps = 0;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Initialisation Gesture Spatial UI Pro...');
        
        try {
            // 1. Initialiser l'UI
            this.ui = new UIOverlay();
            
            // 2. Initialiser la scène 3D
            this.scene = new ThreeScene('threeCanvas');
            this.scene.init();
            
            // 3. Initialiser le contrôleur de gestes
            this.gestureController = new GestureController();
            await this.gestureController.init();
            
            // 4. Configurer les événements
            this.setupEventListeners();
            
            // 5. Lancer la boucle principale
            this.animate();
            
            // 6. Mettre à jour l'état
            this.ui.updateStatus('camera', true);
            this.ui.updateStatus('hand', true);
            this.ui.updateGestureFeedback('Prêt à détecter', '👋');
            
            this.isInitialized = true;
            console.log('✅ Application initialisée avec succès!');
            
        } catch (error) {
            console.error('❌ Erreur d\'initialisation:', error);
            this.ui.showError('Erreur d\'initialisation: ' + error.message);
        }
    }
    
    setupEventListeners() {
        // Événements UI
        document.getElementById('addObjectBtn').addEventListener('click', () => {
            this.scene.addRandomObject();
        });
        
        document.getElementById('resetCameraBtn').addEventListener('click', () => {
            this.scene.resetCamera();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.ui.showHelpModal();
        });
        
        document.getElementById('closeHelpModal').addEventListener('click', () => {
            this.ui.hideHelpModal();
        });
        
        // Contrôles de sensibilité
        document.getElementById('rotationSensitivity').addEventListener('input', (e) => {
            this.gestureController.setRotationSensitivity(e.target.value / 5);
        });
        
        document.getElementById('zoomSensitivity').addEventListener('input', (e) => {
            this.gestureController.setZoomSensitivity(e.target.value / 5);
        });
        
        // Toggle switches
        document.getElementById('rotationToggle').addEventListener('change', (e) => {
            this.gestureController.enableRotation(e.target.checked);
        });
        
        document.getElementById('zoomToggle').addEventListener('change', (e) => {
            this.gestureController.enableZoom(e.target.checked);
        });
        
        // Événements du contrôleur de gestes
        this.gestureController.onGesture((type, data) => {
            this.handleGesture(type, data);
        });
        
        this.gestureController.onHandDetected((handedness) => {
            this.ui.updateStatus('gesture', true);
            this.ui.updateGestureFeedback(`${handedness} détectée`, '✋');
        });
        
        this.gestureController.onHandLost(() => {
            this.ui.updateStatus('gesture', false);
            this.ui.updateGestureFeedback('En attente de main...', '👋');
        });
        
        // Redimensionnement fenêtre
        window.addEventListener('resize', () => {
            this.scene.onWindowResize();
        });
    }
    
    handleGesture(type, data) {
        switch (type) {
            case 'rotate':
                if (document.getElementById('rotationToggle').checked) {
                    this.scene.rotateObjects(data.x, data.y);
                    this.ui.updateGestureFeedback('Rotation', '🔄');
                }
                break;
                
            case 'zoom':
                if (document.getElementById('zoomToggle').checked) {
                    this.scene.zoomCamera(data.distance);
                    this.ui.updateGestureFeedback('Zoom', '🔍');
                }
                break;
                
            case 'select':
                if (document.getElementById('selectionToggle').checked) {
                    const object = this.scene.selectObject(data.position);
                    if (object) {
                        this.ui.selectObject(object.id);
                        this.ui.updateGestureFeedback('Objet sélectionné', '✅');
                    }
                }
                break;
                
            case 'menu':
                this.ui.showContextMenu(data.position);
                this.ui.updateGestureFeedback('Menu ouvert', '📋');
                break;
                
            case 'swipe_left':
                this.scene.nextObject();
                this.ui.updateGestureFeedback('Swipe gauche', '⬅️');
                break;
                
            case 'swipe_right':
                this.scene.previousObject();
                this.ui.updateGestureFeedback('Swipe droite', '➡️');
                break;
        }
    }
    
    animate(timestamp) {
        // Calculer FPS
        if (this.lastFrameTime) {
            const delta = timestamp - this.lastFrameTime;
            this.fps = Math.round(1000 / delta);
            this.ui.updateFPS(this.fps);
        }
        this.lastFrameTime = timestamp;
        
        // Mettre à jour la scène
        this.scene.animate();
        
        // Continuer l'animation
        requestAnimationFrame((t) => this.animate(t));
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Erreur plein écran: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', () => {
    const app = new GestureSpatialUI();
    
    // Exposer globalement pour le débogage
    window.app = app;
});