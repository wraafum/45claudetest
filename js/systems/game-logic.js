// Game Logic - Core Game Mechanics
// Wszystkie Moje Potwory

// Game Logic Module Factory
function createGameLogicModule(dependencies, moduleManager) {
    const { domElements, ui } = dependencies || {};
    
    // Game logic state
    const logicState = {
        lastUpdate: 0,
        passiveIncomeRate: 1000, // Update every second
        passiveIncomeAccumulator: 0, // Accumulate time until 1 second
        clickCooldown: 0,
        clickCooldownTime: 10, // 10ms between clicks
        bonusMultipliers: {
            lustPoints: 1,
            bondPoints: 1,
            production: 1
        }
    };
    
    // Calculate base click value for a character
    function calculateClickValue(character) {
        if (!character || !character.unlocked) return 0;
        
        const baseValue = 1;
        const levelMultiplier = 1 + (character.level - 1) * 0.5; // 50% more per level
        const bondBonus = Math.floor((character.bondPoints || 0) / 100) * 0.1; // 10% per 100 bond
        const buildingBonus = calculateBuildingBonuses(); // Lust multiplier from buildings like kitchen
        
        return Math.max(1, Math.floor(baseValue * levelMultiplier * (1 + bondBonus) * buildingBonus * logicState.bonusMultipliers.lustPoints));
    }
    
    // Calculate bond points gained per click
    function calculateBondGain(character) {
        if (!character || !character.unlocked) return 0;
        
        const baseBondGain = 1.0; // Base 1 bond point per click
        const buildingBondBonus = calculateBuildingBondBonus(); // Bond multiplier from buildings
        
        return baseBondGain * buildingBondBonus * logicState.bonusMultipliers.bondPoints;
    }
    
    // Handle character click
    function handleCharacterClick() {
        if (!gameData) {
            console.error('🚫 Click failed: gameData not available');
            return false;
        }
        
        if (!gameData.activeCharacterId) {
            console.error('🚫 Click failed: no active character set');
            return false;
        }
        
        // Check cooldown
        if (logicState.clickCooldown > 0) {
            console.warn(`🚫 Click failed: cooldown active (${logicState.clickCooldown}ms remaining)`);
            return false;
        }
        
        const character = gameData.characters[gameData.activeCharacterId];
        if (!character) {
            console.error(`🚫 Click failed: character ${gameData.activeCharacterId} not found`);
            return false;
        }
        
        if (!character.unlocked) {
            console.error(`🚫 Click failed: character ${character.name} is not unlocked`);
            return false;
        }
        
        // Calculate gains
        const lustGain = calculateClickValue(character);
        const bondGain = calculateBondGain(character);
        
        // Debug: Log click calculations
        console.log(`🖱️ Character Click Debug for ${character.name}:`, {
            characterId: character.id,
            activeCharacterId: gameData.activeCharacterId,
            bondPointsBefore: character.bondPoints || 0,
            lustGain: lustGain,
            bondGain: bondGain,
            buildingBondBonus: calculateBuildingBondBonus(),
            bonusMultiplier: logicState.bonusMultipliers.bondPoints,
            cooldownState: logicState.clickCooldown
        });
        
        // Apply gains
        gameData.lustPoints = (gameData.lustPoints || 0) + lustGain;
        
        // Apply bond points only to the active character
        if (gameData.activeCharacterId === character.id) {
            const oldBondPoints = character.bondPoints || 0;
            character.bondPoints = oldBondPoints + bondGain;
            console.log(`💖 Bond Points Updated: ${oldBondPoints} → ${character.bondPoints} (+${bondGain})`);
            
            // Update character expression based on new bond level
            const manager = moduleManager || window.gameModules;
            if (!manager || typeof manager.getModule !== 'function') {
                console.log('Module manager not available for expression updates');
            } else {
                const expressions = manager.getModule('expressions');
                if (expressions && typeof expressions.updateCharacterExpression === 'function') {
                    try {
                        expressions.updateCharacterExpression(character.id);
                    } catch (error) {
                        console.warn('Failed to update character expression:', error);
                    }
                } else if (!expressions) {
                    console.log('Expression module not available for character expression update');
                }
            }
        } else {
            console.warn(`⚠️ Bond points NOT applied: activeId=${gameData.activeCharacterId}, charId=${character.id}`);
        }
        
        // Update statistics (note: UI also increments totalClicks, so we skip it here to avoid double counting)
        gameData.statistics.totalLustGenerated += lustGain;
        character.totalClicks = (character.totalClicks || 0) + 1;
        character.totalEarned = (character.totalEarned || 0) + lustGain;
        character.lastInteraction = Date.now();
        
        // Set cooldown
        logicState.clickCooldown = logicState.clickCooldownTime;
        
        // Check for story progression
        checkStoryProgression(character);
        
        // Check for level up
        checkCharacterLevelUp(character);
        
        console.log(`Click: +${lustGain} LP, +${bondGain.toFixed(2)} bond for ${character.name}`);
        return true;
    }
    
    // Calculate character's passive production
    function calculatePassiveProduction(character) {
        if (!character || !character.unlocked || character.level <= 0) return 0;
        
        const baseProduction = character.baseLpPerSecond || 0;
        const level = character.level || 1;
        const growthRate = character.productionGrowth || 1.15;
        
        // Level scaling
        const levelMultiplier = Math.pow(growthRate, level - 1);
        
        // Bond bonus (10% per 500 bond points)
        const bondBonus = Math.floor((character.bondPoints || 0) / 500) * 0.1;
        
        // Building bonuses
        const buildingMultiplier = calculateBuildingBonuses();
        
        const totalProduction = baseProduction * levelMultiplier * (1 + bondBonus) * buildingMultiplier * logicState.bonusMultipliers.production;
        
        return Math.max(0, totalProduction);
    }
    
    // Calculate building bonuses for lust production
    function calculateBuildingBonuses() {
        if (!gameData || !gameData.manor) return 1;
        
        let multiplier = 1;
        
        Object.values(gameData.manor).forEach(building => {
            if (building.level > 0 && building.bonusType === 'lust_multiplier') {
                const bonus = building.bonusValue * building.level;
                multiplier += bonus;
            }
        });
        
        return multiplier;
    }
    
    // Calculate building bonuses for bond gains
    function calculateBuildingBondBonus() {
        if (!gameData || !gameData.manor) return 1;
        
        let multiplier = 1;
        
        Object.values(gameData.manor).forEach(building => {
            if (building.level > 0 && building.bonusType === 'bond_multiplier') {
                const bonus = building.bonusValue * building.level;
                multiplier += bonus;
            }
        });
        
        return multiplier;
    }
    
    // Update passive income
    function updatePassiveIncome(deltaTime) {
        if (!gameData || !gameData.characters) return;
        
        // Accumulate time over multiple frames
        logicState.passiveIncomeAccumulator += deltaTime;
        
        // Only update when we've accumulated 1 second
        if (logicState.passiveIncomeAccumulator < logicState.passiveIncomeRate) return;
        
        // Reset accumulator
        logicState.passiveIncomeAccumulator = 0;
        
        let totalIncome = 0;
        
        Object.values(gameData.characters).forEach(character => {
            if (character.unlocked && character.level > 0) {
                const production = calculatePassiveProduction(character);
                totalIncome += production;
                
                // Track passive earnings per character
                character.totalEarned = (character.totalEarned || 0) + production;
                
                // Add bond points passively only to the active character
                if (gameData.activeCharacterId === character.id) {
                    const basePassiveBond = 0.1 * character.level; // 0.1 per level per second
                    const buildingBondBonus = calculateBuildingBondBonus(); // Bond multiplier from buildings
                    const passiveBond = basePassiveBond * buildingBondBonus * logicState.bonusMultipliers.bondPoints;
                    const oldBondPoints = character.bondPoints || 0;
                    character.bondPoints = oldBondPoints + passiveBond;
                    
                    // Check for expression changes due to bond progression
                    if (Math.floor(character.bondPoints / 50) > Math.floor(oldBondPoints / 50)) {
                        // Bond crossed a threshold, update expression
                        const manager = moduleManager || window.gameModules;
                        if (!manager || typeof manager.getModule !== 'function') {
                            console.log('Module manager not available for passive expression updates');
                        } else {
                            const expressions = manager.getModule('expressions');
                            if (expressions && typeof expressions.updateCharacterExpression === 'function') {
                                try {
                                    expressions.updateCharacterExpression(character.id);
                                } catch (error) {
                                    console.warn('Failed to update character expression during passive gain:', error);
                                }
                            } else if (!expressions) {
                                console.log('Expression module not available for passive bond expression update');
                            }
                        }
                    }
                }
                
                // Check story progression for passive bond gains
                checkStoryProgression(character);
            }
        });
        
        // Update total lust points
        gameData.lustPoints = (gameData.lustPoints || 0) + totalIncome;
        gameData.lustPerSecond = totalIncome;
        gameData.statistics.totalLustGenerated += totalIncome;
        
        // Update playtime
        gameData.playtime = (gameData.playtime || 0) + 1; // 1 second
        
        console.log(`Passive income: +${totalIncome.toFixed(2)} LP/s`);
    }
    
    // Check and trigger story progression
    function checkStoryProgression(character) {
        if (!character) return;
        
        // Get story data from the canonical source
        const characterDefinition = window.characterData?.[character.id];
        if (!characterDefinition || !characterDefinition.storyThresholds || !characterDefinition.storyEvents) {
            if (character && character.id) {
                console.warn(`⚠️ Story progression skipped for ${character.name || character.id}: missing story definition`);
            }
            return;
        }
        
        // Use story data from characterDefinition, but progress from game character
        const storyThresholds = characterDefinition.storyThresholds;
        const storyEvents = characterDefinition.storyEvents;
        
        let currentProgress = character.storyProgress || 0;
        const bondPoints = Math.floor(character.bondPoints || 0);
        
        // Enhanced logging for debugging
        if (character.id === 'momo' && window.gameState?.debugMode) {
            console.log(`🔍 Checking story progression for ${character.name}: ${bondPoints} bond, progress ${currentProgress}/${storyThresholds.length}`);
        }
        
        // Check if we've reached new thresholds (handle multiple unlocks)
        let eventsTriggered = 0;
        while (currentProgress < storyThresholds.length && 
               currentProgress < storyEvents.length) {
            const nextThreshold = storyThresholds[currentProgress];
            
            if (bondPoints >= nextThreshold) {
                // Story event triggered!
                const storyEvent = storyEvents[currentProgress];
                
                if (storyEvent) {
                    // Update progress immediately for next iteration
                    currentProgress++;
                    character.storyProgress = currentProgress;
                    
                    // Also update the character in gameData if it exists separately
                    const gameCharacter = window.gameData?.characters?.[character.id];
                    if (gameCharacter && gameCharacter !== character) {
                        gameCharacter.storyProgress = currentProgress;
                    }
                    
                    console.log(`🎭 STORY EVENT TRIGGERED: ${character.name} - ${storyEvent.title} (progress -> ${currentProgress})`);
                    
                    // Trigger story event
                    const story = window.gameModules?.getModule('story') || window.story;
                    if (story && story.startStoryEvent) {
                        const success = story.startStoryEvent(storyEvent.id);
                        if (!success) {
                            console.error(`❌ Failed to start story event ${storyEvent.id} for ${character.name}`);
                        }
                    } else {
                        console.warn(`⚠️ Story module not available, using fallback notification`);
                        // Fallback: show notification
                        if (window.showNotification) {
                            window.showNotification(`Nowe wydarzenie: ${storyEvent.title}`, 'success', 3000);
                        }
                    }
                    
                    // Special handling for important unlocks
                    if (storyEvent.id === 'momo_7') {
                        console.log(`🏟️ MOMO_7 EVENT TRIGGERED - Arena should unlock now!`);
                    }
                    
                    eventsTriggered++;
                    
                    // Limit to prevent infinite loops, but allow multiple story unlocks
                    if (eventsTriggered >= 10) {
                        console.warn(`⚠️ Story progression limited to 10 events per tick for ${character.name}`);
                        break;
                    }
                } else {
                    console.error(`❌ Story event missing at index ${currentProgress} for ${character.name}`);
                    break;
                }
            } else {
                if (character.id === 'momo' && window.gameState?.debugMode) {
                    console.log(`🔍 ${character.name} needs ${nextThreshold - bondPoints} more bond points for next event`);
                }
                break;
            }
        }
        
        if (eventsTriggered === 0 && currentProgress >= character.storyThresholds.length && character.id === 'momo' && window.gameState?.debugMode) {
            console.log(`✅ ${character.name} has completed all story events`);
        }
    }
    
    // Check if character can level up
    function checkCharacterLevelUp(character) {
        if (!character || !character.unlocked) return false;
        
        const cost = gameUtils.calculateUpgradeCost(character);
        
        if (gameData.lustPoints >= cost && cost > 0) {
            // Auto-level up if enabled, or check for manual trigger
            // For now, we'll only level up manually through upgradeCharacter function
            return true;
        }
        
        return false;
    }
    
    // Upgrade character level
    function upgradeCharacter(characterId) {
        if (!gameData || !gameData.characters[characterId]) return false;
        
        const character = gameData.characters[characterId];
        if (!character.unlocked) return false;
        
        const cost = gameUtils.calculateUpgradeCost(character);
        
        if (gameData.lustPoints >= cost && cost > 0) {
            // Pay the cost
            gameData.lustPoints -= cost;
            
            // Level up
            character.level = (character.level || 1) + 1;
            character.timesLeveled = (character.timesLeveled || 0) + 1;
            
            // Update statistics
            gameData.statistics.buildingsBuilt++; // Using this for character upgrades too
            
            // Show notification
            if (window.showNotification) {
                window.showNotification(`${character.name} osiągnęła poziom ${character.level}!`, 'success');
            }
            
            console.log(`${character.name} upgraded to level ${character.level}`);
            return true;
        }
        
        return false;
    }
    
    // Unlock character
    function unlockCharacter(characterId) {
        if (!gameData || !gameData.characters[characterId]) return false;
        
        const character = gameData.characters[characterId];
        if (character.unlocked) return false; // Already unlocked
        
        const cost = character.unlockCost || 0; // Respect character-defined cost, don't force fallback
        
        // Check unlock conditions
        const conditionsMet = checkUnlockConditions(character);
        if (!conditionsMet) {
            console.warn(`Unlock conditions not met for ${character.name}:`, character.unlockConditions);
            if (window.showNotification) {
                window.showNotification('Nie spełniasz warunków odblokowania', 'error');
            }
            return false;
        }
        
        console.log(`Unlock conditions met for ${character.name}, cost: ${cost}, current LP: ${gameData.lustPoints}`);
        
        if (gameData.lustPoints >= cost) {
            // Pay the cost
            gameData.lustPoints -= cost;
            
            // Unlock character
            character.unlocked = true;
            character.level = 1;
            character.bondPoints = character.bondPoints || 0;
            character.storyProgress = character.storyProgress || 0;
            
            // Update statistics
            gameData.statistics.charactersUnlocked++;
            
            // Show notification
            if (window.showNotification) {
                window.showNotification(`${character.name} dołączyła do dworu!`, 'success');
            }
            
            // Trigger first story event if available
            if (character.storyEvents && character.storyEvents[0]) {
                setTimeout(() => {
                    const story = window.gameModules?.getModule('story') || window.story;
                    if (story && story.startStoryEvent) {
                        story.startStoryEvent(character.storyEvents[0].id);
                    }
                }, 1000);
            }
            
            console.log(`${character.name} unlocked!`);
            
            // Refresh UI to show unlocked character immediately
            const ui = window.gameModules?.getModule('ui') || window.ui;
            if (ui && ui.renderCharactersList) {
                ui.renderCharactersList();
                console.log(`UI refreshed after unlocking ${character.name}`);
            } else {
                console.warn('UI module not available for refresh after unlock');
            }
            
            return true;
        } else {
            const needed = cost - gameData.lustPoints;
            console.warn(`Not enough LP to unlock ${character.name}. Need: ${cost}, Have: ${gameData.lustPoints}, Missing: ${needed}`);
            if (window.showNotification) {
                window.showNotification(`Potrzebujesz jeszcze ${gameUtils.formatNumber(needed)} Pożądania`, 'error');
            }
        }
        
        return false;
    }
    
    // Check unlock conditions for character or building
    function checkUnlockConditions(item) {
        if (!item || !item.unlockConditions) return true;
        
        for (const condition of item.unlockConditions) {
            if (condition.type === 'building') {
                const building = gameData.manor[condition.buildingId];
                if (!building || building.level < (condition.level || 1)) {
                    return false;
                }
            } else if (condition.type === 'character') {
                const character = gameData.characters[condition.characterId];
                if (!character || !character.unlocked) {
                    return false;
                }
                if (condition.level && character.level < condition.level) {
                    return false;
                }
            } else if (condition.type === 'quest') {
                const quest = gameData[condition.questId];
                if (!quest || quest.level < (condition.level || 1)) {
                    return false;
                }
            } else if (condition.type === 'story') {
                const character = gameData.characters[condition.characterId];
                if (!character || !character.unlocked) {
                    return false;
                }
                // Check if the specific story event has been completed
                const eventIndex = character.storyEvents ? character.storyEvents.findIndex(event => event.id === condition.eventId) : -1;
                if (eventIndex === -1 || (character.storyProgress || 0) <= eventIndex) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Upgrade building
    function upgradeBuilding(buildingId) {
        if (!gameData || !gameData.manor[buildingId]) return false;
        
        const building = gameData.manor[buildingId];
        if (building.level >= building.maxLevel) {
            if (window.showNotification) {
                window.showNotification('Budynek osiągnął maksymalny poziom', 'error');
            }
            return false;
        }
        
        // Check unlock conditions before allowing upgrade
        const conditionsMet = checkUnlockConditions(building);
        if (!conditionsMet) {
            if (window.showNotification) {
                window.showNotification('Wymagania nie zostały spełnione', 'error');
            }
            return false;
        }
        
        const cost = gameUtils.calculateBuildingCost(building);
        
        if (gameData.lustPoints >= cost) {
            // Pay the cost
            gameData.lustPoints -= cost;
            
            // Upgrade building
            building.level++;
            building.unlocked = true;
            
            // Update statistics
            gameData.statistics.buildingsBuilt++;
            
            // Check for special unlocks
            if (building.bonusType === 'minigame_unlock' && building.level === 1) {
                const minigame = building.bonusValue;
                if (gameData.minigames[minigame]) {
                    gameData.minigames[minigame].unlocked = true;
                    
                    if (window.showNotification) {
                        window.showNotification(`Odblokowano: ${minigame}!`, 'success');
                    }
                }
            }
            
            // Show notification
            if (window.showNotification) {
                window.showNotification(`${building.name} ulepszony do poziomu ${building.level}!`, 'success');
            }
            
            console.log(`${building.name} upgraded to level ${building.level}`);
            return true;
        } else {
            const needed = cost - gameData.lustPoints;
            if (window.showNotification) {
                window.showNotification(`Potrzebujesz jeszcze ${gameUtils.formatNumber(needed)} Pożądania`, 'error');
            }
        }
        
        return false;
    }
    
    // Start the game (from welcome screen)
    function startGame() {
        if (!gameData) return;
        
        gameData.gameStarted = true;
        gameData.session.startTime = Date.now();
        
        // Ensure Szafran is unlocked and set as active
        if (gameData.characters.szafran) {
            gameData.characters.szafran.unlocked = true;
            gameData.characters.szafran.level = Math.max(1, gameData.characters.szafran.level);
            gameData.activeCharacterId = 'szafran';
        }
        
        console.log('Game started via game logic');
    }
    
    // Update cooldowns
    function updateCooldowns(deltaTime) {
        if (logicState.clickCooldown > 0) {
            logicState.clickCooldown = Math.max(0, logicState.clickCooldown - deltaTime);
        }
    }
    
    // Main update function
    function update(deltaTime) {
        // Update cooldowns
        updateCooldowns(deltaTime);
        
        // Update passive income
        updatePassiveIncome(deltaTime);
        
        // Update production calculations for all characters
        Object.values(gameData.characters || {}).forEach(character => {
            if (character.unlocked) {
                character.currentProduction = calculatePassiveProduction(character);
            }
        });
        
        // Update total lust per second
        gameData.lustPerSecond = Object.values(gameData.characters || {})
            .filter(char => char.unlocked)
            .reduce((total, char) => total + (char.currentProduction || 0), 0);
    }
    
    // Get character can afford upgrade
    function canAffordCharacterUpgrade(characterId) {
        const character = gameData.characters[characterId];
        if (!character || !character.unlocked) return false;
        
        const cost = gameUtils.calculateUpgradeCost(character);
        return gameData.lustPoints >= cost;
    }
    
    // Get building can afford upgrade
    function canAffordBuildingUpgrade(buildingId) {
        const building = gameData.manor[buildingId];
        if (!building || building.level >= building.maxLevel) return false;
        
        const cost = gameUtils.calculateBuildingCost(building);
        return gameData.lustPoints >= cost;
    }
    
    // Calculate total income per second
    function calculateTotalIncome() {
        if (!gameData || !gameData.characters) return 0;
        
        return Object.values(gameData.characters)
            .filter(char => char.unlocked && char.level > 0)
            .reduce((total, char) => total + calculatePassiveProduction(char), 0);
    }
    
    // Get game statistics
    function getGameStats() {
        return {
            totalIncome: calculateTotalIncome(),
            clickValue: gameData.activeCharacterId ? 
                calculateClickValue(gameData.characters[gameData.activeCharacterId]) : 0,
            totalCharacters: Object.values(gameData.characters || {}).filter(c => c.unlocked).length,
            totalBuildings: Object.values(gameData.manor || {}).filter(b => b.level > 0).length,
            buildingBonuses: calculateBuildingBonuses()
        };
    }
    
    // Initialize game logic
    function initialize() {
        console.log('Game Logic initialized');
        return true;
    }
    
    // Cleanup
    function cleanup() {
        logicState.lastUpdate = 0;
        logicState.clickCooldown = 0;
        console.log('Game Logic cleanup complete');
    }
    
    // Return module interface
    return {
        // Core mechanics
        handleCharacterClick,
        upgradeCharacter,
        unlockCharacter,
        upgradeBuilding,
        startGame,
        
        // Calculations
        calculateClickValue,
        calculatePassiveProduction,
        calculateBondGain,
        calculateBuildingBonuses,
        calculateBuildingBondBonus,
        calculateTotalIncome,
        
        // Conditions and checks
        checkUnlockConditions,
        canAffordCharacterUpgrade,
        canAffordBuildingUpgrade,
        checkStoryProgression,
        
        // Game state
        update,
        getGameStats,
        
        // Utilities
        logicState: () => ({ ...logicState }),
        
        // Module lifecycle
        initialize,
        cleanup
    };
}

// Register game logic module
if (window.gameModules) {
    window.gameModules.registerModule('gameLogic', createGameLogicModule, ['domElements']);
    console.log('Game logic module registration complete');
    
    // Delayed exposure for backward compatibility (wait for module manager to be ready)
    setTimeout(() => {
        try {
            window.gameLogic = window.gameModules.getModule('gameLogic');
            if (window.gameLogic) {
                console.log('✅ Game logic module exposed globally');
            }
        } catch (error) {
            console.warn('⚠️ Could not expose gameLogic globally:', error.message);
        }
    }, 100);
} else {
    console.error('gameModules not available, creating game logic directly');
    // Fallback: create game logic directly with proper parameters
    window.gameLogic = createGameLogicModule(
        { domElements: window.domElements }, 
        window.gameModules
    );
}

// Global functions for character interactions
window.upgradeCharacter = function(characterId) {
    const gameLogic = window.gameModules?.getModule('gameLogic') || window.gameLogic;
    if (gameLogic) {
        return gameLogic.upgradeCharacter(characterId);
    }
    return false;
};

window.unlockCharacter = function(characterId) {
    const gameLogic = window.gameModules?.getModule('gameLogic') || window.gameLogic;
    if (gameLogic) {
        return gameLogic.unlockCharacter(characterId);
    }
    return false;
};

window.upgradeBuilding = function(buildingId) {
    const gameLogic = window.gameModules?.getModule('gameLogic') || window.gameLogic;
    if (gameLogic) {
        return gameLogic.upgradeBuilding(buildingId);
    }
    return false;
};

console.log('Game Logic module loaded successfully');