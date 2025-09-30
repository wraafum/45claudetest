// Main Game Entry Point
// Wszystkie Moje Potwory


// Game Module Manager is now defined in HTML head for early availability

// Game State Management
window.gameState = {
    initialized: false,
    running: false,
    paused: false,
    lastUpdate: 0,
    deltaTime: 0,
    gameLoop: null,
    
    // Game timing
    targetFPS: 60,
    updateInterval: 1000 / 60, // 60 FPS
    
    // Performance tracking
    frameCount: 0,
    fpsHistory: [],
    avgFPS: 0
};

// Core Game Functions
window.gameCore = {
    // Initialize the game (legacy fallback)
    initialize: async function() {
        try {
            console.log('🎮 Initializing Wszystkie Moje Potwory...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize core systems
            console.log('📋 Initializing core systems...');
            
            // Initialize DOM elements first
            if (window.domElements) {
                window.domElements.initialize();
            }
            
            // Initialize game data and character integration
            if (window.initializeCharacters) {
                window.initializeCharacters();
            }
            
            // Wait a bit for character data to load
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Initialize all modules
            console.log('🔧 Initializing game modules...');
            window.gameModules.initializeAll();
            
            // Initialize specific systems
            const ui = window.gameModules.getModule('ui');
            if (ui) {
                ui.initialize();
            }
            
            // Load saved game data
            console.log('💾 Loading saved data...');
            const stateManager = window.gameModules.getModule('stateManager') || window.stateManager;
            if (stateManager && stateManager.loadGame) {
                await stateManager.loadGame();
            }
            
            // Initialize news ticker properly
            try {
                const newsTicker = window.gameModules.getModule('newsTicker');
                if (newsTicker && typeof newsTicker.initialize === 'function') {
                    newsTicker.initialize();
                }
            } catch (error) {
                console.error('News ticker initialization failed:', error);
            }
            
            // Start main game loop
            console.log('🔄 Starting game loop...');
            this.startGameLoop();
            
            // Mark as initialized
            gameState.initialized = true;
            
            // Auto-save setup
            this.setupAutoSave();
            
            console.log('✅ Game initialization complete!');
            
            // Show welcome screen or continue game
            this.showWelcomeScreen();
            
        } catch (error) {
            console.error('❌ Game initialization failed:', error);
            this.handleInitializationError(error);
        }
        
        // Emergency fallback for news ticker - runs outside async context
        setTimeout(() => {
            const newsElement = document.getElementById('news-ticker-text');
            
            if (newsElement) {
                if (!newsElement.textContent || newsElement.textContent.trim() === '') {
                    newsElement.textContent = "Dwór wydaje się żyć własnym życiem, pełnym tajemnic i spokoju.";
                    
                    // Start cycling through messages
                    const messages = [
                        "Dwór wydaje się żyć własnym życiem, pełnym tajemnic i spokoju.",
                        "Zapach świeżych kwiatów unosi się korytarzami dworu.",
                        "Gdzieś w oddali słychać delikatne kroki po kamiennych posadzkach.",
                        "W dworze panuje spokojna, ciepła atmosfera."
                    ];
                    
                    let index = 0;
                    setInterval(() => {
                        index = (index + 1) % messages.length;
                        newsElement.textContent = messages[index];
                    }, 8000);
                }
            } else {
                // If element not found, create a visible error message
                document.body.insertAdjacentHTML('afterbegin', 
                    '<div style="position: fixed; top: 10px; left: 10px; background: red; color: white; padding: 10px; z-index: 9999;">NEWS TICKER ELEMENT NOT FOUND</div>'
                );
            }
        }, 2000);
    },
    
    // Start the main game loop
    startGameLoop: function() {
        if (gameState.gameLoop) {
            cancelAnimationFrame(gameState.gameLoop);
        }
        
        gameState.running = true;
        gameState.lastUpdate = performance.now();
        
        const gameLoop = (currentTime) => {
            if (!gameState.running) return;
            
            // Calculate delta time
            gameState.deltaTime = currentTime - gameState.lastUpdate;
            gameState.lastUpdate = currentTime;
            
            // Update game
            this.update(gameState.deltaTime);
            
            // Continue loop
            gameState.gameLoop = requestAnimationFrame(gameLoop);
        };
        
        gameState.gameLoop = requestAnimationFrame(gameLoop);
        console.log('Game loop started');
    },
    
    // Main game update function
    update: function(deltaTime) {
        if (gameState.paused) return;
        
        // Update FPS tracking
        this.updateFPS(deltaTime);
        
        // Update game logic
        const gameLogic = window.gameModules.getModule('gameLogic') || window.gameLogic;
        if (gameLogic && gameLogic.update) {
            gameLogic.update(deltaTime);
        }
        
        // Update UI (throttled)
        const ui = window.gameModules.getModule('ui') || window.ui;
        if (ui && ui.updateAll) {
            ui.updateAll();
        }
        
        // Update character page display (live stats)
        const character = window.gameModules.getModule('character');
        if (character && character.updateCharacterDisplay) {
            character.updateCharacterDisplay();
        }
        
        // Update minigames
        try {
            if (window.ArenaSystem && typeof window.ArenaSystem.processActivity === 'function') {
                window.ArenaSystem.processActivity();
            }
        } catch (error) {
            console.error('Error in ArenaSystem.processActivity:', error);
        }
        
        // Update garden growth
        const minigames = window.gameModules.getModule('minigames');
        if (minigames && minigames.updateGardenGrowth) {
            minigames.updateGardenGrowth();
        }
        
        // Update session time
        if (gameData && gameData.session) {
            gameData.session.lastUpdate = Date.now();
        }
    },
    
    // Update FPS tracking
    updateFPS: function(deltaTime) {
        gameState.frameCount++;
        
        if (deltaTime > 0) {
            const fps = 1000 / deltaTime;
            gameState.fpsHistory.push(fps);
            
            // Keep only last 60 frames for averaging
            if (gameState.fpsHistory.length > 60) {
                gameState.fpsHistory.shift();
            }
            
            // Calculate average FPS
            gameState.avgFPS = gameState.fpsHistory.reduce((a, b) => a + b, 0) / gameState.fpsHistory.length;
        }
    },
    
    // Setup auto-save
    setupAutoSave: function() {
        if (!gameData || !gameData.settings.autoSave) return;
        
        const interval = gameData.settings.autoSaveInterval || 30000; // 30 seconds default
        
        setInterval(() => {
            if (gameState.running && !gameState.paused) {
                const stateManager = window.gameModules.getModule('stateManager') || window.stateManager;
                if (stateManager && stateManager.saveGame) {
                    stateManager.saveGame();
                }
            }
        }, interval);
        
        console.log(`Auto-save enabled (${interval / 1000}s interval)`);
    },
    
    // Show welcome screen
    showWelcomeScreen: function() {
        if (!gameData || gameData.gameStarted) {
            // Game already started, hide welcome screen and show manor
            if (window.domElements) {
                window.domElements.hide('welcomeScreen');
            }
            
            // For returning players, show manor as default view
            setTimeout(() => {
                this.displayManorAsDefault();
            }, 100); // Small delay to ensure UI is ready
            
            return;
        }
        
        // Show welcome screen for new players
        if (window.domElements) {
            window.domElements.show('welcomeScreen', 'flex');
        }
    },
    
    // Start the game (called from welcome screen)
    startGame: function() {
        if (!gameData) return;
        
        gameData.gameStarted = true;
        gameData.session.startTime = Date.now();
        
        // Hide welcome screen
        if (window.domElements) {
            window.domElements.hide('welcomeScreen');
        }
        
        // Show first-time tutorial or story
        if (gameData.statistics.totalClicks === 0) {
            this.showFirstTimeExperience();
        } else {
            // Not first time, show manor immediately
            setTimeout(() => {
                this.displayManorAsDefault();
            }, 100);
        }
        
        // Trigger UI update
        const ui = window.gameModules.getModule('ui') || window.ui;
        if (ui) {
            ui.updateAll();
        }
        
        console.log('Game started!');
    },
    
    // Show first-time experience
    showFirstTimeExperience: function() {
        // Show notification
        setTimeout(() => {
            if (window.showNotification) {
                window.showNotification('Witaj w swoim dworze! Kliknij na Szafran, aby zacząć.', 'info', 5000);
            }
        }, 1000);
        
        // If Szafran has a first story event, trigger it
        setTimeout(() => {
            const szafran = gameData.characters.szafran;
            if (szafran && szafran.storyEvents && szafran.storyEvents.length > 0) {
                const story = window.gameModules.getModule('story') || window.story;
                if (story && story.startStoryEvent) {
                    story.startStoryEvent(szafran.storyEvents[0].id);
                    
                    // After story completes, show manor view as default
                    this.setupPostIntroManorDisplay();
                }
            } else {
                // No story event, show manor immediately
                this.displayManorAsDefault();
            }
        }, 2000);
    },
    
    // Setup manor display after intro story
    setupPostIntroManorDisplay: function() {
        // Listen for story modal close to show manor
        const checkStoryComplete = () => {
            const storyModal = document.getElementById('story-modal');
            const modalContainer = document.getElementById('modal-container');
            
            if (storyModal && modalContainer) {
                // Check if modal is hidden/closed
                if (modalContainer.classList.contains('hidden') || 
                    modalContainer.style.display === 'none' || 
                    !modalContainer.classList.contains('show')) {
                    
                    // Story completed, show manor
                    setTimeout(() => {
                        this.displayManorAsDefault();
                    }, 500); // Small delay for smooth transition
                    
                    return; // Stop checking
                }
            }
            
            // Continue checking
            setTimeout(checkStoryComplete, 100);
        };
        
        // Start checking after a short delay
        setTimeout(checkStoryComplete, 1000);
    },
    
    // Display manor as the default view
    displayManorAsDefault: function() {
        const views = window.gameModules?.getModule('views');
        if (views && views.displayManor) {
            views.displayManor();
            console.log('🏠 Manor view set as default after intro');
        } else if (window.displayManor) {
            window.displayManor();
            console.log('🏠 Manor view set as default after intro (fallback)');
        } else {
            console.warn('⚠️ Could not display manor - views module not available');
        }
    },
    
    // Handle initialization error
    handleInitializationError: function(error) {
        console.error('Game failed to initialize:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-900/90 flex items-center justify-center z-50 text-white text-center p-8';
        errorDiv.innerHTML = `
            <div class="max-w-md">
                <h2 class="text-2xl font-bold mb-4">❌ Błąd inicjalizacji</h2>
                <p class="mb-4">Gra nie mogła zostać uruchomiona. Sprawdź konsolę przeglądarki po więcej informacji.</p>
                <button onclick="location.reload()" class="btn-primary">Spróbuj ponownie</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    },
    
    // Pause/resume game
    pause: function() {
        gameState.paused = true;
        console.log('Game paused');
    },
    
    resume: function() {
        gameState.paused = false;
        gameState.lastUpdate = performance.now();
        console.log('Game resumed');
    },
    
    // Stop game
    stop: function() {
        gameState.running = false;
        if (gameState.gameLoop) {
            cancelAnimationFrame(gameState.gameLoop);
            gameState.gameLoop = null;
        }
        console.log('Game stopped');
    },
    
    // Restart game
    restart: function() {
        this.stop();
        window.gameModules.cleanup();
        
        // Clear game data
        if (window.gameData) {
            Object.assign(window.gameData, window.defaultSaveData);
        }
        
        // Reinitialize
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
};

// Global functions for HTML event handlers
window.startGame = function() {
    window.gameCore.startGame();
};

window.pauseGame = function() {
    window.gameCore.pause();
};

window.resumeGame = function() {
    window.gameCore.resume();
};

window.restartGame = function() {
    if (confirm('Czy na pewno chcesz zrestartować grę? Wszystkie dane zostaną utracone!')) {
        window.gameCore.restart();
    }
};

// Debug functions (available in console)
window.gameDebug = {
    // Add resources
    addLust: function(amount) {
        if (gameData) {
            gameData.lustPoints += amount;
            console.log(`Added ${amount} lust points`);
        }
    },
    
    addEssence: function(amount) {
        if (gameData) {
            gameData.sanctuaryEssence += amount;
            console.log(`Added ${amount} sanctuary essence`);
        }
    },
    
    // Unlock all characters
    unlockAllCharacters: function() {
        if (gameData && gameData.characters) {
            Object.values(gameData.characters).forEach(char => {
                char.unlocked = true;
                char.level = Math.max(1, char.level);
            });
            console.log('All characters unlocked');
        }
    },
    
    // Trigger story event
    triggerStory: function(eventId) {
        const story = window.gameModules.getModule('story') || window.story;
        if (story && story.startStoryEvent) {
            story.startStoryEvent(eventId);
        }
    },
    
    // Show game state
    showState: function() {
        console.log('Game State:', {
            gameState,
            gameData: gameData ? {
                lustPoints: gameData.lustPoints,
                activeCharacter: gameData.activeCharacterId,
                charactersUnlocked: Object.values(gameData.characters).filter(c => c.unlocked).length
            } : 'Not loaded'
        });
    },
    
    // Performance info
    showPerformance: function() {
        console.log('Performance:', {
            fps: Math.round(gameState.avgFPS),
            frameCount: gameState.frameCount,
            moduleCount: window.gameModules.modules.size,
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
            } : 'Not available'
        });
    },
    
    // LP Generation Debug Functions
    testClick: function() {
        console.log('🖱️ Testing character click...');
        const gameLogic = window.gameModules?.getModule('gameLogic') || window.gameLogic;
        if (gameLogic && gameLogic.handleCharacterClick) {
            const beforeLP = gameData.lustPoints || 0;
            const success = gameLogic.handleCharacterClick();
            const afterLP = gameData.lustPoints || 0;
            console.log(`Click result: ${success ? 'SUCCESS' : 'FAILED'}`);
            console.log(`LP before: ${beforeLP}, after: ${afterLP}, gained: ${afterLP - beforeLP}`);
        } else {
            console.error('❌ Game logic module or handleCharacterClick not available');
        }
    },
    
    testPassiveIncome: function() {
        console.log('⏱️ Testing passive income...');
        const gameLogic = window.gameModules?.getModule('gameLogic') || window.gameLogic;
        if (gameLogic && gameLogic.update) {
            const beforeLP = gameData.lustPoints || 0;
            // Simulate 1 second of time
            gameLogic.update(1000);
            const afterLP = gameData.lustPoints || 0;
            console.log(`LP before: ${beforeLP}, after: ${afterLP}, gained: ${afterLP - beforeLP}`);
        } else {
            console.error('❌ Game logic module or update not available');
        }
    },
    
    checkModules: function() {
        console.log('🔧 Checking module status...');
        const modules = ['gameLogic', 'ui', 'domElements'];
        modules.forEach(name => {
            const module = window.gameModules?.getModule(name);
            console.log(`${name}: ${module ? '✅ Available' : '❌ Missing'}`);
        });
        console.log(`Game loop running: ${gameState.running ? '✅' : '❌'}`);
        console.log(`Active character: ${gameData?.activeCharacterId || 'None'}`);
    },
    
    checkCharacter: function(charId = 'szafran') {
        console.log(`👤 Checking character: ${charId}`);
        const char = gameData?.characters?.[charId];
        if (char) {
            console.log({
                unlocked: char.unlocked,
                level: char.level,
                bondPoints: char.bondPoints,
                baseLpPerSecond: char.baseLpPerSecond,
                productionGrowth: char.productionGrowth
            });
            
            if (window.gameUtils?.calculateCharacterProduction) {
                const production = window.gameUtils.calculateCharacterProduction(char);
                console.log(`Current production: ${production} LP/s`);
            }
        } else {
            console.error(`❌ Character ${charId} not found`);
        }
    },
    
    forceUpdate: function() {
        console.log('🔄 Forcing UI update...');
        const ui = window.gameModules?.getModule('ui') || window.ui;
        if (ui && ui.updateAll) {
            ui.updateAll();
            console.log('✅ UI updated');
        } else {
            console.error('❌ UI module not available');
        }
    },
    
    // Module status debug functions
    checkModuleConnections: function() {
        console.log('🔗 Checking module connections...');
        
        // Check if modules can talk to each other
        const ui = window.gameModules?.getModule('ui');
        const gameLogic = window.gameModules?.getModule('gameLogic');
        const domElements = window.gameModules?.getModule('domElements');
        
        console.log('UI module:', ui ? '✅ Available' : '❌ Missing');
        console.log('GameLogic module:', gameLogic ? '✅ Available' : '❌ Missing');
        console.log('DOMElements module:', domElements ? '✅ Available' : '❌ Missing');
        
        if (ui) {
            try {
                const gameLogicFromUI = ui.getGameLogic ? ui.getGameLogic() : null;
                console.log('UI can access GameLogic:', gameLogicFromUI !== null ? '✅ Yes' : '❌ No');
            } catch (error) {
                console.log('UI GameLogic access error:', error.message);
            }
        }
        
        return { ui: !!ui, gameLogic: !!gameLogic, domElements: !!domElements };
    },
    
    simulateClick: function() {
        console.log('🖱️ Simulating character click...');
        
        if (!gameData || !gameData.activeCharacterId) {
            console.error('❌ No active character set');
            return false;
        }
        
        const ui = window.gameModules?.getModule('ui') || window.ui;
        if (ui && ui.handleCharacterClick) {
            ui.handleCharacterClick();
            console.log('✅ Click simulated through UI');
            return true;
        } else {
            console.error('❌ UI module or handleCharacterClick not available');
            return false;
        }
    }
};

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        gameCore.pause();
    } else if (document.visibilityState === 'visible') {
        gameCore.resume();
    }
});

// Handle page unload (save game)
window.addEventListener('beforeunload', function() {
    const stateManager = window.gameModules.getModule('stateManager') || window.stateManager;
    if (stateManager && stateManager.saveGame) {
        stateManager.saveGame();
    }
});

// Handle errors
window.addEventListener('error', function(event) {
    // Provide detailed error information even when event.error is null
    const errorInfo = event.error || {
        message: event.message || 'Unknown error',
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
        console.error('Global error:', errorInfo);
        console.error('Error context:', {
            type: event.type,
            target: event.target?.tagName || 'Unknown',
            timestamp: new Date().toISOString()
        });
    } else {
        console.debug('Module system handled global error:', errorInfo.message);
    }
    
    // Don't crash the game on non-critical errors
    if (gameState.running) {
        if (window.showNotification) {
            window.showNotification('Wystąpił błąd w grze. Sprawdź konsolę.', 'error');
        }
    }
});

// Initialize game when page loads
(function() {
    // Check if all required globals exist
    const requiredGlobals = ['gameData', 'gameModules'];
    
    function attemptInitialization() {
        console.log('🔍 Checking game initialization requirements...');
        
        const missingGlobals = requiredGlobals.filter(name => !window[name]);
        
        if (missingGlobals.length > 0) {
            console.warn('⚠️ Missing required globals:', missingGlobals);
            console.log('Available globals:', Object.keys(window).filter(k => 
                ['gameData', 'domElements', 'gameUtils', 'gameModules'].includes(k)
            ));
            
            // Try again in 500ms
            setTimeout(attemptInitialization, 500);
        } else {
            console.log('✅ All required globals available, waiting for modules to register...');
            
            // Wait a bit for modules to register, then try initialization
            setTimeout(() => {
                // Use the new game initializer
                const gameInitializer = window.gameModules.getModule('gameInitializer');
                if (gameInitializer) {
                    console.log('🎮 Using enhanced game initializer...');
                    gameInitializer.initialize().catch(error => {
                        console.error('💥 Game initialization failed:', error);
                        // Error handling is done within the game initializer
                    });
                } else {
                    console.warn('⚠️ Game initializer not available, falling back to legacy initialization');
                    // Fallback to legacy initialization
                    if (window.gameCore) {
                        window.gameCore.initialize().catch(error => {
                            console.error('💥 Legacy initialization failed:', error);
                        });
                    } else {
                        console.error('❌ No initialization system available!');
                    }
                }
            }, 200); // Give modules time to register
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInitialization);
    } else {
        // Small delay to ensure all scripts have loaded
        setTimeout(attemptInitialization, 100);
    }
})();

console.log('🎮 Main game script loaded - Wszystkie Moje Potwory v' + (window.gameData?.version || '0.1.0'));

// ======= EMERGENCY CHARACTER DEBUG COMMANDS =======

// Debug character loading state
window.debugCharacterData = function() {
    console.log('🔍=== CHARACTER DATA DEBUG ===');
    console.log('characterData exists:', !!window.characterData);
    console.log('Available characters:', Object.keys(window.characterData || {}));
    console.log('Momo exists:', !!window.characterData?.momo);
    
    if (window.characterData?.momo) {
        const momo = window.characterData.momo;
        console.log('Momo unlocked in gameData:', window.gameData?.characters?.momo?.unlocked);
        console.log('Momo story events count:', momo.storyEvents?.length || 0);
        console.log('Momo has arenaCallbacks:', !!momo.arenaCallbacks);
        console.log('Momo arenaData exists:', !!momo.arenaData);
        
        if (momo.storyEvents) {
            const eventIds = momo.storyEvents.map(e => e.id);
            console.log('Momo story event IDs:', eventIds);
            console.log('Has momo_7:', eventIds.includes('momo_7'));
        }
    }
    
    console.log('============================');
};

// Force unlock Momo character
window.forceUnlockMomo = function() {
    console.log('🎆 EMERGENCY: Force unlocking Momo...');
    
    if (!window.gameData.characters.momo) {
        window.gameData.characters.momo = {
            unlocked: false,
            level: 0,
            bondPoints: 0,
            production: 0,
            storyProgress: {
                currentBondThreshold: 500,
                nextEventId: 'momo_1',
                seenEvents: []
            }
        };
    }
    
    window.gameData.characters.momo.unlocked = true;
    window.gameData.characters.momo.bondPoints = 1000; // High bond points
    window.gameData.characters.momo.level = 10; // High level
    
    console.log('✅ Momo force unlocked with high bond points');
    return true;
};

// Complete emergency repair - do everything at once
window.emergencyArenaRepair = function() {
    console.log('🎆 EMERGENCY ARENA REPAIR - FULL SYSTEM RESTORATION');
    
    let success = true;
    
    // Step 1: Force unlock Momo
    console.log('Step 1: Force unlocking Momo...');
    if (!window.forceUnlockMomo()) {
        console.error('❌ Failed to unlock Momo');
        success = false;
    }
    
    // Step 2: Force arena unlock
    console.log('Step 2: Force unlocking arena...');
    if (!window.forceUnlockArena()) {
        console.error('❌ Failed to unlock arena');
        success = false;
    }
    
    // Step 3: Trigger momo_7 story event
    console.log('Step 3: Triggering momo_7 story event...');
    if (!window.forceMomo7Event()) {
        console.error('❌ Failed to trigger momo_7 event');
        success = false;
    }
    
    // Step 4: Test arena functionality
    console.log('Step 4: Testing arena functionality...');
    if (!window.testArenaFunctionality()) {
        console.error('❌ Arena functionality test failed');
        success = false;
    }
    
    if (success) {
        console.log('✨ EMERGENCY REPAIR COMPLETE! Arena should now be accessible.');
        console.log('Try accessing the arena from the game UI or call testArenaFunctionality().');
    } else {
        console.error('❌ EMERGENCY REPAIR FAILED - System may need manual restoration from backup.');
    }
    
    return success;
};

// Comprehensive story progression diagnostic function
window.diagnoseStoryProgression = function(characterId = 'momo') {
    console.log(`🔍 === STORY PROGRESSION DIAGNOSIS FOR ${characterId.toUpperCase()} ===`);
    
    let issues = [];
    
    // === CHARACTER DATA VALIDATION ===
    console.log('\n📋 CHARACTER DATA VALIDATION:');
    
    const characterData = window.characterData?.[characterId];
    const gameCharacter = window.gameData?.characters?.[characterId];
    
    if (!characterData) {
        issues.push(`❌ Character data not found in window.characterData.${characterId}`);
        console.error(`❌ window.characterData.${characterId} is missing`);
    } else {
        console.log(`✅ Character data exists in window.characterData`);
        console.log(`   - Story events count: ${characterData.storyEvents?.length || 0}`);
        console.log(`   - Story thresholds count: ${characterData.storyThresholds?.length || 0}`);
    }
    
    if (!gameCharacter) {
        issues.push(`❌ Character not found in gameData.characters.${characterId}`);
        console.error(`❌ gameData.characters.${characterId} is missing`);
    } else {
        console.log(`✅ Character exists in gameData.characters`);
        console.log(`   - Unlocked: ${gameCharacter.unlocked}`);
        console.log(`   - Bond points: ${Math.floor(gameCharacter.bondPoints || 0)}`);
        console.log(`   - Story progress: ${gameCharacter.storyProgress || 0}`);
        console.log(`   - Active character: ${window.gameData?.activeCharacterId === characterId ? 'YES' : 'NO'}`);
    }
    
    // === STORY EVENT ALIGNMENT CHECK ===
    console.log('\n🎭 STORY EVENT ALIGNMENT:');
    
    if (characterData?.storyEvents && characterData?.storyThresholds) {
        const events = characterData.storyEvents;
        const thresholds = characterData.storyThresholds;
        
        console.log(`Story events (${events.length}):`, events.map((e, i) => `${i}: ${e.id}`));
        console.log(`Story thresholds (${thresholds.length}):`, thresholds);
        
        // Check if momo_7 is at the correct index
        const momo7Index = events.findIndex(e => e.id === 'momo_7');
        const expectedThreshold = 25000;
        const actualThreshold = thresholds[momo7Index];
        
        if (momo7Index === -1) {
            issues.push(`❌ momo_7 event not found in story events array`);
        } else if (actualThreshold !== expectedThreshold) {
            issues.push(`❌ momo_7 at index ${momo7Index} has threshold ${actualThreshold}, expected ${expectedThreshold}`);
            console.error(`❌ CRITICAL: momo_7 threshold mismatch - index ${momo7Index}, threshold ${actualThreshold} vs expected ${expectedThreshold}`);
        } else {
            console.log(`✅ momo_7 event correctly aligned at index ${momo7Index} with threshold ${actualThreshold}`);
        }
        
        // Check if current bond points should have triggered progression
        if (gameCharacter) {
            const currentBondPoints = Math.floor(gameCharacter.bondPoints || 0);
            const currentProgress = gameCharacter.storyProgress || 0;
            const nextThreshold = thresholds[currentProgress];
            
            console.log(`\n📊 PROGRESSION STATUS:`);
            console.log(`   - Current bond: ${currentBondPoints}`);
            console.log(`   - Current progress: ${currentProgress}/${thresholds.length}`);
            console.log(`   - Next threshold: ${nextThreshold || 'MAX'}`);
            
            if (nextThreshold && currentBondPoints >= nextThreshold) {
                issues.push(`❌ CRITICAL: Bond points (${currentBondPoints}) >= next threshold (${nextThreshold}) but story hasn't progressed`);
                console.error(`❌ STORY PROGRESSION BROKEN: Should have triggered event at progress ${currentProgress}`);
            }
            
            // Check specifically for momo_7
            if (currentBondPoints >= 25000 && currentProgress < 7) {
                issues.push(`❌ CRITICAL: momo_7 should have unlocked arena but didn't`);
                console.error(`❌ ARENA UNLOCK FAILED: Bond points sufficient (${currentBondPoints} >= 25000) but momo_7 not triggered`);
            }
        }
    }
    
    // === GAME SYSTEM STATUS ===
    console.log('\n🎮 GAME SYSTEM STATUS:');
    
    const gameLogic = window.gameModules?.getModule('gameLogic');
    const story = window.gameModules?.getModule('story');
    
    if (!gameLogic) {
        issues.push(`❌ Game logic module not loaded`);
    } else {
        console.log(`✅ Game logic module loaded`);
        
        // Check if story progression function exists
        if (typeof gameLogic.checkStoryProgression !== 'function') {
            issues.push(`❌ checkStoryProgression function missing from game logic`);
        } else {
            console.log(`✅ checkStoryProgression function available`);
        }
    }
    
    if (!story) {
        issues.push(`❌ Story module not loaded`);
    } else {
        console.log(`✅ Story module loaded`);
    }
    
    // Check game loop status
    const gameRunning = window.gameState?.running;
    console.log(`Game loop running: ${gameRunning ? '✅ YES' : '❌ NO'}`);
    if (!gameRunning) {
        issues.push(`❌ Game loop not running - story progression won't work`);
    }
    
    // === ARENA STATUS ===
    console.log('\n🏟️ ARENA STATUS:');
    const arenaUnlocked = window.gameData?.minigames?.arena?.unlocked;
    console.log(`Arena unlocked: ${arenaUnlocked ? '✅ YES' : '❌ NO'}`);
    
    if (!arenaUnlocked && gameCharacter?.bondPoints >= 25000) {
        issues.push(`❌ CRITICAL: Arena should be unlocked but isn't`);
    }
    
    // === SUMMARY ===
    console.log('\n📝 DIAGNOSIS SUMMARY:');
    if (issues.length === 0) {
        console.log('🎉 NO CRITICAL ISSUES FOUND - Story progression should be working');
    } else {
        console.log(`💥 FOUND ${issues.length} CRITICAL ISSUES:`);
        issues.forEach((issue, i) => console.log(`${i + 1}. ${issue}`));
    }
    
    console.log('\n=== END DIAGNOSIS ===\n');
    
    return {
        issues,
        characterData: !!characterData,
        gameCharacter: !!gameCharacter,
        storyAlignment: characterData?.storyEvents?.length === characterData?.storyThresholds?.length,
        gameSystemsLoaded: !!gameLogic && !!story,
        arenaUnlocked
    };
};

