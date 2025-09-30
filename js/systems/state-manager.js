// State Manager - Save/Load System
// Wszystkie Moje Potwory

// State Manager Module Factory
function createStateManagerModule(dependencies, moduleManager) {
    // Configuration
    const config = {
        saveKey: 'wszystkie_moje_potwory_save',
        backupKey: 'wszystkie_moje_potwory_backup',
        maxBackups: 5,
        compressionEnabled: true,
        version: '0.1.0',
        
        // Version compatibility matrix
        supportedVersions: {
            '0.1.0': { compatible: true, migration: null },
            '0.0.9': { compatible: true, migration: 'migrate_0_0_9_to_0_1_0' }
        },
        
        // Data integrity settings
        enableChecksums: true,
        enableCompression: false, // Disabled for now for easier debugging
        maxSaveSize: 1024 * 1024 // 1MB limit
    };
    
    // Save/Load state
    const state = {
        lastSave: null,
        lastLoad: null,
        autoSaveEnabled: true,
        backups: [],
        saveInProgress: false,
        loadCompleted: false
    };
    
    // Enhanced save data validation with comprehensive checks
    function validateSaveData(data) {
        try {
            if (!data || typeof data !== 'object') {
                console.warn('💾 Save data is not an object');
                return { valid: false, reason: 'invalid_format' };
            }
            
            // Check required properties
            const requiredProps = ['version', 'lustPoints', 'characters'];
            for (const prop of requiredProps) {
                if (!(prop in data)) {
                    console.warn(`💾 Missing required property: ${prop}`);
                    return { valid: false, reason: 'missing_property', property: prop };
                }
            }
            
            // Enhanced version compatibility check
            if (!isVersionCompatible(data.version)) {
                console.warn(`💾 Incompatible version: ${data.version} vs ${config.version}`);
                return { valid: false, reason: 'incompatible_version', version: data.version };
            }
            
            // Validate data types and ranges
            const validationErrors = [];
            
            if (typeof data.lustPoints !== 'number' || data.lustPoints < 0) {
                validationErrors.push('lustPoints must be a non-negative number');
            }
            
            if (typeof data.characters !== 'object') {
                validationErrors.push('characters must be an object');
            }
            
            // Validate character data
            if (data.characters) {
                for (const [charId, charData] of Object.entries(data.characters)) {
                    if (!validateCharacterData(charId, charData)) {
                        validationErrors.push(`Invalid character data for ${charId}`);
                    }
                }
            }
            
            // Validate new systems
            if (data.sanctuaryEssence !== undefined) {
                if (typeof data.sanctuaryEssence !== 'number' || data.sanctuaryEssence < 0) {
                    validationErrors.push('sanctuaryEssence must be a non-negative number');
                }
            }
            
            if (data.mainQuest && typeof data.mainQuest.level !== 'number') {
                validationErrors.push('mainQuest.level must be a number');
            }
            
            // Check for data corruption
            if (validationErrors.length > 0) {
                console.warn('💾 Save data validation errors:', validationErrors);
                return { valid: false, reason: 'validation_errors', errors: validationErrors };
            }
            
            return { valid: true };
            
        } catch (error) {
            console.error('💾 Error validating save data:', error);
            return { valid: false, reason: 'validation_exception', error: error.message };
        }
    }
    
    // Validate individual character data
    function validateCharacterData(charId, charData) {
        if (!charData || typeof charData !== 'object') return false;
        
        const requiredProps = ['unlocked', 'level', 'bondPoints'];
        for (const prop of requiredProps) {
            if (!(prop in charData)) return false;
        }
        
        // Type and range validation
        if (typeof charData.unlocked !== 'boolean') return false;
        if (typeof charData.level !== 'number' || charData.level < 0) return false;
        if (typeof charData.bondPoints !== 'number' || charData.bondPoints < 0) return false;
        
        return true;
    }
    
    // Check version compatibility
    function isVersionCompatible(version) {
        if (!version) return false;
        
        // Check against supported versions
        if (config.supportedVersions[version]) {
            return config.supportedVersions[version].compatible;
        }
        
        // Parse version numbers for comparison
        const parseVersion = (v) => v.split('.').map(Number);
        const saveVersion = parseVersion(version);
        const currentVersion = parseVersion(config.version);
        
        // Major version must match, minor version can be lower
        return saveVersion[0] === currentVersion[0] && saveVersion[1] <= currentVersion[1];
    }
    
    // Prepare data for saving (clean and optimize)
    function prepareSaveData() {
        if (!gameData) {
            console.error('Game data not available for saving');
            return null;
        }
        
        try {
            // Create a clean copy of game data
            const saveData = {
                // Metadata
                version: gameData.version,
                lastSaved: Date.now(),
                playtime: gameData.playtime || 0,
                
                // Core game state
                lustPoints: gameData.lustPoints || 0,
                goldCoins: gameData.goldCoins || 0,
                sanctuaryEssence: gameData.sanctuaryEssence || 0,
                
                // Character data
                characters: {},
                activeCharacterId: gameData.activeCharacterId,
                
                // Buildings
                manor: gameData.manor ? { ...gameData.manor } : {},
                
                // Quest progression
                mainQuest: gameData.mainQuest ? { ...gameData.mainQuest } : { level: 0 },
                
                // Minigames
                minigames: {
                    garden: gameData.minigames?.garden ? {
                        unlocked: gameData.minigames.garden.unlocked,
                        plots: gameData.minigames.garden.plots,
                        seeds: gameData.minigames.garden.seeds
                    } : { unlocked: false },
                    arena: gameData.minigames?.arena ? {
                        unlocked: gameData.minigames.arena.unlocked,
                        level: gameData.minigames.arena.level,
                        experience: gameData.minigames.arena.experience,
                        questsCompleted: gameData.minigames.arena.questsCompleted,
                        stats: gameData.minigames.arena.stats,
                        equipment: gameData.minigames.arena.equipment
                    } : { unlocked: false }
                },
                
                // Settings
                settings: gameData.settings ? { ...gameData.settings } : {},
                
                // Statistics
                statistics: gameData.statistics ? { ...gameData.statistics } : {},
                
                // Story progression
                story: {
                    completedEvents: gameData.story?.completedEvents || [],
                    globalFlags: gameData.story?.globalFlags || {}
                },
                
                // UI state
                ui: {
                    rightPanelTab: gameData.ui?.rightPanelTab || 'characters'
                },
                
                // New systems data
                sanctuaryBonuses: gameData.sanctuaryBonuses || {},
                features: gameData.features || {},
                passiveTrees: {}
            };
            
            // Save character data (only important properties)
            if (gameData.characters) {
                Object.keys(gameData.characters).forEach(charId => {
                    const char = gameData.characters[charId];
                    if (char) {
                        saveData.characters[charId] = {
                            unlocked: char.unlocked,
                            level: char.level,
                            bondPoints: char.bondPoints,
                            storyProgress: char.storyProgress,
                            totalEarned: char.totalEarned || 0,
                            totalClicks: char.totalClicks || 0,
                            timesLeveled: char.timesLeveled || 0,
                            
                            // New systems
                            passiveTree: char.passiveTree || null,
                            passiveBonuses: char.passiveBonuses || null,
                            lastInteraction: char.lastInteraction || null
                        };
                        
                        // Save passive tree data globally as well
                        if (char.passiveTree) {
                            saveData.passiveTrees[charId] = char.passiveTree;
                        }
                    }
                });
            }
            
            return saveData;
        } catch (error) {
            console.error('Error preparing save data:', error);
            return null;
        }
    }
    
    // Apply loaded data to game state
    function applySaveData(saveData) {
        if (!gameData || !saveData) {
            console.error('Cannot apply save data: game data or save data is null');
            return false;
        }
        
        try {
            // Apply core properties
            gameData.lustPoints = gameUtils.validateNumber(saveData.lustPoints, 0);
            gameData.goldCoins = gameUtils.validateNumber(saveData.goldCoins, 0);
            gameData.sanctuaryEssence = gameUtils.validateNumber(saveData.sanctuaryEssence, 0);
            gameData.playtime = gameUtils.validateNumber(saveData.playtime, 0);
            
            // Apply character data
            if (saveData.characters && gameData.characters) {
                Object.keys(saveData.characters).forEach(charId => {
                    const savedChar = saveData.characters[charId];
                    const gameChar = gameData.characters[charId];
                    
                    if (gameChar && savedChar) {
                        gameChar.unlocked = Boolean(savedChar.unlocked);
                        gameChar.level = gameUtils.validateNumber(savedChar.level, 0);
                        gameChar.bondPoints = gameUtils.validateNumber(savedChar.bondPoints, 0);
                        gameChar.storyProgress = gameUtils.validateNumber(savedChar.storyProgress, 0);
                        gameChar.totalEarned = gameUtils.validateNumber(savedChar.totalEarned, 0);
                        gameChar.totalClicks = gameUtils.validateNumber(savedChar.totalClicks, 0);
                        gameChar.timesLeveled = gameUtils.validateNumber(savedChar.timesLeveled, 0);
                        gameChar.lastInteraction = savedChar.lastInteraction || null;
                        
                        // Apply passive tree data
                        if (savedChar.passiveTree) {
                            gameChar.passiveTree = savedChar.passiveTree;
                        } else if (saveData.passiveTrees && saveData.passiveTrees[charId]) {
                            gameChar.passiveTree = saveData.passiveTrees[charId];
                        }
                        
                        // Apply passive bonuses
                        if (savedChar.passiveBonuses) {
                            gameChar.passiveBonuses = savedChar.passiveBonuses;
                        }
                    }
                });
            }
            
            // Apply active character
            if (saveData.activeCharacterId && gameData.characters[saveData.activeCharacterId]) {
                gameData.activeCharacterId = saveData.activeCharacterId;
            }
            
            // Apply buildings
            if (saveData.manor && gameData.manor) {
                Object.keys(saveData.manor).forEach(buildingId => {
                    const savedBuilding = saveData.manor[buildingId];
                    const gameBuilding = gameData.manor[buildingId];
                    
                    if (gameBuilding && savedBuilding) {
                        gameBuilding.level = gameUtils.validateNumber(savedBuilding.level, 0);
                        gameBuilding.unlocked = Boolean(savedBuilding.unlocked);
                    }
                });
            }
            
            // Apply main quest
            if (saveData.mainQuest) {
                gameData.mainQuest.level = gameUtils.validateNumber(saveData.mainQuest.level, 0);
                gameData.mainQuest.unlockedFeatures = saveData.mainQuest.unlockedFeatures || [];
            }
            
            // Apply minigames
            if (saveData.minigames) {
                if (saveData.minigames.garden && gameData.minigames.garden) {
                    gameData.minigames.garden.unlocked = Boolean(saveData.minigames.garden.unlocked);
                    if (saveData.minigames.garden.plots) {
                        gameData.minigames.garden.plots = saveData.minigames.garden.plots;
                    }
                    if (saveData.minigames.garden.seeds) {
                        gameData.minigames.garden.seeds = saveData.minigames.garden.seeds;
                    }
                }
                
                // Handle arena loading with fallback for missing data
                if (saveData.minigames.arena) {
                    // Ensure arena structure exists in gameData
                    if (!gameData.minigames.arena) {
                        console.log('⚠️ Creating missing arena structure during load');
                        gameData.minigames.arena = {
                            unlocked: false,
                            hasBeenVisited: false,
                            level: 1,
                            experience: 0,
                            experienceToNext: 100,
                            hp: 100,
                            maxHp: 100,
                            stamina: { current: 100, max: 100 },
                            isResting: false,
                            restStartTime: 0,
                            restDuration: 90,
                            currentQuest: null,
                            currentActivity: "Gotowa do walki",
                            activityProgress: 0,
                            currentStage: 0,
                            stageProgress: 0,
                            questProgress: 0,
                            questsCompleted: 0,
                            totalDeaths: 0,
                            itemsFound: 0,
                            goldEarned: 0,
                            logEntries: [],
                            stats: {
                                sila: 10,
                                zrecznosc: 6,
                                inteligencja: 5,
                                szczescie: 7,
                                cyce: 10,
                                dupa: 10,
                                cipka: "Dziewicza"
                            },
                            skillProgress: {
                                sila: 0,
                                zrecznosc: 0,
                                inteligencja: 0,
                                szczescie: 0,
                                cyce: 0,
                                dupa: 0
                            },
                            skillCaps: {
                                sila: 100,
                                zrecznosc: 100,
                                inteligencja: 100,
                                szczescie: 100,
                                cyce: 10,
                                dupa: 10
                            },
                            equipment: {
                                weapon: null,
                                armor: null,
                                accessory: null,
                                artefakt: null
                            },
                            equipmentCondition: {
                                weapon: 100,
                                armor: 100,
                                accessory: 100,
                                artefakt: 100
                            },
                            combatPhase: { current: 0, total: 5, progress: 0 },
                            comboMeter: { count: 0, progress: 0, maxCombo: 10 },
                            skillTraining: { active: null, progress: 0 },
                            cipkaEffects: {
                                sensitivity: 0.5,
                                wetness: 0.1,
                                corruption: 0.0,
                                magic_resistance: 1.0,
                                recovery_time: 1.0
                            }
                        };
                    }
                    
                    // Load arena data safely
                    gameData.minigames.arena.unlocked = Boolean(saveData.minigames.arena.unlocked);
                    gameData.minigames.arena.level = gameUtils.validateNumber(saveData.minigames.arena.level, 1);
                    gameData.minigames.arena.experience = gameUtils.validateNumber(saveData.minigames.arena.experience, 0);
                    gameData.minigames.arena.questsCompleted = gameUtils.validateNumber(saveData.minigames.arena.questsCompleted, 0);
                    
                    if (saveData.minigames.arena.stats) {
                        Object.assign(gameData.minigames.arena.stats, saveData.minigames.arena.stats);
                    }
                    
                    if (saveData.minigames.arena.equipment) {
                        gameData.minigames.arena.equipment = saveData.minigames.arena.equipment;
                    }
                    
                    console.log('✅ Arena data loaded from save, unlocked:', gameData.minigames.arena.unlocked);
                } else {
                    console.log('📋 No arena data in save file, keeping default state');
                }
            }
            
            // Apply settings
            if (saveData.settings) {
                Object.assign(gameData.settings, saveData.settings);
            }
            
            // Apply statistics
            if (saveData.statistics) {
                Object.assign(gameData.statistics, saveData.statistics);
            }
            
            // Apply story progress
            if (saveData.story) {
                gameData.story.completedEvents = saveData.story.completedEvents || [];
                gameData.story.globalFlags = saveData.story.globalFlags || {};
            }
            
            // Apply UI state
            if (saveData.ui) {
                gameData.ui.rightPanelTab = saveData.ui.rightPanelTab || 'characters';
            }
            
            // Apply sanctuary bonuses
            if (saveData.sanctuaryBonuses) {
                gameData.sanctuaryBonuses = saveData.sanctuaryBonuses;
            }
            
            // Apply unlocked features
            if (saveData.features) {
                gameData.features = saveData.features;
            }
            
            // Mark game as started if any progress exists
            if (gameData.lustPoints > 0 || gameData.statistics.totalClicks > 0) {
                gameData.gameStarted = true;
            }
            
            // Update last loaded time
            gameData.lastSaved = saveData.lastSaved;
            state.lastLoad = Date.now();
            state.loadCompleted = true;
            
            // Refresh UI to reflect loaded character data
            const ui = window.gameModules?.getModule('ui') || window.ui;
            if (ui && ui.renderCharactersList) {
                ui.renderCharactersList();
                console.log('UI refreshed after loading save data');
            }
            
            console.log('Save data applied successfully');
            return true;
            
        } catch (error) {
            console.error('Error applying save data:', error);
            return false;
        }
    }
    
    // Save game to localStorage
    function saveGame() {
        if (state.saveInProgress) {
            console.log('Save already in progress, skipping');
            return false;
        }
        
        state.saveInProgress = true;
        
        try {
            const saveData = prepareSaveData();
            if (!saveData) {
                console.error('Failed to prepare save data');
                return false;
            }
            
            // Create backup before saving
            createBackup();
            
            // Save to localStorage
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(config.saveKey, saveString);
            
            // Update state
            state.lastSave = Date.now();
            gameData.lastSaved = state.lastSave;
            
            console.log('Game saved successfully');
            
            // Show notification
            if (window.showNotification) {
                window.showNotification('Gra zapisana', 'success', 1000);
            }
            
            return true;
            
        } catch (error) {
            console.error('Error saving game:', error);
            
            if (window.showNotification) {
                window.showNotification('Błąd podczas zapisywania', 'error');
            }
            
            return false;
        } finally {
            state.saveInProgress = false;
        }
    }
    
    // Load game from localStorage
    function loadGame() {
        try {
            const saveString = localStorage.getItem(config.saveKey);
            if (!saveString) {
                console.log('No save data found');
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            
            if (!validateSaveData(saveData)) {
                console.error('Invalid save data');
                return false;
            }
            
            const success = applySaveData(saveData);
            
            if (success) {
                console.log('Game loaded successfully');
                
                if (window.showNotification) {
                    window.showNotification('Gra wczytana', 'success', 1000);
                }
            } else {
                console.error('Failed to apply save data');
            }
            
            return success;
            
        } catch (error) {
            console.error('Error loading game:', error);
            
            if (window.showNotification) {
                window.showNotification('Błąd podczas wczytywania', 'error');
            }
            
            return false;
        }
    }
    
    // Create backup
    function createBackup() {
        try {
            const currentSave = localStorage.getItem(config.saveKey);
            if (!currentSave) return;
            
            const timestamp = Date.now();
            const backupKey = `${config.backupKey}_${timestamp}`;
            
            localStorage.setItem(backupKey, currentSave);
            state.backups.push({ key: backupKey, timestamp });
            
            // Remove old backups
            if (state.backups.length > config.maxBackups) {
                const oldBackup = state.backups.shift();
                localStorage.removeItem(oldBackup.key);
            }
            
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }
    
    // Get available backups
    function getBackups() {
        const backups = [];
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(config.backupKey)) {
                    const saveString = localStorage.getItem(key);
                    if (saveString) {
                        const saveData = JSON.parse(saveString);
                        backups.push({
                            key,
                            timestamp: saveData.lastSaved || 0,
                            lustPoints: saveData.lustPoints || 0,
                            playtime: saveData.playtime || 0
                        });
                    }
                }
            }
            
            return backups.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('Error getting backups:', error);
            return [];
        }
    }
    
    // Load from backup
    function loadBackup(backupKey) {
        try {
            const saveString = localStorage.getItem(backupKey);
            if (!saveString) {
                console.error('Backup not found:', backupKey);
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            
            if (!validateSaveData(saveData)) {
                console.error('Invalid backup data');
                return false;
            }
            
            const success = applySaveData(saveData);
            
            if (success) {
                console.log('Backup loaded successfully');
                
                if (window.showNotification) {
                    window.showNotification('Backup wczytany', 'success');
                }
            }
            
            return success;
            
        } catch (error) {
            console.error('Error loading backup:', error);
            return false;
        }
    }
    
    // Delete save data
    function deleteSave() {
        try {
            localStorage.removeItem(config.saveKey);
            console.log('Save data deleted');
            return true;
        } catch (error) {
            console.error('Error deleting save:', error);
            return false;
        }
    }
    
    // Export save data
    function exportSave() {
        try {
            const saveData = prepareSaveData();
            if (!saveData) return null;
            
            const exportString = JSON.stringify(saveData, null, 2);
            const blob = new Blob([exportString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `wszystkie_moje_potwory_save_${timestamp}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            
            URL.revokeObjectURL(url);
            
            if (window.showNotification) {
                window.showNotification('Gra wyeksportowana', 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Error exporting save:', error);
            return false;
        }
    }
    
    // Import save data
    function importSave(fileContent) {
        try {
            const saveData = JSON.parse(fileContent);
            
            if (!validateSaveData(saveData)) {
                if (window.showNotification) {
                    window.showNotification('Nieprawidłowy plik zapisu', 'error');
                }
                return false;
            }
            
            // Create backup before importing
            createBackup();
            
            const success = applySaveData(saveData);
            
            if (success) {
                saveGame(); // Save the imported data
                
                if (window.showNotification) {
                    window.showNotification('Gra zaimportowana', 'success');
                }
                
                // Refresh UI
                const ui = window.gameModules?.getModule('ui') || window.ui;
                if (ui && ui.updateAll) {
                    ui.updateAll();
                }
            }
            
            return success;
            
        } catch (error) {
            console.error('Error importing save:', error);
            
            if (window.showNotification) {
                window.showNotification('Błąd podczas importu', 'error');
            }
            
            return false;
        }
    }
    
    // Check storage availability
    function checkStorageAvailable() {
        try {
            const test = 'storage_test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            console.error('localStorage not available:', error);
            return false;
        }
    }
    
    // Get storage usage info
    function getStorageInfo() {
        try {
            const saveData = localStorage.getItem(config.saveKey);
            const totalSize = JSON.stringify(localStorage).length;
            const saveSize = saveData ? saveData.length : 0;
            
            return {
                totalSize,
                saveSize,
                available: checkStorageAvailable(),
                lastSave: state.lastSave,
                lastLoad: state.lastLoad
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    }
    
    // Initialize the state manager
    function initialize() {
        if (!checkStorageAvailable()) {
            console.warn('localStorage not available - saves will not work');
            return false;
        }
        
        // Load existing backups list
        state.backups = getBackups().map(backup => ({
            key: backup.key,
            timestamp: backup.timestamp
        }));
        
        console.log('State Manager initialized');
        return true;
    }
    
    // Cleanup
    function cleanup() {
        state.backups = [];
        console.log('State Manager cleanup complete');
    }
    
    // Return module interface
    return {
        // Core functions
        saveGame,
        loadGame,
        deleteSave,
        
        // Backup management
        createBackup,
        getBackups,
        loadBackup,
        
        // Import/Export
        exportSave,
        importSave,
        
        // Utilities
        getStorageInfo,
        checkStorageAvailable,
        validateSaveData,
        
        // State
        getState: () => ({ ...state }),
        
        // Module lifecycle
        initialize,
        cleanup
    };
}

// Register state manager module
if (window.gameModules) {
    window.gameModules.registerModule('stateManager', createStateManagerModule, []);
} else {
    // Fallback: create state manager directly with proper parameters
    window.stateManager = createStateManagerModule(
        {}, 
        window.gameModules
    );
}

// Global functions for save/load UI
window.saveGame = function() {
    const stateManager = window.gameModules?.getModule('stateManager') || window.stateManager;
    if (stateManager) {
        return stateManager.saveGame();
    }
    return false;
};

window.loadGame = function() {
    const stateManager = window.gameModules?.getModule('stateManager') || window.stateManager;
    if (stateManager) {
        return stateManager.loadGame();
    }
    return false;
};

window.exportSave = function() {
    const stateManager = window.gameModules?.getModule('stateManager') || window.stateManager;
    if (stateManager) {
        return stateManager.exportSave();
    }
    return false;
};

console.log('State Manager module loaded successfully');