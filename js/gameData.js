// Game Data - Centralized State Management
// Wszystkie Moje Potwory

// Initialize global game data object
window.gameData = {
    // Game Version & Metadata
    version: '0.1.0',
    lastSaved: null,
    playtime: 0,
    gameStarted: false,
    
    // Core Game Resources
    lustPoints: 0,
    lustPerSecond: 0,
    totalLustEarned: 0,
    clicksTotal: 0,
    
    // Currency & Resources
    goldCoins: 0,
    sanctuaryEssence: 0,
    sparks: 0,
    
    // Active Character System
    activeCharacterId: 'szafran', // Default starting character
    viewedCharacterId: null, // Currently viewed character/view
    exclusiveBondCharacter: null, // Character who exclusively receives bond points (null = all get bond points)
    
    // Characters Data
    characters: {
        // Characters will be populated from character files
        // Each character has: id, name, unlocked, level, bondPoints, storyProgress, etc.
    },
    
    // Character Display Order (based on game progression)
    characterOrder: [
        'szafran',        // Starting character
        'duo_kroliczki',  // 3,000 LP - early game
        'promilia',       // 8,000 LP - early-mid game
        'mina',           // 10,000 LP
        'lucja',          // 12,000 LP
        'bastet',         // 20,000 LP
        'momo',           // 30,000 LP - mid game
        'mara',           // 35,000 LP
        'furia',          // 40,000 LP + conditions - mid-late game
        'mimi',           // 100,000 LP - late game
        'zmora',          // 100,000 LP - late game
        'alina'           // Prestige character - endgame
    ],
    
    // Buildings & Manor System
    manor: {
        kitchen: {
            id: 'kitchen',
            name: 'Kuchnia',
            level: 0,
            maxLevel: 10,
            baseCost: 1000,
            costGrowth: 1.5,
            description: 'Miejsce przygotowywania posiłków dla mieszkańców dworu',
            tooltip: 'Ulepsza kuchnię, zwiększając produkcję Pożądania wszystkich postaci o 10% za poziom. Lepsze posiłki sprawiają, że dziewczyny są bardziej energiczne i wydajne.',
            bonusType: 'lust_multiplier',
            bonusValue: 0.1,
            unlocked: true,
            image: 'imgs/buildings/kitchen.png'
        },
        bathhouse: {
            id: 'bathhouse', 
            name: 'Łaźnia',
            level: 0,
            maxLevel: 10,
            baseCost: 2500,
            costGrowth: 1.6,
            description: 'Relaksujące miejsce dla mieszkańców dworu',
            tooltip: 'Buduje luksusową łaźnię, zwiększając przyrost Więzi wszystkich postaci o 15% za poziom. Gorące kąpiele poprawiają nastrój i przywiązanie dziewczyn.',
            bonusType: 'bond_multiplier',
            bonusValue: 0.15,
            unlocked: false,
            image: 'imgs/buildings/bathhouse.png'
        },
        basement: {
            id: 'basement',
            name: 'Piwnica',
            level: 0,
            maxLevel: 15,
            baseCost: 5000,
            costGrowth: 1.7,
            description: 'Tajemnicze miejsce pełne skarbów i sekretów',
            tooltip: 'Eksploruje tajemnicze piwnice dworu, zwiększając szansę na specjalne wydarzenia o 5% za poziom. Ukryte przejścia i starożytne artefakty czekają na odkrycie.',
            bonusType: 'special_events',
            bonusValue: 0.05,
            unlocked: false,
            image: 'imgs/buildings/basement.png'
        },
        garden: {
            id: 'garden',
            name: 'Ogród',
            level: 0,
            maxLevel: 5,
            baseCost: 3000,
            costGrowth: 2.0,
            description: 'Miejsce uprawy magicznych roślin',
            tooltip: 'Otwiera dostęp do magicznego ogrodu Szafran, gdzie można uprawiać rzadkie rośliny. Każdy poziom dodaje nowe działki i ulepsza jakość upraw.',
            bonusType: 'minigame_unlock',
            bonusValue: 'garden',
            unlocked: false,
            unlockConditions: [
                { type: 'story', characterId: 'szafran', eventId: 'szafran_7' }
            ],
            image: 'imgs/buildings/garden.png'
        }
    },
    
    // Main Quest & Sanctuary Progression
    mainQuest: {
        level: 0,
        thresholds: [0, 10, 25, 50, 100, 200, 400, 800, 1600, 3200, 6400], // Essence required for each level
        maxLevel: 10,
        unlockedFeatures: []
    },
    
    // Minigames System
    minigames: {
        // Garden System
        garden: {
            unlocked: false, // Garden starts locked until building level 1
            plots: [], // Empty array - plots created when garden building reaches level 1
            seeds: {
                // Starting seeds
                'passion_flower': 5,
                'love_herb': 3,
                'essence_bloom': 1
            },
            stats: {
                totalHarvests: 0,
                totalSeedsPlanted: 0,
                totalLustEarned: 0,
                totalBondEarned: 0,
                totalEssenceEarned: 0,
                seedsHarvested: {
                    'passion_flower': 0,
                    'love_herb': 0,
                    'essence_bloom': 0,
                    'enchanted_rose': 0
                },
                firstHarvestTime: null,
                lastHarvestTime: null
            }
        },
        
        // Arena System (for Momo character)
        arena: {
            unlocked: false,
            hasBeenVisited: false, // Prevents progression until first visit
            level: 1,
            experience: 0,
            experienceToNext: 100,
            hp: 100,
            maxHp: 100,
            stamina: { current: 100, max: 100 },
            isResting: false,
            restStartTime: 0,
            restDuration: 90, // 90 seconds base duration
            currentQuest: null,
            currentActivity: "Gotowa do walki",
            activityProgress: 0,
            currentStage: 0,        // Index of current stage within quest (0-based)
            stageProgress: 0,       // Progress within current stage (0-100%)
            questProgress: 0,       // Overall quest completion percentage (0-100%)
            questsCompleted: 0,
            totalDeaths: 0,
            itemsFound: 0,
            goldEarned: 0,
            logEntries: [],
            
            // Combat Stats
            stats: {
                sila: 10,
                zrecznosc: 6,
                inteligencja: 5,
                szczescie: 7,
                cyce: 10,
                dupa: 10,
                cipka: "Dziewicza"
            },
            
            // Skill Progress & Caps
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
            
            // Equipment System
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
            
            // Advanced Combat Systems
            combatPhase: { current: 0, total: 5, progress: 0 },
            comboMeter: { count: 0, progress: 0, maxCombo: 10 },
            skillTraining: { active: null, progress: 0 },
            
            // Cipka Effects System
            cipkaEffects: {
                sensitivity: 0.5,
                wetness: 0.1,
                corruption: 0.0,
                magic_resistance: 1.0,
                recovery_time: 1.0
            }
        }
    },
    
    // Seed Data for Garden System
    seeds: {
        'passion_flower': {
            name: 'Kwiat Namiętności',
            growthTime: 1800, // 30 minutes in seconds
            rewardType: 'lust',
            rewardPercent: 0.1, // 10% of current lust points
            rarity: 'common',
            cost: 100
        },
        'love_herb': {
            name: 'Zioło Miłości',
            growthTime: 3600, // 1 hour
            rewardType: 'bond',
            rewardPercent: 0.05, // 5% of current bond points
            rarity: 'uncommon',
            cost: 250
        },
        'essence_bloom': {
            name: 'Kwiat Esencji',
            growthTime: 7200, // 2 hours
            rewardType: 'essence',
            rewardAmount: 1,
            rarity: 'rare',
            cost: 500
        },
        'enchanted_rose': {
            name: 'Zaczarowana Róża',
            growthTime: 14400, // 4 hours
            rewardType: 'lust',
            rewardPercent: 0.2,
            rarity: 'legendary',
            cost: 1000
        }
    },
    
    // Game Settings
    settings: {
        masterVolume: 0.7,
        musicVolume: 0.5,
        sfxVolume: 0.8,
        autoSave: true,
        autoSaveInterval: 30000, // 30 seconds
        showNotifications: true,
        enableAnimations: true,
        enableParticles: true,
        language: 'pl',
        newsTickerEnabled: true
    },
    
    // UI State
    ui: {
        rightPanelTab: 'characters', // 'characters' or 'buildings'
        currentView: 'manor', // 'manor', 'character', 'sanctuary', 'garden', 'arena'
        modalOpen: false,
        currentModal: null,
        notifications: []
    },
    
    // News Ticker State
    news: {
        enabled: true,
        currentNews: null,
        newsHistory: [],
        lastUpdate: 0,
        cooldowns: {}
    },
    
    // Statistics & Achievements
    statistics: {
        totalClicks: 0,
        totalLustGenerated: 0,
        totalEssenceGenerated: 0,
        charactersUnlocked: 1, // Start with Szafran
        storiesCompleted: 0,
        buildingsBuilt: 0,
        questsCompleted: 0,
        daysPlayed: 0,
        longestSession: 0
    },
    
    // Story & Event System
    story: {
        completedEvents: [],
        currentEvent: null,
        globalFlags: {},
        eventHistory: []
    },
    
    // Prestige System (placeholder for future)
    prestige: {
        level: 0,
        points: 0,
        upgrades: {},
        unlocked: false
    },
    
    // Temporary/Session Data
    session: {
        startTime: Date.now(),
        clicksThisSession: 0,
        lustThisSession: 0,
        lastUpdate: Date.now(),
        selectedSeed: null,
        debugMode: false
    }
};