// Test arena unlock fix functionality
window.testArenaUnlockFix = function() {
    console.log('🧪 === TESTING ARENA UNLOCK FIX ===');
    
    let allTestsPassed = true;
    
    // Test 1: Check if story module exports the required function
    console.log('Test 1: Story module function export...');
    const story = window.gameModules?.getModule('story');
    if (story && typeof story.processStoryEventUnlocks === 'function') {
        console.log('✅ processStoryEventUnlocks is properly exported');
    } else {
        console.error('❌ processStoryEventUnlocks not exported from story module');
        allTestsPassed = false;
    }
    
    // Test 2: Check if momo_7 event exists and has unlocks
    console.log('Test 2: Momo 7 event structure...');
    const momoEvents = window.characterData?.momo?.storyEvents;
    const momo7Event = momoEvents?.find(event => event.id === 'momo_7');
    if (momo7Event && momo7Event.unlocks && momo7Event.unlocks.minigame === 'arena') {
        console.log('✅ momo_7 event has correct unlock structure');
    } else {
        console.error('❌ momo_7 event missing or malformed');
        allTestsPassed = false;
    }
    
    // Test 3: Test the emergency command
    console.log('Test 3: Emergency command execution...');
    const currentArenaState = window.gameData?.minigames?.arena?.unlocked;
    console.log('Arena state before test:', currentArenaState);
    
    try {
        const result = window.forceMomo7Event();
        if (result === true) {
            console.log('✅ forceMomo7Event() completed successfully');
            
            // Check if arena was unlocked
            const newArenaState = window.gameData?.minigames?.arena?.unlocked;
            if (newArenaState === true) {
                console.log('✅ Arena successfully unlocked via emergency command');
            } else {
                console.error('❌ Arena not unlocked after command execution');
                allTestsPassed = false;
            }
        } else {
            console.error('❌ forceMomo7Event() returned false');
            allTestsPassed = false;
        }
    } catch (error) {
        console.error('❌ Error executing forceMomo7Event():', error);
        allTestsPassed = false;
    }
    
    // Final result
    console.log('=== TEST RESULTS ===');
    if (allTestsPassed) {
        console.log('🎉 ALL TESTS PASSED! Arena unlock fix is working correctly.');
        console.log('You can now use emergencyArenaRepair() or forceMomo7Event() to unlock the arena.');
    } else {
        console.error('💥 SOME TESTS FAILED! There may still be issues with the fix.');
    }
    console.log('====================');
    
    return allTestsPassed;
};

