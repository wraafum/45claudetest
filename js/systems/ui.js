// UI System - Rendering and Update Management
// Wszystkie Moje Potwory

// UI Module Factory
function createUIModule(dependencies, moduleManager) {
    const { domElements } = dependencies || {};
    
    // Ensure moduleManager is available via parameter or global fallback
    const getModuleManager = () => {
        if (moduleManager && typeof moduleManager.getModule === 'function') {
            return moduleManager;
        }
        if (window.gameModules && typeof window.gameModules.getModule === 'function') {
            return window.gameModules;
        }
        return null;
    };
    
    console.log('🔧 UI Module created with moduleManager:', !!moduleManager, 'Global fallback available:', !!window.gameModules);
    
    // Get game logic module reference (lazy loading with safe fallbacks)
    function getGameLogic() {
        try {
            // Try module manager first (if available and gameLogic is registered)
            const moduleManagerInstance = getModuleManager();
            if (moduleManagerInstance) {
                const gameLogic = moduleManagerInstance.getModule('gameLogic');
                if (gameLogic) return gameLogic;
            }
            
            // Fallback to global reference
            if (window.gameLogic) {
                return window.gameLogic;
            }
            
            // No game logic available yet
            return null;
        } catch (error) {
            console.warn('getGameLogic failed, using fallback:', error.message);
            return window.gameLogic || null;
        }
    }
    
    // UI State
    const uiState = {
        lastUpdate: 0,
        updateInterval: 100, // Update every 100ms
        animations: new Map(),
        notifications: [],
        currentView: 'manor',
        rightPanelTab: 'characters'
    };
    
    // Calculate character progress toward next story threshold
    function calculateCharacterProgress(character) {
        if (!character) {
            return {
                progressPercent: 0,
                currentBond: 0,
                nextThreshold: null,
                currentThreshold: 0,
                isComplete: false,
                debugInfo: { error: 'No character provided' }
            };
        }
        
        const bondPoints = Math.floor(Math.max(0, character.bondPoints || 0));
        const storyProgress = Math.max(0, Math.floor(character.storyProgress || 0));
        const storyThresholds = character.storyThresholds;
        
        // Use actual bond points (test values removed)
        const actualBondPoints = bondPoints;
        
        let progressPercent = 0;
        let nextThreshold = null;
        let currentThreshold = 0;
        let isComplete = false;
        let targetThresholdIndex = 0;
        
        const debugInfo = {
            characterId: character.id,
            characterName: character.name,
            bondPoints: actualBondPoints,
            storyProgress: storyProgress,
            hasThresholds: !!storyThresholds,
            thresholdsLength: storyThresholds ? storyThresholds.length : 0
        };
        
        // Check if we have valid story thresholds
        if (!storyThresholds || !Array.isArray(storyThresholds) || storyThresholds.length === 0) {
            // No story thresholds - show basic progress based on bond points (max at 100)
            progressPercent = actualBondPoints > 0 ? Math.min((actualBondPoints / 100) * 100, 100) : 0;
            debugInfo.calculationType = 'no-thresholds';
            debugInfo.note = 'No story thresholds available';
            return { progressPercent, currentBond: actualBondPoints, nextThreshold, currentThreshold, isComplete, debugInfo };
        }
        
        // Check if story is complete (reached max level)
        if (storyProgress >= storyThresholds.length) {
            progressPercent = 100;
            isComplete = true;
            debugInfo.calculationType = 'max-level';
            debugInfo.note = 'Story completed - max level reached';
            return { progressPercent, currentBond: bondPoints, nextThreshold, currentThreshold, isComplete, debugInfo };
        }
        
        // Normal case - calculate progress toward next story event
        // Use story progress to determine which threshold we're working toward
        // This ensures sequential story progression regardless of bond points
        
        // The next threshold is based on story progress, not bond points
        const nextStoryIndex = storyProgress; // 0-based index of next story to unlock
        
        if (nextStoryIndex >= storyThresholds.length) {
            // All stories completed
            progressPercent = 100;
            isComplete = true;
            currentThreshold = storyThresholds[storyThresholds.length - 1] || 0;
            debugInfo.calculationType = 'all-stories-completed';
            debugInfo.note = 'All story events have been completed';
        } else {
            // Set current and next thresholds based on story progress
            currentThreshold = nextStoryIndex > 0 ? storyThresholds[nextStoryIndex - 1] : 0;
            nextThreshold = storyThresholds[nextStoryIndex];
            targetThresholdIndex = nextStoryIndex;
            
            debugInfo.calculationType = 'story-progress-based';
            debugInfo.note = `Working toward story ${nextStoryIndex + 1} (threshold ${nextThreshold})`;
        }
        
        // If all stories completed, ensure proper state
        if (isComplete) {
            debugInfo.currentThreshold = currentThreshold;
            debugInfo.nextThreshold = nextThreshold;
            return { progressPercent, currentBond: actualBondPoints, nextThreshold, currentThreshold, isComplete, debugInfo };
        }
        
        debugInfo.currentThreshold = currentThreshold;
        debugInfo.nextThreshold = nextThreshold;
        debugInfo.targetThresholdIndex = targetThresholdIndex;
        
        // Calculate progress between current and next threshold
        const currentProgress = Math.max(0, actualBondPoints - currentThreshold);
        const maxProgress = Math.max(1, nextThreshold - currentThreshold); // Avoid division by zero
        
        if (maxProgress > 0) {
            progressPercent = Math.min((currentProgress / maxProgress) * 100, 100);
            debugInfo.calculationType = 'story-progress-based';
            debugInfo.currentProgress = currentProgress;
            debugInfo.maxProgress = maxProgress;
            debugInfo.calculation = `(${actualBondPoints} - ${currentThreshold}) / (${nextThreshold} - ${currentThreshold}) * 100 = ${progressPercent.toFixed(2)}%`;
            debugInfo.storyIndex = nextStoryIndex;
        } else {
            // Edge case: current >= next threshold (should trigger story unlock)
            progressPercent = 100;
            debugInfo.calculationType = 'ready-for-story-unlock';
            debugInfo.note = `Bond points (${actualBondPoints}) >= story ${nextStoryIndex + 1} threshold (${nextThreshold}) - ready for story event`;
            debugInfo.storyIndex = nextStoryIndex;
        }
        
        return { 
            progressPercent, 
            currentBond: actualBondPoints, 
            nextThreshold, 
            currentThreshold, 
            isComplete, 
            debugInfo 
        };
    }

    // Update display values with animations
    function updateDisplay(elementKey, newValue, options = {}) {
        const { 
            format = true, 
            animate = true, 
            suffix = '', 
            className = '',
            duration = 300 
        } = options;
        
        if (!domElements) {
            console.warn('DOM elements not available for UI update');
            return;
        }
        
        const element = domElements.get(elementKey);
        if (!element) return;
        
        const formattedValue = format ? (window.gameUtils ? window.gameUtils.formatNumber(newValue) : newValue.toString()) : newValue.toString();
        const displayValue = formattedValue + suffix;
        
        if (animate && element.textContent !== displayValue) {
            element.classList.add('number-pop');
            setTimeout(() => {
                element.classList.remove('number-pop');
            }, duration);
        }
        
        if (className) {
            element.className = className;
        }
        
        element.textContent = displayValue;
    }
    
    // Update game statistics display
    function updateGameStats() {
        if (!gameData || !domElements) return;
        
        // Update lust points
        updateDisplay('lustPoints', gameData.lustPoints, { 
            animate: true, 
            className: 'text-pink-300 font-bold' 
        });
        
        // Update lust per second
        updateDisplay('lps', gameData.lustPerSecond, { 
            animate: false, 
            suffix: '',
            className: 'text-gray-300' 
        });
        
        // Update game version
        domElements.setContent('gameVersion', `v${gameData.version}`);
        
        // Update save status
        const lastSaved = gameData.lastSaved;
        if (lastSaved) {
            const timeSince = Math.floor((Date.now() - lastSaved) / 1000);
            domElements.setContent('saveStatus', `Zapisano: ${window.gameUtils ? window.gameUtils.formatTime(timeSince) : timeSince + 's'} temu`);
        } else {
            domElements.setContent('saveStatus', 'Auto-save: włączony');
        }
    }
    
    // Update active character display
    function updateActiveCharacter() {
        if (!gameData || !gameData.activeCharacterId || !domElements) return;
        
        const character = gameData.characters[gameData.activeCharacterId];
        if (!character) return;
        
        // Update character info
        domElements.setContent('activeCharacterName', character.name || 'Nieznana');
        domElements.setContent('activeCharacterTitle', character.title || '');
        
        // Update character image (use clickImage for interactive area)
        const imageElement = domElements.get('activeCharacterImage');
        if (imageElement && character.clickImage) {
            imageElement.src = character.clickImage;
            imageElement.alt = character.name;
        }
        
        // Update character stats using centralized progress calculation
        const level = character.level || 0;
        const progressData = calculateCharacterProgress(character);
        const production = window.gameUtils ? window.gameUtils.calculateCharacterProduction(character) : 0;
        
        domElements.setContent('characterLevel', `Poziom: ${level}`);
        
        if (progressData.nextThreshold !== null) {
            domElements.setContent('characterBond', `Więź: ${progressData.currentBond}/${progressData.nextThreshold}`);
        } else {
            domElements.setContent('characterBond', `Więź: ${progressData.currentBond}`);
        }
        
        updateDisplay('characterProduction', production, { 
            suffix: ' LP/s',
            className: 'text-green-300'
        });
        
        // Update character comment (random from clickComments)
        if (character.clickComments && character.clickComments.length > 0 && Math.random() < 0.05) {
            const randomComment = character.clickComments[Math.floor(Math.random() * character.clickComments.length)];
            domElements.setContent('characterComment', `"${randomComment}"`);
            
            // Clear comment after 5 seconds
            setTimeout(() => {
                domElements.setContent('characterComment', '');
            }, 5000);
        }
    }
    
    // Render characters list (only call when actually needed)
    function renderCharactersList() {
        console.log('🏗️ RECREATING ALL CHARACTER DOM ELEMENTS', {
            timestamp: new Date().toLocaleTimeString(),
            characterCount: Object.keys(gameData?.characters || {}).length
        });
        
        if (!gameData || !gameData.characters || !domElements) return;
        
        const container = domElements.get('charactersList');
        if (!container) return;
        
        container.innerHTML = ''; // This destroys all progress bar widths!
        
        // Get ordered list of characters based on game progression
        const orderedCharacters = getOrderedCharacters();
        
        orderedCharacters.forEach(character => {
            const characterCard = createCharacterCard(character);
            container.appendChild(characterCard);
        });
    }
    
    // Get characters in proper display order
    function getOrderedCharacters() {
        if (!gameData.characters) return [];
        
        const characterOrder = gameData.characterOrder || [
            'szafran', 'momo', 'duo_kroliczki', 'mina', 'lucja', 'mara', 
            'bastet', 'promilia', 'furia', 'mimi', 'zmora', 'alina'
        ];
        
        const orderedChars = [];
        const allCharacters = gameData.characters;
        
        // Add characters in defined order (only if they should be visible)
        characterOrder.forEach(charId => {
            if (allCharacters[charId] && shouldShowCharacter(allCharacters[charId])) {
                orderedChars.push(allCharacters[charId]);
            }
        });
        
        // Add any characters not in the order list (future-proofing, only if they should be visible)
        Object.values(allCharacters).forEach(character => {
            if (!characterOrder.includes(character.id) && shouldShowCharacter(character)) {
                orderedChars.push(character);
            }
        });
        
        return orderedChars;
    }
    
    // Update character values without recreating DOM
    function updateCharacterValues() {
        if (!gameData || !gameData.characters) {
            console.warn('⚠️ updateCharacterValues: gameData or characters not available');
            return;
        }
        
        // Only update if characters exist in DOM
        const container = domElements.get('charactersList');
        if (!container) {
            console.warn('⚠️ updateCharacterValues: charactersList container not found');
            return;
        }
        
        // Debug: Track update frequency (throttled to avoid spam)
        const now = Date.now();
        if (!updateCharacterValues.lastDebugLog || now - updateCharacterValues.lastDebugLog > 5000) {
            const characterCount = Object.keys(gameData.characters).length;
            const unlockedCount = Object.values(gameData.characters).filter(c => c.unlocked).length;
            console.log(`🔄 Updating character progress bars... (${unlockedCount}/${characterCount} unlocked)`);
            updateCharacterValues.lastDebugLog = now;
        }
        
        // Use same ordering as render function
        const orderedCharacters = getOrderedCharacters();
        if (!orderedCharacters || orderedCharacters.length === 0) {
            console.warn('⚠️ updateCharacterValues: No ordered characters found');
            return;
        }
        
        // Check if any character elements are missing and need a full re-render
        let missingElements = false;
        for (const character of orderedCharacters) {
            if (!character || !character.id) {
                console.warn('⚠️ updateCharacterValues: Invalid character object', character);
                continue;
            }
            const characterElement = container.querySelector(`[data-character-id="${character.id}"]`);
            if (!characterElement) {
                missingElements = true;
                break;
            }
        }
        
        // If any character elements are missing, do a full re-render
        if (missingElements) {
            console.log('🔄 Character elements missing, triggering full re-render');
            renderCharactersList();
            // Don't return early - continue with the update to set progress bar values
            console.log('🔄 Continuing with progress bar updates after re-render');
        }
        
        let progressBarsUpdated = 0;
        let progressBarsSkipped = 0;
        
        orderedCharacters.forEach(character => {
            if (!character || !character.id) {
                progressBarsSkipped++;
                return;
            }
            
            // Re-query the DOM element after potential re-render
            const characterElement = container.querySelector(`[data-character-id="${character.id}"]`);
            if (!characterElement) {
                console.warn(`⚠️ Character element STILL not found for ${character.name || character.id} after re-render`);
                progressBarsSkipped++;
                return;
            }
            
            if (character.unlocked) {
                // Update unlocked character display
                
                // Update progress bar with comprehensive error handling
                const progressFill = characterElement.querySelector('.character-panel-progress-fill');
                if (!progressFill) {
                    console.warn(`⚠️ Progress bar element missing for ${character.name || character.id}:`, {
                        characterElement: characterElement,
                        expectedClass: '.character-panel-progress-fill'
                    });
                    progressBarsSkipped++;
                    return;
                }
                
                // Use live game data for consistent behavior with comprehensive validation
                const liveCharacter = gameData.characters[character.id] || character;
                if (!liveCharacter) {
                    console.warn(`⚠️ Live character data not found for ${character.id}`);
                    progressBarsSkipped++;
                    return;
                }
                
                // Use centralized progress calculation
                const progressData = calculateCharacterProgress(liveCharacter);
                const finalWidth = Math.max(progressData.progressPercent, 0); // Use actual progress without artificial minimums
                
                // CRITICAL DEBUGGING: Track progress bar updates
                console.log(`🔍 PROGRESS UPDATE for ${character.name}:`, {
                    bondPoints: progressData.currentBond,
                    nextThreshold: progressData.nextThreshold,
                    currentThreshold: progressData.currentThreshold,
                    progressPercent: progressData.progressPercent,
                    finalWidth: finalWidth,
                    calculationType: progressData.debugInfo.calculationType,
                    timestamp: new Date().toLocaleTimeString()
                });
                
                // Apply the width to the progress bar with enhanced verification
                try {
                    // Use calculated width (not test override)
                    console.log(`🎯 USING CALCULATED WIDTH: ${finalWidth}% for ${character.name}`);
                    console.log(`🔍 PROGRESS DATA:`, progressData);
                    
                    // Clear any existing width first
                    progressFill.style.width = '';
                    
                    // Use multiple methods to set width with maximum force (but use real calculation)
                    progressFill.style.setProperty('width', `${finalWidth}%`, 'important');
                    progressFill.style.width = `${finalWidth}%`;
                    
                    // SAME WORKING METHOD - but with pretty solid purple color
                    progressFill.setAttribute('style', `width: ${finalWidth}% !important; background: #C3A3F7 !important; border: 1px solid rgba(255,255,255,0.2) !important;`);
                    
                    // Verify the width was actually applied
                    const appliedWidth = progressFill.style.width;
                    const computedStyle = window.getComputedStyle(progressFill);
                    
                    console.log(`🎯 DOM STYLE APPLICATION for ${character.name}:`, {
                        targetWidth: `${finalWidth}%`,
                        appliedStyleWidth: appliedWidth,
                        computedWidth: computedStyle.width,
                        elementVisible: progressFill.offsetWidth > 0,
                        parentWidth: progressFill.parentElement?.offsetWidth,
                        elementHTML: progressFill.outerHTML.substring(0, 100),
                        timestamp: new Date().toLocaleTimeString()
                    });
                    
                    // Force a repaint if needed
                    if (finalWidth > 0 && progressFill.offsetWidth === 0) {
                        console.warn(`⚠️ Progress bar not visible for ${character.name}, forcing repaint`);
                        progressFill.style.display = 'none';
                        progressFill.offsetHeight; // Force reflow
                        progressFill.style.display = '';
                    }
                    
                    progressBarsUpdated++;
                } catch (error) {
                    console.error(`❌ Failed to set progress bar width for ${character.name}:`, error);
                    progressBarsSkipped++;
                }
                
                // Update stats text
                const statsElement = characterElement.querySelector('.character-panel-stats');
                if (statsElement) {
                    const level = character.level || 0;
                    const production = window.gameUtils ? window.gameUtils.calculateCharacterProduction(character) : 0;
                    const bpPerSecond = character.baseBpPerSecond || 0;
                    
                    statsElement.innerHTML = `
                        <span>Poziom: ${level}</span>
                        <span>LP/s: ${window.gameUtils ? window.gameUtils.formatNumber(production) : production}</span>
                        <span>BP/s: ${bpPerSecond.toFixed(1)}</span>
                    `;
                }
                
                // Update level button cost and state
                const levelBtn = characterElement.querySelector('.level-btn');
                if (levelBtn) {
                    const upgradeCost = window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0;
                    const canAffordUpgrade = gameData.lustPoints >= upgradeCost;
                    
                    // Update button text with current cost
                    levelBtn.textContent = `Lvl (${window.gameUtils ? window.gameUtils.formatNumber(upgradeCost) : upgradeCost})`;
                    
                    // Update button state (enabled/disabled)
                    if (canAffordUpgrade) {
                        levelBtn.disabled = false;
                        levelBtn.classList.remove('btn-disabled');
                    } else {
                        levelBtn.disabled = true;
                        levelBtn.classList.add('btn-disabled');
                    }
                }
            } else {
                // Update locked character display
                const cost = character.unlockCost || 0;
                const canAfford = gameData.lustPoints >= cost;
                
                // Check unlock conditions
                const conditionsCheck = checkDisplayUnlockConditions(character.unlockConditions);
                const allRequirementsMet = canAfford && conditionsCheck.allMet;
                
                // Update unlock info display
                const statsElement = characterElement.querySelector('.character-panel-stats');
                if (statsElement) {
                    let unlockInfoHTML = '';
                    
                    // Special case for Alina - requires prestige unlock
                    if (character.id === 'alina') {
                        const hasPrestigeUnlock = gameData.prestigeUpgrades && gameData.prestigeUpgrades.unlock_alina;
                        unlockInfoHTML = `
                            <span class="${hasPrestigeUnlock ? 'text-green-400' : 'text-purple-400'}">
                                ${hasPrestigeUnlock ? '✓ Prestiż: Odblokowana' : '🔒 Prestiż: Wymagany'}
                            </span>
                            <br><span class="text-yellow-300 text-sm">Alina jest dostępna tylko przez drzewko prestiżu</span>
                        `;
                    } else {
                        // More compact requirements display
                        if (character.unlockConditions && character.unlockConditions.length > 0) {
                            const unmetCount = conditionsCheck.details.filter(d => !d.met).length;
                            const totalCount = conditionsCheck.details.length;
                            
                            if (unmetCount === 0) {
                                unlockInfoHTML = `<span class="text-green-400 text-sm">✓ Wszystkie wymagania spełnione</span>`;
                            } else {
                                unlockInfoHTML = `<span class="text-yellow-300 text-sm">Wymagania:</span>`;
                                
                                // Show most critical unmet requirement
                                const firstUnmet = conditionsCheck.details.find(d => !d.met);
                                if (firstUnmet) {
                                    unlockInfoHTML += `<br><span class="text-red-400 text-xs">${firstUnmet.status}</span>`;
                                }
                            }
                        } else {
                            unlockInfoHTML = `
                                <span class="${canAfford ? 'text-green-400' : 'text-red-400'} text-sm">
                                    ${canAfford ? '✓ Gotowa do odblokowania' : '⏳ Zbierz więcej Pożądania'}
                                </span>
                            `;
                        }
                    }
                    
                    statsElement.innerHTML = unlockInfoHTML;
                }
                // Update unlock button state
                const unlockBtn = characterElement.querySelector('.level-btn');
                if (unlockBtn) {
                    let buttonText, canUnlock;
                    
                    if (character.id === 'alina') {
                        const hasPrestigeUnlock = gameData.prestigeUpgrades && gameData.prestigeUpgrades.unlock_alina;
                        buttonText = hasPrestigeUnlock ? 'Poznaj ją!' : 'Prestiż wymagany';
                        canUnlock = hasPrestigeUnlock;
                    } else {
                        buttonText = `Poznaj ją! (${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost})`;
                        canUnlock = allRequirementsMet;
                    }
                    
                    // Update button text and state
                    unlockBtn.textContent = buttonText;
                    
                    if (canUnlock) {
                        unlockBtn.disabled = false;
                        unlockBtn.classList.remove('btn-disabled');
                    } else {
                        unlockBtn.disabled = true;
                        unlockBtn.classList.add('btn-disabled');
                    }
                }
            }
        });
        
        // Summary logging (throttled to avoid spam)
        if (now - (updateCharacterValues.lastSummaryLog || 0) > 10000) {
            console.log(`📊 Progress bars update summary: ${progressBarsUpdated} updated, ${progressBarsSkipped} skipped`);
            updateCharacterValues.lastSummaryLog = now;
        }
    }
    
    // Format unlock conditions into readable Polish text
    function formatUnlockConditions(conditions) {
        if (!conditions || conditions.length === 0) return '';
        
        const conditionTexts = conditions.map(condition => {
            if (condition.type === 'building') {
                const building = gameData.manor[condition.buildingId];
                const buildingName = building ? building.name : condition.buildingId;
                const requiredLevel = condition.level || 1;
                return `${buildingName} (poziom ${requiredLevel})`;
            } else if (condition.type === 'character') {
                const character = gameData.characters[condition.characterId];
                const characterName = character ? character.name : condition.characterId;
                const requiredLevel = condition.level || 1;
                return `${characterName} (poziom ${requiredLevel})`;
            } else if (condition.type === 'quest') {
                const requiredLevel = condition.level || 1;
                return `Zadanie: ${condition.questId} (poziom ${requiredLevel})`;
            }
            return 'Nieznany warunek';
        });
        
        return conditionTexts.join(', ');
    }
    
    // Check if individual unlock conditions are met and return status
    function checkDisplayUnlockConditions(conditions) {
        if (!conditions || conditions.length === 0) return { allMet: true, details: [] };
        
        const details = conditions.map(condition => {
            let met = false;
            let status = '';
            
            if (condition.type === 'building') {
                const building = gameData.manor[condition.buildingId];
                const buildingName = building ? building.name : condition.buildingId;
                const requiredLevel = condition.level || 1;
                const currentLevel = building ? building.level : 0;
                
                met = building && currentLevel >= requiredLevel;
                status = met ? 
                    `✓ ${buildingName} (${currentLevel}/${requiredLevel})` : 
                    `✗ ${buildingName} (${currentLevel}/${requiredLevel})`;
            } else if (condition.type === 'character') {
                const character = gameData.characters[condition.characterId];
                const characterName = character ? character.name : condition.characterId;
                const requiredLevel = condition.level || 1;
                const currentLevel = character ? character.level : 0;
                const isUnlocked = character ? character.unlocked : false;
                
                met = character && isUnlocked && currentLevel >= requiredLevel;
                if (!isUnlocked) {
                    status = `✗ ${characterName} (zablokowana)`;
                } else {
                    status = met ? 
                        `✓ ${characterName} (${currentLevel}/${requiredLevel})` : 
                        `✗ ${characterName} (${currentLevel}/${requiredLevel})`;
                }
            } else if (condition.type === 'quest') {
                const quest = gameData[condition.questId];
                const requiredLevel = condition.level || 1;
                const currentLevel = quest ? quest.level : 0;
                
                met = quest && currentLevel >= requiredLevel;
                status = met ? 
                    `✓ ${condition.questId} (${currentLevel}/${requiredLevel})` : 
                    `✗ ${condition.questId} (${currentLevel}/${requiredLevel})`;
            }
            
            return { met, status, condition };
        });
        
        const allMet = details.every(detail => detail.met);
        return { allMet, details };
    }
    
    // Update building values - delegate to building module
    function updateBuildingValues() {
        try {
            const moduleManagerInstance = getModuleManager();
            if (moduleManagerInstance) {
                const buildings = moduleManagerInstance.getModule('buildings');
                if (buildings && buildings.updateBuildingValues) {
                    return buildings.updateBuildingValues();
                }
            }
            
            // Fallback: no update if building module not available
            console.warn('Building module not available for updateBuildingValues');
        } catch (error) {
            console.error('Error accessing buildings module for updateBuildingValues:', error);
        }
    }
    
    // Check if characters should be visible based on story progress
    function shouldShowCharacter(character) {
        if (!character) return false;
        
        // Always show Szafran (starting character)
        if (character.id === 'szafran') return true;
        
        // Check if Szafran's first story event has been completed
        if (gameData && gameData.story && gameData.story.completedEvents) {
            return gameData.story.completedEvents.includes('szafran_1');
        }
        
        // Fallback: hide characters if story data not available
        return false;
    }
    
    // Create character card element
    // Note: Character visibility filtering is handled in getOrderedCharacters()
    function createCharacterCard(character) {
        const isActive = character.id === gameData.activeCharacterId;
        
        const card = domElements.createElement('div', {
            className: `character-panel-wide ${character.unlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`,
            attributes: { 'data-character-id': character.id }
        });
        
        // Set background image from avatar
        if (character.avatar) {
            card.style.backgroundImage = `url('${character.avatar}')`;
        }
        
        // Name and title at top
        const name = domElements.createElement('div', {
            className: 'character-panel-name',
            textContent: character.name
        });
        
        const title = domElements.createElement('div', {
            className: 'character-panel-title',
            textContent: character.title || ''
        });
        
        
        // Bottom area - Progress, stats, buttons  
        const bottomArea = domElements.createElement('div', {
            className: 'character-panel-bottom'
        });
        
        if (character.unlocked) {
            // Add click handler to open character page
            card.classList.add('cursor-pointer', 'character-clickable');
            card.addEventListener('click', (event) => {
                // Don't trigger if clicking on buttons
                if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
                    return;
                }
                
                console.log(`Opening character page for ${character.name}`);
                const characterModule = window.gameModules?.getModule('character');
                if (characterModule && characterModule.displayCharacter) {
                    characterModule.displayCharacter(character.id);
                } else if (window.displayCharacter) {
                    window.displayCharacter(character.id);
                }
            });
            
            // Add hover event listeners for particle effects
            card.addEventListener('mouseenter', () => {
                triggerCharacterHoverParticles(character.id, true);
            });
            
            card.addEventListener('mouseleave', () => {
                triggerCharacterHoverParticles(character.id, false);
            });
            
            // Progress bar for bond points
            const progressContainer = domElements.createElement('div', {
                className: 'character-panel-progress'
            });
            
            // Use live game data for consistent behavior
            const liveCharacter = gameData.characters[character.id] || character;
            
            // Use centralized progress calculation
            const progressData = calculateCharacterProgress(liveCharacter);
            const finalWidth = Math.max(progressData.progressPercent, 0); // Use actual progress without artificial minimums
            
            console.log(`🔧 Creating progress bar for ${character.name}:`, {
                bondPoints: progressData.currentBond,
                nextThreshold: progressData.nextThreshold,
                currentThreshold: progressData.currentThreshold,
                progressPercent: progressData.progressPercent,
                finalWidth: finalWidth,
                calculationType: progressData.debugInfo.calculationType
            });
            
            // Use calculated width (not test override)
            console.log(`🎯 CREATING with CALCULATED WIDTH: ${finalWidth}% for ${character.name}`);
            console.log(`🔍 CREATION PROGRESS DATA:`, progressData);
            
            const progressFill = domElements.createElement('div', {
                className: 'character-panel-progress-fill',
                style: { width: `${finalWidth}%` }
            });
            
            // SAME WORKING METHOD - but with pretty solid purple color
            progressFill.setAttribute('style', `width: ${finalWidth}% !important; background: #C3A3F7 !important; border: 1px solid rgba(255,255,255,0.2) !important;`);
            
            // Verify initial progress bar creation
            console.log(`🏗️ Progress bar created for ${character.name}:`, {
                element: progressFill,
                initialWidth: progressFill.style.width,
                className: progressFill.className,
                hasStyleAttribute: progressFill.hasAttribute('style')
            });
            
            progressContainer.appendChild(progressFill);
            
            // Stats line
            const level = character.level || 0;
            const production = window.gameUtils ? window.gameUtils.calculateCharacterProduction(character) : 0;
            const bpPerSecond = character.baseBpPerSecond || 0;
            
            const stats = domElements.createElement('div', {
                className: 'character-panel-stats'
            });
            
            stats.innerHTML = `
                <span>Poziom: ${level}</span>
                <span>LP/s: ${window.gameUtils ? window.gameUtils.formatNumber(production) : production}</span>
                <span>BP/s: ${bpPerSecond.toFixed(1)}</span>
            `;
            
            // Buttons
            const buttons = domElements.createElement('div', {
                className: 'character-panel-buttons'
            });
            
            // Level up button
            const upgradeCost = window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0;
            const canAffordUpgrade = gameData.lustPoints >= upgradeCost;
            
            const levelBtn = domElements.createElement('button', {
                className: `character-btn level-btn ${!canAffordUpgrade ? 'btn-disabled' : ''}`,
                textContent: `Lvl (${window.gameUtils ? window.gameUtils.formatNumber(upgradeCost) : upgradeCost})`,
                attributes: { 
                    'data-character-id': character.id,
                    'onclick': `levelCharacter('${character.id}')`
                }
            });
            if (!canAffordUpgrade) {
                levelBtn.disabled = true;
            }
            
            // Prevent card click when clicking buttons
            levelBtn.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            // Story button (Randka) - check if story event is available
            const hasAvailableStory = progressData.nextThreshold !== null && progressData.currentBond >= progressData.nextThreshold;
            const storyBtn = domElements.createElement('button', {
                className: `character-btn story-btn ${!hasAvailableStory ? 'btn-disabled' : ''}`,
                textContent: 'Randka',
                attributes: { 
                    'data-character-id': character.id,
                    'onclick': `launchRandka('${character.id}')`
                }
            });
            if (!hasAvailableStory) {
                storyBtn.disabled = true;
            }
            
            // Prevent card click when clicking buttons
            storyBtn.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            // Shared interactions button
            const sharedBtn = domElements.createElement('button', {
                className: 'character-btn shared-btn',
                textContent: 'wspólne',
                attributes: { 
                    'data-character-id': character.id,
                    'onclick': `showSharedInteractions('${character.id}')`
                }
            });
            
            // Prevent card click when clicking buttons
            sharedBtn.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            // Set as active button
            const activeBtn = domElements.createElement('button', {
                className: `character-btn active-btn ${isActive ? 'is-active' : ''}`,
                textContent: 'czas',
                attributes: { 
                    'data-character-id': character.id,
                    'onclick': `setExclusiveCharacter('${character.id}')`
                }
            });
            
            // Prevent card click when clicking buttons
            activeBtn.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            buttons.appendChild(levelBtn);
            buttons.appendChild(storyBtn);
            buttons.appendChild(sharedBtn);
            buttons.appendChild(activeBtn);
            
            bottomArea.appendChild(progressContainer);
            bottomArea.appendChild(stats);
            bottomArea.appendChild(buttons);
        } else {
            // Locked character - show unlock cost and conditions
            const cost = character.unlockCost || 0;
            const canAfford = gameData.lustPoints >= cost;
            
            // Check unlock conditions
            const conditionsCheck = checkDisplayUnlockConditions(character.unlockConditions);
            const allRequirementsMet = canAfford && conditionsCheck.allMet;
            
            // Create cost info element
            const costInfo = domElements.createElement('div', {
                className: 'character-panel-stats'
            });
            
            // Create requirements info element (separate from stats to avoid height restriction)
            const requirementsInfo = domElements.createElement('div', {
                className: 'text-white mb-2 text-xs'
            });
            
            // Build cost info HTML
            let costInfoHTML = '';
            let requirementsHTML = '';
            
            // Special case for Alina - requires prestige unlock
            if (character.id === 'alina') {
                const hasPrestigeUnlock = gameData.prestigeUpgrades && gameData.prestigeUpgrades.unlock_alina;
                costInfoHTML = `
                    <span class="${hasPrestigeUnlock ? 'text-green-400' : 'text-purple-400'}">
                        ${hasPrestigeUnlock ? '✓ Prestiž: Odblokowana' : '🔒 Prestiž: Wymagany'}
                    </span>
                `;
                requirementsHTML = `<span class="text-yellow-300">Alina jest dostępna tylko przez drzewko prestiżu</span>`;
            } else {
                // More compact requirements display
                if (character.unlockConditions && character.unlockConditions.length > 0) {
                    const unmetCount = conditionsCheck.details.filter(d => !d.met).length;
                    const totalCount = conditionsCheck.details.length;
                    
                    if (unmetCount === 0) {
                        costInfoHTML = `<span class="text-green-400 text-sm">✓ Wszystkie wymagania spełnione</span>`;
                    } else {
                        costInfoHTML = `<span class="text-yellow-300 text-sm">Wymagania:</span>`;
                        
                        // Show most critical unmet requirement
                        const firstUnmet = conditionsCheck.details.find(d => !d.met);
                        if (firstUnmet) {
                            requirementsHTML = `<span class="text-red-400 text-xs">${firstUnmet.status}</span>`;
                        }
                    }
                } else {
                    costInfoHTML = `
                        <span class="${canAfford ? 'text-green-400' : 'text-red-400'} text-sm">
                            ${canAfford ? '✓ Gotowa do odblokowania' : '⏳ Zbierz więcej Pożądania'}
                        </span>
                    `;
                }
            }
            
            costInfo.innerHTML = costInfoHTML;
            if (requirementsHTML) {
                requirementsInfo.innerHTML = requirementsHTML;
            }
            
            // Add tooltip for requirements if they exist
            if (character.unlockConditions && character.unlockConditions.length > 0) {
                const fullRequirements = conditionsCheck.details.map(detail => detail.status).join(', ');
                requirementsInfo.title = `Wszystkie wymagania: ${fullRequirements}`;
                requirementsInfo.style.cursor = 'help';
            }
            
            // Create unlock button for all locked characters
            let buttonText, canUnlock;
            
            if (character.id === 'alina') {
                const hasPrestigeUnlock = gameData.prestigeUpgrades && gameData.prestigeUpgrades.unlock_alina;
                buttonText = hasPrestigeUnlock ? 'Poznaj ją!' : 'Prestiż wymagany';
                canUnlock = hasPrestigeUnlock;
            } else {
                buttonText = `Poznaj ją! (${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost})`;
                canUnlock = allRequirementsMet;
            }
            
            const unlockBtn = domElements.createElement('button', {
                className: `character-btn level-btn ${!canUnlock ? 'btn-disabled' : ''}`,
                textContent: buttonText,
                attributes: { 
                    'data-character-id': character.id,
                    'onclick': `unlockCharacterClick('${character.id}')`
                }
            });
            
            if (!canUnlock) {
                unlockBtn.disabled = true;
            }
            
            // Prevent card click when clicking unlock button
            unlockBtn.addEventListener('click', (event) => {
                event.stopPropagation();
            });
            
            // Make card clickable to open secretive character page
            card.classList.add('cursor-pointer');
            card.addEventListener('click', (event) => {
                // Don't trigger if clicking on buttons
                if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
                    return;
                }
                
                console.log(`Opening secretive character page for ${character.name}`);
                
                // Open character page in secretive mode for locked characters
                const characterModule = window.gameModules?.getModule('character');
                if (characterModule && characterModule.displayCharacter) {
                    characterModule.displayCharacter(character.id);
                } else if (window.displayCharacter) {
                    window.displayCharacter(character.id);
                } else {
                    console.warn('Character display module not available');
                    const ui = window.gameModules?.getModule('ui') || window.ui;
                    if (ui && ui.showNotification) {
                        ui.showNotification('Podgląd postaci niedostępny', 'warning');
                    }
                }
            });
            
            // Add elements in order: cost info, requirements (visible above button), then button
            bottomArea.appendChild(costInfo);
            if (requirementsHTML) {
                bottomArea.appendChild(requirementsInfo);
            }
            bottomArea.appendChild(unlockBtn);
        }
        
        // Append elements to card (simple flex layout)
        card.appendChild(name);
        card.appendChild(title);
        card.appendChild(bottomArea);
        
        return card;
    }
    
    // Render buildings list - delegate to building module
    function renderBuildingsList() {
        try {
            // Get moduleManager instance (with fallback)
            const moduleManagerInstance = getModuleManager();
            if (!moduleManagerInstance) {
                console.warn('🏗️ No moduleManager available for buildings rendering (using fallback)');
                renderBuildingsFallback();
                return;
            }
            
            console.log('🏗️ Attempting to get buildings module...');
            const buildings = moduleManagerInstance.getModule('buildings');
            if (buildings && buildings.renderBuildingsList) {
                console.log('✅ Buildings module found, delegating rendering...');
                return buildings.renderBuildingsList();
            }
            
            // Module exists but doesn't have renderBuildingsList method
            console.warn('⚠️ Buildings module available but missing renderBuildingsList method');
            renderBuildingsFallback();
        } catch (error) {
            console.error('❌ Error accessing buildings module:', error);
            renderBuildingsFallback();
        }
    }
    
    // Fallback rendering when buildings module is not available
    function renderBuildingsFallback() {
        console.log('🏗️ Using fallback buildings rendering...');
        
        if (!gameData || !gameData.manor || !domElements) {
            console.warn('Missing dependencies for buildings fallback:', {
                gameData: !!gameData,
                manor: !!gameData?.manor,
                domElements: !!domElements
            });
            return;
        }
        
        const container = domElements.get('buildingsList');
        if (!container) {
            console.warn('Buildings list container not found');
            return;
        }
        
        // Try to render basic building list
        try {
            const buildings = Object.values(gameData.manor || {});
            if (buildings.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-400 p-4">Brak dostępnych budynków</div>';
                return;
            }
            
            // Render basic building cards
            let html = '';
            buildings.forEach(building => {
                const cost = building.baseCost || 0;
                const canAfford = gameData.lustPoints >= cost;
                html += `
                    <div class="building-panel-wide ${canAfford ? 'unlocked' : 'locked'} mb-2 p-3 border rounded">
                        <div class="font-bold">${building.name || 'Nieznany budynek'}</div>
                        <div class="text-sm text-gray-300">Poziom: ${building.level || 0}</div>
                        <div class="text-sm">Koszt: ${cost} LP</div>
                    </div>
                `;
            });
            container.innerHTML = html;
            console.log('✅ Fallback buildings rendered successfully');
            
        } catch (error) {
            console.error('Error in buildings fallback rendering:', error);
            container.innerHTML = '<div class="text-center text-red-400 p-4">Błąd podczas ładowania budynków</div>';
        }
    }
    
    // Building card creation moved to building module
    
    // Building tooltip system moved to building module
    
    // Switch between right panel tabs
    function switchRightPanelTab(tab) {
        if (!domElements) return;
        
        uiState.rightPanelTab = tab;
        gameData.ui.rightPanelTab = tab;
        
        // Update tab buttons
        domElements.removeClass('charactersTab', 'active');
        domElements.removeClass('buildingsTab', 'active');
        domElements.addClass(`${tab}Tab`, 'active');
        
        // Show/hide content and render once
        if (tab === 'characters') {
            domElements.show('charactersContent', 'block');
            domElements.hide('buildingsContent');
            renderCharactersList(); // Initial render when switching tabs
        } else if (tab === 'buildings') {
            domElements.hide('charactersContent');
            domElements.show('buildingsContent', 'block');
            renderBuildingsList(); // Initial render when switching tabs
        }
    }
    
    // Show notification
    function showNotification(message, type = 'info', duration = 3000) {
        if (!domElements) return;
        
        const container = domElements.get('notificationContainer');
        if (!container) return;
        
        const notification = domElements.createElement('div', {
            className: `notification ${type} slide-in`,
            innerHTML: `
                <div class="flex items-center justify-between">
                    <span class="text-sm">${message}</span>
                    <button class="ml-4 text-white hover:text-gray-300" onclick="this.parentElement.parentElement.remove()">✕</button>
                </div>
            `
        });
        
        container.appendChild(notification);
        
        // Play notification sound
        const sound = domElements.get('notificationSound');
        if (sound && gameData.settings.sfxVolume > 0) {
            sound.volume = gameData.settings.sfxVolume;
            sound.play().catch(() => {}); // Ignore errors
        }
        
        // Auto-remove after duration
        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
        
        // Track notification
        uiState.notifications.push({
            message,
            type,
            timestamp: Date.now()
        });
        
        // Keep only last 10 notifications
        if (uiState.notifications.length > 10) {
            uiState.notifications.shift();
        }
    }
    
    // Handle character click with animation
    function handleCharacterClick() {
        if (!gameData || !gameData.activeCharacterId) return;
        
        const character = gameData.characters[gameData.activeCharacterId];
        if (!character || !character.unlocked) return;
        
        // Play click sound
        const sound = domElements.get('clickSound');
        if (sound && gameData.settings.sfxVolume > 0) {
            sound.volume = gameData.settings.sfxVolume;
            sound.currentTime = 0;
            sound.play().catch(() => {}); // Ignore errors
        }
        
        // Create click effect
        createClickEffect();
        
        // Trigger particle effects
        triggerClickParticles();
        
        // Update game logic (this will be handled by game-logic.js)
        const gameLogic = getGameLogic();
        if (gameLogic && gameLogic.handleCharacterClick) {
            const success = gameLogic.handleCharacterClick();
            if (!success) {
                console.warn('Character click failed - check game logic');
            }
        } else {
            console.warn('🖱️ Game logic module not ready for character click - will retry when available');
        }
        
        // Update statistics (done here since UI handles the click event)
        gameData.statistics.totalClicks++;
        gameData.session.clicksThisSession++;
    }
    
    // Create click effect animation
    function createClickEffect() {
        const clickArea = domElements.get('characterClickArea');
        if (!clickArea) return;
        
        const effect = domElements.createElement('div', {
            className: 'click-ripple',
            style: {
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '20px',
                height: '20px',
                marginLeft: '-10px',
                marginTop: '-10px',
                zIndex: '10'
            }
        });
        
        clickArea.appendChild(effect);
        
        // Remove effect after animation
        setTimeout(() => {
            if (effect.parentElement) {
                effect.remove();
            }
        }, 600);
    }
    
    // Trigger particle effects for character click
    function triggerClickParticles() {
        if (!gameData || !gameData.activeCharacterId) return;
        
        const characterId = gameData.activeCharacterId;
        const clickArea = domElements.get('characterClickArea');
        
        if (!clickArea) return;
        
        // Get click position relative to viewport
        const rect = clickArea.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        // Dispatch character click event for particle system
        if (window.dispatchEvent) {
            const event = new CustomEvent('characterClick', {
                detail: {
                    characterId: characterId,
                    clickPosition: position
                }
            });
            window.dispatchEvent(event);
        }
        
        // Also trigger bond increase particles if applicable
        const character = gameData.characters[characterId];
        if (character) {
            const bondGain = 1; // Base bond gain per click
            
            if (window.dispatchEvent) {
                const bondEvent = new CustomEvent('bondIncrease', {
                    detail: {
                        characterId: characterId,
                        bondGain: bondGain,
                        position: position
                    }
                });
                window.dispatchEvent(bondEvent);
            }
        }
    }
    
    // Trigger character hover particles
    function triggerCharacterHoverParticles(characterId, isHovering) {
        if (window.dispatchEvent) {
            const event = new CustomEvent('characterHover', {
                detail: {
                    characterId: characterId,
                    isHovering: isHovering
                }
            });
            window.dispatchEvent(event);
        }
    }
    
    // Set active character
    function setActiveCharacter(characterId) {
        if (!gameData || !gameData.characters[characterId]) return;
        
        const character = gameData.characters[characterId];
        if (!character.unlocked) return;
        
        gameData.activeCharacterId = characterId;
        updateActiveCharacter();
        renderCharactersList(); // Refresh to update active state
        
        showNotification(`${character.name} jest teraz aktywna`, 'success');
    }
    
    // Unlock character
    function unlockCharacter(characterId) {
        const gameLogic = getGameLogic();
        if (gameLogic && gameLogic.unlockCharacter) {
            gameLogic.unlockCharacter(characterId);
        } else {
            console.warn('🔓 Game logic module not ready for character unlock - please try again');
            if (typeof showNotification === 'function') {
                showNotification('System ładuje się, spróbuj ponownie za chwilę', 'warning');
            }
        }
    }
    
    // Upgrade building
    function upgradeBuilding(buildingId) {
        const gameLogic = getGameLogic();
        if (gameLogic && gameLogic.upgradeBuilding) {
            gameLogic.upgradeBuilding(buildingId);
        } else {
            console.warn('🏗️ Game logic module not ready for building upgrade - please try again');
            if (typeof showNotification === 'function') {
                showNotification('System ładuje się, spróbuj ponownie za chwilę', 'warning');
            }
        }
    }
    
    // Level up character
    function levelCharacter(characterId) {
        if (!gameData || !gameData.characters[characterId]) {
            console.warn('Character not found:', characterId);
            return;
        }
        
        const character = gameData.characters[characterId];
        if (!character.unlocked) {
            showNotification('Postać nie jest odblokowana', 'error');
            return;
        }
        
        const upgradeCost = window.gameUtils ? window.gameUtils.calculateUpgradeCost(character) : 0;
        if (gameData.lustPoints < upgradeCost) {
            showNotification('Nie masz wystarczająco Pożądania', 'error');
            return;
        }
        
        // Deduct cost and level up
        gameData.lustPoints -= upgradeCost;
        character.level++;
        
        // Play level up sound and animation
        const sound = domElements.get('crystalSound');
        if (sound && gameData.settings.sfxVolume > 0) {
            sound.volume = gameData.settings.sfxVolume;
            sound.play().catch(() => {});
        }
        
        // Update displays
        updateAll();
        
        showNotification(`${character.name} osiągnęła poziom ${character.level}!`, 'success', 2000);
        
        console.log(`${character.name} leveled up to ${character.level} for ${upgradeCost} LP`);
    }
    
    // Launch story interaction (Randka)
    function launchRandka(characterId) {
        if (!gameData || !gameData.characters[characterId]) {
            console.warn('Character not found:', characterId);
            return;
        }
        
        const character = gameData.characters[characterId];
        if (!character.unlocked) {
            showNotification('Postać nie jest odblokowana', 'error');
            return;
        }
        
        // Use centralized progress calculation to check if story event is available
        const progressData = calculateCharacterProgress(character);
        
        if (progressData.nextThreshold === null || progressData.currentBond < progressData.nextThreshold) {
            showNotification('Potrzebujesz więcej punktów więzi', 'warning');
            return;
        }
        
        // Try to get story system
        const storySystem = window.gameModules?.getModule('story') || window.storySystem;
        if (storySystem && storySystem.startStoryEvent) {
            const storyEvent = character.storyEvents ? character.storyEvents[character.storyProgress] : null;
            if (storyEvent) {
                storySystem.startStoryEvent(storyEvent);
            } else {
                showNotification('Brak dostępnej historii', 'info');
            }
        } else {
            console.warn('Story system not available');
            showNotification('System historii nie jest dostępny', 'error');
        }
    }
    
    // Show shared interactions
    function showSharedInteractions(characterId) {
        if (!gameData || !gameData.characters[characterId]) {
            console.warn('Character not found:', characterId);
            return;
        }
        
        const character = gameData.characters[characterId];
        showNotification(`Wspólne interakcje dla ${character.name} będą dostępne wkrótce`, 'info');
        
        // TODO: Implement shared interactions system
        console.log('Shared interactions for:', character.name);
    }
    
    // Set exclusive character (only this character gets bond points)
    function setExclusiveCharacter(characterId) {
        if (!gameData || !gameData.characters[characterId]) {
            console.warn('Character not found:', characterId);
            return;
        }
        
        const character = gameData.characters[characterId];
        if (!character.unlocked) {
            showNotification('Postać nie jest odblokowana', 'error');
            return;
        }
        
        // Set as active character
        gameData.activeCharacterId = characterId;
        
        // Set exclusive bond point flag
        gameData.exclusiveBondCharacter = characterId;
        
        updateActiveCharacter();
        renderCharactersList(); // Refresh to update active state
        
        showNotification(`${character.name} jest teraz twoją wyłączną towarzyszką`, 'success');
        
        console.log(`Set exclusive character: ${character.name}`);
    }
    
    // Update top status bar
    function updateStatusBar() {
        if (!gameData || !domElements) return;
        
        try {
            // Count unlocked characters
            const unlockedGirls = Object.values(gameData.characters || {}).filter(c => c.unlocked).length;
            domElements.setContent('girlsCount', unlockedGirls.toString());
            
            // Current active character
            const activeCharacter = gameData.characters && gameData.activeCharacterId 
                ? gameData.characters[gameData.activeCharacterId] 
                : null;
            const activeGirlName = activeCharacter && activeCharacter.unlocked 
                ? activeCharacter.name 
                : 'Brak';
            domElements.setContent('activeGirlName', activeGirlName);
            
            // Resources
            const formatNumber = window.gameUtils?.formatNumber || ((n) => n.toString());
            domElements.setContent('lustAmount', formatNumber(gameData.lustPoints || 0));
            domElements.setContent('sparksAmount', formatNumber(gameData.sparks || 0));
            domElements.setContent('essenceAmount', formatNumber(gameData.sanctuaryEssence || 0));
            domElements.setContent('goldAmount', formatNumber(gameData.goldCoins || 0));
            
        } catch (error) {
            console.warn('Error updating status bar:', error);
        }
    }
    
    // Update all UI elements
    function updateAll() {
        const now = Date.now();
        
        // Always update character values for progress bars to work (no throttling)
        updateCharacterValues();
        
        // Throttle other updates
        if (now - uiState.lastUpdate < uiState.updateInterval) {
            return;
        }
        
        uiState.lastUpdate = now;
        
        updateGameStats();
        updateActiveCharacter();
        updateStatusBar();
        
        // Only update buildings if buildings tab is active
        if (uiState.rightPanelTab === 'buildings') {
            updateBuildingValues();
        }
    }
    
    // Initialize UI
    function initialize() {
        if (!domElements) {
            console.error('DOM elements not available for UI initialization');
            return false;
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Initial render
        switchRightPanelTab('characters');
        updateAll();
        
        // Hide loading screen with better feedback
        setTimeout(() => {
            console.log('🎯 Hiding loading screen...');
            if (domElements && domElements.hide('loadingScreen')) {
                console.log('✅ Loading screen hidden successfully');
            } else {
                console.error('❌ Could not hide loading screen');
                // Force hide with direct DOM manipulation
                const loadingEl = document.getElementById('loading-screen');
                if (loadingEl) {
                    loadingEl.style.display = 'none';
                    console.log('✅ Loading screen hidden via direct DOM');
                }
            }
        }, 1000);
        
        console.log('UI System initialized successfully');
        return true;
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Character click
        domElements.on('characterClickArea', 'click', handleCharacterClick);
        
        // Tab switching
        domElements.on('charactersTab', 'click', () => switchRightPanelTab('characters'));
        domElements.on('buildingsTab', 'click', () => switchRightPanelTab('buildings'));
        
        // Start game button
        domElements.on('startGameBtn', 'click', () => {
            const gameLogic = getGameLogic();
            if (gameLogic && gameLogic.startGame) {
                gameLogic.startGame();
            } else {
                console.warn('🎮 Game logic module not ready for start game - using fallback');
                // Fallback: basic game start
                if (gameData) {
                    gameData.gameStarted = true;
                    gameData.session.startTime = Date.now();
                    if (domElements) {
                        domElements.hide('welcomeScreen');
                    }
                }
            }
        });
    }
    
    // Module cleanup
    function cleanup() {
        // Clear animations
        uiState.animations.clear();
        
        // Clear notifications
        uiState.notifications = [];
        
        console.log('UI module cleanup complete');
    }
    
    // Public API
    return {
        // Core functions
        updateAll,
        updateGameStats,
        updateActiveCharacter,
        updateStatusBar,
        
        // Rendering
        renderCharactersList,
        renderBuildingsList,
        updateCharacterValues,
        updateBuildingValues,
        
        // UI interactions
        showNotification,
        switchRightPanelTab,
        setActiveCharacter,
        handleCharacterClick,
        
        // Character actions
        levelCharacter,
        launchRandka,
        showSharedInteractions,
        setExclusiveCharacter,
        
        // Element management
        updateDisplay,
        createClickEffect,
        
        // Progress calculation
        calculateCharacterProgress,
        
        // State
        getState: () => ({ ...uiState }),
        
        // Module lifecycle
        initialize,
        cleanup,
        
        // Utilities
        formatNumber: gameUtils?.formatNumber || ((n) => n.toString()),
        formatTime: gameUtils?.formatTime || ((n) => n.toString())
    };
}

