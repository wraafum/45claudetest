// DOM Elements Management System
// Centralized DOM element references with lazy loading and error handling

// DOM Elements Module Factory
function createDOMElementsModule() {
    // Cache for DOM elements
    const elementCache = new Map();
    
    // Test mode detection - check if we're in a testing environment
    function isTestMode() {
        // Check for test indicators
        const hasTestPage = document.title.includes('Test') || window.location.pathname.includes('test');
        const hasMockGameData = window.gameData && Object.keys(window.gameData.characters || {}).length < 5;
        const hasTestResults = document.getElementById('test-results');
        
        return hasTestPage || hasMockGameData || hasTestResults;
    }
    
    // Element selectors and their descriptions
    const elementMap = {
        // Game Container
        gameContainer: { selector: '#game-container', description: 'Main game container' },
        
        // Left Panel Elements
        leftPanel: { selector: '#left-panel', description: 'Left panel container' },
        leftPanelTitle: { selector: '#left-panel-title', description: 'Left panel title' },
        activeCharacterContainer: { selector: '#active-character-container', description: 'Active character container' },
        activeCharacterDisplay: { selector: '#active-character-display', description: 'Active character display area' },
        activeCharacterName: { selector: '#active-character-name', description: 'Active character name display' },
        activeCharacterTitle: { selector: '#active-character-title', description: 'Active character title display' },
        characterClickArea: { selector: '#character-click-area', description: 'Character click area' },
        activeCharacterImage: { selector: '#active-character-image', description: 'Active character image' },
        clickEffect: { selector: '#click-effect', description: 'Click effect animation container' },
        characterStats: { selector: '#character-stats', description: 'Character stats display' },
        characterLevel: { selector: '#character-level', description: 'Character level display' },
        characterBond: { selector: '#character-bond', description: 'Character bond display' },
        characterProduction: { selector: '#character-production', description: 'Character production display' },
        characterComment: { selector: '#character-comment', description: 'Character comment display' },
        gameStatsFooter: { selector: '#game-stats-footer', description: 'Game stats footer' },
        lustPointsDisplay: { selector: '#lust-points-display', description: 'Lust points display' },
        lustPoints: { selector: '#lust-points', description: 'Lust points value' },
        lustPerSecond: { selector: '#lust-per-second', description: 'Lust per second display' },
        lps: { selector: '#lps', description: 'LPS value' },
        
        // Center Panel Elements
        centerPanel: { selector: '#center-panel', description: 'Center panel container' },
        centerPanelTitle: { selector: '#center-panel-title', description: 'Center panel title' },
        centerPanelControls: { selector: '#center-panel-controls', description: 'Center panel controls' },
        mainCharacterDisplay: { selector: '#main-character-display', description: 'Main character display area' },
        welcomeScreen: { selector: '#welcome-screen', description: 'Welcome screen' },
        startGameBtn: { selector: '#start-game-btn', description: 'Start game button' },
        
        // Right Panel Elements
        rightPanel: { selector: '#right-panel', description: 'Right panel container' },
        charactersTab: { selector: '#characters-tab', description: 'Characters tab button' },
        buildingsTab: { selector: '#buildings-tab', description: 'Buildings tab button' },
        charactersContent: { selector: '#characters-content', description: 'Characters content area' },
        charactersList: { selector: '#characters-list', description: 'Characters list' },
        buildingsContent: { selector: '#buildings-content', description: 'Buildings content area' },
        buildingsList: { selector: '#buildings-list', description: 'Buildings list' },
        rightPanelFooter: { selector: '#right-panel-footer', description: 'Right panel footer' },
        gameVersion: { selector: '#game-version', description: 'Game version display' },
        saveStatus: { selector: '#save-status', description: 'Save status display' },
        
        // Modal Elements
        modalContainer: { selector: '#modal-container', description: 'Modal container' },
        storyModal: { selector: '#story-modal', description: 'Story event modal' },
        storyModalContent: { selector: '#story-modal-content', description: 'Story modal content' },
        gardenModal: { selector: '#garden-modal', description: 'Garden modal' },
        gardenPlots: { selector: '#garden-plots', description: 'Garden plots container' },
        seedList: { selector: '#seed-list', description: 'Seed list container' },
        
        // Notification & UI Elements
        notificationContainer: { selector: '#notification-container', description: 'Notification container' },
        loadingScreen: { selector: '#loading-screen', description: 'Loading screen' },
        
        // Audio Elements
        clickSound: { selector: '#click-sound', description: 'Click sound audio' },
        crystalSound: { selector: '#crystal-sound', description: 'Crystal sound audio' },
        notificationSound: { selector: '#notification-sound', description: 'Notification sound audio' },
        
        // Top Status Bar Elements
        girlsCount: { selector: '#girls-count', description: 'Girls count display' },
        activeGirlName: { selector: '#active-girl-name', description: 'Active girl name display' },
        lustAmount: { selector: '#lust-amount', description: 'Lust amount display' },
        sparksAmount: { selector: '#sparks-amount', description: 'Sparks amount display' },
        essenceAmount: { selector: '#essence-amount', description: 'Essence amount display' },
        goldAmount: { selector: '#gold-amount', description: 'Gold amount display' },
        
        // News Ticker Elements
        newsTickerContainer: { selector: '#news-ticker-container', description: 'News ticker container' },
        newsTickerText: { selector: '#news-ticker-text', description: 'News ticker text display' }
    };
    
    // Get element with caching and error handling
    function getElement(key, options = {}) {
        const { required = false, cache = true, refresh = false } = options;
        
        // Check cache first (unless refresh is requested)
        if (cache && !refresh && elementCache.has(key)) {
            return elementCache.get(key);
        }
        
        const elementInfo = elementMap[key];
        if (!elementInfo) {
            const error = new Error(`Unknown element key: ${key}`);
            if (required) throw error;
            console.warn(error.message);
            return null;
        }
        
        const element = document.querySelector(elementInfo.selector);
        
        if (!element) {
            const error = new Error(`Element not found: ${elementInfo.selector} (${elementInfo.description})`);
            if (required) throw error;
            
            // Use different logging based on test mode
            if (isTestMode()) {
                console.log(`🧪 Test Mode - Missing element: ${elementInfo.selector}`);
            } else {
                console.warn(error.message);
            }
            return null;
        }
        
        // Cache the element
        if (cache) {
            elementCache.set(key, element);
        }
        
        return element;
    }
    
    // Get multiple elements at once
    function getElements(keys, options = {}) {
        const result = {};
        const errors = [];
        
        for (const key of keys) {
            try {
                result[key] = getElement(key, options);
            } catch (error) {
                errors.push(error);
            }
        }
        
        if (errors.length > 0 && options.required) {
            throw new Error(`Multiple element errors: ${errors.map(e => e.message).join(', ')}`);
        }
        
        return result;
    }
    
    // Check if element exists
    function elementExists(key) {
        const elementInfo = elementMap[key];
        if (!elementInfo) return false;
        return !!document.querySelector(elementInfo.selector);
    }
    
    // Wait for element to appear in DOM
    function waitForElement(key, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const elementInfo = elementMap[key];
            if (!elementInfo) {
                reject(new Error(`Unknown element key: ${key}`));
                return;
            }
            
            const element = document.querySelector(elementInfo.selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(elementInfo.selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Timeout
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Element ${elementInfo.selector} not found within ${timeout}ms`));
            }, timeout);
        });
    }
    
    // Clear cache
    function clearCache(key = null) {
        if (key) {
            elementCache.delete(key);
        } else {
            elementCache.clear();
        }
    }
    
    // Initialize all core elements and cache them
    function initializeElements() {
        const coreElements = [
            'gameContainer', 'leftPanel', 'centerPanel', 'rightPanel',
            'activeCharacterDisplay', 'mainCharacterDisplay', 'charactersList',
            'lustPoints', 'lustPerSecond', 'centerPanelTitle'
        ];
        
        const elements = {};
        const missingElements = [];
        
        for (const key of coreElements) {
            try {
                elements[key] = getElement(key, { cache: true });
                if (!elements[key]) {
                    missingElements.push(key);
                }
            } catch (error) {
                missingElements.push(key);
                console.error(`Failed to initialize element ${key}:`, error);
            }
        }
        
        if (missingElements.length > 0) {
            if (isTestMode()) {
                console.log('🧪 Test Mode - Some elements not found (expected in test environment):', missingElements);
            } else {
                console.warn('Missing core elements:', missingElements);
            }
        }
        
        console.log('DOM Elements initialized:', Object.keys(elements).length, 'elements cached');
        return elements;
    }
    
    // Add event listeners with error handling
    function addEventListener(elementKey, event, handler, options = {}) {
        const element = getElement(elementKey);
        if (!element) {
            console.warn(`Cannot add event listener to ${elementKey}: element not found`);
            return false;
        }
        
        try {
            element.addEventListener(event, handler, options);
            return true;
        } catch (error) {
            console.error(`Failed to add event listener to ${elementKey}:`, error);
            return false;
        }
    }
    
    // Remove event listeners
    function removeEventListener(elementKey, event, handler, options = {}) {
        const element = getElement(elementKey);
        if (!element) {
            console.warn(`Cannot remove event listener from ${elementKey}: element not found`);
            return false;
        }
        
        try {
            element.removeEventListener(event, handler, options);
            return true;
        } catch (error) {
            console.error(`Failed to remove event listener from ${elementKey}:`, error);
            return false;
        }
    }
    
    // Set element content safely
    function setContent(elementKey, content, options = {}) {
        const { html = false } = options;
        const element = getElement(elementKey);
        
        if (!element) {
            console.warn(`Cannot set content for ${elementKey}: element not found`);
            return false;
        }
        
        try {
            if (html) {
                element.innerHTML = content;
            } else {
                element.textContent = content;
            }
            return true;
        } catch (error) {
            console.error(`Failed to set content for ${elementKey}:`, error);
            return false;
        }
    }
    
    // Get element content
    function getContent(elementKey, options = {}) {
        const { html = false } = options;
        const element = getElement(elementKey);
        
        if (!element) {
            console.warn(`Cannot get content from ${elementKey}: element not found`);
            return null;
        }
        
        return html ? element.innerHTML : element.textContent;
    }
    
    // Show/hide elements
    function show(elementKey, display = 'block') {
        const element = getElement(elementKey);
        if (element) {
            element.style.display = display;
            return true;
        }
        return false;
    }
    
    function hide(elementKey) {
        const element = getElement(elementKey);
        if (element) {
            element.style.display = 'none';
            return true;
        }
        return false;
    }
    
    // Toggle element visibility
    function toggle(elementKey, display = 'block') {
        const element = getElement(elementKey);
        if (element) {
            element.style.display = element.style.display === 'none' ? display : 'none';
            return true;
        }
        return false;
    }
    
    // Add/remove CSS classes
    function addClass(elementKey, className) {
        const element = getElement(elementKey);
        if (element) {
            element.classList.add(className);
            return true;
        }
        return false;
    }
    
    function removeClass(elementKey, className) {
        const element = getElement(elementKey);
        if (element) {
            element.classList.remove(className);
            return true;
        }
        return false;
    }
    
    function toggleClass(elementKey, className) {
        const element = getElement(elementKey);
        if (element) {
            element.classList.toggle(className);
            return true;
        }
        return false;
    }
    
    function hasClass(elementKey, className) {
        const element = getElement(elementKey);
        return element ? element.classList.contains(className) : false;
    }
    
    // Set element attributes
    function setAttribute(elementKey, attribute, value) {
        const element = getElement(elementKey);
        if (element) {
            element.setAttribute(attribute, value);
            return true;
        }
        return false;
    }
    
    function getAttribute(elementKey, attribute) {
        const element = getElement(elementKey);
        return element ? element.getAttribute(attribute) : null;
    }
    
    // Create and append elements
    function createElement(tag, options = {}) {
        const { 
            className = '', 
            id = '', 
            innerHTML = '', 
            textContent = '', 
            attributes = {},
            style = {}
        } = options;
        
        const element = document.createElement(tag);
        
        if (className) element.className = className;
        if (id) element.id = id;
        if (innerHTML) element.innerHTML = innerHTML;
        if (textContent) element.textContent = textContent;
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        // Set styles
        Object.entries(style).forEach(([key, value]) => {
            element.style[key] = value;
        });
        
        return element;
    }
    
    function appendTo(elementKey, child) {
        const element = getElement(elementKey);
        if (element && child) {
            element.appendChild(child);
            return true;
        }
        return false;
    }
    
    function prependTo(elementKey, child) {
        const element = getElement(elementKey);
        if (element && child) {
            element.insertBefore(child, element.firstChild);
            return true;
        }
        return false;
    }
    
    // Clear element content
    function clear(elementKey) {
        const element = getElement(elementKey);
        if (element) {
            element.innerHTML = '';
            return true;
        }
        return false;
    }
    
    // Element validation and debugging
    function validateElements() {
        const results = {};
        const errors = [];
        
        Object.keys(elementMap).forEach(key => {
            const exists = elementExists(key);
            results[key] = exists;
            
            if (!exists) {
                errors.push({
                    key,
                    selector: elementMap[key].selector,
                    description: elementMap[key].description
                });
            }
        });
        
        console.log('Element validation results:', {
            total: Object.keys(elementMap).length,
            found: Object.values(results).filter(Boolean).length,
            missing: errors.length
        });
        
        if (errors.length > 0) {
            if (isTestMode()) {
                console.log('🧪 Test Mode - Element validation results:', errors);
            } else {
                console.warn('Missing elements:', errors);
            }
        }
        
        return { results, errors };
    }
    
    // Module cleanup
    function cleanup() {
        clearCache();
        console.log('DOM Elements module cleanup complete');
    }
    
    // Return module interface
    return {
        // Core functions
        get: getElement,
        getAll: getElements,
        exists: elementExists,
        wait: waitForElement,
        
        // Event handling
        on: addEventListener,
        off: removeEventListener,
        
        // Content management
        setContent,
        getContent,
        clear,
        
        // Visibility
        show,
        hide,
        toggle,
        
        // CSS classes
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        
        // Attributes
        setAttribute,
        getAttribute,
        
        // Element creation
        createElement,
        appendTo,
        prependTo,
        
        // Cache management
        clearCache,
        
        // Initialization and validation
        initialize: initializeElements,
        validate: validateElements,
        
        // Utilities
        elementMap,
        
        // Module lifecycle
        cleanup
    };
}

// Create and expose the DOM elements module
window.domElements = createDOMElementsModule();

// Initialize elements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.domElements.initialize();
    });
} else {
    window.domElements.initialize();
}

// Module manager integration - wait for enhanced module manager
function registerWithModuleManager() {
    if (window.gameModules && window.gameModules.registerModule) {
        try {
            window.gameModules.registerModule('domElements', () => window.domElements, []);
            console.log('📦 DOM Elements registered with module manager');
        } catch (error) {
            console.warn('Failed to register DOM Elements with module manager:', error);
        }
    } else {
        // Try again in 100ms if module manager isn't ready
        setTimeout(registerWithModuleManager, 100);
    }
}

// Register immediately if available, otherwise wait
registerWithModuleManager();

console.log('DOM Elements module loaded successfully');