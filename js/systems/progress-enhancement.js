// Enhanced Progress Visuals - Bond Progression with Celebrations and Effects
// Wszystkie Moje Potwory

function createProgressEnhancementModule(dependencies, moduleManager) {
    const { domElements, animations, particles } = dependencies || {};
    
    console.log('📊 Progress Enhancement Module created');
    
    // Progress enhancement state
    const progressState = {
        characterProgress: new Map(), // characterId -> progress tracking
        celebrationQueue: [],
        isUpdatingProgress: false,
        thresholdGlowActive: new Set()
    };
    
    // Character-specific settings
    const characterSettings = {
        szafran: {
            colorClass: 'character-szafran',
            thresholds: [15, 40, 200, 800, 2000, 4500, 8000, 13000],
            particleTheme: 'nature'
        },
        furia: {
            colorClass: 'character-furia',
            thresholds: [20, 60, 250, 1000, 2500, 5000, 10000, 15000],
            particleTheme: 'fire'
        },
        momo: {
            colorClass: 'character-momo',
            thresholds: [18, 50, 220, 900, 2200, 4800, 9000, 14000],
            particleTheme: 'magical'
        },
        default: {
            colorClass: 'character-default',
            thresholds: [25, 75, 300, 1200, 3000, 6000, 12000, 20000],
            particleTheme: 'ambient'
        }
    };
    
    // Initialize progress enhancement system
    function initialize() {
        console.log('📊 Initializing progress enhancement system...');
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize all character progress tracking (with delay if gameData not ready)
        if (window.gameData && window.gameData.characters) {
            initializeCharacterProgress();
        } else {
            // Defer initialization until gameData is ready
            setTimeout(() => {
                if (window.gameData && window.gameData.characters) {
                    initializeCharacterProgress();
                }
            }, 500);
        }
        
        console.log('✅ Progress enhancement system initialized');
        return true;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Bond progression events
        window.addEventListener('bondIncrease', handleBondIncrease);
        
        // Character changes
        window.addEventListener('characterChanged', handleCharacterChange);
        
        // Story milestones
        window.addEventListener('storyMilestone', handleStoryMilestone);
        
        // Game update cycle for progress checks
        window.addEventListener('gameUpdate', updateProgressVisuals);
    }
    
    // Initialize progress tracking for all characters
    function initializeCharacterProgress() {
        if (!window.gameData || !window.gameData.characters) {
            console.warn('📊 gameData not ready for progress initialization, will initialize later');
            return;
        }
        
        Object.keys(window.gameData.characters).forEach(characterId => {
            const character = window.gameData.characters[characterId];
            if (character && character.unlocked) {
                initializeCharacterProgressTracking(characterId);
            }
        });
    }
    
    // Initialize progress tracking for specific character
    function initializeCharacterProgressTracking(characterId) {
        const character = window.gameData?.characters?.[characterId];
        if (!character) return;
        
        const settings = getCharacterSettings(characterId);
        const bondPoints = character.bondPoints || 0;
        
        progressState.characterProgress.set(characterId, {
            currentBond: bondPoints,
            lastMilestone: findLastMilestone(bondPoints, settings.thresholds),
            nextMilestone: findNextMilestone(bondPoints, settings.thresholds),
            lastUpdateTime: Date.now(),
            celebrationsPending: []
        });
        
        // Apply initial progress visuals
        setTimeout(() => updateCharacterProgressVisual(characterId), 100); // Delay to ensure DOM is ready
    }
    
    // Handle bond increase events
    function handleBondIncrease(event) {
        const { characterId, bondGain, position } = event.detail || {};
        if (!characterId || !bondGain) return;
        
        // Show floating bond gain indicator
        showBondGainIndicator(characterId, bondGain, position);
        
        // Check for milestone celebrations
        checkMilestoneProgress(characterId);
        
        // Update progress visuals
        updateCharacterProgressVisual(characterId);
        
        // Add shine effect to progress bar
        addProgressShineEffect(characterId);
    }
    
    // Handle character change
    function handleCharacterChange(event) {
        const { characterId } = event.detail || {};
        if (!characterId) return;
        
        // Initialize tracking if not exists
        if (!progressState.characterProgress.has(characterId)) {
            initializeCharacterProgressTracking(characterId);
        }
        
        // Update visual immediately
        updateCharacterProgressVisual(characterId);
    }
    
    // Handle story milestones
    function handleStoryMilestone(event) {
        const { characterId, milestone } = event.detail || {};
        if (!characterId) return;
        
        // Trigger celebration effect
        triggerMilestoneCelebration(characterId, milestone);
    }
    
    // Update progress visuals for all characters
    function updateProgressVisuals() {
        if (progressState.isUpdatingProgress) return;
        progressState.isUpdatingProgress = true;
        
        try {
            progressState.characterProgress.forEach((progress, characterId) => {
                updateCharacterProgressVisual(characterId);
                checkThresholdProximity(characterId);
            });
        } finally {
            progressState.isUpdatingProgress = false;
        }
    }
    
    // Update progress visual for specific character
    function updateCharacterProgressVisual(characterId) {
        const character = window.gameData?.characters?.[characterId];
        if (!character) return;
        
        const settings = getCharacterSettings(characterId);
        const bondPoints = character.bondPoints || 0;
        const progress = calculateProgress(bondPoints, settings.thresholds);
        
        // Update progress bars
        updateProgressBars(characterId, progress, settings);
        
        // Update progress tracking
        updateProgressTracking(characterId, bondPoints);
    }
    
    // Calculate progress percentage and milestone info
    function calculateProgress(bondPoints, thresholds) {
        let currentThreshold = 0;
        let nextThreshold = thresholds[0] || 100;
        
        for (let i = 0; i < thresholds.length; i++) {
            if (bondPoints >= thresholds[i]) {
                currentThreshold = thresholds[i];
                nextThreshold = thresholds[i + 1] || (thresholds[i] * 2);
            } else {
                nextThreshold = thresholds[i];
                break;
            }
        }
        
        const progressInRange = bondPoints - currentThreshold;
        const rangeSize = nextThreshold - currentThreshold;
        const percentage = Math.min((progressInRange / rangeSize) * 100, 100);
        
        return {
            percentage,
            currentThreshold,
            nextThreshold,
            bondPoints,
            isMaxLevel: bondPoints >= thresholds[thresholds.length - 1]
        };
    }
    
    // Update progress bars with enhanced visuals
    function updateProgressBars(characterId, progress, settings) {
        const progressBars = document.querySelectorAll(`[data-character-id="${characterId}"] .character-panel-progress-fill`);
        
        progressBars.forEach(bar => {
            // Apply character-specific color class
            bar.classList.add('enhanced', settings.colorClass);
            
            // Update width
            bar.style.width = progress.percentage + '%';
            
            // Add milestone indicators if needed
            addMilestoneIndicators(bar, progress, settings);
        });
    }
    
    // Add milestone indicators to progress bar
    function addMilestoneIndicators(progressBar, progress, settings) {
        // Remove existing milestone indicators
        progressBar.parentElement.querySelectorAll('.progress-milestone').forEach(indicator => {
            indicator.remove();
        });
        
        // Add milestone indicators
        settings.thresholds.forEach((threshold, index) => {
            if (threshold <= progress.nextThreshold && threshold > progress.currentThreshold) {
                const percentage = ((threshold - progress.currentThreshold) / (progress.nextThreshold - progress.currentThreshold)) * 100;
                
                const indicator = document.createElement('div');
                indicator.className = 'progress-milestone';
                if (progress.bondPoints >= threshold) {
                    indicator.classList.add('reached');
                }
                indicator.style.left = percentage + '%';
                
                progressBar.parentElement.appendChild(indicator);
            }
        });
    }
    
    // Check if character is near a threshold for glow effect
    function checkThresholdProximity(characterId) {
        const character = window.gameData?.characters?.[characterId];
        if (!character) return;
        
        const settings = getCharacterSettings(characterId);
        const progress = calculateProgress(character.bondPoints || 0, settings.thresholds);
        
        // Apply glow if near threshold (90%+ progress)
        const shouldGlow = progress.percentage >= 90 && !progress.isMaxLevel;
        const progressBars = document.querySelectorAll(`[data-character-id="${characterId}"] .character-panel-progress-fill`);
        
        progressBars.forEach(bar => {
            if (shouldGlow) {
                bar.classList.add('near-threshold');
                progressState.thresholdGlowActive.add(characterId);
            } else {
                bar.classList.remove('near-threshold');
                progressState.thresholdGlowActive.delete(characterId);
            }
        });
    }
    
    // Check for milestone celebrations
    function checkMilestoneProgress(characterId) {
        const character = window.gameData?.characters?.[characterId];
        const tracking = progressState.characterProgress.get(characterId);
        if (!character || !tracking) return;
        
        const settings = getCharacterSettings(characterId);
        const currentMilestone = findLastMilestone(character.bondPoints || 0, settings.thresholds);
        
        // Check if we passed a milestone
        if (currentMilestone > tracking.lastMilestone) {
            triggerMilestoneCelebration(characterId, currentMilestone);
            tracking.lastMilestone = currentMilestone;
        }
    }
    
    // Trigger milestone celebration
    function triggerMilestoneCelebration(characterId, milestone) {
        const progressBars = document.querySelectorAll(`[data-character-id="${characterId}"] .character-panel-progress-fill`);
        
        progressBars.forEach(bar => {
            // Add celebration animation
            bar.classList.add('celebrating');
            
            // Remove class after animation
            setTimeout(() => {
                bar.classList.remove('celebrating');
            }, 1500);
        });
        
        // Trigger particle celebration
        if (particles && particles.triggerParticleBurst) {
            const characterCard = document.querySelector(`[data-character-id="${characterId}"]`);
            if (characterCard) {
                const rect = characterCard.getBoundingClientRect();
                const position = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
                
                particles.triggerParticleBurst(characterId, position, 'high');
            }
        }
        
        // Dispatch milestone event for other systems
        if (window.dispatchEvent) {
            const event = new CustomEvent('storyMilestone', {
                detail: { characterId, milestone }
            });
            window.dispatchEvent(event);
        }
        
        console.log(`🎉 Milestone celebration for ${characterId}: ${milestone}`);
    }
    
    // Add shine effect to progress bar
    function addProgressShineEffect(characterId) {
        const progressBars = document.querySelectorAll(`[data-character-id="${characterId}"] .character-panel-progress-fill`);
        
        progressBars.forEach(bar => {
            bar.classList.add('gaining');
            
            setTimeout(() => {
                bar.classList.remove('gaining');
            }, 800);
        });
    }
    
    // Show floating bond gain indicator
    function showBondGainIndicator(characterId, bondGain, position) {
        if (!position) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'bond-gain-indicator';
        indicator.textContent = `+${Math.round(bondGain)} 💗`;
        indicator.style.left = position.x + 'px';
        indicator.style.top = position.y + 'px';
        
        document.body.appendChild(indicator);
        
        // Remove after animation
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 1500);
    }
    
    // Update progress tracking data
    function updateProgressTracking(characterId, bondPoints) {
        const tracking = progressState.characterProgress.get(characterId);
        if (!tracking) return;
        
        tracking.currentBond = bondPoints;
        tracking.lastUpdateTime = Date.now();
        
        const settings = getCharacterSettings(characterId);
        tracking.nextMilestone = findNextMilestone(bondPoints, settings.thresholds);
    }
    
    // Utility functions
    function getCharacterSettings(characterId) {
        return characterSettings[characterId] || characterSettings.default;
    }
    
    function findLastMilestone(bondPoints, thresholds) {
        let lastMilestone = 0;
        for (const threshold of thresholds) {
            if (bondPoints >= threshold) {
                lastMilestone = threshold;
            } else {
                break;
            }
        }
        return lastMilestone;
    }
    
    function findNextMilestone(bondPoints, thresholds) {
        for (const threshold of thresholds) {
            if (bondPoints < threshold) {
                return threshold;
            }
        }
        return thresholds[thresholds.length - 1] * 2; // Beyond max
    }
    
    // Public API
    function enhanceCharacterProgress(characterId) {
        initializeCharacterProgressTracking(characterId);
        updateCharacterProgressVisual(characterId);
    }
    
    function triggerCelebration(characterId, milestone) {
        triggerMilestoneCelebration(characterId, milestone);
    }
    
    function getProgressInfo(characterId) {
        const character = window.gameData?.characters?.[characterId];
        if (!character) return null;
        
        const settings = getCharacterSettings(characterId);
        return calculateProgress(character.bondPoints || 0, settings.thresholds);
    }
    
    function addCharacterSettings(characterId, settings) {
        characterSettings[characterId] = {
            ...characterSettings.default,
            ...settings
        };
        console.log(`📊 Added progress settings for character: ${characterId}`);
    }
    
    // Cleanup function
    function cleanup() {
        // Remove event listeners
        window.removeEventListener('bondIncrease', handleBondIncrease);
        window.removeEventListener('characterChanged', handleCharacterChange);
        window.removeEventListener('storyMilestone', handleStoryMilestone);
        window.removeEventListener('gameUpdate', updateProgressVisuals);
        
        // Clear state
        progressState.characterProgress.clear();
        progressState.thresholdGlowActive.clear();
        progressState.celebrationQueue = [];
        
        console.log('📊 Progress enhancement system cleaned up');
    }
    
    // Public API
    return {
        initialize,
        enhanceCharacterProgress,
        triggerCelebration,
        getProgressInfo,
        addCharacterSettings,
        updateProgressVisuals,
        cleanup
    };
}

