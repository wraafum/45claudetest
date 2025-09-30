// --- Minigames System ---
// Modular minigames system with dependency injection

// Minigames Module Factory
function createMinigamesModule(dependencies, moduleManager) {
    const { domElements, ui } = dependencies;
    
    // DOM element cache for performance
    let domCache = {
        plotElements: new Map(),
        seedElements: new Map(),
        shopButtons: new Map(),
        lastCacheTime: 0,
        cacheTimeout: 5000 // 5 seconds cache
    };
    
    function getCachedElement(selector, force = false) {
        const now = Date.now();
        if (force || now - domCache.lastCacheTime > domCache.cacheTimeout) {
            // Clear stale cache
            domCache.plotElements.clear();
            domCache.seedElements.clear();
            domCache.shopButtons.clear();
            domCache.lastCacheTime = now;
        }
        
        let element = document.querySelector(selector);
        return element;
    }
    
    function getCachedPlotElement(plotIndex) {
        if (domCache.plotElements.has(plotIndex)) {
            return domCache.plotElements.get(plotIndex);
        }
        
        const element = getCachedElement(`[data-plot-index="${plotIndex}"]`);
        if (element) {
            domCache.plotElements.set(plotIndex, element);
        }
        return element;
    }
    
    function getCachedSeedElement(seedType) {
        if (domCache.seedElements.has(seedType)) {
            return domCache.seedElements.get(seedType);
        }
        
        const element = getCachedElement(`[data-seed-type="${seedType}"]`);
        if (element) {
            domCache.seedElements.set(seedType, element);
        }
        return element;
    }

    // Utility function to safely validate and convert numbers
    function validateNumber(value, fallback = 0) {
        if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
            return value;
        }
        console.warn('Invalid number detected in minigames system, using fallback:', { value, fallback });
        return fallback;
    }

    function checkMainQuestProgress() {
    const currentLevel = validateNumber(gameData.mainQuest.level, 0);
    const nextThreshold = gameData.mainQuest.thresholds[currentLevel];
    const validThreshold = validateNumber(nextThreshold, 0);
    const validEssence = validateNumber(gameData.sanctuaryEssence, 0);
    
    if (validThreshold > 0 && validEssence >= validThreshold) {
        // Don't level up automatically, wait for player action
    }
}

    function levelUpSanctuary() {
    const currentLevel = validateNumber(gameData.mainQuest.level, 0);
    const nextThreshold = gameData.mainQuest.thresholds[currentLevel];
    const validThreshold = validateNumber(nextThreshold, 0);
    
    gameData.sanctuaryEssence = validateNumber(gameData.sanctuaryEssence, 0);
    
    if (validThreshold > 0 && gameData.sanctuaryEssence >= validThreshold) {
        gameData.sanctuaryEssence = validateNumber(gameData.sanctuaryEssence - validThreshold, 0);
        gameData.mainQuest.level = validateNumber(gameData.mainQuest.level + 1, 1);
        startStoryEvent('sanctuary_level_up_1');
        if (gameData.viewedCharacterId === 'manor_map') {
            displayManorMap();
        }
    }
}

    function checkUnlockConditions(item) {
    if (!item || !item.unlockConditions) return true;
    
    for(const condition of item.unlockConditions) {
        if (condition.type === 'building') {
            const building = gameData.manor[condition.buildingId];
            if (!building) return false;
            
            const buildingLevel = validateNumber(building.level, 0);
            const requiredLevel = validateNumber(condition.level, 1);
            
            if (buildingLevel < requiredLevel) {
                return false;
            }
        } else if (condition.type === 'character') {
            const character = gameData.characters[condition.characterId];
            if (!character || !character.unlocked) {
                return false;
            }
            // Check level requirement if specified
            if (condition.level) {
                const characterLevel = validateNumber(character.level, 0);
                const requiredLevel = validateNumber(condition.level, 1);
                
                if (characterLevel < requiredLevel) {
                    return false;
                }
            }
        } else if (condition.type === 'quest') {
            const quest = gameData[condition.questId];
            if (!quest) return false;
            
            const questLevel = validateNumber(quest.level, 0);
            const requiredLevel = validateNumber(condition.level, 1);
            
            if (questLevel < requiredLevel) {
                return false;
            }
        }
    }
    return true;
}

    function unlockCharacter(charId) {
    // Use the enhanced unlock validator if available
    const validator = window.gameModules?.getModule('characterUnlockValidator');
    if (validator) {
        const result = validator.unlockCharacterSafely(charId);
        return result.success;
    }
    
    // Fallback to legacy unlock system
    return unlockCharacterLegacy(charId);
}