console.log('🎆 EMERGENCY DEBUG SYSTEM LOADED');
console.log('=== STORY PROGRESSION FIX COMMANDS ===');
console.log('- diagnoseStoryProgression() - 🔍 COMPREHENSIVE DIAGNOSIS (run this first!)');
console.log('- bulletproofArenaUnlock() - 🎯 GUARANTEED ARENA UNLOCK (bypasses story system)');
console.log('- forceStoryProgressionCheck() - 🔧 Force check story progression for character');
console.log('- enableStoryDebug() / disableStoryDebug() - Toggle detailed story logging');
console.log('');
console.log('=== LEGACY EMERGENCY COMMANDS ===');
console.log('- emergencyArenaRepair() - COMPLETE SYSTEM FIX');
console.log('- debugCharacterData() - Debug character loading');
console.log('- forceUnlockMomo() - Force unlock Momo');
console.log('- forceUnlockArena() - Force unlock arena');
console.log('- forceMomo7Event() - Force story event');
console.log('- debugArenaState() - Debug arena state');
console.log('- testArenaFunctionality() - Test arena');
console.log('- testArenaUnlockFix() - Test if the fix is working');
console.log('========================');
console.log('');
console.log('🎯 RECOMMENDED: Run diagnoseStoryProgression() first to identify issues');
console.log('🚀 QUICK FIX: Run bulletproofArenaUnlock() for guaranteed arena access');

