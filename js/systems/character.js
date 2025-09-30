// Character Management System
// Comprehensive character display, interaction, and progression management

function createCharacterModule(dependencies, moduleManager) {
    const { domElements, ui } = dependencies || {};
    
    // Character display state
    const characterState = {
        currentCharacter: null,
        currentView: 'basic', // 'basic', 'detailed', 'gallery'
        animationQueue: [],
        lastInteraction: 0
    };
    
    // Display character in the center panel with full character page
    function displayCharacter(characterId) {
        if (!gameData || !gameData.characters || !characterId) {
            console.warn('Cannot display character: invalid data');
            return false;
        }
        
        const character = gameData.characters[characterId];
        if (!character) {
            console.warn(`Character ${characterId} not found`);
            return false;
        }
        
        // Set as viewed character for live updates
        gameData.viewedCharacterId = characterId;
        characterState.currentCharacter = characterId;
        
        // Update center panel
        if (domElements) {
            domElements.setContent('centerPanelTitle', character.name);
            displayCharacterPage(character);
        }
        
        console.log(`Displaying character: ${character.name}`);
        return true;
    }
    
    // Create comprehensive character page
    function displayCharacterPage(character) {
        if (!domElements) return;
        
        // Different layout for locked vs unlocked characters
        const isLocked = !character.unlocked;
        
        const characterPageHTML = `
            <div class="character-page h-full flex flex-col">
                <!-- Character Header -->
                <div class="character-header bg-white/10 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="relative">
                                <img src="${character.avatar || character.image}" 
                                     alt="${character.name}" 
                                     class="w-16 h-16 rounded-full object-cover border-2 border-white/20 ${isLocked ? 'opacity-60 grayscale' : ''}">
                                ${isLocked ? '<div class="absolute inset-0 flex items-center justify-center text-2xl">🔒</div>' : ''}
                            </div>
                            <div>
                                <h2 class="text-2xl font-bold">${character.name}</h2>
                                <p class="text-gray-300">${isLocked ? '???' : (character.title || '')}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-semibold" id="char-level-${character.id}">
                                ${isLocked ? 'Poziom ???' : `Poziom ${character.level || 0}`}
                            </div>
                            <div class="text-sm ${isLocked ? 'text-red-400' : 'text-green-400'}">
                                ${character.unlocked ? 'Odblokowana' : 'Zablokowana'}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${isLocked ? generateLockedCharacterContent(character) : generateUnlockedCharacterContent(character)}
                
                <!-- Back button -->
                <div class="mt-4">
                    <button onclick="displayManor()" class="btn-secondary">
                        ← Wróć do Dworu
                    </button>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', characterPageHTML, { html: true });
    }
    
    // Generate content for locked characters (secretive/mysterious)
    function generateLockedCharacterContent(character) {
        const cost = character.unlockCost || 0;
        const canAfford = (gameData.lustPoints || 0) >= cost;
        
        // Check unlock conditions
        const unlockConditions = character.unlockConditions || [];
        let conditionsHTML = '';
        
        if (unlockConditions.length > 0) {
            conditionsHTML = '<div class="mt-4"><h4 class="font-semibold text-yellow-300 mb-2">Wymagania do odblokowania:</h4><ul class="text-sm space-y-1">';
            unlockConditions.forEach(condition => {
                if (condition.type === 'building') {
                    const building = gameData.manor[condition.buildingId];
                    const buildingName = building ? building.name : condition.buildingId;
                    const requiredLevel = condition.level || 1;
                    const currentLevel = building ? building.level : 0;
                    const met = building && currentLevel >= requiredLevel;
                    conditionsHTML += `<li class="${met ? 'text-green-400' : 'text-red-400'}">• ${buildingName} (poziom ${requiredLevel})</li>`;
                } else if (condition.type === 'character') {
                    const char = gameData.characters[condition.characterId];
                    const charName = char ? char.name : condition.characterId;
                    const requiredLevel = condition.level || 1;
                    const currentLevel = char ? char.level : 0;
                    const met = char && char.unlocked && currentLevel >= requiredLevel;
                    conditionsHTML += `<li class="${met ? 'text-green-400' : 'text-red-400'}">• ${charName} (poziom ${requiredLevel})</li>`;
                }
            });
            conditionsHTML += '</ul></div>';
        }
        
        return `
            <!-- Mysterious/Secretive Content for Locked Character -->
            <div class="character-content flex-1 space-y-4 overflow-y-auto">
                <div class="bg-white/5 rounded-lg p-6 text-center">
                    <div class="text-4xl mb-4">🔒</div>
                    <h3 class="text-xl font-bold mb-3 text-gray-300">Tajemnicza Postać</h3>
                    <p class="text-gray-400 mb-4">Ta postać pozostaje zagadką. Jej sekrety zostaną ujawnione dopiero po odblokowaniu.</p>
                    
                    <div class="bg-black/30 rounded-lg p-4 mt-4">
                        <h4 class="font-semibold text-purple-300 mb-2">Koszt odblokowania:</h4>
                        <div class="text-lg ${canAfford ? 'text-green-400' : 'text-red-400'}">
                            ${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost} Pożądania
                        </div>
                        ${conditionsHTML}
                    </div>
                    
                    <div class="mt-6 space-y-3">
                        <div class="text-sm text-gray-500">
                            <p class="mb-2">✨ <em>Ukryte tajemnice czekają na odkrycie...</em></p>
                            <p class="mb-2">📖 <em>Historia pełna niespodzianek...</em></p>
                            <p>💫 <em>Wyjątkowe interakcje do odblokowania...</em></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generate content for unlocked characters (full details)
    function generateUnlockedCharacterContent(character) {
        return `
            <!-- Character Stats and Info -->
            <div class="character-content flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto">
                <!-- Left Column - Stats and Bio -->
                <div class="space-y-4">
                    ${generateCharacterStats(character)}
                    ${generateCharacterBio(character)}
                </div>
                
                <!-- Right Column - Image and Interactions -->
                <div class="space-y-4">
                    ${generateCharacterImage(character)}
                    ${generateCharacterActions(character)}
                    ${generateStoryProgress(character)}
                </div>
            </div>
            
            <!-- Character Gallery -->
            <div class="character-gallery mt-4">
                ${generateInteractionGallery(character)}
            </div>
        `;
    }
    
    // Generate character stats section
    function generateCharacterStats(character) {
        const production = window.gameUtils ? window.gameUtils.calculateCharacterProduction(character) : 0;
        const upgradeCost = window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0;
        
        return `
            <div class="character-stats bg-white/5 rounded-lg p-4">
                <h3 class="font-bold mb-3 text-lg">Statystyki</h3>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Poziom:</span>
                        <span class="font-semibold" id="char-level-stat-${character.id}">${character.level || 0}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Więź:</span>
                        <span class="font-semibold text-purple-300" id="char-bond-${character.id}">${Math.floor(character.bondPoints || 0)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Produkcja:</span>
                        <span class="font-semibold text-green-300" id="char-production-${character.id}">${production.toFixed(2)} LP/s</span>
                    </div>
                    ${character.unlocked ? `
                        <div class="flex justify-between">
                            <span>Koszt ulepszenia:</span>
                            <span class="font-semibold text-yellow-300" id="char-upgrade-cost-${character.id}">${window.gameUtils ? window.gameUtils.formatNumber(upgradeCost) : upgradeCost} LP</span>
                        </div>
                    ` : `
                        <div class="flex justify-between">
                            <span>Koszt odblokowania:</span>
                            <span class="font-semibold text-yellow-300">${window.gameUtils ? window.gameUtils.formatNumber(character.unlockCost || 0) : character.unlockCost || 0} LP</span>
                        </div>
                    `}
                    <div class="flex justify-between">
                        <span>Całkowicie zarobione:</span>
                        <span class="font-semibold text-gray-300" id="char-total-earned-${character.id}">${window.gameUtils ? window.gameUtils.formatNumber(character.totalEarned || 0) : character.totalEarned || 0} LP</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Całkowite kliknięcia:</span>
                        <span class="font-semibold text-gray-300" id="char-total-clicks-${character.id}">${character.totalClicks || 0}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generate character bio section
    function generateCharacterBio(character) {
        if (!character.bio || character.bio.length === 0) return '';
        
        // Find current bio based on bond points
        let currentBio = character.bio[0].text;
        for (const bioEntry of character.bio) {
            if ((character.bondPoints || 0) >= bioEntry.threshold) {
                currentBio = bioEntry.text;
            }
        }
        
        // Calculate dynamic spacing based on content length
        const isShortBio = currentBio.length < 200;
        const marginClass = isShortBio ? 'mt-2' : 'mt-4';
        
        return `
            <div class="character-bio bg-white/5 rounded-lg p-4 ${marginClass}">
                <h3 class="font-bold mb-2 text-lg">O Postaci</h3>
                <div class="text-sm leading-relaxed text-gray-300">
                    ${currentBio}
                </div>
            </div>
        `;
    }
    
    // Generate character image section
    function generateCharacterImage(character) {
        const imageSrc = character.image || 'imgs/placeholder.png';
        
        return `
            <div class="character-image bg-white/5 rounded-lg p-2 h-full flex items-center justify-center">
                <img src="${imageSrc}" 
                     alt="${character.name}" 
                     class="w-full h-full max-h-full rounded-lg shadow-lg object-cover">
            </div>
        `;
    }
    
    // Generate character actions section
    function generateCharacterActions(character) {
        const canUpgrade = character.unlocked && (gameData.lustPoints || 0) >= (window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0);
        const canUnlock = !character.unlocked && (gameData.lustPoints || 0) >= (character.unlockCost || 0);
        
        return `
            <div class="character-actions bg-white/5 rounded-lg p-4">
                <h3 class="font-bold mb-3 text-lg">Działania</h3>
                <div class="space-y-2">
                    ${character.unlocked ? `
                        <button onclick="upgradeCharacter('${character.id}')" 
                                class="btn-primary w-full ${canUpgrade ? '' : 'btn-disabled'}"
                                ${canUpgrade ? '' : 'disabled'}
                                id="char-upgrade-btn-${character.id}">
                            Ulepsz Poziom
                        </button>
                        <button onclick="setActiveCharacter('${character.id}')" 
                                class="btn-secondary w-full">
                            Ustaw jako Aktywną
                        </button>
                    ` : `
                        <button onclick="unlockCharacter('${character.id}')" 
                                class="btn-success w-full ${canUnlock ? '' : 'btn-disabled'}"
                                ${canUnlock ? '' : 'disabled'}>
                            Odblokuj Postać
                        </button>
                    `}
                    
                    <!-- Special Actions -->
                    ${generateSpecialActions(character)}
                </div>
            </div>
        `;
    }
    
    // Generate special character-specific actions
    function generateSpecialActions(character) {
        let actions = '';
        
        // Momo arena access
        if (character.id === 'momo' && character.unlocked && gameData.minigames && gameData.minigames.arena && gameData.minigames.arena.unlocked) {
            actions += `
                <button onclick="displayArena()" class="btn-warning w-full mt-2">
                    Wejdź do Areny
                </button>
            `;
        }
        
        // Szafran garden access
        if (character.id === 'szafran' && character.unlocked && gameData.minigames && gameData.minigames.garden && gameData.minigames.garden.unlocked) {
            actions += `
                <button onclick="displayGarden()" class="btn-success w-full mt-2">
                    Odwiedź Ogród
                </button>
            `;
        }
        
        return actions;
    }
    
    // Generate story progress section
    function generateStoryProgress(character) {
        if (!character.storyEvents || !character.storyThresholds) return '';
        
        const currentBond = character.bondPoints || 0;
        const completedEvents = (character.storyProgress || 0);
        const totalEvents = character.storyEvents.length;
        
        // Find next story threshold
        let nextThreshold = null;
        for (let i = completedEvents; i < character.storyThresholds.length && i < totalEvents; i++) {
            nextThreshold = character.storyThresholds[i];
            break;
        }
        
        return `
            <div class="story-progress bg-white/5 rounded-lg p-4">
                <h3 class="font-bold mb-3 text-lg">Postęp Historii</h3>
                <div class="space-y-3">
                    <div class="text-sm">
                        <div class="flex justify-between mb-1">
                            <span>Wydarzenia:</span>
                            <span>${completedEvents}/${totalEvents}</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                                 style="width: ${totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0}%"></div>
                        </div>
                    </div>
                    
                    ${nextThreshold !== null ? `
                        <div class="text-sm">
                            <div class="flex justify-between mb-1">
                                <span>Następne wydarzenie:</span>
                                <span>${Math.floor(currentBond)}/${nextThreshold}</span>
                            </div>
                            <div class="w-full bg-gray-700 rounded-full h-2">
                                <div class="bg-pink-600 h-2 rounded-full transition-all duration-300" 
                                     style="width: ${Math.min(100, (currentBond / nextThreshold) * 100)}%"></div>
                            </div>
                        </div>
                    ` : `
                        <div class="text-sm text-green-400">
                            Wszystkie wydarzenia zakończone!
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    // Generate interaction gallery
    function generateInteractionGallery(character) {
        const completedEvents = character.storyProgress || 0;
        const availableEvents = character.storyEvents ? character.storyEvents.slice(0, completedEvents) : [];
        
        if (availableEvents.length === 0) {
            return `
                <div class="bg-white/5 rounded-lg p-4">
                    <h3 class="font-bold mb-3 text-lg">Galeria Interakcji</h3>
                    <p class="text-gray-400 text-sm">Brak odblokowanych wydarzeń</p>
                </div>
            `;
        }
        
        return `
            <div class="bg-white/5 rounded-lg p-4">
                <h3 class="font-bold mb-3 text-lg">Galeria Interakcji</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    ${availableEvents.map(event => `
                        <button onclick="replayStoryEvent('${event.id}')" 
                                class="bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-all duration-200 text-xs">
                            <div class="font-semibold">${event.title}</div>
                            <div class="text-gray-400 text-xs mt-1">Kliknij aby odtworzyć</div>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Set active character
    function setActiveCharacter(characterId) {
        if (!gameData || !gameData.characters) return false;
        
        const character = gameData.characters[characterId];
        if (!character || !character.unlocked) {
            if (typeof showNotification === 'function') {
                showNotification('Nie można ustawić zablokowanej postaci jako aktywnej', 'error');
            }
            return false;
        }
        
        gameData.activeCharacterId = characterId;
        
        if (typeof showNotification === 'function') {
            showNotification(`${character.name} jest teraz aktywną postacią!`, 'success');
        }
        
        // Update UI
        const manager = moduleManager || window.gameModules;
        const ui = manager?.getModule('ui');
        if (ui && ui.updateActiveCharacter) {
            ui.updateActiveCharacter();
        }
        
        // Update background for character theme
        const background = manager?.getModule('background');
        if (background && background.setActiveCharacter) {
            background.setActiveCharacter(characterId);
        }
        
        // Dispatch character change event for other systems
        if (window.dispatchEvent) {
            const event = new CustomEvent('characterChanged', { 
                detail: { characterId: characterId, character: character }
            });
            window.dispatchEvent(event);
        }
        
        return true;
    }
    
    // Upgrade character
    function upgradeCharacter(characterId) {
        const character = gameData?.characters?.[characterId];
        if (!character || !character.unlocked) return false;
        
        const upgradeCost = window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0;
        
        if ((gameData.lustPoints || 0) < upgradeCost) {
            if (typeof showNotification === 'function') {
                showNotification('Nie masz wystarczająco Pożądania!', 'error');
            }
            return false;
        }
        
        // Perform upgrade
        gameData.lustPoints -= upgradeCost;
        character.level = (character.level || 0) + 1;
        character.timesLeveled = (character.timesLeveled || 0) + 1;
        
        if (typeof showNotification === 'function') {
            showNotification(`${character.name} awansowała na poziom ${character.level}!`, 'success');
        }
        
        // Refresh display if currently viewing this character
        if (characterState.currentCharacter === characterId) {
            displayCharacter(characterId);
        }
        
        return true;
    }
    
    // Replay story event
    function replayStoryEvent(eventId) {
        const manager = moduleManager || window.gameModules;
        const story = manager?.getModule('story');
        if (story && story.startStoryEvent) {
            story.startStoryEvent(eventId, { replay: true });
        } else if (typeof startStoryEvent === 'function') {
            startStoryEvent(eventId, { replay: true });
        }
    }
    
    // Update character display (called by game loop)
    function updateCharacterDisplay() {
        // Handle arena live updates
        if (gameData.viewedCharacterId === 'arena') {
            try {
                if (window.ArenaSystem && typeof window.ArenaSystem.render === 'function') {
                    window.ArenaSystem.render();
                }
            } catch (error) {
                console.error('Error in ArenaSystem.render during character display update:', error);
            }
            return;
        }
        
        if (!characterState.currentCharacter || gameData.viewedCharacterId !== characterState.currentCharacter) {
            return; // No character page is currently displayed
        }
        
        const character = gameData.characters[characterState.currentCharacter];
        if (!character) return;
        
        // Update only the dynamic elements that can change
        updateSelectiveElements(character);
    }
    
    // Selectively update specific DOM elements without full page regeneration
    function updateSelectiveElements(character) {
        const characterId = character.id;
        
        // Update bond points
        const bondElement = document.getElementById(`char-bond-${characterId}`);
        if (bondElement) {
            bondElement.textContent = Math.floor(character.bondPoints || 0);
        }
        
        // Update production
        const productionElement = document.getElementById(`char-production-${characterId}`);
        if (productionElement) {
            const production = window.gameUtils ? window.gameUtils.calculateCharacterProduction(character) : 0;
            productionElement.textContent = `${production.toFixed(2)} LP/s`;
        }
        
        // Update total earned
        const totalEarnedElement = document.getElementById(`char-total-earned-${characterId}`);
        if (totalEarnedElement) {
            const formattedEarned = window.gameUtils ? window.gameUtils.formatNumber(character.totalEarned || 0) : character.totalEarned || 0;
            totalEarnedElement.textContent = `${formattedEarned} LP`;
        }
        
        // Update total clicks
        const totalClicksElement = document.getElementById(`char-total-clicks-${characterId}`);
        if (totalClicksElement) {
            totalClicksElement.textContent = character.totalClicks || 0;
        }
        
        // Update header level display and upgrade button
        updateHeaderElements(character);
    }
    
    // Update header elements (level only)
    function updateHeaderElements(character) {
        // Update level in header
        const headerLevelElement = document.getElementById(`char-level-${character.id}`);
        if (headerLevelElement) {
            headerLevelElement.textContent = `Poziom ${character.level || 0}`;
        }
        
        // Update level in stats section
        const statsLevelElement = document.getElementById(`char-level-stat-${character.id}`);
        if (statsLevelElement) {
            statsLevelElement.textContent = character.level || 0;
        }
        
        // Update upgrade cost in stats section
        if (character.unlocked) {
            const upgradeCost = window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0;
            const formattedCost = window.gameUtils ? window.gameUtils.formatNumber(upgradeCost) : upgradeCost;
            
            const upgradeCostElement = document.getElementById(`char-upgrade-cost-${character.id}`);
            if (upgradeCostElement) {
                upgradeCostElement.textContent = `${formattedCost} LP`;
            }
            
            // Update upgrade button in actions section
            const upgradeButton = document.getElementById(`char-upgrade-btn-${character.id}`);
            if (upgradeButton) {
                const canUpgrade = (gameData.lustPoints || 0) >= upgradeCost;
                upgradeButton.className = `btn-primary w-full ${canUpgrade ? '' : 'btn-disabled'}`;
                upgradeButton.disabled = !canUpgrade;
            }
        }
    }
    
    // Module cleanup
    function cleanup() {
        characterState.currentCharacter = null;
        characterState.animationQueue = [];
        console.log('Character module cleanup complete');
    }
    
    // Return module interface
    return {
        displayCharacter,
        setActiveCharacter,
        upgradeCharacter,
        replayStoryEvent,
        updateCharacterDisplay,
        
        // Internal functions for debugging
        _internal: {
            generateCharacterStats,
            generateCharacterBio,
            generateCharacterImage
        },
        
        cleanup
    };
}

// Register Character module with module manager
if (window.gameModules) {
    window.gameModules.registerModule('character', createCharacterModule, ['domElements']);
    console.log('Character module registration complete');
} else {
    console.error('gameModules not available for character module');
}

// Global fallback functions for HTML event handlers
window.displayCharacter = function(characterId) {
    const character = window.gameModules?.getModule('character');
    if (character) return character.displayCharacter(characterId);
    return false;
};

window.setActiveCharacter = function(characterId) {
    const character = window.gameModules?.getModule('character');
    if (character) return character.setActiveCharacter(characterId);
    return false;
};

window.upgradeCharacter = function(characterId) {
    const character = window.gameModules?.getModule('character');
    if (character) return character.upgradeCharacter(characterId);
    return false;
};

window.replayStoryEvent = function(eventId) {
    const character = window.gameModules?.getModule('character');
    if (character) return character.replayStoryEvent(eventId);
    return false;
};

console.log('Character module loaded');