// Register the module with dependency validation and retry mechanism
function registerProgressEnhancementModule() {
    if (!window.gameModules || !window.gameModules.registerModule) {
        setTimeout(registerProgressEnhancementModule, 100);
        return false;
    }
    
    // Check if dependencies are available
    const dependencies = ['domElements', 'animations', 'particles'];
    const missingDeps = dependencies.filter(dep => {
        if (dep === 'domElements') return !window.domElements;
        return !window.gameModules.getModule(dep);
    });
    
    if (missingDeps.length > 0) {
        console.log(`📊 Progress Enhancement module waiting for dependencies: ${missingDeps.join(', ')}`);
        setTimeout(registerProgressEnhancementModule, 300);
        return false;
    }
    
    try {
        window.gameModules.registerModule('progressEnhancement', createProgressEnhancementModule, dependencies);
        console.log('📊 Progress Enhancement module registered successfully');
        return true;
    } catch (error) {
        console.error('Failed to register progress enhancement module:', error);
        return false;
    }
}

// Attempt registration
registerProgressEnhancementModule();

// Global fallback functions
window.enhanceCharacterProgress = (characterId) => {
    const progressModule = window.gameModules?.getModule('progressEnhancement');
    if (progressModule) {
        progressModule.enhanceCharacterProgress(characterId);
    }
};

window.triggerProgressCelebration = (characterId, milestone) => {
    const progressModule = window.gameModules?.getModule('progressEnhancement');
    if (progressModule) {
        progressModule.triggerCelebration(characterId, milestone);
    }
};

console.log('📊 Progress Enhancement module loaded');