// Enable debug mode for story progression
window.enableStoryDebug = function() {
    if (window.gameState) {
        window.gameState.debugMode = true;
        console.log('✅ Story progression debug mode enabled');
    } else {
        console.error('❌ gameState not available');
    }
};

// Disable debug mode
window.disableStoryDebug = function() {
    if (window.gameState) {
        window.gameState.debugMode = false;
        console.log('✅ Story progression debug mode disabled');
    }
};

// Force story progression check for a character
window.forceStoryProgressionCheck = function(characterId = 'momo') {
    console.log(`🔧 Force checking story progression for ${characterId}...`);
    
    const gameLogic = window.gameModules?.getModule('gameLogic');
    if (!gameLogic) {
        console.error('❌ Game logic module not available');
        return false;
    }
    
    const character = window.gameData?.characters?.[characterId];
    if (!character) {
        console.error(`❌ Character ${characterId} not found in gameData`);
        return false;
    }
    
    // Merge character data from characterData if needed
    const characterDefinition = window.characterData?.[characterId];
    if (characterDefinition) {
        // Ensure story events and thresholds are available
        if (!character.storyEvents && characterDefinition.storyEvents) {
            character.storyEvents = characterDefinition.storyEvents;
            console.log(`📋 Added story events to ${characterId}`);
        }
        if (!character.storyThresholds && characterDefinition.storyThresholds) {
            character.storyThresholds = characterDefinition.storyThresholds;
            console.log(`📋 Added story thresholds to ${characterId}`);
        }
    }
    
    // Check story progression
    if (typeof gameLogic.checkStoryProgression === 'function') {
        console.log(`🎭 Running story progression check for ${character.name}...`);
        gameLogic.checkStoryProgression(character);
        console.log(`✅ Story progression check completed for ${characterId}`);
        return true;
    } else {
        console.error('❌ checkStoryProgression function not available');
        return false;
    }
};

