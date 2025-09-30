// Character Expression System - Dynamic Character Portraits
// Wszystkie Moje Potwory

function createExpressionModule(dependencies, moduleManager) {
    const { domElements, animations } = dependencies || {};
    
    console.log('😊 Expression Module created');
    
    // Expression system state
    const expressionState = {
        currentExpressions: new Map(), // characterId -> current expression
        preloadedImages: new Map(),    // imageUrl -> Image object
        transitionQueue: [],
        isTransitioning: false
    };
    
    // Expression system enabled/disabled flags
    const expressionFlags = {
        szafran: false,  // Disabled until proper images are ready for introduction
        furia: false,    // Keep other characters disabled for now
        momo: false,     // Keep other characters disabled for now
        default: false   // Global disable flag
    };

    // Character expression definitions with available CG assets
    const characterExpressions = {
        szafran: {
            // CG images available but disabled for introduction phase
            // Will be enabled when proper introduction images are ready
            expressions: {
                idle: 'imgs/cg/szafran/szafran_1.png',          // Default calm state
                happy: 'imgs/cg/szafran/szafran_2.png',         // Joyful, bond 100+
                shy: 'imgs/cg/szafran/szafran_3.png',           // Bashful, first interactions
                content: 'imgs/cg/szafran/szafran_4.png',       // Satisfied, bond 300+
                excited: 'imgs/cg/szafran/szafran_5.png',       // Enthusiastic, story events
                serene: 'imgs/cg/szafran/szafran_6.png',        // Peaceful, bond 500+
                intimate: 'imgs/cg/szafran/szafran_7.png',      // Close, bond 1000+
                blissful: 'imgs/cg/szafran/szafran_8.png'       // Ultimate bond, 2000+
            },
            bondMapping: [
                { min: 0, max: 50, expression: 'shy' },
                { min: 50, max: 150, expression: 'idle' },
                { min: 150, max: 350, expression: 'happy' },
                { min: 350, max: 600, expression: 'content' },
                { min: 600, max: 1200, expression: 'serene' },
                { min: 1200, max: 2500, expression: 'intimate' },
                { min: 2500, max: 999999, expression: 'blissful' }
            ],
            hoverExpression: 'excited',
            clickExpression: 'happy',
            enabled: false  // DISABLED for introduction phase
        },
        
        // For other characters, use concept art as fallbacks (also disabled)
        furia: {
            expressions: {
                idle: 'imgs/avatars/furia_avatar.png',
                happy: 'imgs/characters/furia.png',
                excited: 'imgs/click/furia_click.png'
            },
            bondMapping: [
                { min: 0, max: 100, expression: 'idle' },
                { min: 100, max: 500, expression: 'happy' },
                { min: 500, max: 999999, expression: 'excited' }
            ],
            hoverExpression: 'happy',
            clickExpression: 'excited',
            enabled: false  // DISABLED
        },
        
        momo: {
            expressions: {
                idle: 'imgs/avatars/momo_avatar.png',
                happy: 'imgs/characters/momo.png',
                excited: 'imgs/click/momo_click.png'
            },
            bondMapping: [
                { min: 0, max: 100, expression: 'idle' },
                { min: 100, max: 500, expression: 'happy' },
                { min: 500, max: 999999, expression: 'excited' }
            ],
            hoverExpression: 'happy',
            clickExpression: 'excited',
            enabled: false  // DISABLED
        },
        
        // Default expression system for characters without specific CG
        default: {
            expressions: {
                idle: null, // Will use character.avatar
                happy: null, // Will use character.image
                excited: null // Will use character.clickImage
            },
            bondMapping: [
                { min: 0, max: 200, expression: 'idle' },
                { min: 200, max: 800, expression: 'happy' },
                { min: 800, max: 999999, expression: 'excited' }
            ],
            hoverExpression: 'happy',
            clickExpression: 'excited',
            enabled: false  // DISABLED by default
        }
    };
    
    // Initialize expression system
    function initialize() {
        console.log('😊 Initializing expression system...');
        
        // Preload critical expression images
        preloadExpressionImages();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Expression system initialized');
        return true;
    }
    
    // Preload expression images for better performance
    function preloadExpressionImages() {
        Object.keys(characterExpressions).forEach(characterId => {
            if (characterId === 'default') return;
            
            const expressions = characterExpressions[characterId].expressions;
            Object.values(expressions).forEach(imageUrl => {
                if (imageUrl && !expressionState.preloadedImages.has(imageUrl)) {
                    preloadImage(imageUrl);
                }
            });
        });
    }
    
    // Preload single image
    function preloadImage(url) {
        const img = new Image();
        img.onload = () => {
            expressionState.preloadedImages.set(url, img);
            console.log(`😊 Preloaded expression: ${url}`);
        };
        img.onerror = () => {
            console.warn(`😞 Failed to preload expression: ${url}`);
        };
        img.src = url;
    }
    
    // Setup event listeners for expression changes
    function setupEventListeners() {
        // Bond progression changes
        window.addEventListener('bondIncrease', handleBondChange);
        
        // Character selection changes
        window.addEventListener('characterChanged', handleCharacterChange);
        
        // Story milestone events
        window.addEventListener('storyMilestone', handleStoryMilestone);
        
        // Mouse interactions
        window.addEventListener('characterHover', handleCharacterHover);
        window.addEventListener('characterClick', handleCharacterClick);
    }
    
    // Handle bond progression expression changes
    function handleBondChange(event) {
        const { characterId } = event.detail || {};
        if (!characterId) return;
        
        updateCharacterExpression(characterId);
    }
    
    // Handle character selection
    function handleCharacterChange(event) {
        const { characterId } = event.detail || {};
        if (!characterId) return;
        
        // Set initial expression for character
        updateCharacterExpression(characterId);
    }
    
    // Handle story milestones
    function handleStoryMilestone(event) {
        const { characterId, milestone } = event.detail || {};
        if (!characterId) return;
        
        // Temporarily show excited expression for story events
        setTemporaryExpression(characterId, 'excited', 3000);
    }
    
    // Handle character hover
    function handleCharacterHover(event) {
        const { characterId, isHovering } = event.detail || {};
        if (!characterId) return;
        
        if (isHovering) {
            const expressionData = getCharacterExpressionData(characterId);
            if (expressionData.hoverExpression) {
                setTemporaryExpression(characterId, expressionData.hoverExpression, 1000);
            }
        }
    }
    
    // Handle character click
    function handleCharacterClick(event) {
        const { characterId } = event.detail || {};
        if (!characterId) return;
        
        const expressionData = getCharacterExpressionData(characterId);
        if (expressionData.clickExpression) {
            setTemporaryExpression(characterId, expressionData.clickExpression, 2000);
        }
    }
    
    // Check if expressions are enabled for a character
    function isExpressionsEnabled(characterId) {
        const expressionData = getCharacterExpressionData(characterId);
        return expressionData.enabled === true;
    }

    // Update character expression based on current bond level
    function updateCharacterExpression(characterId) {
        if (!window.gameData || !window.gameData.characters[characterId]) return;
        
        // Check if expressions are enabled for this character
        if (!isExpressionsEnabled(characterId)) {
            console.log(`😊 Expressions disabled for ${characterId} - skipping update`);
            return;
        }
        
        const character = window.gameData.characters[characterId];
        const bondPoints = character.bondPoints || 0;
        const expressionData = getCharacterExpressionData(characterId);
        
        // Find appropriate expression for current bond level
        const bondMapping = expressionData.bondMapping || [];
        let targetExpression = 'idle';
        
        for (const mapping of bondMapping) {
            if (bondPoints >= mapping.min && bondPoints < mapping.max) {
                targetExpression = mapping.expression;
                break;
            }
        }
        
        setCharacterExpression(characterId, targetExpression);
    }
    
    // Set temporary expression (for events, hovers, clicks)
    function setTemporaryExpression(characterId, expression, duration) {
        // Check if expressions are enabled for this character
        if (!isExpressionsEnabled(characterId)) {
            console.log(`😊 Expressions disabled for ${characterId} - skipping temporary expression`);
            return;
        }
        
        setCharacterExpression(characterId, expression);
        
        // Revert to bond-appropriate expression after duration
        setTimeout(() => {
            updateCharacterExpression(characterId);
        }, duration);
    }
    
    // Set character expression with smooth transition
    function setCharacterExpression(characterId, expression) {
        // Check if expressions are enabled for this character
        if (!isExpressionsEnabled(characterId)) {
            console.log(`😊 Expressions disabled for ${characterId} - skipping expression change to: ${expression}`);
            return;
        }
        
        const expressionData = getCharacterExpressionData(characterId);
        const imageUrl = getExpressionImageUrl(characterId, expression, expressionData);
        
        if (!imageUrl) {
            console.warn(`😞 No image URL for ${characterId} expression: ${expression}`);
            return;
        }
        
        // Check if this is already the current expression
        const currentExpression = expressionState.currentExpressions.get(characterId);
        if (currentExpression === expression) {
            return;
        }
        
        // Update current expression
        expressionState.currentExpressions.set(characterId, expression);
        
        // Apply expression to character displays
        applyExpressionToCharacterDisplays(characterId, imageUrl);
        
        console.log(`😊 Set ${characterId} expression to: ${expression}`);
    }
    
    // Get character expression data (with fallback to default)
    function getCharacterExpressionData(characterId) {
        return characterExpressions[characterId] || characterExpressions.default;
    }
    
    // Get image URL for specific expression
    function getExpressionImageUrl(characterId, expression, expressionData) {
        const imageUrl = expressionData.expressions[expression];
        
        // If specific image URL is defined, use it
        if (imageUrl) {
            return imageUrl;
        }
        
        // Fallback to character's default images
        if (!window.gameData || !window.gameData.characters[characterId]) return null;
        const character = window.gameData.characters[characterId];
        
        switch (expression) {
            case 'idle':
                return character.avatar || character.image;
            case 'happy':
            case 'excited':
                return character.image || character.avatar;
            case 'click':
                return character.clickImage || character.image || character.avatar;
            default:
                return character.avatar || character.image;
        }
    }
    
    // Apply expression to all character displays
    function applyExpressionToCharacterDisplays(characterId, imageUrl) {
        // Update active character image if this is the active character
        if (window.gameData && window.gameData.activeCharacterId === characterId) {
            updateActiveCharacterImage(imageUrl);
        }
        
        // Update character page image if currently viewing this character
        if (window.gameData && window.gameData.viewedCharacterId === characterId) {
            updateCharacterPageImage(imageUrl);
        }
        
        // Update character card background
        updateCharacterCardImage(characterId, imageUrl);
    }
    
    // Update active character image with smooth transition
    function updateActiveCharacterImage(imageUrl) {
        const activeImage = domElements?.get('activeCharacterImage');
        if (!activeImage) return;
        
        // Use animation module for smooth crossfade if available
        if (animations && animations.animate) {
            animations.animate(activeImage, {
                duration: 500,
                easing: 'easeInOutQuad',
                properties: {
                    opacity: { from: 1, to: 0.3, back: 1 }
                }
            }).then(() => {
                activeImage.src = imageUrl;
            });
        } else {
            // Fallback to direct change
            activeImage.style.transition = 'opacity 0.5s ease-in-out';
            activeImage.style.opacity = '0.3';
            setTimeout(() => {
                activeImage.src = imageUrl;
                activeImage.style.opacity = '1';
            }, 250);
        }
    }
    
    // Update character page image
    function updateCharacterPageImage(imageUrl) {
        const characterImages = document.querySelectorAll('.character-image img');
        characterImages.forEach(img => {
            if (animations && animations.animate) {
                animations.animate(img, {
                    duration: 400,
                    easing: 'easeInOutQuad',
                    properties: {
                        opacity: { from: 1, to: 0.2, back: 1 }
                    }
                }).then(() => {
                    img.src = imageUrl;
                });
            } else {
                img.style.transition = 'opacity 0.4s ease-in-out';
                img.style.opacity = '0.2';
                setTimeout(() => {
                    img.src = imageUrl;
                    img.style.opacity = '1';
                }, 200);
            }
        });
    }
    
    // Update character card background image
    function updateCharacterCardImage(characterId, imageUrl) {
        const characterCard = document.querySelector(`[data-character-id="${characterId}"]`);
        if (!characterCard) return;
        
        // Smooth background transition
        characterCard.style.transition = 'background-image 0.6s ease-in-out';
        characterCard.style.backgroundImage = `url('${imageUrl}')`;
    }
    
    // Public API functions
    function setExpression(characterId, expression) {
        setCharacterExpression(characterId, expression);
    }
    
    function getCurrentExpression(characterId) {
        return expressionState.currentExpressions.get(characterId) || 'idle';
    }
    
    // Enable/disable expressions for specific characters
    function enableExpressions(characterId) {
        if (characterExpressions[characterId]) {
            characterExpressions[characterId].enabled = true;
            console.log(`😊 Expressions enabled for ${characterId}`);
        } else {
            console.warn(`No expression data found for character: ${characterId}`);
        }
    }
    
    function disableExpressions(characterId) {
        if (characterExpressions[characterId]) {
            characterExpressions[characterId].enabled = false;
            console.log(`😊 Expressions disabled for ${characterId}`);
        }
    }
    
    function enableAllExpressions() {
        Object.keys(characterExpressions).forEach(characterId => {
            if (characterExpressions[characterId]) {
                characterExpressions[characterId].enabled = true;
            }
        });
        console.log('😊 All character expressions enabled');
    }
    
    function disableAllExpressions() {
        Object.keys(characterExpressions).forEach(characterId => {
            if (characterExpressions[characterId]) {
                characterExpressions[characterId].enabled = false;
            }
        });
        console.log('😊 All character expressions disabled');
    }
    
    function addCharacterExpressions(characterId, expressionConfig) {
        characterExpressions[characterId] = {
            ...characterExpressions.default,
            ...expressionConfig
        };
        
        // Preload new expression images
        Object.values(expressionConfig.expressions || {}).forEach(imageUrl => {
            if (imageUrl && !expressionState.preloadedImages.has(imageUrl)) {
                preloadImage(imageUrl);
            }
        });
        
        console.log(`😊 Added expressions for character: ${characterId}`);
    }
    
    function getAvailableExpressions(characterId) {
        const expressionData = getCharacterExpressionData(characterId);
        return Object.keys(expressionData.expressions);
    }
    
    function preloadAllExpressions() {
        preloadExpressionImages();
    }
    
    // Cleanup function
    function cleanup() {
        // Remove event listeners
        window.removeEventListener('bondIncrease', handleBondChange);
        window.removeEventListener('characterChanged', handleCharacterChange);
        window.removeEventListener('storyMilestone', handleStoryMilestone);
        window.removeEventListener('characterHover', handleCharacterHover);
        window.removeEventListener('characterClick', handleCharacterClick);
        
        // Clear state
        expressionState.currentExpressions.clear();
        expressionState.preloadedImages.clear();
        
        console.log('😊 Expression system cleaned up');
    }
    
    // Public API
    return {
        initialize,
        setExpression,
        getCurrentExpression,
        addCharacterExpressions,
        getAvailableExpressions,
        preloadAllExpressions,
        updateCharacterExpression,
        enableExpressions,
        disableExpressions,
        enableAllExpressions,
        disableAllExpressions,
        isExpressionsEnabled,
        cleanup
    };
}

