// Game Initializer - Centralized Initialization Management
// Wszystkie Moje Potwory

// Game Initializer Module Factory
function createGameInitializerModule(dependencies, moduleManager) {
    const { domElements } = dependencies || {};
    
    // Initialization state
    const initState = {
        phase: 'waiting',
        progress: 0,
        startTime: null,
        errors: [],
        stages: [
            'dom_ready',
            'core_systems',
            'character_data',
            'game_modules',
            'save_data',
            'game_loop',
            'final_setup'
        ]
    };
    
    // Initialize the game with comprehensive error handling and progress tracking
    async function initialize() {
        try {
            initState.startTime = performance.now();
            initState.phase = 'starting';
            console.log('🎮 Initializing Wszystkie Moje Potwory...');
            updateLoadingProgress('Rozpoczynanie inicjalizacji...', 0);
            
            // Stage 1: Wait for DOM to be ready
            await waitForDOM();
            updateLoadingProgress('DOM gotowy', 15);
            
            // Stage 2: Initialize core systems
            await initializeCoreSystems();
            updateLoadingProgress('Systemy podstawowe zainicjalizowane', 30);
            
            // Stage 3: Initialize character data
            await initializeCharacterData();
            updateLoadingProgress('Dane postaci załadowane', 45);
            
            // Stage 4: Initialize game modules
            await initializeGameModules();
            updateLoadingProgress('Moduły gry zainicjalizowane', 60);
            
            // Stage 5: Load saved game data
            await loadSavedData();
            updateLoadingProgress('Zapisane dane załadowane', 75);
            
            // Stage 6: Start game loop
            await startGameSystems();
            updateLoadingProgress('Systemy gry uruchomione', 90);
            
            // Stage 7: Final setup
            await finalizeInitialization();
            updateLoadingProgress('Inicjalizacja zakończona', 100);
            
            const initTime = performance.now() - initState.startTime;
            console.log(`✅ Game initialization complete in ${Math.round(initTime)}ms`);
            
            // Hide loading screen and show game
            await showGame();
            
            return { success: true, time: initTime };
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            initState.errors.push(error);
            await handleInitializationError(error);
            return { success: false, error };
        }
    }
    
    // Wait for DOM to be ready
    async function waitForDOM() {
        initState.phase = 'dom_ready';
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }
        
        // Validate essential DOM elements exist
        const essentialElements = ['game-container', 'loading-screen'];
        const missing = essentialElements.filter(id => !document.getElementById(id));
        
        if (missing.length > 0) {
            throw new Error(`Essential DOM elements missing: ${missing.join(', ')}`);
        }
        
        console.log('📋 DOM ready and validated');
    }
    
    // Initialize core systems
    async function initializeCoreSystems() {
        initState.phase = 'core_systems';
        console.log('📋 Initializing core systems...');
        
        // Initialize DOM elements system first
        if (window.domElements) {
            console.log('   - Initializing DOM elements...');
            try {
                window.domElements.initialize();
            } catch (error) {
                console.warn('DOM elements initialization failed:', error);
                // Not critical, continue
            }
        } else {
            console.warn('DOM elements system not available');
        }
        
        // Validate game data exists
        if (!window.gameData) {
            throw new Error('Game data not initialized');
        }
        
        // Initialize game state
        if (!window.gameState) {
            throw new Error('Game state not initialized');
        }
        
        console.log('✅ Core systems initialized');
    }
    
    // Initialize character data
    async function initializeCharacterData() {
        initState.phase = 'character_data';
        console.log('📋 Initializing character data...');
        
        // Initialize character integration
        if (window.initializeCharacters) {
            console.log('   - Loading character data...');
            window.initializeCharacters();
            
            // Wait for character data to load with timeout
            const timeout = 5000; // 5 seconds
            const startTime = Date.now();
            
            while (Date.now() - startTime < timeout) {
                if (window.characterData && Object.keys(window.characterData).length > 0) {
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (!window.characterData || Object.keys(window.characterData).length === 0) {
                throw new Error('Character data failed to load within timeout');
            }
            
            console.log(`   - Loaded ${Object.keys(window.characterData).length} characters`);
        } else {
            console.warn('Character initialization function not available');
        }
        
        console.log('✅ Character data initialized');
    }
    
    // Initialize game modules
    async function initializeGameModules() {
        initState.phase = 'game_modules';
        console.log('🔧 Initializing game modules...');
        
        if (!window.gameModules) {
            throw new Error('Game module manager not available');
        }
        
        try {
            // Initialize all registered modules
            console.log('   - Initializing registered modules...');
            window.gameModules.initializeAll();
            
            // Initialize specific critical systems
            const criticalSystems = ['ui', 'gameLogic', 'character', 'story', 'newsTicker', 'background', 'particles', 'animations', 'expressions', 'progressEnhancement'];
            for (const systemName of criticalSystems) {
                const system = window.gameModules.getModule(systemName);
                if (system && system.initialize) {
                    console.log(`   - Initializing ${systemName}...`);
                    await system.initialize();
                }
            }
            
            console.log(`   - Initialized ${window.gameModules.moduleCount || 'unknown number of'} modules`);
        } catch (error) {
            console.error('Module initialization error:', error);
            throw new Error(`Failed to initialize modules: ${error.message}`);
        }
        
        console.log('✅ Game modules initialized');
    }
    
    // Load saved game data
    async function loadSavedData() {
        initState.phase = 'save_data';
        console.log('💾 Loading saved data...');
        
        try {
            const stateManager = window.gameModules.getModule('stateManager') || window.stateManager;
            
            if (stateManager && stateManager.loadGame) {
                console.log('   - Loading save data...');
                await stateManager.loadGame();
                console.log('   - Save data loaded successfully');
            } else {
                console.log('   - No save manager available, using default data');
            }
        } catch (error) {
            console.warn('Failed to load saved data:', error);
            // Not critical - game can start with default data
        }
        
        console.log('✅ Save data processed');
    }
    
    // Start game systems
    async function startGameSystems() {
        initState.phase = 'game_loop';
        console.log('🔄 Starting game systems...');
        
        // Start main game loop if gameCore is available
        if (window.gameCore && window.gameCore.startGameLoop) {
            console.log('   - Starting game loop...');
            window.gameCore.startGameLoop();
        } else {
            console.warn('Game core not available for loop start');
        }
        
        // Setup auto-save if available
        if (window.gameCore && window.gameCore.setupAutoSave) {
            console.log('   - Setting up auto-save...');
            window.gameCore.setupAutoSave();
        }
        
        console.log('✅ Game systems started');
    }
    
    // Finalize initialization
    async function finalizeInitialization() {
        initState.phase = 'final_setup';
        console.log('🏁 Finalizing initialization...');
        
        // Mark game as initialized
        if (window.gameState) {
            window.gameState.initialized = true;
        }
        
        // Setup event listeners for game lifecycle
        setupGameLifecycleEvents();
        
        // Initialize notification system if available
        if (window.gameModules) {
            const ui = window.gameModules.getModule('ui');
            if (ui && ui.initializeNotifications) {
                ui.initializeNotifications();
            }
        }
        
        console.log('✅ Initialization finalized');
    }
    
    // Show the game (hide loading screen, show game interface)
    async function showGame() {
        console.log('🎭 Showing game interface...');
        
        // Fade out loading screen
        if (domElements) {
            const loadingScreen = domElements.get('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.transition = 'opacity 0.5s ease-out';
                loadingScreen.style.opacity = '0';
                
                setTimeout(() => {
                    domElements.hide('loadingScreen');
                }, 500);
            }
        }
        
        // Show welcome screen or continue game
        if (window.gameCore && window.gameCore.showWelcomeScreen) {
            window.gameCore.showWelcomeScreen();
        }
        
        // Trigger initial UI update
        const ui = window.gameModules?.getModule('ui');
        if (ui && ui.updateAll) {
            ui.updateAll();
        }
    }
    
    // Update loading progress
    function updateLoadingProgress(message, percent) {
        initState.progress = percent;
        
        // Update loading screen if possible
        const progressText = document.querySelector('#loading-screen .text-sm');
        if (progressText) {
            progressText.textContent = message;
        }
        
        // Add progress bar if element exists
        const progressBar = document.querySelector('#loading-progress');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        
        console.log(`📊 Init Progress: ${percent}% - ${message}`);
    }
    
    // Setup game lifecycle event listeners
    function setupGameLifecycleEvents() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', function() {
            if (window.gameCore) {
                if (document.visibilityState === 'hidden') {
                    window.gameCore.pause();
                } else if (document.visibilityState === 'visible') {
                    window.gameCore.resume();
                }
            }
        });
        
        // Handle page unload (save game)
        window.addEventListener('beforeunload', function() {
            const stateManager = window.gameModules?.getModule('stateManager') || window.stateManager;
            if (stateManager && stateManager.saveGame) {
                stateManager.saveGame();
            }
        });
        
        // Handle errors
        window.addEventListener('error', function(event) {
            // Provide detailed error information even when event.error is null
            const errorInfo = event.error || {
                message: event.message || 'Unknown error during gameplay',
                filename: event.filename || 'Unknown file',
                lineno: event.lineno || 'Unknown line',
                colno: event.colno || 'Unknown column'
            };
            
            // Filter out module-related errors that are handled gracefully
            const isModuleError = errorInfo.message && (
                errorInfo.message.includes('moduleManager') || 
                errorInfo.message.includes('getModule') ||
                errorInfo.message.includes('updateCharacterExpression')
            );
            
            if (!isModuleError) {
                console.error('Global error during gameplay:', errorInfo);
                console.error('Gameplay error context:', {
                    type: event.type,
                    target: event.target?.tagName || 'Unknown',
                    gameState: window.gameState?.running || false,
                    timestamp: new Date().toISOString()
                });
            } else {
                console.debug('Module system handled gameplay error:', errorInfo.message);
            }
            
            // Don't crash the game on non-critical errors
            if (window.gameState && window.gameState.running) {
                if (window.showNotification) {
                    window.showNotification('Wystąpił błąd w grze. Sprawdź konsolę.', 'error');
                }
            }
        });
        
        console.log('🔧 Game lifecycle events configured');
    }
    
    // Handle initialization errors
    async function handleInitializationError(error) {
        console.error('Game initialization failed:', error);
        
        // Hide loading screen
        if (domElements) {
            domElements.hide('loadingScreen');
        }
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-900/90 flex items-center justify-center z-50 text-white text-center p-8';
        errorDiv.innerHTML = `
            <div class="max-w-md bg-red-800/50 backdrop-blur-sm rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4">❌ Błąd inicjalizacji</h2>
                <p class="mb-4">Gra nie mogła zostać uruchomiona. Sprawdź konsolę przeglądarki po więcej informacji.</p>
                <p class="text-sm mb-4 text-red-200">Błąd: ${error.message}</p>
                <p class="text-sm mb-6 text-red-200">Faza: ${initState.phase}</p>
                <div class="space-y-2">
                    <button onclick="location.reload()" class="btn-primary w-full">
                        Spróbuj ponownie
                    </button>
                    <button onclick="console.log('Init State:', ${JSON.stringify(initState)})" class="btn-secondary w-full text-sm">
                        Pokaż szczegóły w konsoli
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
    
    // Get initialization state (for debugging)
    function getInitState() {
        return { ...initState };
    }
    
    // Public API
    return {
        initialize,
        getInitState,
        updateLoadingProgress,
        
        // Module lifecycle
        cleanup: function() {
            if (initState.gameLoop) {
                cancelAnimationFrame(initState.gameLoop);
            }
        }
    };
}

// Register the module
if (window.gameModules) {
    window.gameModules.registerModule('gameInitializer', createGameInitializerModule, ['domElements']);
}

// Global fallback function for HTML event handlers
window.initializeGame = function() {
    const gameInitializer = window.gameModules?.getModule('gameInitializer');
    if (gameInitializer) {
        return gameInitializer.initialize();
    } else {
        console.error('Game initializer not available');
        return Promise.reject(new Error('Game initializer not available'));
    }
};

console.log('🎮 Game Initializer module loaded');