// Story Event System - Enhanced Implementation
// Wszystkie Moje Potwory

function createStoryModule(dependencies, moduleManager) {
    const { domElements } = dependencies || {};
    
    // Story state management
    const storyState = {
        currentEvent: null,
        isReplayMode: false,
        eventHistory: [],
        choiceHistory: new Map(),
        modalVisible: false,
        currentCharacter: null
    };
    
    // Enhanced story event starter with replay support
    function startStoryEvent(eventId, options = {}) {
        const { 
            replayMode = false, 
            forceShow = false,
            characterId = null 
        } = options;
        
        console.log(`Starting story event: ${eventId}${replayMode ? ' (replay mode)' : ''}`);
        
        // Find the event in character data
        let foundEvent = null;
        let character = null;
        
        if (window.characterData) {
            for (const charId in window.characterData) {
                const char = window.characterData[charId];
                if (char.storyEvents) {
                    const event = char.storyEvents.find(e => e.id === eventId);
                    if (event) {
                        foundEvent = event;
                        character = char;
                        break;
                    }
                }
            }
        }
        
        if (!foundEvent) {
            console.warn(`Story event not found: ${eventId}`);
            return false;
        }
        
        // Check if event should be shown
        if (!replayMode && !forceShow) {
            // Check if event was already completed
            if (gameData.story && gameData.story.completedEvents.includes(eventId)) {
                console.log(`Story event ${eventId} already completed`);
                return false;
            }
            
            // Check bond requirements using character's storyThresholds
            const gameCharacter = gameData.characters[character.id];
            if (gameCharacter) {
                let requiredBondPoints = null;
                
                // Try to get bond requirement from event first (backward compatibility)
                if (foundEvent.bondRequirement !== undefined) {
                    requiredBondPoints = foundEvent.bondRequirement;
                } else if (character.storyThresholds && character.storyEvents) {
                    // Find the event index in character's storyEvents array
                    const eventIndex = character.storyEvents.findIndex(e => e.id === eventId);
                    if (eventIndex >= 0 && eventIndex < character.storyThresholds.length) {
                        requiredBondPoints = character.storyThresholds[eventIndex];
                    }
                }
                
                // Check if player has enough bond points
                if (requiredBondPoints !== null && gameCharacter.bondPoints < requiredBondPoints) {
                    console.log(`Insufficient bond points for event ${eventId}: ${Math.floor(gameCharacter.bondPoints)} < ${requiredBondPoints}`);
                    return false;
                }
            }
        }
        
        // Set story state
        storyState.currentEvent = foundEvent;
        storyState.isReplayMode = replayMode;
        storyState.currentCharacter = character;
        
        // Add to history if not replay
        if (!replayMode) {
            addToEventHistory(eventId, character.id);
        }
        
        showStoryModal(foundEvent, character, { replayMode });
        return true;
    }
    
    // Enhanced story modal with animations and choice support
    function showStoryModal(event, character, options = {}) {
        const { replayMode = false } = options;
        
        if (!domElements) return;
        
        const modal = domElements.get('storyModal');
        const content = domElements.get('storyModalContent');
        
        if (!modal || !content) {
            console.warn('Story modal elements not found');
            return;
        }
        
        // Build modal content with enhanced styling
        const replayIndicator = replayMode ? 
            '<div class="replay-indicator bg-blue-600/20 border border-blue-400 rounded-lg p-2 mb-4 text-center text-blue-300 text-sm">📖 Tryb powtórki</div>' : '';
        
        const characterInfo = character ? 
            `<div class="character-info mb-4 text-center">
                <div class="text-lg font-semibold text-pink-300">${character.name}</div>
                <div class="text-sm text-gray-400">${character.title || ''}</div>
            </div>` : '';
        
        const storyText = formatStoryText(event.text || 'Brak tekstu wydarzenia.');
        
        // Add CG image if available
        let cgImageHtml = '';
        if (event.cg) {
            cgImageHtml = `
                <div class="cg-image mb-6 text-center">
                    <img src="${event.cg}" alt="${event.title}" class="max-w-full max-h-96 mx-auto rounded-lg border border-gray-600 shadow-lg" 
                         onerror="this.style.display='none'; console.warn('CG image not found:', '${event.cg}')"
                         onload="console.log('CG image loaded:', '${event.cg}')" />
                </div>`;
        }
        
        let choicesHtml = '';
        if (event.choices && event.choices.length > 0) {
            choicesHtml = '<div class="story-choices mt-6 space-y-3">';
            event.choices.forEach((choice, index) => {
                // Auto-generate choice ID if it doesn't exist
                if (!choice.id) {
                    choice.id = `${event.id}_choice_${index}`;
                }
                
                const choiceClass = choice.type === 'special' ? 
                    'bg-purple-600/30 border-purple-400 hover:bg-purple-600/50' : 
                    'bg-gray-600/30 border-gray-400 hover:bg-gray-600/50';
                
                choicesHtml += `
                    <button onclick="handleStoryChoice('${choice.id}', '${event.id}')" 
                            class="choice-btn w-full p-3 border rounded-lg transition-all duration-200 text-left ${choiceClass}">
                        <div class="font-medium">${choice.text}</div>
                        ${choice.description ? `<div class="text-sm text-gray-300 mt-1">${choice.description}</div>` : ''}
                    </button>`;
            });
            choicesHtml += '</div>';
        } else {
            choicesHtml = `
                <div class="flex justify-end mt-6">
                    <button onclick="closeStoryModal()" 
                            class="px-6 py-2 bg-pink-600 hover:bg-pink-700 border border-pink-400 rounded-lg transition-colors duration-200 font-medium">
                        Kontynuuj
                    </button>
                </div>`;
        }
        
        content.innerHTML = `
            <div class="story-event bg-gray-900/95 border border-gray-600 rounded-lg p-6 max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
                ${replayIndicator}
                ${characterInfo}
                <h2 class="text-2xl font-bold mb-4 text-center text-white">${event.title}</h2>
                ${cgImageHtml}
                <div class="story-text mb-4 text-gray-200 leading-relaxed">${storyText}</div>
                ${choicesHtml}
            </div>
        `;
        
        // Show modal with animation
        const modalContainer = domElements.get('modalContainer');
        if (modalContainer) {
            modalContainer.style.display = 'flex';
            modalContainer.style.opacity = '0';
            
            // Animate in
            requestAnimationFrame(() => {
                modalContainer.style.transition = 'opacity 0.3s ease-in-out';
                modalContainer.style.opacity = '1';
            });
        }
        
        domElements.show('storyModal', 'flex');
        storyState.modalVisible = true;
        
        // Play story sound if available
        const storySound = domElements.get('crystalSound');
        if (storySound && gameData.settings.sfxVolume > 0) {
            storySound.volume = gameData.settings.sfxVolume * 0.5;
            storySound.play().catch(() => {}); // Ignore errors
        }
    }
    
    // Enhanced modal close with animation and cleanup
    function closeStoryModal() {
        if (!domElements || !storyState.modalVisible) return;
        
        const modalContainer = domElements.get('modalContainer');
        if (modalContainer) {
            modalContainer.style.transition = 'opacity 0.2s ease-in-out';
            modalContainer.style.opacity = '0';
            
            setTimeout(() => {
                domElements.hide('modalContainer');
                domElements.hide('storyModal');
                
                // Mark event as completed if not in replay mode
                if (!storyState.isReplayMode && storyState.currentEvent) {
                    markEventCompleted(storyState.currentEvent.id);
                }
                
                // Reset state
                storyState.modalVisible = false;
                storyState.currentEvent = null;
                storyState.currentCharacter = null;
            }, 200);
        } else {
            domElements.hide('modalContainer');
            domElements.hide('storyModal');
            storyState.modalVisible = false;
        }
    }
    
    // Handle story choices with consequence tracking
    function handleStoryChoice(choiceId, eventId) {
        if (!storyState.currentEvent) return;
        
        const choice = storyState.currentEvent.choices?.find(c => c.id === choiceId);
        if (!choice) {
            console.warn(`Choice not found: ${choiceId}`);
            return;
        }
        
        console.log(`Player chose: ${choice.text} (${choiceId}) for event ${eventId}`);
        
        // Track choice in history
        if (!storyState.isReplayMode) {
            storyState.choiceHistory.set(eventId, {
                choiceId,
                choiceText: choice.text,
                timestamp: Date.now()
            });
            
            // Apply choice consequences (new format)
            applyChoiceConsequences(choice, eventId);
        }
        
        // Handle choice effects
        if (choice.effects) {
            processChoiceEffects(choice.effects);
        }
        
        // Handle choice outcomes (character data format)
        if (choice.consequence && storyState.currentEvent.choiceOutcomes) {
            const outcomeKey = choice.consequence;
            const outcomeText = storyState.currentEvent.choiceOutcomes[outcomeKey];
            
            if (outcomeText) {
                // Show the choice outcome text
                showChoiceOutcome(outcomeText);
                return; // Don't close modal immediately
            }
        }
        
        // Show choice result if available (legacy format)
        if (choice.result) {
            showChoiceResult(choice.result);
        } else {
            closeStoryModal();
        }
    }
    
    // Apply consequences of player choices
    function applyChoiceConsequences(choice, eventId) {
        if (!choice.consequences || storyState.isReplayMode) return;
        
        const consequences = choice.consequences;
        
        // Apply resource changes
        if (consequences.lustPoints) {
            gameData.lustPoints += consequences.lustPoints;
            if (window.showNotification) {
                const sign = consequences.lustPoints > 0 ? '+' : '';
                window.showNotification(`${sign}${consequences.lustPoints} LP`, 'info', 1500);
            }
        }
        
        if (consequences.sanctuaryEssence) {
            gameData.sanctuaryEssence += consequences.sanctuaryEssence;
            if (window.showNotification) {
                const sign = consequences.sanctuaryEssence > 0 ? '+' : '';
                window.showNotification(`${sign}${consequences.sanctuaryEssence} Esencja`, 'success', 1500);
            }
        }
        
        // Apply character bond changes
        if (consequences.bondPoints && storyState.currentCharacter) {
            const character = gameData.characters[storyState.currentCharacter.id];
            if (character) {
                // Apply bond points only to the active character
                if (gameData.activeCharacterId === character.id) {
                    character.bondPoints += consequences.bondPoints;
                    if (window.showNotification) {
                        const sign = consequences.bondPoints > 0 ? '+' : '';
                        window.showNotification(`${sign}${consequences.bondPoints} Więź`, 'info', 1500);
                    }
                } else if (window.showNotification) {
                    // Notify that bond points were blocked (not active character)
                    window.showNotification(`Punkty więzi zablokowane (inna postać jest aktywna)`, 'warning', 2000);
                }
            }
        }
        
        // Set story flags
        if (consequences.flags) {
            if (!gameData.story.globalFlags) {
                gameData.story.globalFlags = {};
            }
            Object.assign(gameData.story.globalFlags, consequences.flags);
        }
        
        // Unlock features
        if (consequences.unlocks) {
            consequences.unlocks.forEach(unlock => {
                if (unlock.type === 'character' && gameData.characters[unlock.id]) {
                    gameData.characters[unlock.id].unlocked = true;
                    if (window.showNotification) {
                        window.showNotification(`Odblokowano: ${gameData.characters[unlock.id].name}`, 'success');
                    }
                } else if (unlock.type === 'building' && gameData.manor[unlock.id]) {
                    gameData.manor[unlock.id].unlocked = true;
                    if (window.showNotification) {
                        window.showNotification(`Odblokowano: ${gameData.manor[unlock.id].name}`, 'success');
                    }
                }
            });
        }
    }
    
    // Process choice effects (immediate UI changes)
    function processChoiceEffects(effects) {
        if (effects.showNotification) {
            if (window.showNotification) {
                window.showNotification(effects.showNotification.message, effects.showNotification.type || 'info');
            }
        }
        
        if (effects.playSound) {
            const sound = domElements.get(effects.playSound);
            if (sound && gameData.settings.sfxVolume > 0) {
                sound.volume = gameData.settings.sfxVolume;
                sound.play().catch(() => {});
            }
        }
    }
    
    // Show choice result before closing modal
    function showChoiceResult(result) {
        const content = domElements.get('storyModalContent');
        if (!content) return;
        
        // Keep the CG image visible if it was displayed before
        let cgImageHtml = '';
        if (storyState.currentEvent && storyState.currentEvent.cg) {
            cgImageHtml = `
                <div class="cg-image mb-6 text-center">
                    <img src="${storyState.currentEvent.cg}" alt="${storyState.currentEvent.title}" class="max-w-full max-h-96 mx-auto rounded-lg border border-gray-600 shadow-lg" 
                         onerror="this.style.display='none'" />
                </div>`;
        }
        
        content.innerHTML = `
            <div class="choice-result bg-gray-900/95 border border-gray-600 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 class="text-xl font-bold mb-4 text-center text-white">Rezultat</h3>
                ${cgImageHtml}
                <div class="result-text mb-4 text-gray-200 leading-relaxed">${formatStoryText(result)}</div>
                <div class="flex justify-center">
                    <button onclick="closeStoryModal()" 
                            class="px-6 py-2 bg-pink-600 hover:bg-pink-700 border border-pink-400 rounded-lg transition-colors duration-200 font-medium">
                        Kontynuuj
                    </button>
                </div>
            </div>
        `;
    }
    
    // Show choice outcome (character data format)
    function showChoiceOutcome(outcomeText) {
        const content = domElements.get('storyModalContent');
        if (!content) return;
        
        // Keep the CG image visible if it was displayed before
        let cgImageHtml = '';
        if (storyState.currentEvent && storyState.currentEvent.cg) {
            cgImageHtml = `
                <div class="cg-image mb-6 text-center">
                    <img src="${storyState.currentEvent.cg}" alt="${storyState.currentEvent.title}" class="max-w-full max-h-96 mx-auto rounded-lg border border-gray-600 shadow-lg" 
                         onerror="this.style.display='none'" />
                </div>`;
        }
        
        content.innerHTML = `
            <div class="choice-result bg-gray-900/95 border border-gray-600 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 class="text-xl font-bold mb-4 text-center text-white">Rezultat</h3>
                ${cgImageHtml}
                <div class="result-text mb-4 text-gray-200 leading-relaxed">${formatStoryText(outcomeText)}</div>
                <div class="flex justify-center">
                    <button onclick="closeStoryModal()" 
                            class="px-6 py-2 bg-pink-600 hover:bg-pink-700 border border-pink-400 rounded-lg transition-colors duration-200 font-medium">
                        Kontynuuj
                    </button>
                </div>
            </div>
        `;
    }
    
    // Format story text with better presentation
    function formatStoryText(text) {
        if (!text) return '';
        
        return text
            .replace(/\n\n/g, '</p><p class="mb-4">')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p class="mb-4">')
            .replace(/$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-pink-300">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>');
    }
    
    // Add event to history
    function addToEventHistory(eventId, characterId) {
        const historyEntry = {
            eventId,
            characterId,
            timestamp: Date.now(),
            wasReplay: false
        };
        
        storyState.eventHistory.push(historyEntry);
        
        // Keep only last 50 events
        if (storyState.eventHistory.length > 50) {
            storyState.eventHistory.shift();
        }
    }
    
    // Mark event as completed
    function markEventCompleted(eventId) {
        if (!gameData.story) {
            gameData.story = {
                completedEvents: [],
                globalFlags: {}
            };
        }
        
        if (!gameData.story.completedEvents.includes(eventId)) {
            gameData.story.completedEvents.push(eventId);
            console.log(`Story event ${eventId} marked as completed`);
            
            // Process unlocks from the completed event
            processStoryEventUnlocks(eventId);
        }
    }
    
    // Process unlocks when a story event is completed
    function processStoryEventUnlocks(eventId) {
        // Find the story event in character data
        let foundEvent = null;
        let characterId = null;
        
        if (window.characterData) {
            for (const charId in window.characterData) {
                const char = window.characterData[charId];
                if (char.storyEvents) {
                    const event = char.storyEvents.find(e => e.id === eventId);
                    if (event) {
                        foundEvent = event;
                        characterId = charId;
                        break;
                    }
                }
            }
        }
        
        if (!foundEvent || !foundEvent.unlocks) return;
        
        const unlocks = foundEvent.unlocks;
        console.log(`Processing unlocks for story event ${eventId}:`, unlocks);
        
        // Handle minigame unlocks
        if (unlocks.minigame) {
            const minigameId = unlocks.minigame;
            console.log(`🎮 Processing minigame unlock: ${minigameId}`);
            
            // Ensure minigames structure exists
            if (!gameData.minigames) {
                console.log('⚠️ Creating missing minigames structure in story system');
                gameData.minigames = {};
            }
            
            // Special handling for arena unlock
            if (minigameId === 'arena') {
                if (!gameData.minigames.arena) {
                    console.log('⚠️ Creating missing arena structure in story system');
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
                
                // Force unlock arena
                gameData.minigames.arena.unlocked = true;
                console.log(`✅ Arena unlocked by story system`);
                
                // Trigger character-specific unlock callbacks for arena
                if (characterId && window.characterData[characterId] && window.characterData[characterId].arenaCallbacks) {
                    const character = window.characterData[characterId];
                    if (character.arenaCallbacks.onArenaUnlock) {
                        try {
                            character.arenaCallbacks.onArenaUnlock.call(character);
                            console.log(`✅ Triggered arena unlock callback for ${characterId}`);
                        } catch (error) {
                            console.error(`❌ Error in arena unlock callback for ${characterId}:`, error);
                        }
                    }
                } else {
                    console.warn(`⚠️ Arena callbacks not found for character: ${characterId}`);
                }
            }
            // Handle other minigames
            else if (gameData.minigames && gameData.minigames[minigameId]) {
                gameData.minigames[minigameId].unlocked = true;
                console.log(`🎮 Minigame unlocked: ${minigameId}`);
            } else {
                console.warn(`⚠️ Unknown minigame: ${minigameId}`);
            }
            
            // Show notification for all minigames
            if (window.showNotification) {
                const minigameNames = {
                    'arena': 'Arena',
                    'garden': 'Ogród'
                };
                const name = minigameNames[minigameId] || minigameId;
                window.showNotification(`🎮 Odblokowano: ${name}!`, 'success', 5000);
            }
        }
        
        // Handle character unlocks (if needed)
        if (unlocks.character) {
            const unlockedCharId = unlocks.character;
            if (gameData.characters && gameData.characters[unlockedCharId]) {
                gameData.characters[unlockedCharId].unlocked = true;
                console.log(`👤 Character unlocked: ${unlockedCharId}`);
                
                if (window.showNotification) {
                    const charName = gameData.characters[unlockedCharId].name || unlockedCharId;
                    window.showNotification(`👤 Odblokowano: ${charName}!`, 'success', 5000);
                }
            }
        }
        
        // Handle building unlocks (if needed)
        if (unlocks.building) {
            const buildingId = unlocks.building;
            if (gameData.manor && gameData.manor[buildingId]) {
                gameData.manor[buildingId].unlocked = true;
                console.log(`🏠 Building unlocked: ${buildingId}`);
                
                if (window.showNotification) {
                    const buildingName = gameData.manor[buildingId].name || buildingId;
                    window.showNotification(`🏠 Odblokowano: ${buildingName}!`, 'success', 5000);
                }
            }
        }
    }
    
    // Get event history for gallery
    function getEventHistory() {
        return storyState.eventHistory.slice().reverse(); // Most recent first
    }
    
    // Get choice history for replay
    function getChoiceHistory() {
        return new Map(storyState.choiceHistory);
    }
    
    // Check if event is completed
    function isEventCompleted(eventId) {
        return gameData.story?.completedEvents?.includes(eventId) || false;
    }
    
    // Initialize story system
    function initialize() {
        if (!gameData.story) {
            gameData.story = {
                completedEvents: [],
                globalFlags: {}
            };
        }
        
        console.log('Story System initialized');
        return true;
    }
    
    // Module cleanup
    function cleanup() {
        storyState.eventHistory = [];
        storyState.choiceHistory.clear();
        storyState.modalVisible = false;
        console.log('Story module cleanup complete');
    }
    
    // Return enhanced module interface
    return {
        // Core functions
        startStoryEvent,
        showStoryModal,
        closeStoryModal,
        
        // Choice handling
        handleStoryChoice,
        
        // History and tracking
        getEventHistory,
        getChoiceHistory,
        isEventCompleted,
        
        // Unlock processing
        processStoryEventUnlocks,
        
        // State management
        getState: () => ({ ...storyState }),
        
        // Module lifecycle
        initialize,
        cleanup
    };
}

// Register module
if (window.gameModules) {
    window.gameModules.registerModule('story', createStoryModule, ['domElements']);
}

// Global fallback functions for HTML event handlers
window.startStoryEvent = function(eventId, options = {}) {
    const story = window.gameModules?.getModule('story');
    if (story) return story.startStoryEvent(eventId, options);
    return false;
};

window.closeStoryModal = function() {
    const story = window.gameModules?.getModule('story');
    if (story) story.closeStoryModal();
};

window.handleStoryChoice = function(choiceId, eventId) {
    const story = window.gameModules?.getModule('story');
    if (story) story.handleStoryChoice(choiceId, eventId);
};

window.replayStoryEvent = function(eventId) {
    const story = window.gameModules?.getModule('story');
    if (story) return story.startStoryEvent(eventId, { replayMode: true });
    return false;
};

console.log('Story module loaded');

// ======= EMERGENCY STORY DEBUG COMMANDS =======

// Test story system functionality
window.debugStorySystem = function() {
    console.log('🔍=== STORY SYSTEM DEBUG ===');
    const story = window.gameModules?.getModule('story');
    console.log('Story module exists:', !!story);
    console.log('gameModules exists:', !!window.gameModules);
    console.log('Momo character data:', !!window.characterData?.momo);
    
    if (window.characterData?.momo?.storyEvents) {
        const momoEvents = window.characterData.momo.storyEvents;
        console.log('Momo story events count:', momoEvents.length);
        
        // Find momo_7 event
        const momo7Event = momoEvents.find(event => event.id === 'momo_7');
        console.log('momo_7 event found:', !!momo7Event);
        if (momo7Event) {
            console.log('momo_7 unlocks:', momo7Event.unlocks);
        }
    }
    
    console.log('==========================');
};

// Force trigger momo_7 story event to unlock arena
window.forceMomo7Event = function() {
    console.log('🎆 EMERGENCY: Force triggering momo_7 story event...');
    
    try {
        // Validate core dependencies first
        if (!window.gameData) {
            console.error('❌ gameData not found! Game may not be initialized.');
            return false;
        }
        
        const story = window.gameModules?.getModule('story');
        if (!story) {
            console.error('❌ Story module not found! Game modules may not be loaded.');
            return false;
        }
        
        // Check if event exists
        if (!window.characterData?.momo?.storyEvents) {
            console.error('❌ Momo story events not found! Character data may not be loaded.');
            console.log('Available character data:', Object.keys(window.characterData || {}));
            return false;
        }
        
        const momoEvents = window.characterData.momo.storyEvents;
        const momo7Event = momoEvents.find(event => event.id === 'momo_7');
        
        if (!momo7Event) {
            console.error('❌ momo_7 event not found!');
            console.log('Available Momo events:', momoEvents.map(e => e.id));
            return false;
        }
        
        if (!momo7Event.unlocks) {
            console.error('❌ momo_7 event has no unlocks property!');
            console.log('Event structure:', momo7Event);
            return false;
        }
        
        console.log('✅ Found momo_7 event with unlocks:', momo7Event.unlocks);
        
        // Manually trigger the unlock processing
        if (story.processStoryEventUnlocks) {
            console.log('🔧 Processing unlocks via story system...');
            story.processStoryEventUnlocks('momo_7');
            console.log('✅ Unlock processing completed!');
        } else {
            console.error('❌ processStoryEventUnlocks function not available in story module!');
            return false;
        }
        
        // Mark event as seen in gameData
        if (!window.gameData.characters.momo) {
            console.error('❌ Momo character data not found in gameData!');
            return false;
        }
        
        if (!window.gameData.characters.momo.storyProgress) {
            window.gameData.characters.momo.storyProgress = { seenEvents: [] };
        }
        
        if (!window.gameData.characters.momo.storyProgress.seenEvents) {
            window.gameData.characters.momo.storyProgress.seenEvents = [];
        }
        
        if (!window.gameData.characters.momo.storyProgress.seenEvents.includes('momo_7')) {
            window.gameData.characters.momo.storyProgress.seenEvents.push('momo_7');
        }
        
        // Verify arena was actually unlocked
        const arenaUnlocked = window.gameData.minigames?.arena?.unlocked;
        if (arenaUnlocked) {
            console.log('✨ momo_7 event processing complete! Arena successfully unlocked.');
        } else {
            console.warn('⚠️ Event processed but arena may not be unlocked. Check arena state manually.');
            console.log('Arena state:', window.gameData.minigames?.arena);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error forcing momo_7 event:', error);
        return false;
    }
};

console.log('🎆 Story debug commands loaded:');
console.log('- debugStorySystem() - Debug story system state');
console.log('- forceMomo7Event() - Force trigger momo_7 to unlock arena');