// Register UI module with validation
if (window.gameModules && typeof window.gameModules.registerModule === 'function') {
    console.log('🔧 Registering UI module with module manager...');
    try {
        window.gameModules.registerModule('ui', createUIModule, ['domElements']);
        console.log('✅ UI module registration complete');
    } catch (error) {
        console.error('❌ Failed to register UI module:', error);
        console.log('🔄 Falling back to direct UI module creation...');
        window.ui = createUIModule({ domElements: window.domElements });
    }
    
    // Test module access immediately after registration
    setTimeout(() => {
        try {
            const testUI = window.gameModules.getModule('ui');
            if (testUI) {
                console.log('✅ UI module successfully registered and accessible');
            } else {
                console.warn('⚠️ UI module registered but not accessible');
            }
        } catch (error) {
            console.error('❌ Error testing UI module after registration:', error);
        }
    }, 100);
} else {
    console.error('❌ gameModules not available, creating UI module directly (FALLBACK PATH)');
    // Fallback: create UI module directly
    window.ui = createUIModule({ domElements: window.domElements });
    console.log('⚠️ UI module created via fallback path without moduleManager');
}

// Global UI functions for HTML event handlers
window.showCharactersTab = () => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui) ui.switchRightPanelTab('characters');
};

window.showBuildingsTab = () => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui) ui.switchRightPanelTab('buildings');
};

