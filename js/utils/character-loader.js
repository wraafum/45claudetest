// Character Loader Utility
// Centralized multi-file character loading and validation
// Wszystkie Moje Potwory

// Character Loader Module Factory
function createCharacterLoaderModule() {
    // Configuration
    const config = {
        characterBasePath: 'js/characters/',
        requiredFileTypes: ['base'],
        optionalFileTypes: ['story-1-5', 'story-6-9', 'story-10-plus', 'arena', 'garden', 'special'],
        validationStrict: false,
        loadTimeout: 10000 // 10 seconds
    };
    
    // Loading state
    const state = {
        loadedCharacters: new Map(),
        loadingPromises: new Map(),
        failedLoads: new Set(),
        loadOrder: [],
        totalLoadTime: 0
    };
    
    // Character validation schema
    const characterSchema = {
        required: ['id', 'name', 'unlocked'],
        optional: ['title', 'description', 'image', 'avatar', 'clickImage', 'level', 'bondPoints', 'storyProgress', 'baseCost', 'costGrowth', 'baseLpPerSecond', 'baseBpPerSecond', 'bio'],
        arrays: ['storyEvents', 'storyThresholds', 'clickComments', 'bio'],
        objects: ['upgrades', 'production', 'passiveTree', 'passiveBonuses']
    };
    
    // Validate character data structure
    function validateCharacterData(characterData, characterId) {
        const errors = [];
        const warnings = [];
        
        if (!characterData || typeof characterData !== 'object') {
            errors.push(`Character data for ${characterId} is not an object`);
            return { valid: false, errors, warnings };
        }
        
        // Check required fields
        characterSchema.required.forEach(field => {
            if (!(field in characterData)) {
                errors.push(`Missing required field: ${field}`);
            }
        });
        
        // Validate ID matches
        if (characterData.id && characterData.id !== characterId) {
            warnings.push(`Character ID mismatch: expected ${characterId}, got ${characterData.id}`);
        }
        
        // Validate data types
        if (characterData.unlocked !== undefined && typeof characterData.unlocked !== 'boolean') {
            errors.push('unlocked field must be boolean');
        }
        
        if (characterData.unlockCost !== undefined && typeof characterData.unlockCost !== 'number') {
            errors.push('unlockCost field must be number');
        }
        
        if (characterData.level !== undefined && typeof characterData.level !== 'number') {
            errors.push('level field must be number');
        }
        
        if (characterData.bondPoints !== undefined && typeof characterData.bondPoints !== 'number') {
            errors.push('bondPoints field must be number');
        }
        
        // Validate arrays
        characterSchema.arrays.forEach(field => {
            if (characterData[field] !== undefined && !Array.isArray(characterData[field])) {
                errors.push(`${field} field must be array`);
            }
        });
        
        // Validate objects
        characterSchema.objects.forEach(field => {
            if (characterData[field] !== undefined && typeof characterData[field] !== 'object') {
                errors.push(`${field} field must be object`);
            }
        });
        
        // Validate story events structure
        if (characterData.storyEvents) {
            characterData.storyEvents.forEach((event, index) => {
                if (!event.id) {
                    errors.push(`Story event ${index} missing id`);
                }
                if (!event.title) {
                    warnings.push(`Story event ${event.id || index} missing title`);
                }
                if (!event.text) {
                    warnings.push(`Story event ${event.id || index} missing text`);
                }
            });
        }
        
        const valid = errors.length === 0;
        return { valid, errors, warnings };
    }
    
    // Detect character file structure (single file vs multi-file)
    function detectCharacterStructure(characterId) {
        const singleFilePath = `${config.characterBasePath}${characterId}.js`;
        const multiFileBasePath = `${config.characterBasePath}${characterId}/${characterId}-base.js`;
        
        // Check if character data is already loaded in window.characterData
        if (window.characterData && window.characterData[characterId]) {
            return {
                type: 'preloaded',
                files: [],
                characterData: window.characterData[characterId]
            };
        }
        
        // For now, we'll assume structure based on known patterns
        // In a real implementation, you might check file existence
        const knownMultiFileCharacters = ['szafran', 'momo', 'furia', 'lucja'];
        const knownSingleFileCharacters = ['alina', 'bastet', 'duo_kroliczki', 'mara', 'mimi', 'mina', 'promilia', 'zmora'];
        
        if (knownMultiFileCharacters.includes(characterId)) {
            return {
                type: 'multi-file',
                basePath: `${config.characterBasePath}${characterId}/`,
                files: [
                    `${characterId}-base.js`,
                    `${characterId}-story-1-5.js`,
                    `${characterId}-story-6-9.js`,
                    `${characterId}-story-10-14.js`
                ]
            };
        } else if (knownSingleFileCharacters.includes(characterId)) {
            return {
                type: 'single-file',
                files: [`${characterId}.js`]
            };
        } else {
            // Unknown character, try multi-file first
            return {
                type: 'unknown',
                possibleStructures: [
                    {
                        type: 'multi-file',
                        basePath: `${config.characterBasePath}${characterId}/`,
                        files: [`${characterId}-base.js`]
                    },
                    {
                        type: 'single-file',
                        basePath: config.characterBasePath,
                        files: [`${characterId}.js`]
                    }
                ]
            };
        }
    }
    
    // Load character files dynamically
    async function loadCharacterFiles(characterId, structure) {
        if (structure.type === 'preloaded') {
            return structure.characterData;
        }
        
        const loadPromises = [];
        const basePath = structure.basePath || config.characterBasePath;
        
        for (const fileName of structure.files) {
            const filePath = basePath + fileName;
            loadPromises.push(loadScriptFile(filePath));
        }
        
        try {
            await Promise.all(loadPromises);
            
            // Check if character data was loaded
            if (window.characterData && window.characterData[characterId]) {
                return window.characterData[characterId];
            } else {
                throw new Error(`Character data not found after loading files for ${characterId}`);
            }
        } catch (error) {
            console.error(`Failed to load character files for ${characterId}:`, error);
            throw error;
        }
    }
    
    // Load script file dynamically
    function loadScriptFile(filePath) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${filePath}"]`);
            if (existingScript) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = filePath;
            script.async = true;
            
            script.onload = () => {
                console.log(`Loaded character script: ${filePath}`);
                resolve();
            };
            
            script.onerror = () => {
                console.error(`Failed to load character script: ${filePath}`);
                reject(new Error(`Failed to load script: ${filePath}`));
            };
            
            // Set timeout
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout loading script: ${filePath}`));
            }, config.loadTimeout);
            
            script.onload = () => {
                clearTimeout(timeout);
                console.log(`Loaded character script: ${filePath}`);
                resolve();
            };
            
            document.head.appendChild(script);
        });
    }
    
    // Load single character with validation
    async function loadCharacter(characterId) {
        if (state.loadingPromises.has(characterId)) {
            return state.loadingPromises.get(characterId);
        }
        
        const loadPromise = (async () => {
            try {
                console.log(`Loading character: ${characterId}`);
                const startTime = performance.now();
                
                // Detect character structure
                const structure = detectCharacterStructure(characterId);
                console.log(`Character ${characterId} structure:`, structure.type);
                
                // Load character files
                const characterData = await loadCharacterFiles(characterId, structure);
                
                // Validate character data
                const validation = validateCharacterData(characterData, characterId);
                
                if (!validation.valid) {
                    if (config.validationStrict) {
                        throw new Error(`Character validation failed for ${characterId}: ${validation.errors.join(', ')}`);
                    } else {
                        console.warn(`Character validation warnings for ${characterId}:`, validation.errors, validation.warnings);
                    }
                }
                
                if (validation.warnings.length > 0) {
                    console.warn(`Character validation warnings for ${characterId}:`, validation.warnings);
                }
                
                // Store loaded character
                state.loadedCharacters.set(characterId, {
                    data: characterData,
                    loadTime: performance.now() - startTime,
                    structure: structure.type,
                    validation
                });
                
                state.loadOrder.push(characterId);
                state.totalLoadTime += performance.now() - startTime;
                
                console.log(`Successfully loaded character ${characterId} in ${(performance.now() - startTime).toFixed(2)}ms`);
                return characterData;
                
            } catch (error) {
                console.error(`Failed to load character ${characterId}:`, error);
                state.failedLoads.add(characterId);
                throw error;
            } finally {
                state.loadingPromises.delete(characterId);
            }
        })();
        
        state.loadingPromises.set(characterId, loadPromise);
        return loadPromise;
    }
    
    // Load multiple characters
    async function loadCharacters(characterIds, options = {}) {
        const { 
            concurrent = true, 
            failFast = false,
            retries = 1 
        } = options;
        
        console.log(`Loading ${characterIds.length} characters:`, characterIds);
        
        const results = {
            success: [],
            failed: [],
            totalTime: 0
        };
        
        const startTime = performance.now();
        
        if (concurrent) {
            // Load all characters concurrently
            const loadPromises = characterIds.map(async (characterId) => {
                try {
                    for (let attempt = 0; attempt <= retries; attempt++) {
                        try {
                            await loadCharacter(characterId);
                            results.success.push(characterId);
                            break;
                        } catch (error) {
                            if (attempt === retries) {
                                throw error;
                            }
                            console.warn(`Retry ${attempt + 1} for character ${characterId}`);
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                        }
                    }
                } catch (error) {
                    results.failed.push({ characterId, error: error.message });
                    if (failFast) {
                        throw error;
                    }
                }
            });
            
            if (failFast) {
                await Promise.all(loadPromises);
            } else {
                await Promise.allSettled(loadPromises);
            }
        } else {
            // Load characters sequentially
            for (const characterId of characterIds) {
                try {
                    await loadCharacter(characterId);
                    results.success.push(characterId);
                } catch (error) {
                    results.failed.push({ characterId, error: error.message });
                    if (failFast) {
                        break;
                    }
                }
            }
        }
        
        results.totalTime = performance.now() - startTime;
        
        console.log(`Character loading completed in ${results.totalTime.toFixed(2)}ms:`, {
            success: results.success.length,
            failed: results.failed.length
        });
        
        if (results.failed.length > 0) {
            console.warn('Failed character loads:', results.failed);
        }
        
        return results;
    }
    
    // Get character data (from cache or load)
    async function getCharacter(characterId) {
        if (state.loadedCharacters.has(characterId)) {
            return state.loadedCharacters.get(characterId).data;
        }
        
        return await loadCharacter(characterId);
    }
    
    // Check if character is loaded
    function isCharacterLoaded(characterId) {
        return state.loadedCharacters.has(characterId);
    }
    
    // Get loading statistics
    function getLoadingStats() {
        return {
            totalCharacters: state.loadedCharacters.size,
            loadOrder: [...state.loadOrder],
            totalLoadTime: state.totalLoadTime,
            averageLoadTime: state.totalLoadTime / state.loadedCharacters.size || 0,
            failedLoads: [...state.failedLoads],
            loadedCharacters: Array.from(state.loadedCharacters.keys())
        };
    }
    
    // Auto-discover and load all available characters
    async function loadAllCharacters(options = {}) {
        const { forceReload = false } = options;
        
        // Get all known character IDs
        const allCharacterIds = [
            ...config.knownMultiFileCharacters || ['szafran', 'momo', 'furia', 'lucja'],
            ...config.knownSingleFileCharacters || ['alina', 'bastet', 'duo_kroliczki', 'mara', 'mimi', 'mina', 'promilia', 'zmora']
        ];
        
        console.log(`🔍 Auto-loading all ${allCharacterIds.length} characters...`);
        
        // Filter out already loaded characters unless forceReload
        const charactersToLoad = forceReload 
            ? allCharacterIds 
            : allCharacterIds.filter(id => !state.loadedCharacters.has(id));
        
        if (charactersToLoad.length === 0) {
            console.log('✅ All characters already loaded');
            return { success: allCharacterIds, failed: [], totalTime: 0 };
        }
        
        // Load characters with error tolerance
        const result = await loadCharacters(charactersToLoad, {
            concurrent: true,
            failFast: false,
            retries: 2
        });
        
        console.log(`🔍 Auto-load completed: ${result.success.length}/${allCharacterIds.length} characters loaded`);
        
        // Integrate loaded characters with game data
        if (window.gameData && window.gameData.characters) {
            for (const characterId of result.success) {
                const charData = state.loadedCharacters.get(characterId)?.data;
                if (charData && !window.gameData.characters[characterId]) {
                    // Initialize character in game data with defaults
                    window.gameData.characters[characterId] = {
                        ...charData,
                        totalEarned: 0,
                        totalClicks: 0,
                        timesLeveled: 0,
                        lastInteraction: null,
                        passiveTree: null,
                        passiveBonuses: null
                    };
                }
            }
        }
        
        return result;
    }
    
    // Initialize character data integration
    function initializeCharacterIntegration() {
        if (!window.gameData || !window.gameData.characters) {
            console.warn('⚠️ Game data not available for character integration');
            return false;
        }
        
        let integrated = 0;
        
        // Integrate all loaded characters with game data
        for (const [characterId, info] of state.loadedCharacters) {
            if (!window.gameData.characters[characterId]) {
                window.gameData.characters[characterId] = {
                    ...info.data,
                    // Game-specific runtime properties
                    totalEarned: 0,
                    totalClicks: 0,
                    timesLeveled: 0,
                    lastInteraction: null,
                    passiveTree: null,
                    passiveBonuses: null
                };
                integrated++;
            }
        }
        
        console.log(`🔗 Integrated ${integrated} characters with game data`);
        return true;
    }
    
    // Reload character (force refresh)
    async function reloadCharacter(characterId) {
        state.loadedCharacters.delete(characterId);
        state.failedLoads.delete(characterId);
        return await loadCharacter(characterId);
    }
    
    // Validate all loaded characters
    function validateAllCharacters() {
        const results = {
            valid: [],
            invalid: [],
            warnings: []
        };
        
        for (const [characterId, info] of state.loadedCharacters) {
            const validation = validateCharacterData(info.data, characterId);
            
            if (validation.valid) {
                results.valid.push(characterId);
            } else {
                results.invalid.push({
                    characterId,
                    errors: validation.errors
                });
            }
            
            if (validation.warnings.length > 0) {
                results.warnings.push({
                    characterId,
                    warnings: validation.warnings
                });
            }
        }
        
        return results;
    }
    
    // Initialize character loader
    function initialize() {
        // Ensure window.characterData exists
        if (!window.characterData) {
            window.characterData = {};
        }
        
        console.log('Character Loader initialized');
        return true;
    }
    
    // Module cleanup
    function cleanup() {
        state.loadedCharacters.clear();
        state.loadingPromises.clear();
        state.failedLoads.clear();
        state.loadOrder = [];
        state.totalLoadTime = 0;
        console.log('Character Loader cleanup complete');
    }
    
    // Return module interface
    return {
        // Core loading functions
        loadCharacter,
        loadCharacters,
        loadAllCharacters,
        getCharacter,
        reloadCharacter,
        
        // Integration
        initializeCharacterIntegration,
        
        // Status checking
        isCharacterLoaded,
        getLoadingStats,
        
        // Validation
        validateCharacterData,
        validateAllCharacters,
        
        // Utilities
        detectCharacterStructure,
        
        // Configuration
        setConfig: (newConfig) => Object.assign(config, newConfig),
        getConfig: () => ({ ...config }),
        
        // State
        getState: () => ({
            loadedCount: state.loadedCharacters.size,
            failedCount: state.failedLoads.size,
            totalLoadTime: state.totalLoadTime
        }),
        
        // Module lifecycle
        initialize,
        cleanup
    };
}

// Create and expose the character loader module
window.characterLoader = createCharacterLoaderModule();

// Module manager integration
if (window.gameModules) {
    window.gameModules.registerModule('characterLoader', () => window.characterLoader, []);
}

// Global utility functions
window.loadCharacter = async function(characterId) {
    return await window.characterLoader.loadCharacter(characterId);
};

window.getCharacterData = async function(characterId) {
    return await window.characterLoader.getCharacter(characterId);
};

console.log('Character Loader utility loaded successfully');