// Legacy unlock function (kept for backwards compatibility)
    function unlockCharacterLegacy(charId) {
    const char = gameData.characters[charId];
    
    if (!char) {
        console.error(`Character ${charId} not found in gameData`);
        return false;
    }
    
    // Alina może być odblokowana tylko przez prestiż
    if (charId === 'alina') {
        if (gameData.prestigeUpgrades && gameData.prestigeUpgrades.unlock_alina && !char.permanentlyUnlocked) {
            char.permanentlyUnlocked = true;
            char.unlocked = true;
            char.level = 1;
            if (typeof startStoryEvent === 'function' && char.storyEvents && char.storyEvents[0]) {
                startStoryEvent(char.storyEvents[0].id);
            }
            if (typeof showNotification === 'function') {
                showNotification(`${char.name} została odblokowana przez prestiż!`, 'success');
            }
            return true;
        }
        if (typeof showNotification === 'function') {
            showNotification('Alina może być odblokowana tylko przez drzewko prestiżu!', 'error');
        }
        return false;
    }
    
    // Validate unlock cost (don't override character-defined values)
    char.unlockCost = validateNumber(char.unlockCost, char.unlockCost || 0);
    
    // Validate gameData lustPoints
    gameData.lustPoints = validateNumber(gameData.lustPoints, 0);
    
    // Check conditions
    if (gameData.lustPoints >= char.unlockCost && checkUnlockConditions(char)) {
        gameData.lustPoints = validateNumber(gameData.lustPoints - char.unlockCost, 0);
        char.unlocked = true;
        char.level = 1;
        
        // Start story event safely
        if (typeof startStoryEvent === 'function' && char.storyEvents && char.storyEvents[0]) {
            startStoryEvent(char.storyEvents[0].id);
        } else {
            console.warn(`Could not start story event for character ${charId}`);
        }
        
        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`${char.name} została odblokowana!`, 'success');
        }
        
        // Force UI update to show changes
        if (typeof updateAllUI === 'function') {
            updateAllUI();
        }
        
        console.log(`Character ${charId} successfully unlocked`);
        return true;
    } else {
        const missingLust = char.unlockCost - gameData.lustPoints;
        if (typeof showNotification === 'function') {
            showNotification(`Potrzebujesz jeszcze ${Math.ceil(missingLust)} Pożądania`, 'error');
        }
        return false;
    }
}

    function displaySanctuaryCore() {
    if (!domElements) {
        console.error('❌ domElements not available in displaySanctuaryCore');
        return;
    }
    
    gameData.viewedCharacterId = 'sanctuary';
    domElements.setContent('centerPanelTitle', 'Serce Dworu');
    const currentLevel = gameData.mainQuest.level;
    const nextThreshold = gameData.mainQuest.thresholds[currentLevel];
    const canLevelUp = nextThreshold !== undefined && gameData.sanctuaryEssence >= nextThreshold;
    
    const sanctuaryHTML = `
        <div class="sanctuary-core">
            <div class="sanctuary-display">
                <img src="imgs/sanctuary/level_${currentLevel}.png" alt="Sanctuary Level ${currentLevel}" class="sanctuary-image">
            </div>
            <div class="sanctuary-info">
                <h2>Poziom ${currentLevel}</h2>
                <div class="essence-progress">
                    <div class="essence-bar">
                        <div class="essence-fill" style="width: ${nextThreshold ? (gameData.sanctuaryEssence / nextThreshold * 100) : 100}%"></div>
                    </div>
                    <div class="essence-text">
                        Esencja: ${formatNumber(gameData.sanctuaryEssence)}${nextThreshold ? ` / ${formatNumber(nextThreshold)}` : ' (Max)'}
                    </div>
                </div>
                ${canLevelUp ? `
                    <button class="btn-level-up" onclick="levelUpSanctuary()">
                        Ulepsz Sanktuarium
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    domElements.setContent('mainCharacterDisplay', sanctuaryHTML, { html: true });
}

    // Calculate grid size based on garden building level
    function calculateGridSize() {
        const gardenBuilding = gameData?.manor?.garden;
        if (!gardenBuilding || gardenBuilding.level === 0) {
            // Garden is locked at level 0
            return { size: 0, totalPlots: 0 };
        }
        
        const baseSize = 3; // Start at 3x3 when level 1
        const maxSize = 7;  // Max 7x7 at level 5
        // Level 1 = 3x3, Level 2 = 4x4, Level 3 = 5x5, Level 4 = 6x6, Level 5 = 7x7
        const currentSize = Math.min(maxSize, baseSize + (gardenBuilding.level - 1));
        return { 
            size: currentSize, 
            totalPlots: currentSize * currentSize 
        };
    }

    // Ensure garden has correct number of plots
    function ensureCorrectPlotCount() {
        if (!gameData?.minigames?.garden) return;
        
        const { totalPlots } = calculateGridSize();
        const currentPlots = gameData.minigames.garden.plots.length;
        
        // If garden is unlocked but has no plots, initialize them
        if (gameData.minigames.garden.unlocked && currentPlots === 0 && totalPlots > 0) {
            console.log(`🌱 Initializing garden with ${totalPlots} plots`);
            for (let i = 0; i < totalPlots; i++) {
                gameData.minigames.garden.plots.push({
                    seed: null,
                    growth: 0,
                    plantedTime: null
                });
            }
        } else if (currentPlots < totalPlots) {
            // Add new empty plots when garden building is upgraded
            console.log(`🌱 Expanding garden from ${currentPlots} to ${totalPlots} plots`);
            for (let i = currentPlots; i < totalPlots; i++) {
                gameData.minigames.garden.plots.push({
                    seed: null,
                    growth: 0,
                    plantedTime: null
                });
            }
        } else if (currentPlots > totalPlots) {
            // Remove excess plots but preserve planted crops when possible
            const plotsToKeep = [];
            const plotsToRemove = [];
            
            // First, collect all planted plots and empty plots
            gameData.minigames.garden.plots.forEach((plot, index) => {
                if (plot.seed) {
                    plotsToKeep.push({...plot, originalIndex: index});
                } else {
                    plotsToRemove.push({...plot, originalIndex: index});
                }
            });
            
            // Keep planted crops first, then fill remaining slots with empty plots
            const finalPlots = [];
            const plantedCount = plotsToKeep.length;
            
            if (plantedCount <= totalPlots) {
                // All planted crops can be preserved
                finalPlots.push(...plotsToKeep.map(p => ({seed: p.seed, growth: p.growth, plantedTime: p.plantedTime})));
                
                // Fill remaining slots with empty plots
                const emptyPlotsNeeded = totalPlots - plantedCount;
                for (let i = 0; i < emptyPlotsNeeded; i++) {
                    finalPlots.push({seed: null, growth: 0, plantedTime: null});
                }
            } else {
                // Too many planted crops - prioritize most mature ones
                plotsToKeep.sort((a, b) => (b.growth || 0) - (a.growth || 0));
                finalPlots.push(...plotsToKeep.slice(0, totalPlots).map(p => ({seed: p.seed, growth: p.growth, plantedTime: p.plantedTime})));
                
                // Show notification about lost crops
                const lostCrops = plantedCount - totalPlots;
                if (typeof showNotification === 'function') {
                    showNotification(`Uwaga: ${lostCrops} upraw zostało utraconych przez zmniejszenie ogrodu`, 'warning');
                }
            }
            
            gameData.minigames.garden.plots = finalPlots;
            console.log(`🌱 Garden resized: preserved ${Math.min(plantedCount, totalPlots)} planted crops`);
        }
    }

    function displayGarden() {
    console.log('🌸 displayGarden called');
    
    if (!domElements) {
        console.error('❌ domElements not available in displayGarden');
        return;
    }
    
    if (!gameData?.minigames?.garden) {
        console.error('❌ Garden minigame data not available');
        return;
    }
    
    // Check if garden is unlocked
    if (!gameData.minigames.garden.unlocked) {
        console.log('❌ Garden is locked');
        gameData.viewedCharacterId = 'garden';
        domElements.setContent('centerPanelTitle', 'Ogród - Zablokowany');
        
        const lockedHTML = `
            <div class="garden-view">
                <button onclick="displayManor()" class="btn-primary absolute top-4 right-4 text-sm px-3 py-1">
                    ← Wróć do Dworu
                </button>
                
                <div class="text-center py-20">
                    <div class="text-6xl mb-4">🔒</div>
                    <h2 class="text-2xl font-bold text-gray-300 mb-4">Ogród Zablokowany</h2>
                    <p class="text-gray-400 mb-6">Ulepsz budynek Ogrodu do poziomu 1 aby odblokować tę funkcję</p>
                    <button onclick="displayManor(); setTimeout(() => { const rightPanel = window.gameModules?.getModule('ui'); if (rightPanel) rightPanel.showBuildingsTab(); }, 100);" 
                            class="btn-secondary">
                        Przejdź do Budynków
                    </button>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', lockedHTML, { html: true });
        return;
    }
    
    // Ensure correct plot count before displaying
    ensureCorrectPlotCount();
    
    console.log('✅ Setting up garden display');
    gameData.viewedCharacterId = 'garden';
    domElements.setContent('centerPanelTitle', 'Ogród Szafran');
    
    const { size } = calculateGridSize();
    
    const gardenHTML = `
        <div class="garden-view">
            <button onclick="displayManor()" class="btn-primary absolute top-4 right-4 text-sm px-3 py-1">
                ← Wróć do Dworu
            </button>
            
            <div class="mb-6">
                <h2 class="text-xl font-bold text-green-300 mb-4">🌸 Działki Ogrodowe (${size}×${size})</h2>
                <div class="garden-plots" style="grid-template-columns: repeat(${size}, 64px); grid-template-rows: repeat(${size}, 64px);">
                    ${gameData.minigames.garden.plots.map((plot, index) => `
                        <div class="garden-plot ${plot.seed ? 'planted' : 'empty'}" 
                             data-plot-index="${index}"
                             onclick="handlePlotClick(${index})" 
                             title="${plot.seed ? 'Kliknij aby zebrać plon' : 'Kliknij aby zasadzić nasiono'}">
                            ${plot.seed ? `
                                <div class="plant">
                                    <img src="imgs/seeds/${plot.seed}.png" alt="${plot.seed}" onerror="this.style.display='none'">
                                    <div class="growth-bar">
                                        <div class="growth-fill" style="width: ${plot.growth}%"></div>
                                    </div>
                                    <div class="growth-text">${Math.floor(plot.growth)}%</div>
                                </div>
                            ` : `
                                <div class="empty-plot">🌱</div>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="garden-inventory">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="text-lg font-bold text-amber-300">📦 Nasiona w Ekwipunku</h3>
                    <div class="text-xs">
                        <label class="text-gray-300 mr-2">Sortuj:</label>
                        <select id="seed-sort" onchange="updateSeedInventory()" class="bg-gray-800 text-white text-xs px-2 py-1 rounded border border-gray-600">
                            <option value="name">Nazwa</option>
                            <option value="quantity">Ilość</option>
                            <option value="rarity">Rzadkość</option>
                            <option value="growthTime">Czas wzrostu</option>
                        </select>
                    </div>
                </div>
                <div id="seeds-list" class="seeds-list grid grid-cols-6 gap-3 mb-4">
                    ${(() => {
                        const sortType = document.getElementById('seed-sort')?.value || 'name';
                        const sortedSeeds = sortSeeds(sortType);
                        
                        if (sortedSeeds.length === 0) {
                            return '<div class="col-span-6 text-center text-gray-400 py-4">Brak nasion w ekwipunku</div>';
                        }
                        
                        return sortedSeeds.map(([seedType, count]) => {
                            const seedData = gameData.seeds[seedType];
                            const rarityColors = {
                                'common': 'border-gray-500',
                                'uncommon': 'border-green-500',
                                'rare': 'border-blue-500', 
                                'legendary': 'border-purple-500'
                            };
                            const rarityColor = rarityColors[seedData?.rarity] || 'border-gray-500';
                            
                            return `
                                <div class="seed-item ${gameData.selectedSeed === seedType ? 'selected' : ''} ${rarityColor}" 
                                     onclick="selectSeed('${seedType}')" 
                                     title="${seedData?.name || seedType}&#10;Ilość: ${count}&#10;Rzadkość: ${seedData?.rarity || 'nieznana'}&#10;Czas wzrostu: ${Math.floor((seedData?.growthTime || 0) / 60)} min&#10;Nagroda: ${seedData?.rewardType === 'lust' ? 'Pożądanie' : seedData?.rewardType === 'bond' ? 'Więź' : 'Esencja'}">
                                    <img src="imgs/seeds/${seedType}.png" alt="${seedType}" onerror="this.style.display='none'">
                                    <span class="seed-count">${count}</span>
                                </div>
                            `;
                        }).join('');
                    })()}
                </div>
                
                <div class="selected-seed-info mb-4">
                    ${gameData.selectedSeed ? `
                        <div class="text-center">
                            <h4 class="text-sm font-semibold text-green-300">🌱 Wybrane: ${gameData.seeds[gameData.selectedSeed]?.name || gameData.selectedSeed}</h4>
                            <p class="text-xs text-gray-300 mt-1">
                                ⏱️ Czas wzrostu: ${Math.floor(gameData.seeds[gameData.selectedSeed]?.growthTime / 60)} min | 
                                💰 Nagroda: ${gameData.seeds[gameData.selectedSeed]?.rewardType === 'lust' ? 'Pożądanie ♡' : gameData.seeds[gameData.selectedSeed]?.rewardType === 'bond' ? 'Więź 💜' : 'Esencja 💧'}
                            </p>
                        </div>
                    ` : '<p class="text-sm text-gray-400 text-center">Wybierz nasiono aby zasadzić</p>'}
                </div>
                
                <div class="bulk-actions mb-4">
                    <h4 class="text-sm font-semibold text-blue-300 mb-3">⚡ Szybkie Akcje</h4>
                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="handlePlantAllClick()" 
                                class="bulk-action-btn btn-secondary text-xs px-3 py-2"
                                ${gameData.selectedSeed && (gameData.minigames.garden.seeds[gameData.selectedSeed] || 0) > 0 ? '' : 'disabled'}>
                            🌱 Zasadź Wszystkie
                        </button>
                        <button onclick="handleHarvestAllClick()" 
                                class="bulk-action-btn btn-secondary text-xs px-3 py-2">
                            🧺 Zbierz Wszystkie
                        </button>
                    </div>
                </div>
                
                <div class="seed-shop">
                    <h4 class="text-sm font-semibold text-purple-300 mb-3">🛒 Sklep z Nasionami</h4>
                    <div class="grid grid-cols-1 gap-3">
                        ${Object.entries(gameData.seeds || {}).map(([seedType, seedData]) => {
                            const cost = seedData.cost || (seedData.rarity === 'common' ? 100 : seedData.rarity === 'uncommon' ? 250 : seedData.rarity === 'rare' ? 500 : 1000);
                            const canAfford = gameData.lustPoints >= cost;
                            const canAfford5 = gameData.lustPoints >= (cost * 5);
                            
                            const rarityColors = {
                                'common': 'bg-gray-700/60',
                                'uncommon': 'bg-green-700/60',
                                'rare': 'bg-blue-700/60',
                                'legendary': 'bg-purple-700/60'
                            };
                            const rarityBg = rarityColors[seedData.rarity] || 'bg-gray-700/60';
                            
                            return `
                                <div class="seed-shop-item ${rarityBg} rounded-lg p-3 border border-gray-600/50">
                                    <div class="flex justify-between items-center mb-2">
                                        <div>
                                            <div class="font-semibold text-sm">${seedData.name}</div>
                                            <div class="text-xs text-gray-300">
                                                ${seedData.rarity} • ${Math.floor(seedData.growthTime / 60)}min • 
                                                ${seedData.rewardType === 'lust' ? '♡' : seedData.rewardType === 'bond' ? '💜' : '💧'}
                                            </div>
                                        </div>
                                        <img src="imgs/seeds/${seedType}.png" alt="${seedType}" class="w-8 h-8" onerror="this.style.display='none'">
                                    </div>
                                    <div class="flex gap-2">
                                        <button onclick="handleShopButtonClick(this, '${seedType}', 1)" 
                                                class="btn-secondary text-xs px-3 py-1 flex-1 transition-all duration-150 ${canAfford ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}" 
                                                ${canAfford ? '' : 'disabled'}>
                                            1x (${cost} ♡)
                                        </button>
                                        <button onclick="handleShopButtonClick(this, '${seedType}', 5)" 
                                                class="btn-secondary text-xs px-3 py-1 flex-1 transition-all duration-150 ${canAfford5 ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed'}" 
                                                ${canAfford5 ? '' : 'disabled'}>
                                            5x (${cost * 5} ♡)
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="garden-stats mt-6">
                    <h4 class="text-sm font-semibold text-cyan-300 mb-3 cursor-pointer" onclick="toggleGardenStats()">
                        📊 Statystyki Ogrodu <span id="stats-toggle">▼</span>
                    </h4>
                    <div id="garden-stats-content" class="hidden bg-gray-900/40 rounded-lg p-4 text-xs">
                        ${gameData.minigames.garden.stats ? `
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-green-300">🌱 Zasadzone: ${gameData.minigames.garden.stats.totalSeedsPlanted}</p>
                                    <p class="text-orange-300">🧺 Zebrane: ${gameData.minigames.garden.stats.totalHarvests}</p>
                                    <p class="text-purple-300">♡ Pożądanie: ${gameData.minigames.garden.stats.totalLustEarned}</p>
                                </div>
                                <div>
                                    <p class="text-pink-300">💜 Więź: ${gameData.minigames.garden.stats.totalBondEarned}</p>
                                    <p class="text-blue-300">💧 Esencja: ${gameData.minigames.garden.stats.totalEssenceEarned}</p>
                                    <p class="text-gray-300">⏰ Aktywny: ${gameData.minigames.garden.stats.firstHarvestTime ? 
                                        Math.floor((Date.now() - gameData.minigames.garden.stats.firstHarvestTime) / (1000 * 60 * 60 * 24)) + ' dni' : 'Nowy'}</p>
                                </div>
                            </div>
                            <div class="mt-3 border-t border-gray-700/50 pt-3">
                                <p class="text-amber-300 mb-2">🌾 Zebrane Nasiona:</p>
                                <div class="flex flex-wrap gap-2">
                                    ${Object.entries(gameData.minigames.garden.stats.seedsHarvested || {})
                                        .filter(([_, count]) => count > 0)
                                        .map(([seedType, count]) => `
                                            <span class="bg-gray-800/60 px-2 py-1 rounded text-xs">
                                                ${gameData.seeds[seedType]?.name || seedType}: ${count}
                                            </span>
                                        `).join('')}
                                </div>
                            </div>
                        ` : '<p class="text-gray-400">Brak statystyk - zacznij uprawiać rośliny!</p>'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    domElements.setContent('mainCharacterDisplay', gardenHTML, { html: true });
}

    // Legacy function for backward compatibility
    function selectSeed(seedType) {
    handleSeedClick(seedType);
}

    function buySeed(seedType) {
    const seedData = gameData.seeds[seedType];
    if (!seedData) {
        console.error(`Seed type ${seedType} not found`);
        return;
    }
    
    const cost = seedData.cost || (seedData.rarity === 'common' ? 100 : seedData.rarity === 'uncommon' ? 250 : seedData.rarity === 'rare' ? 500 : 1000);
    
    if (gameData.lustPoints < cost) {
        if (typeof showNotification === 'function') {
            showNotification(`Potrzebujesz ${cost} Pożądania na to nasiono`, 'error');
        }
        return;
    }
    
    // Deduct cost
    gameData.lustPoints -= cost;
    
    // Add seed to inventory
    if (!gameData.minigames.garden.seeds) {
        gameData.minigames.garden.seeds = {};
    }
    gameData.minigames.garden.seeds[seedType] = (gameData.minigames.garden.seeds[seedType] || 0) + 1;
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification(`Kupiono ${seedData.name}!`, 'success');
    }
    
    // Update UI with targeted updates instead of full re-render
    if (gameData.viewedCharacterId === 'garden') {
        updateSeedInventoryDisplay();
        updateShopPrices();
    }
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    }
}

    function buySeedMultiple(seedType, quantity = 5) {
    const seedData = gameData.seeds[seedType];
    if (!seedData) return;
    
    const cost = seedData.cost || (seedData.rarity === 'common' ? 100 : seedData.rarity === 'uncommon' ? 250 : seedData.rarity === 'rare' ? 500 : 1000);
    const totalCost = cost * quantity;
    
    if (gameData.lustPoints < totalCost) {
        if (typeof showNotification === 'function') {
            showNotification(`Potrzebujesz ${totalCost} Pożądania na ${quantity} nasion`, 'error');
        }
        return;
    }
    
    gameData.lustPoints -= totalCost;
    
    if (!gameData.minigames.garden.seeds) {
        gameData.minigames.garden.seeds = {};
    }
    gameData.minigames.garden.seeds[seedType] = (gameData.minigames.garden.seeds[seedType] || 0) + quantity;
    
    if (typeof showNotification === 'function') {
        showNotification(`Kupiono ${quantity}x ${seedData.name}!`, 'success');
    }
    
    if (gameData.viewedCharacterId === 'garden') {
        updateSeedInventoryDisplay();
        updateShopPrices();
    }
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    }
}

    function sortSeeds(sortType = 'name') {
    if (!gameData.minigames?.garden?.seeds) return [];
    
    const seedEntries = Object.entries(gameData.minigames.garden.seeds || {})
        .filter(([seedType, count]) => count > 0);
    
    switch (sortType) {
        case 'name':
            return seedEntries.sort(([a], [b]) => {
                const nameA = gameData.seeds[a]?.name || a;
                const nameB = gameData.seeds[b]?.name || b;
                return nameA.localeCompare(nameB);
            });
        case 'quantity':
            return seedEntries.sort(([,a], [,b]) => b - a);
        case 'rarity':
            const rarityOrder = { 'common': 1, 'uncommon': 2, 'rare': 3, 'legendary': 4 };
            return seedEntries.sort(([a], [b]) => {
                const rarityA = rarityOrder[gameData.seeds[a]?.rarity] || 0;
                const rarityB = rarityOrder[gameData.seeds[b]?.rarity] || 0;
                return rarityB - rarityA;
            });
        case 'growthTime':
            return seedEntries.sort(([a], [b]) => {
                const timeA = gameData.seeds[a]?.growthTime || 0;
                const timeB = gameData.seeds[b]?.growthTime || 0;
                return timeA - timeB;
            });
        default:
            return seedEntries;
    }
}

    function interactWithPlot(plotIndex) {
    const plot = gameData.minigames.garden.plots[plotIndex];
    
    if (!plot) {
        console.error('Invalid plot index:', plotIndex);
        return;
    }
    
    if (!plot.seed && gameData.selectedSeed && gameData.minigames.garden.seeds[gameData.selectedSeed] > 0) {
        // Plant seed
        plantSeed(plotIndex, gameData.selectedSeed);
    } else if (plot.seed && plot.growth >= 100) {
        // Harvest
        harvestPlot(plotIndex);
    } else if (plot.seed && plot.growth < 100) {
        // Show growth status
        if (typeof showNotification === 'function') {
            const remainingTime = calculateRemainingGrowthTime(plot);
            showNotification(`Roślina rośnie... (${Math.floor(plot.growth)}% ukończone, ~${remainingTime} pozostało)`, 'info');
        }
    } else if (!plot.seed && !gameData.selectedSeed) {
        // No seed selected
        if (typeof showNotification === 'function') {
            showNotification('Wybierz nasiono z ekwipunku aby zasadzić', 'warning');
        }
    } else if (!plot.seed && gameData.selectedSeed && (!gameData.minigames.garden.seeds[gameData.selectedSeed] || gameData.minigames.garden.seeds[gameData.selectedSeed] <= 0)) {
        // No seeds of selected type
        if (typeof showNotification === 'function') {
            showNotification(`Nie masz nasion typu ${gameData.seeds[gameData.selectedSeed]?.name || gameData.selectedSeed}`, 'error');
        }
    }
    
    // Update displays with targeted updates
    if (gameData.viewedCharacterId === 'garden') {
        updateSinglePlot(plotIndex);
        updateSeedInventoryDisplay(); // In case seed count changed
        updateShopPrices(); // In case lust points changed
    }
}

    function calculateRemainingGrowthTime(plot) {
    if (!plot || !plot.seed || !plot.plantedTime) return 'nieznany';
    
    const seedData = gameData.seeds[plot.seed];
    if (!seedData || !seedData.growthTime) return 'nieznany';
    
    const now = Date.now();
    const timeElapsed = (now - plot.plantedTime) / 1000;
    const totalGrowthTime = seedData.growthTime;
    const remainingTime = Math.max(0, totalGrowthTime - timeElapsed);
    
    if (remainingTime <= 0) return 'gotowe!';
    
    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    
    if (minutes > 0) {
        return `${minutes}min ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
}

    function plantAllSeeds() {
    if (!gameData.selectedSeed || !gameData.minigames?.garden?.plots) {
        if (typeof showNotification === 'function') {
            showNotification('Wybierz typ nasiona aby zasadzić', 'warning');
        }
        return;
    }
    
    const seedType = gameData.selectedSeed;
    const availableSeeds = gameData.minigames.garden.seeds[seedType] || 0;
    
    if (availableSeeds <= 0) {
        if (typeof showNotification === 'function') {
            showNotification(`Nie masz nasion typu ${gameData.seeds[seedType]?.name || seedType}`, 'error');
        }
        return;
    }
    
    let planted = 0;
    const emptyPlots = gameData.minigames.garden.plots
        .map((plot, index) => ({ plot, index }))
        .filter(({ plot }) => !plot.seed);
    
    const maxToPlant = Math.min(availableSeeds, emptyPlots.length);
    
    for (let i = 0; i < maxToPlant; i++) {
        const plotIndex = emptyPlots[i].index;
        if (plantSeed(plotIndex, seedType)) {
            planted++;
        }
    }
    
    if (planted > 0) {
        if (typeof showNotification === 'function') {
            showNotification(`Zasadzono ${planted} nasion typu ${gameData.seeds[seedType]?.name || seedType}`, 'success');
        }
        if (gameData.viewedCharacterId === 'garden') {
            // Update all affected plots
            for (let i = 0; i < maxToPlant; i++) {
                updateSinglePlot(emptyPlots[i].index);
            }
            updateSeedInventoryDisplay();
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Nie udało się zasadzić żadnych nasion', 'error');
        }
    }
}

    function harvestAllPlots() {
    if (!gameData.minigames?.garden?.plots) return;
    
    let harvested = 0;
    const readyPlots = gameData.minigames.garden.plots
        .map((plot, index) => ({ plot, index }))
        .filter(({ plot }) => plot.seed && plot.growth >= 100);
    
    readyPlots.forEach(({ index }) => {
        if (harvestPlot(index)) {
            harvested++;
        }
    });
    
    if (harvested > 0) {
        if (typeof showNotification === 'function') {
            showNotification(`Zebrano ${harvested} upraw`, 'success');
        }
        if (gameData.viewedCharacterId === 'garden') {
            // Update all harvested plots
            readyPlots.forEach(({ index }) => {
                updateSinglePlot(index);
            });
            updateSeedInventoryDisplay();
            updateShopPrices();
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Brak gotowych upraw do zebrania', 'info');
        }
    }
}

    function updateSeedInventory() {
    const seedsList = document.getElementById('seeds-list');
    const sortSelect = document.getElementById('seed-sort');
    
    if (!seedsList || !sortSelect) return;
    
    const sortType = sortSelect.value;
    const sortedSeeds = sortSeeds(sortType);
    
    if (sortedSeeds.length === 0) {
        seedsList.innerHTML = '<div class="col-span-6 text-center text-gray-400 py-4">Brak nasion w ekwipunku</div>';
        return;
    }
    
    seedsList.innerHTML = sortedSeeds.map(([seedType, count]) => {
        const seedData = gameData.seeds[seedType];
        const rarityColors = {
            'common': 'border-gray-500',
            'uncommon': 'border-green-500',
            'rare': 'border-blue-500', 
            'legendary': 'border-purple-500'
        };
        const rarityColor = rarityColors[seedData?.rarity] || 'border-gray-500';
        
        return `
            <div class="seed-item ${gameData.selectedSeed === seedType ? 'selected' : ''} ${rarityColor}" 
                 onclick="selectSeed('${seedType}')" 
                 title="${seedData?.name || seedType}&#10;Ilość: ${count}&#10;Rzadkość: ${seedData?.rarity || 'nieznana'}&#10;Czas wzrostu: ${Math.floor((seedData?.growthTime || 0) / 60)} min&#10;Nagroda: ${seedData?.rewardType === 'lust' ? 'Pożądanie' : seedData?.rewardType === 'bond' ? 'Więź' : 'Esencja'}">
                <img src="imgs/seeds/${seedType}.png" alt="${seedType}" onerror="this.style.display='none'">
                <span class="seed-count">${count}</span>
            </div>
        `;
    }).join('');
}

    function toggleGardenStats() {
    const content = document.getElementById('garden-stats-content');
    const toggle = document.getElementById('stats-toggle');
    
    if (content && toggle) {
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            toggle.textContent = '▲';
        } else {
            content.classList.add('hidden');
            toggle.textContent = '▼';
        }
    }
}

    // Granular update functions for responsive UI
    function updateSinglePlot(plotIndex) {
    const plot = gameData.minigames.garden.plots[plotIndex];
    const plotElement = getCachedPlotElement(plotIndex);
    
    if (!plot || !plotElement) return;
    
    if (plot.seed) {
        plotElement.className = 'garden-plot planted';
        plotElement.innerHTML = `
            <div class="plant">
                <img src="imgs/seeds/${plot.seed}.png" alt="${plot.seed}" onerror="this.style.display='none'">
                <div class="growth-bar">
                    <div class="growth-fill" style="width: ${plot.growth}%"></div>
                </div>
                <div class="growth-text">${Math.floor(plot.growth)}%</div>
            </div>
        `;
    } else {
        plotElement.className = 'garden-plot empty';
        plotElement.innerHTML = '<div class="empty-plot">🌱</div>';
    }
    
    // Update tooltip
    plotElement.title = plot.seed ? 'Kliknij aby zebrać plon' : 'Kliknij aby zasadzić nasiono';
}

    function updateSeedInventoryDisplay() {
    const seedsList = document.getElementById('seeds-list');
    const sortSelect = document.getElementById('seed-sort');
    
    if (!seedsList) return;
    
    const sortType = sortSelect?.value || 'name';
    const sortedSeeds = sortSeeds(sortType);
    
    if (sortedSeeds.length === 0) {
        seedsList.innerHTML = '<div class="col-span-6 text-center text-gray-400 py-4">Brak nasion w ekwipunku</div>';
        return;
    }
    
    seedsList.innerHTML = sortedSeeds.map(([seedType, count]) => {
        const seedData = gameData.seeds[seedType];
        const rarityColors = {
            'common': 'border-gray-500',
            'uncommon': 'border-green-500',
            'rare': 'border-blue-500', 
            'legendary': 'border-purple-500'
        };
        const rarityColor = rarityColors[seedData?.rarity] || 'border-gray-500';
        
        return `
            <div class="seed-item ${gameData.selectedSeed === seedType ? 'selected' : ''} ${rarityColor}" 
                 data-seed-type="${seedType}"
                 onclick="handleSeedClick('${seedType}')" 
                 title="${seedData?.name || seedType}&#10;Ilość: ${count}&#10;Rzadkość: ${seedData?.rarity || 'nieznana'}&#10;Czas wzrostu: ${Math.floor((seedData?.growthTime || 0) / 60)} min&#10;Nagroda: ${seedData?.rewardType === 'lust' ? 'Pożądanie' : seedData?.rewardType === 'bond' ? 'Więź' : 'Esencja'}">
                <img src="imgs/seeds/${seedType}.png" alt="${seedType}" onerror="this.style.display='none'">
                <span class="seed-count">${count}</span>
            </div>
        `;
    }).join('');
}

    function updateShopPrices() {
    const shopButtons = document.querySelectorAll('.seed-shop-item button');
    shopButtons.forEach(button => {
        const onclick = button.getAttribute('onclick');
        if (onclick?.includes('buySeed')) {
            const match = onclick.match(/buySeed\('([^']+)'\)/);
            if (match) {
                const seedType = match[1];
                const seedData = gameData.seeds[seedType];
                const cost = seedData?.cost || 100;
                const canAfford = gameData.lustPoints >= cost;
                
                button.className = button.className.replace(/opacity-50|cursor-not-allowed/g, '');
                button.disabled = false;
                
                if (!canAfford) {
                    button.className += ' opacity-50 cursor-not-allowed';
                    button.disabled = true;
                }
            }
        } else if (onclick?.includes('buySeedMultiple')) {
            const match = onclick.match(/buySeedMultiple\('([^']+)',\s*(\d+)\)/);
            if (match) {
                const seedType = match[1];
                const quantity = parseInt(match[2]);
                const seedData = gameData.seeds[seedType];
                const cost = (seedData?.cost || 100) * quantity;
                const canAfford = gameData.lustPoints >= cost;
                
                button.className = button.className.replace(/opacity-50|cursor-not-allowed/g, '');
                button.disabled = false;
                
                if (!canAfford) {
                    button.className += ' opacity-50 cursor-not-allowed';
                    button.disabled = true;
                }
            }
        }
    });
}

    function updateSelectedSeedInfo() {
    const selectedSeedInfo = document.querySelector('.selected-seed-info');
    if (!selectedSeedInfo) return;
    
    if (gameData.selectedSeed) {
        const seedData = gameData.seeds[gameData.selectedSeed];
        selectedSeedInfo.innerHTML = `
            <div class="text-center">
                <h4 class="text-sm font-semibold text-green-300">🌱 Wybrane: ${seedData?.name || gameData.selectedSeed}</h4>
                <p class="text-xs text-gray-300 mt-1">
                    ⏱️ Czas wzrostu: ${Math.floor((seedData?.growthTime || 0) / 60)} min | 
                    💰 Nagroda: ${seedData?.rewardType === 'lust' ? 'Pożądanie ♡' : seedData?.rewardType === 'bond' ? 'Więź 💜' : 'Esencja 💧'}
                </p>
            </div>
        `;
    } else {
        selectedSeedInfo.innerHTML = '<p class="text-sm text-gray-400 text-center">Wybierz nasiono aby zasadzić</p>';
    }
}

    function addClickFeedback(element, feedbackClass = 'click-feedback') {
    if (!element) return;
    
    element.classList.add(feedbackClass);
    setTimeout(() => {
        element.classList.remove(feedbackClass);
    }, 300);
}

    // Responsive click handlers with immediate feedback and optimistic updates
    function handlePlotClick(plotIndex) {
    const plotElement = getCachedPlotElement(plotIndex);
    addClickFeedback(plotElement);
    
    const plot = gameData.minigames.garden.plots[plotIndex];
    
    // Optimistic update - show immediate result
    if (!plot.seed && gameData.selectedSeed && gameData.minigames.garden.seeds[gameData.selectedSeed] > 0) {
        // Optimistically plant the seed
        plot.seed = gameData.selectedSeed;
        plot.growth = 0;
        plot.plantedTime = Date.now();
        gameData.minigames.garden.seeds[gameData.selectedSeed]--;
        
        // Update UI immediately
        updateSinglePlot(plotIndex);
        updateSeedInventoryDisplay();
        
        // Track statistics optimistically
        if (!gameData.minigames.garden.stats) {
            gameData.minigames.garden.stats = {
                totalHarvests: 0, totalSeedsPlanted: 0, totalLustEarned: 0,
                totalBondEarned: 0, totalEssenceEarned: 0, seedsHarvested: {},
                firstHarvestTime: null, lastHarvestTime: null
            };
        }
        gameData.minigames.garden.stats.totalSeedsPlanted++;
        
        if (typeof showNotification === 'function') {
            showNotification(`Zasadzono nasiono ${gameData.seeds[gameData.selectedSeed]?.name || gameData.selectedSeed}!`, 'success');
        }
        
    } else if (plot.seed && plot.growth >= 100) {
        // Optimistically harvest
        const rewards = calculateGardenRewards(plot.seed);
        const harvestedSeedType = plot.seed;
        
        // Apply rewards optimistically
        if (rewards.type === 'lust') {
            gameData.lustPoints = (gameData.lustPoints || 0) + rewards.amount;
        } else if (rewards.type === 'bond') {
            if (gameData.activeCharacterId && gameData.characters && gameData.characters[gameData.activeCharacterId]) {
                const character = gameData.characters[gameData.activeCharacterId];
                character.bondPoints = (character.bondPoints || 0) + rewards.amount;
            }
        } else if (rewards.type === 'essence') {
            gameData.sanctuaryEssence = (gameData.sanctuaryEssence || 0) + rewards.amount;
        }
        
        // Calculate seed return optimistically
        const gardenLevel = gameData?.manor?.garden?.level || 1;
        const baseSeedReturn = 2 + Math.floor((gardenLevel - 1) * 0.5);
        const seedsReturned = baseSeedReturn + Math.floor(Math.random() * 2);
        gameData.minigames.garden.seeds[harvestedSeedType] = (gameData.minigames.garden.seeds[harvestedSeedType] || 0) + seedsReturned;
        
        // Track statistics optimistically
        if (!gameData.minigames.garden.stats) {
            gameData.minigames.garden.stats = {
                totalHarvests: 0, totalSeedsPlanted: 0, totalLustEarned: 0,
                totalBondEarned: 0, totalEssenceEarned: 0, seedsHarvested: {},
                firstHarvestTime: null, lastHarvestTime: null
            };
        }
        const stats = gameData.minigames.garden.stats;
        stats.totalHarvests++;
        stats.lastHarvestTime = Date.now();
        if (!stats.firstHarvestTime) {
            stats.firstHarvestTime = Date.now();
        }
        if (!stats.seedsHarvested[harvestedSeedType]) {
            stats.seedsHarvested[harvestedSeedType] = 0;
        }
        stats.seedsHarvested[harvestedSeedType]++;
        
        if (rewards.type === 'lust') {
            stats.totalLustEarned += rewards.amount;
        } else if (rewards.type === 'bond') {
            stats.totalBondEarned += rewards.amount;
        } else if (rewards.type === 'essence') {
            stats.totalEssenceEarned += rewards.amount;
        }
        
        // Reset plot optimistically
        plot.seed = null;
        plot.growth = 0;
        plot.plantedTime = null;
        
        // Update UI immediately
        updateSinglePlot(plotIndex);
        updateSeedInventoryDisplay();
        updateShopPrices();
        
        const rewardSymbol = rewards.type === 'lust' ? '♡' : rewards.type === 'bond' ? '💜' : '💧';
        if (typeof showNotification === 'function') {
            showNotification(`Zebrano plon! Otrzymano ${rewards.amount} ${rewardSymbol} i ${seedsReturned} nasion ${harvestedSeedType}`, 'success');
        }
        
    } else {
        // Fallback to original function for other cases (showing messages, etc.)
        interactWithPlot(plotIndex);
    }
}

    function handleSeedClick(seedType) {
    const seedElement = getCachedSeedElement(seedType);
    addClickFeedback(seedElement);
    
    // Update selection immediately for instant feedback
    gameData.selectedSeed = seedType;
    
    // Update UI elements immediately
    updateSeedInventoryDisplay(); // Refresh to show selection
    updateSelectedSeedInfo();
    
    // Update bulk action button states
    const plantAllBtn = document.querySelector('[onclick="handlePlantAllClick()"]');
    if (plantAllBtn) {
        const hasSeeds = (gameData.minigames.garden.seeds[seedType] || 0) > 0;
        plantAllBtn.disabled = !hasSeeds;
        plantAllBtn.className = plantAllBtn.className.replace(/opacity-50|cursor-not-allowed/g, '');
        if (!hasSeeds) {
            plantAllBtn.className += ' opacity-50 cursor-not-allowed';
        }
    }
}

    function handlePlantAllClick() {
    const button = document.querySelector('[onclick="handlePlantAllClick()"]');
    addClickFeedback(button, 'click-feedback');
    
    plantAllSeeds();
}

    function handleHarvestAllClick() {
    const button = document.querySelector('[onclick="handleHarvestAllClick()"]');
    addClickFeedback(button, 'click-feedback');
    
    harvestAllPlots();
}

    function handleShopButtonClick(element, seedType, quantity = 1) {
    addClickFeedback(element);
    
    const seedData = gameData.seeds[seedType];
    if (!seedData) return;
    
    const cost = seedData.cost || (seedData.rarity === 'common' ? 100 : seedData.rarity === 'uncommon' ? 250 : seedData.rarity === 'rare' ? 500 : 1000);
    const totalCost = cost * quantity;
    
    if (gameData.lustPoints < totalCost) {
        if (typeof showNotification === 'function') {
            showNotification(`Potrzebujesz ${totalCost} Pożądania na ${quantity > 1 ? quantity + ' nasion' : 'to nasiono'}`, 'error');
        }
        return;
    }
    
    // Optimistic update - apply changes immediately
    gameData.lustPoints -= totalCost;
    
    if (!gameData.minigames.garden.seeds) {
        gameData.minigames.garden.seeds = {};
    }
    gameData.minigames.garden.seeds[seedType] = (gameData.minigames.garden.seeds[seedType] || 0) + quantity;
    
    // Update UI immediately
    updateSeedInventoryDisplay();
    updateShopPrices();
    
    if (typeof showNotification === 'function') {
        const message = quantity > 1 ? `Kupiono ${quantity}x ${seedData.name}!` : `Kupiono ${seedData.name}!`;
        showNotification(message, 'success');
    }
    
    // Update global UI for lust points
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    }
}

    // Throttling for growth updates
    let lastGrowthUpdate = 0;
    const growthUpdateThrottle = 1000; // 1 second minimum between updates
    
    function updateGardenGrowth() {
    if (!gameData.minigames || !gameData.minigames.garden || !gameData.minigames.garden.unlocked) return;
    
    const now = Date.now();
    
    // Throttle updates for performance
    if (now - lastGrowthUpdate < growthUpdateThrottle) return;
    lastGrowthUpdate = now;
    
    let updated = false;
    
    gameData.minigames.garden.plots.forEach(plot => {
        if (plot && plot.seed && plot.growth < 100 && plot.plantedTime) {
            const timeElapsed = (now - plot.plantedTime) / 1000; // Convert to seconds
            const seedData = gameData.seeds ? gameData.seeds[plot.seed] : null;
            
            if (seedData && seedData.growthTime) {
                // Calculate growth based on actual time passed and seed growth time
                const totalGrowthTime = seedData.growthTime; // in seconds
                const expectedGrowth = (timeElapsed / totalGrowthTime) * 100;
                plot.growth = Math.min(100, expectedGrowth);
                updated = true;
            } else {
                // Fallback to old system if seed data not found
                const growthRate = 0.02; // Slower growth per game loop iteration
                plot.growth = Math.min(100, plot.growth + growthRate);
                updated = true;
            }
        }
    });
    
    // Only update display if we're currently viewing the garden - use targeted updates
    if (updated && gameData.viewedCharacterId === 'garden') {
        // Update only the plots that changed
        gameData.minigames.garden.plots.forEach((plot, index) => {
            if (plot && plot.seed && plot.growth <= 100) {
                updateSinglePlot(index);
            }
        });
    }
}


    function harvestPlot(plotIndex) {
    if (!gameData.minigames || !gameData.minigames.garden || !gameData.minigames.garden.plots) {
        console.error('Garden system not properly initialized');
        return false;
    }
    
    const plot = gameData.minigames.garden.plots[plotIndex];
    if (!plot || !plot.seed || plot.growth < 100) {
        console.warn('Plot not ready for harvest or empty');
        return false;
    }
    
    // Calculate harvest rewards
    const rewards = calculateGardenRewards(plot.seed);
    const harvestedSeedType = plot.seed;
    
    // Apply rewards safely
    if (rewards.type === 'lust') {
        gameData.lustPoints = (gameData.lustPoints || 0) + rewards.amount;
    } else if (rewards.type === 'bond') {
        if (gameData.activeCharacterId && gameData.characters && gameData.characters[gameData.activeCharacterId]) {
            const character = gameData.characters[gameData.activeCharacterId];
            // Apply bond points only to the active character
            character.bondPoints = (character.bondPoints || 0) + rewards.amount;
        }
    } else if (rewards.type === 'essence') {
        gameData.sanctuaryEssence = (gameData.sanctuaryEssence || 0) + rewards.amount;
    }
    
    // Give back some seeds with better logic
    const gardenLevel = gameData?.manor?.garden?.level || 1;
    const baseSeedReturn = 2 + Math.floor((gardenLevel - 1) * 0.5); // Higher garden levels give more seeds back
    const seedsReturned = baseSeedReturn + Math.floor(Math.random() * 2); // 2-3 at level 1, up to 4-5 at level 5
    
    // Ensure seeds object exists
    if (!gameData.minigames.garden.seeds) {
        gameData.minigames.garden.seeds = {};
    }
    
    gameData.minigames.garden.seeds[harvestedSeedType] = (gameData.minigames.garden.seeds[harvestedSeedType] || 0) + seedsReturned;
    
    // Track statistics
    if (!gameData.minigames.garden.stats) {
        gameData.minigames.garden.stats = {
            totalHarvests: 0, totalSeedsPlanted: 0, totalLustEarned: 0,
            totalBondEarned: 0, totalEssenceEarned: 0, seedsHarvested: {},
            firstHarvestTime: null, lastHarvestTime: null
        };
    }
    
    const stats = gameData.minigames.garden.stats;
    stats.totalHarvests++;
    stats.lastHarvestTime = Date.now();
    if (!stats.firstHarvestTime) {
        stats.firstHarvestTime = Date.now();
    }
    
    if (!stats.seedsHarvested[harvestedSeedType]) {
        stats.seedsHarvested[harvestedSeedType] = 0;
    }
    stats.seedsHarvested[harvestedSeedType]++;
    
    if (rewards.type === 'lust') {
        stats.totalLustEarned += rewards.amount;
    } else if (rewards.type === 'bond') {
        stats.totalBondEarned += rewards.amount;
    } else if (rewards.type === 'essence') {
        stats.totalEssenceEarned += rewards.amount;
    }
    
    // Reset plot
    plot.seed = null;
    plot.growth = 0;
    plot.plantedTime = null;
    
    // Update UI safely
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    }
    
    const rewardSymbol = rewards.type === 'lust' ? '♡' : rewards.type === 'bond' ? '💜' : '💧';
    if (typeof showNotification === 'function') {
        showNotification(`Zebrano plon! Otrzymano ${rewards.amount} ${rewardSymbol} i ${seedsReturned} nasion ${harvestedSeedType}`, 'success');
    }
    
    console.log(`Harvested plot ${plotIndex}: ${rewards.amount} ${rewards.type}, ${seedsReturned} seeds`);
    return true;
}

    function plantSeed(plotIndex, seedType) {
    if (!gameData.minigames || !gameData.minigames.garden || !gameData.minigames.garden.plots) {
        console.error('Garden system not properly initialized');
        return false;
    }
    
    const plot = gameData.minigames.garden.plots[plotIndex];
    if (!plot || plot.seed) {
        console.warn('Plot not available or already occupied');
        return false;
    }
    
    // Ensure seeds object exists
    if (!gameData.minigames.garden.seeds) {
        gameData.minigames.garden.seeds = {};
    }
    
    if (!gameData.minigames.garden.seeds[seedType] || gameData.minigames.garden.seeds[seedType] <= 0) {
        if (typeof showNotification === 'function') {
            showNotification(`Nie masz nasion typu ${seedType}`, 'error');
        }
        return false;
    }
    
    // Plant seed with proper initialization
    plot.seed = seedType;
    plot.growth = 0;
    plot.plantedTime = Date.now();
    
    // Consume seed
    gameData.minigames.garden.seeds[seedType]--;
    
    // Track planting statistics
    if (!gameData.minigames.garden.stats) {
        gameData.minigames.garden.stats = {
            totalHarvests: 0, totalSeedsPlanted: 0, totalLustEarned: 0,
            totalBondEarned: 0, totalEssenceEarned: 0, seedsHarvested: {},
            firstHarvestTime: null, lastHarvestTime: null
        };
    }
    gameData.minigames.garden.stats.totalSeedsPlanted++;
    
    // Update UI safely
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    }
    
    if (typeof showNotification === 'function') {
        showNotification(`Zasadzono nasiono ${seedType}!`, 'success');
    }
    
    console.log(`Planted ${seedType} seed in plot ${plotIndex}`);
    return true;
}

    function calculateGardenRewards(seedType) {
    const seedData = gameData.seeds[seedType];
    if (!seedData) return { type: 'lust', amount: 100 };
    
    // Define minimum rewards to ensure meaningful early-game rewards
    const minimumRewards = {
        'passion_flower': 50,
        'love_herb': 25,
        'essence_bloom': 1,
        'enchanted_rose': 150
    };
    
    let baseAmount = 0;
    const minimumAmount = minimumRewards[seedType] || 10;
    
    if (seedData.rewardType === 'lust') {
        baseAmount = gameData.lustPoints * seedData.rewardPercent;
        // Apply building bonus - higher garden levels give better multipliers
        const gardenLevel = gameData?.manor?.garden?.level || 1;
        const buildingBonus = 1 + (gardenLevel - 1) * 0.1; // 10% bonus per level above 1
        baseAmount *= buildingBonus;
    } else if (seedData.rewardType === 'bond') {
        const currentBond = gameData.activeCharacterId ? gameData.characters[gameData.activeCharacterId].bondPoints : 0;
        baseAmount = currentBond * seedData.rewardPercent;
        // Apply building bonus
        const gardenLevel = gameData?.manor?.garden?.level || 1;
        const buildingBonus = 1 + (gardenLevel - 1) * 0.1;
        baseAmount *= buildingBonus;
    } else if (seedData.rewardType === 'essence') {
        baseAmount = seedData.rewardAmount || 1;
        // Essence gets flat bonus from building level
        const gardenLevel = gameData?.manor?.garden?.level || 1;
        baseAmount += Math.floor((gardenLevel - 1) * 0.5); // +0.5 essence per level above 1
    }
    
    return {
        type: seedData.rewardType,
        amount: Math.max(minimumAmount, Math.floor(baseAmount))
    };
}

    // Module cleanup
    function cleanup() {
        // Clear DOM cache
        domCache.plotElements.clear();
        domCache.seedElements.clear();
        domCache.shopButtons.clear();
        console.log('Minigames module cleanup complete');
    }

    // Return module interface
    return {
        // Core functions
        checkMainQuestProgress,
        levelUpSanctuary,
        checkUnlockConditions,
        unlockCharacter,
        unlockCharacterLegacy,
        displaySanctuaryCore,
        displayGarden,
        selectSeed,
        buySeed,
        interactWithPlot,
        updateGardenGrowth,
        harvestPlot,
        plantSeed,
        calculateGardenRewards,
        calculateGridSize,
        ensureCorrectPlotCount,
        calculateRemainingGrowthTime,
        plantAllSeeds,
        harvestAllPlots,
        toggleGardenStats,
        buySeedMultiple,
        sortSeeds,
        updateSeedInventory,
        updateSeedSelection: handleSeedClick, // Use new responsive function
        updateSinglePlot,
        updateSeedInventoryDisplay,
        updateShopPrices,
        updateSelectedSeedInfo,
        addClickFeedback,
        handlePlotClick,
        handleSeedClick,
        handlePlantAllClick,
        handleHarvestAllClick,
        handleShopButtonClick,
        
        // Public methods for HTML handlers
        publicMethods: {
            displaySanctuaryCore,
            levelUpSanctuary,
            displayGarden,
            selectSeed,
            buySeed,
            interactWithPlot,
            unlockCharacter,
            checkUnlockConditions,
            updateGardenGrowth,
            harvestPlot,
            plantSeed,
            calculateGardenRewards,
            calculateRemainingGrowthTime,
            plantAllSeeds,
            harvestAllPlots,
            toggleGardenStats,
            buySeedMultiple,
            sortSeeds,
            updateSeedInventory,
            updateSeedSelection: handleSeedClick,
            updateSinglePlot,
            updateSeedInventoryDisplay,
            updateShopPrices,
            updateSelectedSeedInfo,
            addClickFeedback,
            handlePlotClick,
            handleSeedClick,
            handlePlantAllClick,
            handleHarvestAllClick,
            handleShopButtonClick
        },
        
        // Module lifecycle
        cleanup
    };
}

// Register Minigames module with module manager
if (window.gameModules) {
    window.gameModules.registerModule('minigames', createMinigamesModule, ['domElements']);
    console.log('Minigames module registration complete');
} else {
    console.error('gameModules not available for minigames module');
}

// Backwards compatibility - expose functions globally
// Set up each function individually to avoid conditional blocking
if (typeof window.displaySanctuaryCore === 'undefined') {
    window.displaySanctuaryCore = (...args) => window.gameModules?.getModule('minigames')?.displaySanctuaryCore(...args);
}
if (typeof window.levelUpSanctuary === 'undefined') {
    window.levelUpSanctuary = (...args) => window.gameModules?.getModule('minigames')?.levelUpSanctuary(...args);
}
if (typeof window.displayGarden === 'undefined') {
    window.displayGarden = (...args) => {
        const module = window.gameModules?.getModule('minigames');
        if (!module) {
            console.error('❌ Minigames module not available for displayGarden');
            return;
        }
        if (!module.displayGarden) {
            console.error('❌ displayGarden function not found in minigames module');
            return;
        }
        return module.displayGarden(...args);
    };
}
if (typeof window.selectSeed === 'undefined') {
    window.selectSeed = (...args) => window.gameModules?.getModule('minigames')?.selectSeed(...args);
}
if (typeof window.buySeed === 'undefined') {
    window.buySeed = (...args) => window.gameModules?.getModule('minigames')?.buySeed(...args);
}
if (typeof window.interactWithPlot === 'undefined') {
    window.interactWithPlot = (...args) => window.gameModules?.getModule('minigames')?.interactWithPlot(...args);
}
if (typeof window.unlockCharacter === 'undefined') {
    window.unlockCharacter = (...args) => window.gameModules?.getModule('minigames')?.unlockCharacter(...args);
}
if (typeof window.checkUnlockConditions === 'undefined') {
    window.checkUnlockConditions = (...args) => window.gameModules?.getModule('minigames')?.checkUnlockConditions(...args);
}
if (typeof window.updateGardenGrowth === 'undefined') {
    window.updateGardenGrowth = (...args) => window.gameModules?.getModule('minigames')?.updateGardenGrowth(...args);
}
if (typeof window.harvestPlot === 'undefined') {
    window.harvestPlot = (...args) => window.gameModules?.getModule('minigames')?.harvestPlot(...args);
}
if (typeof window.plantSeed === 'undefined') {
    window.plantSeed = (...args) => window.gameModules?.getModule('minigames')?.plantSeed(...args);
}
if (typeof window.plantAllSeeds === 'undefined') {
    window.plantAllSeeds = (...args) => window.gameModules?.getModule('minigames')?.plantAllSeeds(...args);
}
if (typeof window.harvestAllPlots === 'undefined') {
    window.harvestAllPlots = (...args) => window.gameModules?.getModule('minigames')?.harvestAllPlots(...args);
}
if (typeof window.toggleGardenStats === 'undefined') {
    window.toggleGardenStats = (...args) => window.gameModules?.getModule('minigames')?.toggleGardenStats(...args);
}
if (typeof window.buySeedMultiple === 'undefined') {
    window.buySeedMultiple = (...args) => window.gameModules?.getModule('minigames')?.buySeedMultiple(...args);
}
if (typeof window.updateSeedInventory === 'undefined') {
    window.updateSeedInventory = (...args) => window.gameModules?.getModule('minigames')?.updateSeedInventory(...args);
}
if (typeof window.handlePlotClick === 'undefined') {
    window.handlePlotClick = (...args) => window.gameModules?.getModule('minigames')?.handlePlotClick(...args);
}
if (typeof window.handleSeedClick === 'undefined') {
    window.handleSeedClick = (...args) => window.gameModules?.getModule('minigames')?.handleSeedClick(...args);
}
if (typeof window.handlePlantAllClick === 'undefined') {
    window.handlePlantAllClick = (...args) => window.gameModules?.getModule('minigames')?.handlePlantAllClick(...args);
}
if (typeof window.handleHarvestAllClick === 'undefined') {
    window.handleHarvestAllClick = (...args) => window.gameModules?.getModule('minigames')?.handleHarvestAllClick(...args);
}
if (typeof window.handleShopButtonClick === 'undefined') {
    window.handleShopButtonClick = (...args) => window.gameModules?.getModule('minigames')?.handleShopButtonClick(...args);
}
if (typeof window.calculateGardenRewards === 'undefined') {
    window.calculateGardenRewards = (...args) => window.gameModules?.getModule('minigames')?.calculateGardenRewards(...args);
}