window.handleCharacterClick = () => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui) ui.handleCharacterClick();
};

window.showNotification = (message, type, duration) => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui) ui.showNotification(message, type, duration);
};

window.updateAllUI = () => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui) ui.updateAll();
};

// Character action global functions
window.levelCharacter = (characterId) => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.levelCharacter) ui.levelCharacter(characterId);
};

window.launchRandka = (characterId) => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.launchRandka) ui.launchRandka(characterId);
};

window.showSharedInteractions = (characterId) => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.showSharedInteractions) ui.showSharedInteractions(characterId);
};

window.setExclusiveCharacter = (characterId) => {
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.setExclusiveCharacter) ui.setExclusiveCharacter(characterId);
};

window.unlockCharacterClick = (characterId) => {
    console.log(`Unlock button clicked for ${characterId}`);
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.unlockCharacter) {
        console.log(`Using UI module unlock for ${characterId}`);
        ui.unlockCharacter(characterId);
    } else {
        // Fallback to global unlockCharacter function
        if (window.unlockCharacter) {
            console.log(`Using global unlock function for ${characterId}`);
            window.unlockCharacter(characterId);
        } else {
            console.error(`No unlock function available for ${characterId}`);
        }
    }
};

window.upgradeBuildingClick = (buildingId) => {
    console.log(`Building upgrade button clicked for ${buildingId}`);
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.upgradeBuilding) {
        console.log(`Using UI module upgrade for ${buildingId}`);
        ui.upgradeBuilding(buildingId);
    } else {
        // Fallback to global upgradeBuilding function
        if (window.upgradeBuilding) {
            console.log(`Using global upgrade function for ${buildingId}`);
            window.upgradeBuilding(buildingId);
        } else {
            console.error(`No upgrade function available for ${buildingId}`);
        }
    }
};