// Register the module with dependency validation and retry mechanism
function registerExpressionModule() {
    if (!window.gameModules || !window.gameModules.registerModule) {
        setTimeout(registerExpressionModule, 100);
        return false;
    }
    
    // Check if dependencies are available
    const dependencies = ['domElements', 'animations'];
    const missingDeps = dependencies.filter(dep => {
        if (dep === 'domElements') return !window.domElements;
        if (dep === 'animations') return !window.gameModules.getModule(dep);
        return false;
    });
    
    if (missingDeps.length > 0) {
        console.log(`😊 Expression module waiting for dependencies: ${missingDeps.join(', ')}`);
        setTimeout(registerExpressionModule, 200);
        return false;
    }
    
    try {
        window.gameModules.registerModule('expressions', createExpressionModule, dependencies);
        console.log('😊 Expression module registered successfully');
        return true;
    } catch (error) {
        console.error('Failed to register expression module:', error);
        // Still try to create fallback global functions
        createFallbackFunctions();
        return false;
    }
}

// Create fallback functions if module registration fails
function createFallbackFunctions() {
    if (!window.setCharacterExpression) {
        window.setCharacterExpression = (characterId, expression) => {
            console.warn('Expression module not available - setCharacterExpression ignored');
        };
    }
    
    if (!window.updateCharacterExpression) {
        window.updateCharacterExpression = (characterId) => {
            console.warn('Expression module not available - updateCharacterExpression ignored');
        };
    }
}