// Initialize Character Data Integration
window.initializeCharacters = function() {
    // Wait for character data to load, then populate gameData.characters
    const checkCharacterData = () => {
        if (window.characterData && Object.keys(window.characterData).length > 0) {
            // Copy character data to gameData and initialize game-specific properties
            Object.keys(window.characterData).forEach(charId => {
                const charData = window.characterData[charId];
                
                // Initialize character in gameData if not already present
                if (!gameData.characters[charId]) {
                    gameData.characters[charId] = {
                        ...charData,
                        // Game-specific runtime properties
                        totalEarned: 0,
                        totalClicks: 0,
                        timesLeveled: 0,
                        lastInteraction: null,
                        
                        // Ensure required properties exist
                        bondPoints: charData.bondPoints || 0,
                        storyProgress: charData.storyProgress || 0,
                        level: charData.unlocked ? (charData.level || 1) : 0,
                        unlocked: charData.unlocked || false
                    };
                } else {
                    // CRITICAL FIX: Ensure existing characters have story data
                    const existingChar = gameData.characters[charId];
                    
                    // Merge story events and thresholds if missing
                    if (!existingChar.storyEvents && charData.storyEvents) {
                        existingChar.storyEvents = charData.storyEvents;
                        console.log(`📋 Added story events to existing character: ${charId}`);
                    }
                    if (!existingChar.storyThresholds && charData.storyThresholds) {
                        existingChar.storyThresholds = charData.storyThresholds;
                        console.log(`📋 Added story thresholds to existing character: ${charId}`);
                    }
                    
                    // Ensure other critical properties are updated
                    if (!existingChar.name && charData.name) {
                        existingChar.name = charData.name;
                    }
                    if (!existingChar.id && charData.id) {
                        existingChar.id = charData.id;
                    }
                }
            });
            
            // Ensure Szafran is unlocked by default
            if (gameData.characters.szafran) {
                gameData.characters.szafran.unlocked = true;
                gameData.characters.szafran.level = Math.max(1, gameData.characters.szafran.level);
            }
            
            console.log('Characters initialized:', Object.keys(gameData.characters));
            console.log('Window.characterData keys:', Object.keys(window.characterData || {}));
            console.log('Lucja in window.characterData:', !!window.characterData?.lucja);
            console.log('Lucja in gameData.characters:', !!gameData.characters.lucja);
        } else {
            // Character data not ready yet, try again
            setTimeout(checkCharacterData, 100);
        }
    };
    
    checkCharacterData();
};