// Debug functions for status bar buttons
window.addMillionLP = () => {
    if (!gameData) {
        console.error('gameData not available');
        return;
    }
    
    gameData.lustPoints = (gameData.lustPoints || 0) + 1000000;
    console.log('Added 1,000,000 Lust Points');
    
    // Update UI immediately
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.updateAll) {
        ui.updateAll();
    }
    
    // Show notification
    if (window.showNotification) {
        window.showNotification('Dodano 1,000,000 Pożądania!', 'success');
    }
};

window.maxBondToThreshold = () => {
    if (!gameData || !gameData.activeCharacterId) {
        console.error('No active character selected');
        if (window.showNotification) {
            window.showNotification('Brak aktywnej postaci', 'error');
        }
        return;
    }
    
    const character = gameData.characters[gameData.activeCharacterId];
    if (!character || !character.unlocked) {
        console.error('Active character not found or not unlocked');
        if (window.showNotification) {
            window.showNotification('Postać nie jest odblokowana', 'error');
        }
        return;
    }
    
    // Use centralized progress calculation to get next threshold
    const progressData = window.gameModules?.getModule('ui')?.calculateCharacterProgress 
        ? window.gameModules.getModule('ui').calculateCharacterProgress(character)
        : { nextThreshold: null, isComplete: false };
    
    if (progressData.nextThreshold === null || progressData.isComplete) {
        if (window.showNotification) {
            window.showNotification('Brak następnego progu więzi', 'warning');
        }
        return;
    }
    
    character.bondPoints = progressData.nextThreshold;
    console.log(`Set ${character.name} bond points to ${progressData.nextThreshold}`);
    
    // Update UI immediately
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.updateAll) {
        ui.updateAll();
    }
    
    if (window.showNotification) {
        window.showNotification(`${character.name} ma teraz ${progressData.nextThreshold} BP`, 'success');
    }
};

