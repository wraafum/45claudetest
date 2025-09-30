// Sanctuarium System - Sanctuary Progression and Essence Management
// Wszystkie Moje Potwory

// Sanctuarium Module Factory
function createSanctuariumModule(dependencies, moduleManager) {
    const { domElements, ui } = dependencies || {};
    
    // Sanctuary state
    const sanctuaryState = {
        lastUpdate: 0,
        notifications: [],
        upgradeQueue: [],
        autoUpgrade: false
    };
    
    // Sanctuary upgrade definitions
    const sanctuaryUpgrades = {
        // Level 1 - Basic Manor Features
        1: {
            level: 1,
            essenceCost: 10,
            name: 'Pierwsze Przebudzenie',
            description: 'Pierwsze iskierki życia wypełniają twój dwór.',
            unlocks: {
                buildings: ['kitchen'],
                characters: ['alina'],
                features: ['manual_save']
            },
            bonus: {
                type: 'global_lust_multiplier',
                value: 1.1
            },
            storyEvent: 'sanctuary_awakening_1'
        },
        
        // Level 2 - Extended Manor
        2: {
            level: 2,
            essenceCost: 25,
            name: 'Rozbudowa Dworu',
            description: 'Dwór zaczyna tętnić życiem. Nowe pomieszczenia stają się dostępne.',
            unlocks: {
                buildings: ['bathhouse'],
                characters: ['bastet'],
                features: ['character_gallery']
            },
            bonus: {
                type: 'bond_gain_multiplier',
                value: 1.15
            },
            storyEvent: 'sanctuary_expansion_1'
        },
        
        // Level 3 - Mystical Enhancement
        3: {
            level: 3,
            essenceCost: 50,
            name: 'Mistyczne Wzmocnienie',
            description: 'Magiczna energia przepływa przez dwór, wzmacniając więzi.',
            unlocks: {
                buildings: ['basement'],
                characters: ['duo_kroliczki'],
                features: ['auto_save', 'notifications']
            },
            bonus: {
                type: 'essence_generation',
                value: 0.1
            },
            storyEvent: 'sanctuary_mystical_1'
        },
        
        // Level 4 - Garden Awakening
        4: {
            level: 4,
            essenceCost: 100,
            name: 'Przebudzenie Ogrodu',
            description: 'Magiczny ogród rozświetla się życiem, oferując nowe możliwości.',
            unlocks: {
                buildings: ['garden'],
                characters: ['promilia'],
                minigames: ['garden'],
                features: ['garden_minigame']
            },
            bonus: {
                type: 'production_multiplier',
                value: 1.2
            },
            storyEvent: 'garden_awakening'
        },
        
        // Level 5 - Knowledge Archive
        5: {
            level: 5,
            essenceCost: 200,
            name: 'Archiwum Wiedzy',
            description: 'Starożytna biblioteka ujawnia swoje sekrety.',
            unlocks: {
                buildings: ['library'],
                characters: ['lucja', 'mara'],
                features: ['character_stories_replay', 'achievements']
            },
            bonus: {
                type: 'story_essence_multiplier',
                value: 1.5
            },
            storyEvent: 'library_awakening'
        },
        
        // Level 6 - Combat Training
        6: {
            level: 6,
            essenceCost: 400,
            name: 'Trening Bojowy',
            description: 'Arena dla odważnych wojowniczek zostaje otwarta.',
            unlocks: {
                characters: ['momo'],
                minigames: ['arena'],
                features: ['arena_system', 'combat_stats']
            },
            bonus: {
                type: 'click_multiplier',
                value: 1.3
            },
            storyEvent: 'arena_awakening'
        },
        
        // Level 7 - Deep Connections
        7: {
            level: 7,
            essenceCost: 800,
            name: 'Głębokie Więzi',
            description: 'Więzi między mieszkańcami dworu stają się silniejsze.',
            unlocks: {
                characters: ['mimi', 'mina'],
                features: ['character_interactions', 'group_events']
            },
            bonus: {
                type: 'bond_threshold_reduction',
                value: 0.9
            },
            storyEvent: 'deep_connections'
        },
        
        // Level 8 - Shadow Realm
        8: {
            level: 8,
            essenceCost: 1600,
            name: 'Królestwo Cieni',
            description: 'Mroczne moce zostają oswojone i podporządkowane.',
            unlocks: {
                characters: ['zmora'],
                features: ['night_mode', 'shadow_mechanics']
            },
            bonus: {
                type: 'passive_income_multiplier',
                value: 1.4
            },
            storyEvent: 'shadow_realm_awakening'
        },
        
        // Level 9 - Fury Unleashed
        9: {
            level: 9,
            essenceCost: 3200,
            name: 'Uwolniona Furia',
            description: 'Najpotężniejsza wojowniczka zostaje wyzwolona.',
            unlocks: {
                characters: ['furia'],
                features: ['advanced_combat', 'prestige_preview']
            },
            bonus: {
                type: 'global_multiplier',
                value: 1.5
            },
            storyEvent: 'furia_unleashed'
        },
        
        // Level 10 - Transcendence
        10: {
            level: 10,
            essenceCost: 6400,
            name: 'Transcendencja',
            description: 'Dwór osiąga najwyższy poziom mocy. Prestiż staje się dostępny.',
            unlocks: {
                features: ['prestige_system', 'endless_mode', 'secret_characters']
            },
            bonus: {
                type: 'transcendence',
                value: 2.0
            },
            storyEvent: 'transcendence'
        }
    };
    
    // Get current sanctuary level
    function getCurrentLevel() {
        return gameData?.mainQuest?.level || 0;
    }
    
    // Get current essence amount
    function getCurrentEssence() {
        return gameData?.sanctuaryEssence || 0;
    }
    
    // Get next upgrade information
    function getNextUpgrade() {
        const currentLevel = getCurrentLevel();
        const nextLevel = currentLevel + 1;
        
        if (nextLevel > 10) {
            return null; // Max level reached
        }
        
        return sanctuaryUpgrades[nextLevel] || null;
    }
    
    // Check if player can afford next upgrade
    function canAffordUpgrade() {
        const nextUpgrade = getNextUpgrade();
        if (!nextUpgrade) return false;
        
        return getCurrentEssence() >= nextUpgrade.essenceCost;
    }
    
    // Perform sanctuary upgrade
    function performUpgrade() {
        const nextUpgrade = getNextUpgrade();
        
        if (!nextUpgrade) {
            console.log('🏛️ Sanctuary is at maximum level');
            return { success: false, reason: 'max_level' };
        }
        
        if (!canAffordUpgrade()) {
            console.log('🏛️ Insufficient essence for upgrade');
            return { success: false, reason: 'insufficient_essence' };
        }
        
        // Deduct essence
        gameData.sanctuaryEssence -= nextUpgrade.essenceCost;
        gameData.mainQuest.level = nextUpgrade.level;
        
        // Apply unlocks
        applyUnlocks(nextUpgrade.unlocks);
        
        // Apply bonus
        applyBonus(nextUpgrade.bonus);
        
        // Add to unlocked features list
        if (!gameData.mainQuest.unlockedFeatures) {
            gameData.mainQuest.unlockedFeatures = [];
        }
        gameData.mainQuest.unlockedFeatures.push(nextUpgrade.name);
        
        // Show notification
        const notification = {
            title: 'Sanktuarium Ulepszone!',
            message: `${nextUpgrade.name}: ${nextUpgrade.description}`,
            type: 'sanctuary',
            timestamp: Date.now()
        };
        
        if (window.showNotification) {
            window.showNotification(notification.message, 'success', 8000);
        }
        
        // Trigger story event if specified
        if (nextUpgrade.storyEvent) {
            setTimeout(() => {
                const manager = moduleManager || window.gameModules;
                const story = manager?.getModule('story');
                if (story && story.startStoryEvent) {
                    story.startStoryEvent(nextUpgrade.storyEvent);
                }
            }, 1000);
        }
        
        console.log(`🏛️ Sanctuary upgraded to level ${nextUpgrade.level}: ${nextUpgrade.name}`);
        
        // Update UI
        if (ui && ui.updateAll) {
            ui.updateAll();
        }
        
        return { 
            success: true, 
            level: nextUpgrade.level,
            upgrade: nextUpgrade,
            notification
        };
    }
    
    // Apply unlocks from sanctuary upgrade
    function applyUnlocks(unlocks) {
        if (!unlocks || !gameData) return;
        
        // Unlock buildings
        if (unlocks.buildings) {
            for (const buildingId of unlocks.buildings) {
                if (gameData.manor && gameData.manor[buildingId]) {
                    gameData.manor[buildingId].unlocked = true;
                    console.log(`🏛️   - Building unlocked: ${buildingId}`);
                }
            }
        }
        
        // Unlock characters
        if (unlocks.characters) {
            for (const characterId of unlocks.characters) {
                if (gameData.characters && gameData.characters[characterId]) {
                    gameData.characters[characterId].unlocked = true;
                    console.log(`🏛️   - Character unlocked: ${characterId}`);
                }
            }
        }
        
        // Unlock minigames
        if (unlocks.minigames) {
            for (const minigameId of unlocks.minigames) {
                if (gameData.minigames && gameData.minigames[minigameId]) {
                    gameData.minigames[minigameId].unlocked = true;
                    console.log(`🏛️   - Minigame unlocked: ${minigameId}`);
                }
            }
        }
        
        // Unlock features (stored as flags)
        if (unlocks.features) {
            if (!gameData.features) {
                gameData.features = {};
            }
            
            for (const feature of unlocks.features) {
                gameData.features[feature] = true;
                console.log(`🏛️   - Feature unlocked: ${feature}`);
            }
        }
    }
    
    // Apply bonus from sanctuary upgrade
    function applyBonus(bonus) {
        if (!bonus || !gameData) return;
        
        if (!gameData.sanctuaryBonuses) {
            gameData.sanctuaryBonuses = {};
        }
        
        // Apply the bonus
        if (bonus.type === 'global_lust_multiplier') {
            gameData.sanctuaryBonuses.lustMultiplier = (gameData.sanctuaryBonuses.lustMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'bond_gain_multiplier') {
            gameData.sanctuaryBonuses.bondMultiplier = (gameData.sanctuaryBonuses.bondMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'production_multiplier') {
            gameData.sanctuaryBonuses.productionMultiplier = (gameData.sanctuaryBonuses.productionMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'essence_generation') {
            gameData.sanctuaryBonuses.essenceGeneration = (gameData.sanctuaryBonuses.essenceGeneration || 0) + bonus.value;
        } else if (bonus.type === 'click_multiplier') {
            gameData.sanctuaryBonuses.clickMultiplier = (gameData.sanctuaryBonuses.clickMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'passive_income_multiplier') {
            gameData.sanctuaryBonuses.passiveMultiplier = (gameData.sanctuaryBonuses.passiveMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'story_essence_multiplier') {
            gameData.sanctuaryBonuses.storyEssenceMultiplier = (gameData.sanctuaryBonuses.storyEssenceMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'bond_threshold_reduction') {
            gameData.sanctuaryBonuses.bondThresholdMultiplier = (gameData.sanctuaryBonuses.bondThresholdMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'global_multiplier') {
            // Apply to all relevant multipliers
            gameData.sanctuaryBonuses.globalMultiplier = (gameData.sanctuaryBonuses.globalMultiplier || 1) * bonus.value;
        } else if (bonus.type === 'transcendence') {
            gameData.sanctuaryBonuses.transcendenceMultiplier = bonus.value;
        }
        
        console.log(`🏛️   - Bonus applied: ${bonus.type} = ${bonus.value}`);
    }
    
    // Get all sanctuary information for UI display
    function getSanctuaryInfo() {
        const currentLevel = getCurrentLevel();
        const currentEssence = getCurrentEssence();
        const nextUpgrade = getNextUpgrade();
        const canUpgrade = canAffordUpgrade();
        
        return {
            currentLevel,
            currentEssence,
            nextUpgrade,
            canUpgrade,
            maxLevel: 10,
            isMaxLevel: currentLevel >= 10,
            bonuses: gameData?.sanctuaryBonuses || {},
            unlockedFeatures: gameData?.mainQuest?.unlockedFeatures || []
        };
    }
    
    // Generate essence (called from story events, achievements, etc.)
    function generateEssence(amount, source = 'unknown') {
        if (!gameData) return 0;
        
        let actualAmount = amount;
        
        // Apply sanctuary bonuses to essence generation
        if (gameData.sanctuaryBonuses && gameData.sanctuaryBonuses.storyEssenceMultiplier) {
            actualAmount *= gameData.sanctuaryBonuses.storyEssenceMultiplier;
        }
        
        gameData.sanctuaryEssence = (gameData.sanctuaryEssence || 0) + actualAmount;
        gameData.statistics.totalEssenceGenerated = (gameData.statistics.totalEssenceGenerated || 0) + actualAmount;
        
        console.log(`🏛️ Generated ${actualAmount} essence from ${source}`);
        
        // Show notification for significant essence gains
        if (actualAmount >= 1 && window.showNotification) {
            window.showNotification(`+${Math.floor(actualAmount)} Esencja Sanktuarium`, 'info', 3000);
        }
        
        // Check if auto-upgrade is possible
        if (sanctuaryState.autoUpgrade && canAffordUpgrade()) {
            setTimeout(() => performUpgrade(), 500);
        }
        
        return actualAmount;
    }
    
    // Display sanctuary in center panel
    function displaySanctuary() {
        if (!domElements) return;
        
        const sanctuaryInfo = getSanctuaryInfo();
        
        const sanctuaryHTML = `
            <div class="sanctuary-view h-full flex flex-col">
                <!-- Sanctuary Header -->
                <div class="sanctuary-header bg-white/10 rounded-lg p-4 mb-4">
                    <div class="text-center">
                        <h2 class="text-2xl font-bold mb-2">🏛️ Sanktuarium</h2>
                        <div class="flex justify-center items-center space-x-4">
                            <div class="text-purple-300">
                                <span class="text-lg font-semibold">Poziom ${sanctuaryInfo.currentLevel}</span>
                                ${sanctuaryInfo.isMaxLevel ? '<span class="text-yellow-300 ml-2">MAX</span>' : ''}
                            </div>
                            <div class="text-blue-300">
                                <span class="text-lg">✨ ${gameUtils.formatNumber(sanctuaryInfo.currentEssence)} Esencji</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Next Upgrade -->
                ${sanctuaryInfo.nextUpgrade ? `
                    <div class="next-upgrade bg-white/5 rounded-lg p-4 mb-4">
                        <h3 class="text-lg font-semibold mb-2">${sanctuaryInfo.nextUpgrade.name}</h3>
                        <p class="text-gray-300 text-sm mb-3">${sanctuaryInfo.nextUpgrade.description}</p>
                        
                        <div class="upgrade-cost mb-3">
                            <div class="flex justify-between items-center">
                                <span>Koszt:</span>
                                <span class="text-blue-300 font-semibold">✨ ${sanctuaryInfo.nextUpgrade.essenceCost}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2 mt-1">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(100, (sanctuaryInfo.currentEssence / sanctuaryInfo.nextUpgrade.essenceCost) * 100)}%"></div>
                            </div>
                        </div>
                        
                        <button onclick="performSanctuaryUpgrade()" 
                                class="${sanctuaryInfo.canUpgrade ? 'btn-primary' : 'btn-disabled'} w-full"
                                ${!sanctuaryInfo.canUpgrade ? 'disabled' : ''}>
                            ${sanctuaryInfo.canUpgrade ? 'Ulepsz Sanktuarium' : 'Niewystarczająco Esencji'}
                        </button>
                    </div>
                ` : `
                    <div class="max-level bg-gradient-to-r from-yellow-600/20 to-purple-600/20 rounded-lg p-4 mb-4 text-center">
                        <h3 class="text-xl font-bold text-yellow-300 mb-2">🏆 Sanktuarium w Pełni Rozwinięte</h3>
                        <p class="text-gray-300">Osiągnąłeś najwyższy poziom sanktuarium. Wszystkie moce zostały uwolnione!</p>
                    </div>
                `}
                
                <!-- Active Bonuses -->
                <div class="active-bonuses flex-1 bg-white/5 rounded-lg p-4">
                    <h3 class="text-lg font-semibold mb-3">🌟 Aktywne Bonusy</h3>
                    <div class="grid grid-cols-1 gap-2 text-sm">
                        ${Object.entries(sanctuaryInfo.bonuses).map(([key, value]) => {
                            const bonusName = getBonusDisplayName(key);
                            const bonusValue = getBonusDisplayValue(key, value);
                            return `<div class="flex justify-between"><span>${bonusName}:</span><span class="text-green-300">${bonusValue}</span></div>`;
                        }).join('')}
                        
                        ${Object.keys(sanctuaryInfo.bonuses).length === 0 ? 
                            '<div class="text-gray-400 italic">Brak aktywnych bonusów</div>' : ''
                        }
                    </div>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', sanctuaryHTML);
        domElements.setContent('centerPanelTitle', 'Sanktuarium');
    }
    
    // Helper functions for bonus display
    function getBonusDisplayName(bonusKey) {
        const names = {
            lustMultiplier: 'Mnożnik Pożądania',
            bondMultiplier: 'Mnożnik Więzi',
            productionMultiplier: 'Mnożnik Produkcji',
            essenceGeneration: 'Generacja Esencji',
            clickMultiplier: 'Mnożnik Kliknięć',
            passiveMultiplier: 'Mnożnik Pasywny',
            storyEssenceMultiplier: 'Esencja z Historii',
            bondThresholdMultiplier: 'Redukcja Progów Więzi',
            globalMultiplier: 'Globalny Mnożnik',
            transcendenceMultiplier: 'Transcendencja'
        };
        return names[bonusKey] || bonusKey;
    }
    
    function getBonusDisplayValue(bonusKey, value) {
        if (bonusKey.includes('Multiplier') && bonusKey !== 'bondThresholdMultiplier') {
            return `×${value.toFixed(2)}`;
        } else if (bonusKey === 'bondThresholdMultiplier') {
            return `${((1 - value) * 100).toFixed(1)}% redukcji`;
        } else if (bonusKey === 'essenceGeneration') {
            return `+${value.toFixed(1)}/s`;
        }
        return value.toString();
    }
    
    // Initialize the sanctuary system
    function initialize() {
        console.log('🏛️ Sanctuary system initialized');
        
        // Ensure sanctuary essence exists in game data
        if (gameData && typeof gameData.sanctuaryEssence === 'undefined') {
            gameData.sanctuaryEssence = 0;
        }
        
        // Ensure sanctuary bonuses exist
        if (gameData && !gameData.sanctuaryBonuses) {
            gameData.sanctuaryBonuses = {};
        }
        
        return true;
    }
    
    // Public API
    return {
        initialize,
        getCurrentLevel,
        getCurrentEssence,
        getNextUpgrade,
        canAffordUpgrade,
        performUpgrade,
        generateEssence,
        getSanctuaryInfo,
        displaySanctuary,
        
        // For external access
        get upgrades() { return sanctuaryUpgrades; },
        
        cleanup: function() {
            // Cleanup any timers or listeners
        }
    };
}

// Register the module
if (window.gameModules) {
    window.gameModules.registerModule('sanctuarium', createSanctuariumModule, ['domElements', 'ui']);
}

// Global functions for HTML event handlers
window.performSanctuaryUpgrade = function() {
    const sanctuarium = window.gameModules?.getModule('sanctuarium');
    if (sanctuarium) {
        return sanctuarium.performUpgrade();
    }
};

window.showSanctuary = function() {
    const sanctuarium = window.gameModules?.getModule('sanctuarium');
    if (sanctuarium) {
        sanctuarium.displaySanctuary();
    }
    
    // Update UI state
    if (gameData) {
        gameData.ui.currentView = 'sanctuary';
    }
};

console.log('🏛️ Sanctuarium module loaded');