// Bulletproof arena unlock that bypasses story system entirely
window.bulletproofArenaUnlock = function() {
    console.log('🎆 === BULLETPROOF ARENA UNLOCK - BYPASSING STORY SYSTEM ===');
    
    try {
        // Step 1: Ensure gameData exists
        if (!window.gameData) {
            console.error('❌ gameData not found - game not initialized');
            return false;
        }
        
        // Step 2: Force unlock Momo character
        if (!window.gameData.characters.momo) {
            console.log('📝 Creating Momo character data...');
            window.gameData.characters.momo = {
                id: 'momo',
                name: 'Momo',
                unlocked: true,
                level: 1,
                bondPoints: 25000,
                storyProgress: 7, // Set to past momo_7 event
                baseLpPerSecond: 8,
                baseCost: 150,
                costGrowth: 1.18
            };
        } else {
            console.log('📝 Ensuring Momo is properly unlocked...');
            window.gameData.characters.momo.unlocked = true;
            window.gameData.characters.momo.bondPoints = Math.max(25000, window.gameData.characters.momo.bondPoints || 0);
            window.gameData.characters.momo.storyProgress = Math.max(7, window.gameData.characters.momo.storyProgress || 0);
        }
        
        // Step 3: Force unlock arena directly
        if (!window.gameData.minigames) {
            window.gameData.minigames = {};
        }
        if (!window.gameData.minigames.arena) {
            window.gameData.minigames.arena = {
                unlocked: true,
                level: 1,
                experience: 0,
                hp: 100,
                maxHp: 100
            };
        } else {
            window.gameData.minigames.arena.unlocked = true;
        }
        
        console.log('✅ Arena force unlocked in gameData');
        
        // Step 4: Trigger arena unlock callbacks manually
        try {
            const momoCharacterData = window.characterData?.momo;
            if (momoCharacterData?.arenaCallbacks?.onArenaUnlock) {
                console.log('🔧 Triggering Momo arena unlock callback...');
                momoCharacterData.arenaCallbacks.onArenaUnlock.call(momoCharacterData);
                console.log('✅ Arena unlock callback triggered');
            }
        } catch (error) {
            console.warn('⚠️ Arena unlock callback failed:', error);
            // Continue anyway
        }
        
        // Step 5: Add essence reward manually
        if (window.gameData.sanctuaryEssence !== undefined) {
            window.gameData.sanctuaryEssence += 2;
            console.log('✅ Added 2 Sanctuary Essence');
        }
        
        // Step 6: Show notifications
        if (window.showNotification) {
            window.showNotification('🏟️ Arena odblokowana! (Bulletproof unlock)', 'success', 5000);
            window.showNotification('📈 +2 Esencja Sanktuarium', 'info', 3000);
        }
        
        // Step 7: Update UI
        const ui = window.gameModules?.getModule('ui');
        if (ui && ui.updateAll) {
            ui.updateAll();
            console.log('✅ UI updated');
        }
        
        console.log('🎉 BULLETPROOF ARENA UNLOCK COMPLETE!');
        
        // Verify unlock worked
        const arenaUnlocked = window.gameData?.minigames?.arena?.unlocked;
        const momoUnlocked = window.gameData?.characters?.momo?.unlocked;
        
        console.log(`Final status - Arena: ${arenaUnlocked ? '✅' : '❌'}, Momo: ${momoUnlocked ? '✅' : '❌'}`);
        
        return arenaUnlocked && momoUnlocked;
        
    } catch (error) {
        console.error('❌ Bulletproof unlock failed:', error);
        return false;
    }
};