window.maxAllForTesting = () => {
    if (!gameData) {
        console.error('gameData not available');
        return;
    }
    
    console.log('🔧 Maximizing all characters and buildings for testing...');
    
    // Max all character levels and bond points without triggering story events
    Object.values(gameData.characters || {}).forEach(character => {
        if (character.unlocked) {
            character.level = 100;
            // Set bond points to just before final threshold to avoid story triggers
            if (character.storyThresholds && character.storyThresholds.length > 0) {
                const finalThreshold = character.storyThresholds[character.storyThresholds.length - 1];
                character.bondPoints = finalThreshold - 1; // Just before final threshold
            } else {
                character.bondPoints = 9999; // High value if no thresholds
            }
            console.log(`✅ Maxed ${character.name}: Level 100, ${character.bondPoints} BP`);
        }
    });
    
    // Max all building levels
    Object.values(gameData.manor || {}).forEach(building => {
        building.level = building.maxLevel || 10;
        building.unlocked = true;
        console.log(`✅ Maxed ${building.name}: Level ${building.level}`);
    });
    
    // Give plenty of resources
    gameData.lustPoints = 100000000; // 100 million LP
    gameData.sanctuaryEssence = 10000;
    gameData.sparks = 5000;
    gameData.goldCoins = 50000;
    
    console.log('✅ All characters and buildings maxed for testing!');
    
    // Update UI immediately
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.updateAll) {
        ui.updateAll();
    }
    
    if (window.showNotification) {
        window.showNotification('Wszystko zmaksowane do testów!', 'success', 3000);
    }
};