// Attempt registration
registerExpressionModule();

// Global fallback functions for HTML event handlers
window.setCharacterExpression = (characterId, expression) => {
    const expressionModule = window.gameModules?.getModule('expressions');
    if (expressionModule) {
        expressionModule.setExpression(characterId, expression);
    }
};

window.updateCharacterExpression = (characterId) => {
    const expressionModule = window.gameModules?.getModule('expressions');
    if (expressionModule) {
        expressionModule.updateCharacterExpression(characterId);
    }
};

// Global functions for enabling/disabling expressions
window.enableCharacterExpressions = (characterId) => {
    const expressionModule = window.gameModules?.getModule('expressions');
    if (expressionModule) {
        expressionModule.enableExpressions(characterId);
    } else {
        console.warn('Expression module not available - enableCharacterExpressions ignored');
    }
};

window.disableCharacterExpressions = (characterId) => {
    const expressionModule = window.gameModules?.getModule('expressions');
    if (expressionModule) {
        expressionModule.disableExpressions(characterId);
    } else {
        console.warn('Expression module not available - disableCharacterExpressions ignored');
    }
};

window.enableAllCharacterExpressions = () => {
    const expressionModule = window.gameModules?.getModule('expressions');
    if (expressionModule) {
        expressionModule.enableAllExpressions();
    } else {
        console.warn('Expression module not available - enableAllCharacterExpressions ignored');
    }
};

console.log('😊 Expression module loaded');