export default class UIOverlay {
    constructor() {
        this.elements = {};
        this.state = {
            selectedObject: null,
            fullscreen: false,
            showHelp: false,
            contextMenu: null
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateObjectList([]); // Initialiser liste vide
    }
    
    cacheElements() {
        this.elements = {
            gestureFeedback: document.getElementById('gestureFeedback'),
            gestureIcon: document.getElementById('gestureIcon'),
            gestureText: document.getElementById('gestureText'),
            cameraStatus: document.getElementById('cameraStatus').querySelector('.status-dot'),
            handStatus: document.getElementById('handStatus').querySelector('.status-dot'),
            gestureStatus: document.getElementById('gestureStatus').querySelector('.status-dot'),
            objectList: document.getElementById('objectList'),
            fpsCounter: document.getElementById('fpsCounter'),
            latencyCounter: document.getElementById('latencyCounter'),
            helpModal: document.getElementById('helpModal'),
            contextMenu: document.getElementById('contextMenu')
        };
    }
    
    bindEvents() {
        // Context menu
        document.addEventListener('click', (e) => {
            if (!this.elements.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
        
        // Context menu items
        document.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleContextAction(action);
                this.hideContextMenu();
            });
        });
        
        // Exposer la fonction de mise à jour de la liste d'objets
        window.updateObjectList = (objects) => {
            this.updateObjectList(objects);
        };
    }
    
    updateStatus(type, active) {
        const element = this.elements[`${type}Status`];
        if (element) {
            element.classList.toggle('active', active);
        }
    }
    
    updateGestureFeedback(text, icon = '👋') {
        if (this.elements.gestureIcon) {
            this.elements.gestureIcon.textContent = icon;
        }
        if (this.elements.gestureText) {
            this.elements.gestureText.textContent = text;
        }
        
        // Animation de feedback
        this.elements.gestureFeedback.style.animation = 'none';
        setTimeout(() => {
            this.elements.gestureFeedback.style.animation = 'pulse 2s infinite';
        }, 10);
    }
    
    updateObjectList(objects) {
        const container = this.elements.objectList;
        if (!container) return;
        
        container.innerHTML = '';
        
        objects.forEach(obj => {
            const item = this.createObjectListItem(obj);
            container.appendChild(item);
        });
    }
    
    createObjectListItem(obj) {
        const div = document.createElement('div');
        div.className = `object-item ${obj.selected ? 'selected' : ''}`;
        div.dataset.id = obj.id;
        
        // Couleur
        const colorDiv = document.createElement('div');
        colorDiv.className = 'object-color';
        colorDiv.style.backgroundColor = `#${obj.color.toString(16).padStart(6, '0')}`;
        
        // Nom
        const nameSpan = document.createElement('span');
        nameSpan.className = 'object-name';
        nameSpan.textContent = obj.name;
        
        // Actions
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'object-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteObject(obj.id);
        };
        
        const colorBtn = document.createElement('button');
        colorBtn.className = 'icon-btn';
        colorBtn.innerHTML = '<i class="fas fa-palette"></i>';
        colorBtn.onclick = (e) => {
            e.stopPropagation();
            this.changeObjectColor(obj.id);
        };
        
        actionsDiv.appendChild(colorBtn);
        actionsDiv.appendChild(deleteBtn);
        
        div.appendChild(colorDiv);
        div.appendChild(nameSpan);
        div.appendChild(actionsDiv);
        
        // Sélection
        div.onclick = () => {
            this.selectObject(obj.id);
        };
        
        return div;
    }
    
    selectObject(id) {
        // Mettre à jour la sélection visuelle
        document.querySelectorAll('.object-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.id === id.toString()) {
                item.classList.add('selected');
            }
        });
        
        this.state.selectedObject = id;
        
        // Notifier l'application
        if (window.app && window.app.scene) {
            // Simuler un clic au centre pour sélection
            window.app.scene.selectObject({
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            });
        }
    }
    
    deleteObject(id) {
        if (confirm('Supprimer cet objet ?')) {
            // Implémenter la suppression dans ThreeScene
            if (window.app && window.app.scene) {
                // À implémenter dans ThreeScene
                console.log('Supprimer objet:', id);
            }
        }
    }
    
    changeObjectColor(id) {
        const colors = [
            0x6366f1, 0x10b981, 0x8b5cf6, 
            0xf59e0b, 0xef4444, 0xec4899
        ];
        
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Mettre à jour dans ThreeScene
        if (window.app && window.app.scene) {
            // À implémenter dans ThreeScene
            console.log('Changer couleur objet:', id, randomColor);
        }
    }
    
    updateFPS(fps) {
        if (this.elements.fpsCounter) {
            this.elements.fpsCounter.textContent = fps;
            this.elements.fpsCounter.style.color = 
                fps > 50 ? '#22c55e' : 
                fps > 30 ? '#f59e0b' : 
                '#ef4444';
        }
    }
    
    updateLatency(latency) {
        if (this.elements.latencyCounter) {
            this.elements.latencyCounter.textContent = `${latency}ms`;
        }
    }
    
    showHelpModal() {
        this.elements.helpModal.classList.add('active');
        this.state.showHelp = true;
    }
    
    hideHelpModal() {
        this.elements.helpModal.classList.remove('active');
        this.state.showHelp = false;
    }
    
    showContextMenu(position) {
        const menu = this.elements.contextMenu;
        menu.style.left = `${position.x}px`;
        menu.style.top = `${position.y}px`;
        menu.classList.add('active');
        this.state.contextMenu = position;
    }
    
    hideContextMenu() {
        this.elements.contextMenu.classList.remove('active');
        this.state.contextMenu = null;
    }
    
    handleContextAction(action) {
        console.log('Action contextuelle:', action);
        
        switch(action) {
            case 'duplicate':
                if (window.app && window.app.scene) {
                    window.app.scene.addRandomObject();
                }
                break;
            case 'color':
                if (this.state.selectedObject) {
                    this.changeObjectColor(this.state.selectedObject);
                }
                break;
            case 'delete':
                if (this.state.selectedObject) {
                    this.deleteObject(this.state.selectedObject);
                }
                break;
            case 'animate':
                // Implémenter l'animation
                break;
        }
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="close-btn">&times;</button>
        `;
        
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        errorDiv.querySelector('.close-btn').onclick = () => {
            errorDiv.remove();
        };
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove après 5 secondes
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }
    
    showNotification(message, type = 'info') {
        const colors = {
            info: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444'
        };
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <span class="notification-icon">${icons[type]}</span>
            <span class="notification-text">${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideUp 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove après 3 secondes
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideDown 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
}