window.unlockMomoArena = () => {
    if (!gameData) {
        console.error('gameData not available');
        return;
    }
    
    console.log('🎮 Force unlocking Momo arena...');
    
    // Ensure minigames structure exists
    if (!gameData.minigames) {
        gameData.minigames = {};
    }
    
    // Force unlock arena with complete initialization
    gameData.minigames.arena = {
        unlocked: true,
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
    
    console.log('✅ Arena unlocked and initialized successfully!');
    
    // Update UI immediately
    const ui = window.gameModules?.getModule('ui') || window.ui;
    if (ui && ui.updateAll) {
        ui.updateAll();
    }
    
    // Show notification
    if (window.showNotification) {
        window.showNotification('🎮 Arena Momo odblokowana!', 'success', 3000);
    }
};

window.resetGameProgress = () => {
    if (!confirm('Czy na pewno chcesz zresetować postęp gry? Ta akcja jest nieodwracalna!')) {
        return;
    }
    
    if (!confirm('OSTATNIE OSTRZEŻENIE: Wszystkie dane zostaną utracone. Kontynuować?')) {
        return;
    }
    
    console.log('🔄 Resetting game progress...');
    
    try {
        // Stop game loop to prevent interference
        if (window.gameState && window.gameState.gameLoop) {
            cancelAnimationFrame(window.gameState.gameLoop);
            window.gameState.running = false;
            window.gameState.initialized = false;
        }
        
        // Clear localStorage completely (using correct key names from state-manager.js)
        try {
            // Clear main save file (state-manager.js uses 'wszystkie_moje_potwory_save')
            localStorage.removeItem('wszystkie_moje_potwory_save');
            
            // Clear all backup files (pattern: 'wszystkie_moje_potwory_backup_timestamp')
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('wszystkie_moje_potwory_backup')) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all backup keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                console.log(`🗑️ Removed backup: ${key}`);
            });
            
            // Also clear any legacy keys (just in case)
            localStorage.removeItem('monsterGirlGame');
            
            console.log(`✅ localStorage cleared (${keysToRemove.length + 2} keys removed)`);
        } catch (error) {
            console.warn('⚠️ Error clearing localStorage:', error);
        }
        
        // Reset gameData to initial state
        if (window.gameData) {
            // Create a fresh copy of initial game data
            const initialData = {
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
                activeCharacterId: 'szafran',
                viewedCharacterId: null,
                exclusiveBondCharacter: null,
                
                // Characters Data - will be re-populated by character initialization
                characters: {},
                
                // Reset all other systems to their initial state
                manor: {
                    kitchen: { id: 'kitchen', name: 'Kuchnia', level: 0, maxLevel: 10, baseCost: 1000, costGrowth: 1.5, unlocked: false },
                    bathhouse: { id: 'bathhouse', name: 'Łaźnia', level: 0, maxLevel: 10, baseCost: 2500, costGrowth: 1.6, unlocked: false },
                    basement: { id: 'basement', name: 'Piwnica', level: 0, maxLevel: 15, baseCost: 5000, costGrowth: 1.7, unlocked: false },
                    library: { id: 'library', name: 'Biblioteka', level: 0, maxLevel: 8, baseCost: 15000, costGrowth: 1.8, unlocked: false },
                    garden: { id: 'garden', name: 'Ogród', level: 0, maxLevel: 5, baseCost: 3000, costGrowth: 2.0, unlocked: false }
                },
                
                mainQuest: { level: 0, thresholds: [0, 10, 25, 50, 100, 200, 400, 800, 1600, 3200, 6400], maxLevel: 10, unlockedFeatures: [] },
                
                minigames: {
                    garden: {
                        unlocked: false,
                        plots: Array(9).fill({ seed: null, growth: 0, plantedTime: null }),
                        seeds: { 'passion_flower': 5, 'love_herb': 3, 'essence_bloom': 1 }
                    },
                    arena: { unlocked: false }
                },
                
                settings: window.gameData.settings || { masterVolume: 0.7, musicVolume: 0.5, sfxVolume: 0.8, autoSave: true, language: 'pl' },
                
                ui: { rightPanelTab: 'characters', currentView: 'manor', modalOpen: false, currentModal: null, notifications: [] },
                
                statistics: { totalClicks: 0, totalLustGenerated: 0, totalEssenceGenerated: 0, charactersUnlocked: 1, storiesCompleted: 0, buildingsBuilt: 0, questsCompleted: 0, daysPlayed: 0, longestSession: 0 },
                
                story: { completedEvents: [], currentEvent: null, globalFlags: {}, eventHistory: [] },
                
                prestige: { level: 0, points: 0, upgrades: {}, unlocked: false },
                
                session: { startTime: Date.now(), clicksThisSession: 0, lustThisSession: 0, lastUpdate: Date.now(), selectedSeed: null, debugMode: false }
            };
            
            // Replace gameData with fresh initial data
            Object.keys(window.gameData).forEach(key => delete window.gameData[key]);
            Object.assign(window.gameData, initialData);
            
            console.log('✅ gameData reset to initial state');
        }
        
        if (window.showNotification) {
            window.showNotification('Resetowanie gry...', 'info', 2000);
        }
        
        // Reinitialize the game properly (WITHOUT auto-loading)
        setTimeout(async () => {
            console.log('🔄 Reinitializing game...');
            
            // Show loading screen
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
            }
            
            // Show welcome screen (reset should show welcome)
            const welcomeScreen = document.getElementById('welcome-screen');
            if (welcomeScreen) {
                welcomeScreen.style.display = 'flex';
            }
            
            // Reinitialize character data
            if (window.initializeCharacters) {
                window.initializeCharacters();
            }
            
            // Wait for character data to load
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // CRITICAL: Temporarily disable auto-loading to prevent restoring old data
            const stateManager = window.gameModules?.getModule('stateManager') || window.stateManager;
            let originalLoadGame = null;
            if (stateManager && stateManager.loadGame) {
                originalLoadGame = stateManager.loadGame;
                stateManager.loadGame = () => {
                    console.log('🚫 loadGame temporarily disabled during reset');
                    return false;
                };
            }
            
            // Reinitialize all modules (this won't auto-load now)
            if (window.gameModules && window.gameModules.initializeAll) {
                window.gameModules.initializeAll();
            }
            
            // Reinitialize UI
            const ui = window.gameModules?.getModule('ui') || window.ui;
            if (ui && ui.initialize) {
                ui.initialize();
            }
            
            // Create a custom initialization that skips loading
            if (window.gameState) {
                window.gameState.initialized = true;
                window.gameState.running = true;
                
                // Start fresh game loop
                if (window.gameCore && window.gameCore.startGameLoop) {
                    window.gameCore.startGameLoop();
                }
                
                // Setup auto-save for future saves
                if (window.gameCore && window.gameCore.setupAutoSave) {
                    window.gameCore.setupAutoSave();
                }
            }
            
            // Restore original loadGame function after reset is complete
            if (stateManager && originalLoadGame) {
                setTimeout(() => {
                    stateManager.loadGame = originalLoadGame;
                    console.log('✅ loadGame function restored');
                }, 1000);
            }
            
            console.log('✅ Game reset and reinitialization complete!');
            
            if (window.showNotification) {
                window.showNotification('Gra została zresetowana!', 'success', 3000);
            }
            
        }, 500);
        
    } catch (error) {
        console.error('❌ Error during game reset:', error);
        
        if (window.showNotification) {
            window.showNotification('Błąd podczas resetowania. Przeładowywanie strony...', 'error');
        }
        
        // Fallback to page reload if something goes wrong
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
};

console.log('UI System module loaded successfully');