// Utility Functions
window.gameUtils = {
    // Format numbers for display
    formatNumber: function(num) {
        if (num >= 1e15) return (num / 1e15).toFixed(2) + 'Q';
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return Math.floor(num).toString();
    },
    
    // Format time for display
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    },
    
    // Calculate character production
    calculateCharacterProduction: function(character) {
        if (!character || !character.unlocked || character.level <= 0) return 0;
        
        const baseProduction = character.baseLpPerSecond || 0;
        const level = character.level || 1;
        const growthRate = character.productionGrowth || 1.15;
        
        return baseProduction * Math.pow(growthRate, level - 1);
    },
    
    // Calculate character upgrade cost
    calculateUpgradeCost: function(character) {
        if (!character || !character.unlocked) return 0;
        
        const baseCost = character.baseCost || 10;
        const level = character.level || 1;
        const costGrowth = character.costGrowth || 1.15;
        
        return Math.floor(baseCost * Math.pow(costGrowth, level));
    },
    
    // Calculate building cost
    calculateBuildingCost: function(building) {
        if (!building) return 0;
        
        const baseCost = building.baseCost || 1000;
        const level = building.level || 0;
        const costGrowth = building.costGrowth || 1.5;
        
        return Math.floor(baseCost * Math.pow(costGrowth, level));
    },
    
    // Deep clone object
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Generate random ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Validate number
    validateNumber: function(value, fallback = 0) {
        if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
            return value;
        }
        return fallback;
    },
    
    // Safe property access
    safeGet: function(obj, path, defaultValue = null) {
        const keys = path.split('.');
        let result = obj;
        
        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                return defaultValue;
            }
        }
        
        return result;
    }
};

// Default Save Data Structure
window.defaultSaveData = {
    version: gameData.version,
    lustPoints: 0,
    characters: {},
    manor: {},
    mainQuest: { level: 0 },
    minigames: {
        garden: {
            unlocked: false,
            plots: gameData.minigames.garden.plots,
            seeds: { 'passion_flower': 5, 'love_herb': 3, 'essence_bloom': 1 }
        },
        arena: { unlocked: false }
    },
    settings: gameData.settings,
    statistics: gameData.statistics,
    story: { completedEvents: [], globalFlags: {} }
};

// Initialize character integration when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initializeCharacters);
} else {
    window.initializeCharacters();
}

console.log('Game Data initialized successfully');
console.log('Game version:', gameData.version);
console.log('Starting resources:', {
    lustPoints: gameData.lustPoints,
    goldCoins: gameData.goldCoins,
    sanctuaryEssence: gameData.sanctuaryEssence
});