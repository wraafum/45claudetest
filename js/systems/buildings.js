// Buildings Management System
// Wszystkie Moje Potwory

function createBuildingsModule(dependencies, moduleManager) {
    const { domElements, ui } = dependencies || {};
    
    // Building module state
    const buildingState = {
        currentBuildingTooltip: null,
        buildingTooltipTimer: null,
        buildingTooltipHideTimer: null
    };
    
    // Get game logic module reference
    function getGameLogic() {
        try {
            if (moduleManager && typeof moduleManager.getModule === 'function') {
                const gameLogic = moduleManager.getModule('gameLogic');
                if (gameLogic) return gameLogic;
            }
            return window.gameLogic || null;
        } catch (error) {
            console.warn('getGameLogic failed, using fallback:', error.message);
            return window.gameLogic || null;
        }
    }
    
    // Generate dynamic building effect text based on level and bonus type
    function getBuildingEffectText(building) {
        const currentLevel = building.level || 0;
        const effectLevel = currentLevel > 0 ? currentLevel : 1; // Show next level effect if not built yet
        
        switch (building.bonusType) {
            case 'lust_multiplier':
                const lustBonus = (building.bonusValue * effectLevel * 100).toFixed(0);
                return `Zwiększa pasywną generację pożądania o ${lustBonus}%`;
                
            case 'bond_multiplier':
                const bondBonus = (building.bonusValue * effectLevel * 100).toFixed(0);
                return `Zwiększa przyrost więzi o ${bondBonus}%`;
                
            case 'special_events':
                return '?';
                
            case 'essence_generation':
                const essenceAmount = (building.bonusValue * effectLevel).toFixed(1);
                return `Generuje ${essenceAmount} esencji na minutę`;
                
            case 'minigame_unlock':
                if (currentLevel === 0) {
                    return `Odblokowuje minigierę: ${building.bonusValue}`;
                } else {
                    return `Ulepsza ${building.bonusValue} (poziom ${currentLevel})`;
                }
                
            default:
                return 'Zapewnia bonusy dla dworu';
        }
    }

    // Generate unlock requirements text
    function getUnlockRequirementsText(building) {
        if (!building.unlockConditions || building.unlockConditions.length === 0) {
            return '';
        }
        
        const requirements = [];
        building.unlockConditions.forEach(condition => {
            if (condition.type === 'story') {
                const character = gameData.characters[condition.characterId];
                const characterName = character ? character.name : condition.characterId;
                
                // Try to find the story event to get a better description
                let eventDescription = `wydarzenie "${condition.eventId}"`;
                if (character && character.storyEvents) {
                    const eventIndex = character.storyEvents.findIndex(event => event.id === condition.eventId);
                    if (eventIndex !== -1) {
                        eventDescription = `${eventIndex + 1}. wydarzenie`;
                    }
                }
                
                requirements.push(`Ukończ ${eventDescription} z ${characterName}`);
            } else if (condition.type === 'building') {
                const reqBuilding = gameData.manor[condition.buildingId];
                const buildingName = reqBuilding ? reqBuilding.name : condition.buildingId;
                const level = condition.level || 1;
                requirements.push(`${buildingName} poziom ${level}`);
            } else if (condition.type === 'character') {
                const character = gameData.characters[condition.characterId];
                const characterName = character ? character.name : condition.characterId;
                if (condition.level) {
                    requirements.push(`${characterName} poziom ${condition.level}`);
                } else {
                    requirements.push(`Odblokuj ${characterName}`);
                }
            } else if (condition.type === 'quest') {
                const level = condition.level || 1;
                requirements.push(`Sanktuarium poziom ${level}`);
            }
        });
        
        return requirements.join(', ');
    }

    // Create building card element
    function createBuildingCard(building) {
        const cost = window.gameUtils ? window.gameUtils.calculateBuildingCost(building) : 0;
        const canAfford = gameData.lustPoints >= cost;
        const maxLevel = building.level >= building.maxLevel;
        
        // Check unlock conditions
        const gameLogic = getGameLogic();
        const hasSpecialConditions = building.unlockConditions && building.unlockConditions.length > 0;
        const unlockConditionsMet = gameLogic ? gameLogic.checkUnlockConditions(building) : true;
        
        // Building is considered unlocked if:
        // 1. It's explicitly unlocked, OR
        // 2. It has no special conditions (LP-only building)
        const isUnlocked = building.unlocked === true || !hasSpecialConditions;
        
        // Building is locked only if it has special conditions that aren't met
        const isLocked = hasSpecialConditions && !unlockConditionsMet;
        
        const canUpgrade = canAfford && !isLocked && !maxLevel;
        
        // Determine card styling based on building state
        let cardClass = 'building-panel-wide ';
        if (isLocked) {
            cardClass += 'locked building-locked';
        } else if (maxLevel) {
            cardClass += 'max-level';
        } else if (canUpgrade) {
            cardClass += 'unlocked';
        } else {
            cardClass += 'locked';
        }
        
        const card = domElements.createElement('div', {
            className: cardClass,
            attributes: { 'data-building-id': building.id }
        });
        
        // Set background image from building image
        if (building.image) {
            card.style.backgroundImage = `url('${building.image}')`;
        }
        
        // Name and description at top
        const name = domElements.createElement('div', {
            className: 'building-panel-name',
            textContent: building.name
        });
        
        const description = domElements.createElement('div', {
            className: 'building-panel-description',
            textContent: getBuildingEffectText(building)
        });
        description.style.fontSize = '0.85em'; // Smaller font for effect text
        description.style.fontStyle = 'italic'; // Italicize to distinguish from name
        
        // Bottom area - Stats and button
        const bottomArea = domElements.createElement('div', {
            className: 'building-panel-bottom'
        });
        
        // Stats line
        const stats = domElements.createElement('div', {
            className: 'building-panel-stats'
        });
        
        if (isLocked) {
            const unlockText = getUnlockRequirementsText(building);
            const costText = cost > 0 ? `Koszt: ${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost} LP` : '';
            
            let displayText = '';
            if (unlockText && costText) {
                displayText = `${unlockText} | ${costText}`;
            } else if (unlockText) {
                displayText = unlockText;
            } else if (costText) {
                displayText = costText;
            } else {
                displayText = 'ZABLOKOWANY';
            }
            
            stats.innerHTML = `
                <span>Poziom: ${building.level}/${building.maxLevel}</span>
                <span class="text-red-400" style="font-size: 0.9em;">${displayText}</span>
            `;
        } else if (maxLevel) {
            stats.innerHTML = `
                <span class="text-yellow-400">Poziom: ${building.level}/${building.maxLevel}</span>
                <span class="text-yellow-400">MAKSYMALNY</span>
            `;
        } else {
            stats.innerHTML = `
                <span>Poziom: ${building.level}/${building.maxLevel}</span>
                <span class="${canAfford ? 'text-green-400' : 'text-red-400'}">
                    Koszt: ${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost} LP
                </span>
            `;
        }
        
        // Button
        const buttonContainer = domElements.createElement('div', {
            className: 'building-panel-button'
        });
        
        if (isLocked) {
            const unlockText = getUnlockRequirementsText(building);
            const buttonText = unlockText ? unlockText : 'ZABLOKOWANY';
            
            const lockedBtn = domElements.createElement('button', {
                className: 'building-btn btn-disabled',
                textContent: buttonText,
                attributes: { 'data-building-id': building.id }
            });
            lockedBtn.disabled = true;
            lockedBtn.style.fontSize = '0.85em'; // Smaller font for longer text
            buttonContainer.appendChild(lockedBtn);
        } else if (maxLevel) {
            const maxBtn = domElements.createElement('button', {
                className: 'building-btn max-level-btn',
                textContent: 'MAKSYMALNY POZIOM',
                attributes: { 'data-building-id': building.id }
            });
            maxBtn.disabled = true;
            buttonContainer.appendChild(maxBtn);
        } else {
            const upgradeBtn = domElements.createElement('button', {
                className: `building-btn upgrade-btn ${!canAfford ? 'btn-disabled' : ''}`,
                textContent: `Ulepsz! (${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost})`,
                attributes: { 
                    'data-building-id': building.id,
                    'onclick': `upgradeBuildingClick('${building.id}')`
                }
            });
            
            if (!canAfford) {
                upgradeBtn.disabled = true;
            }
            
            buttonContainer.appendChild(upgradeBtn);
        }
        
        // Add tooltip functionality
        if (building.tooltip) {
            card.addEventListener('mouseenter', (event) => {
                showBuildingTooltip(event, building);
            });
            
            card.addEventListener('mouseleave', () => {
                delayedHideBuildingTooltip();
            });
        }
        
        // Make card clickable for feedback only (no upgrade to prevent double-triggering)
        if (!canUpgrade && !maxLevel) {
            card.addEventListener('click', (event) => {
                // Only show error if click wasn't on the button itself
                if (!event.target.classList.contains('building-btn')) {
                    console.log(`Cannot upgrade ${building.name}, showing error message`);
                    const ui = window.gameModules?.getModule('ui') || window.ui;
                    if (ui && ui.showNotification) {
                        if (isLocked) {
                            ui.showNotification('Wymagania nie zostały spełnione', 'error');
                        } else if (!canAfford) {
                            ui.showNotification('Nie masz wystarczająco Pożądania', 'error');
                        }
                    }
                }
            });
        }
        
        bottomArea.appendChild(stats);
        bottomArea.appendChild(buttonContainer);
        
        // Append elements to card
        card.appendChild(name);
        card.appendChild(description);
        card.appendChild(bottomArea);
        
        return card;
    }
    
    // Building Tooltip System
    function showBuildingTooltip(event, building) {
        // Clear any existing timers
        if (buildingState.buildingTooltipTimer) {
            clearTimeout(buildingState.buildingTooltipTimer);
            buildingState.buildingTooltipTimer = null;
        }
        if (buildingState.buildingTooltipHideTimer) {
            clearTimeout(buildingState.buildingTooltipHideTimer);
            buildingState.buildingTooltipHideTimer = null;
        }
        
        // If tooltip already exists for same building, don't recreate
        if (buildingState.currentBuildingTooltip && buildingState.currentBuildingTooltip.dataset.buildingId === building.id) {
            return;
        }
        
        clearBuildingTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'building-tooltip';
        tooltip.dataset.buildingId = building.id;
        
        let content = `<div class="building-tooltip-header">${building.name}</div>`;
        content += `<div class="building-tooltip-description">${building.tooltip}</div>`;
        
        // Add effect description
        let effectText = '';
        if (building.bonusType === 'lust_multiplier') {
            effectText = `+${(building.bonusValue * 100).toFixed(0)}% produkcji Pożądania za poziom`;
        } else if (building.bonusType === 'bond_multiplier') {
            effectText = `+${(building.bonusValue * 100).toFixed(0)}% przyrostu Więzi za poziom`;
        } else if (building.bonusType === 'essence_generation') {
            effectText = `+${building.bonusValue} Esencji na minutę za poziom`;
        } else if (building.bonusType === 'special_events') {
            effectText = `+${(building.bonusValue * 100).toFixed(0)}% szans na specjalne wydarzenia za poziom`;
        } else if (building.bonusType === 'minigame_unlock') {
            effectText = `Odblokowuje minigierę: ${building.bonusValue}`;
        }
        
        if (effectText) {
            content += `<div class="building-tooltip-effect">Efekt: ${effectText}</div>`;
        }
        
        // Add unlock conditions if building is locked
        if (!building.unlocked && building.unlockConditions) {
            const gameLogic = getGameLogic();
            if (gameLogic && gameLogic.checkUnlockConditions) {
                const conditionsMet = gameLogic.checkUnlockConditions(building);
                if (!conditionsMet) {
                    let unlockText = 'Wymagania: ';
                    building.unlockConditions.forEach((condition, index) => {
                        if (index > 0) unlockText += ', ';
                        if (condition.type === 'story') {
                            const character = gameData.characters[condition.characterId];
                            const characterName = character ? character.name : condition.characterId;
                            unlockText += `Ukończ historię "${condition.eventId}" z ${characterName}`;
                        }
                    });
                    content += `<div class="building-tooltip-unlock">${unlockText}</div>`;
                }
            }
        }
        
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        let top = rect.top - tooltipHeight - 10;
        
        // Ensure tooltip stays within viewport
        if (left < 0) left = 5;
        if (left + tooltipWidth > window.innerWidth) left = window.innerWidth - tooltipWidth - 5;
        if (top < 0) top = rect.bottom + 10;
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        // Add hover events to tooltip itself
        tooltip.addEventListener('mouseenter', () => {
            if (buildingState.buildingTooltipHideTimer) {
                clearTimeout(buildingState.buildingTooltipHideTimer);
                buildingState.buildingTooltipHideTimer = null;
            }
        });
        
        tooltip.addEventListener('mouseleave', () => {
            delayedHideBuildingTooltip();
        });
        
        // Show tooltip with small delay
        buildingState.buildingTooltipTimer = setTimeout(() => {
            tooltip.classList.add('show');
            buildingState.buildingTooltipTimer = null;
        }, 150);
        
        buildingState.currentBuildingTooltip = tooltip;
    }
    
    function clearBuildingTooltip() {
        if (buildingState.buildingTooltipTimer) {
            clearTimeout(buildingState.buildingTooltipTimer);
            buildingState.buildingTooltipTimer = null;
        }
        
        if (buildingState.buildingTooltipHideTimer) {
            clearTimeout(buildingState.buildingTooltipHideTimer);
            buildingState.buildingTooltipHideTimer = null;
        }
        
        if (buildingState.currentBuildingTooltip) {
            buildingState.currentBuildingTooltip.remove();
            buildingState.currentBuildingTooltip = null;
        }
        
        // Clean up any orphaned tooltips
        const orphanedTooltips = document.querySelectorAll('.building-tooltip');
        orphanedTooltips.forEach(tooltip => tooltip.remove());
    }
    
    function delayedHideBuildingTooltip() {
        if (buildingState.buildingTooltipHideTimer) {
            clearTimeout(buildingState.buildingTooltipHideTimer);
        }
        
        buildingState.buildingTooltipHideTimer = setTimeout(() => {
            if (buildingState.currentBuildingTooltip) {
                buildingState.currentBuildingTooltip.remove();
                buildingState.currentBuildingTooltip = null;
            }
            buildingState.buildingTooltipHideTimer = null;
        }, 300); // 300ms delay before hiding
    }
    
    // Render buildings list
    function renderBuildingsList() {
        if (!gameData || !gameData.manor || !domElements) {
            console.warn('Missing dependencies for renderBuildingsList:', {
                gameData: !!gameData,
                manor: !!gameData?.manor,
                domElements: !!domElements
            });
            return;
        }
        
        const container = domElements.get('buildingsList');
        if (!container) {
            console.warn('buildingsList container not found');
            return;
        }
        
        console.log('🏗️ Rendering buildings list...');
        container.innerHTML = '';
        
        // Show all buildings, regardless of unlock status
        Object.values(gameData.manor).forEach(building => {
            console.log(`Rendering building: ${building.name}, unlocked: ${building.unlocked}`);
            const buildingCard = createBuildingCard(building);
            container.appendChild(buildingCard);
        });
        
        console.log(`✅ Rendered ${Object.keys(gameData.manor).length} buildings`);
    }
    
    // Update building values without recreating DOM
    function updateBuildingValues() {
        if (!gameData || !gameData.manor) return;
        
        // Only update if buildings exist in DOM
        const container = domElements.get('buildingsList');
        if (!container) return;
        
        Object.values(gameData.manor).forEach(building => {
            const buildingElement = container.querySelector(`[data-building-id="${building.id}"]`);
            if (!buildingElement) return;
            
            const cost = window.gameUtils ? window.gameUtils.calculateBuildingCost(building) : 0;
            const canAfford = gameData.lustPoints >= cost;
            const maxLevel = building.level >= building.maxLevel;
            const gameLogic = getGameLogic();
            const hasSpecialConditions = building.unlockConditions && building.unlockConditions.length > 0;
            const unlockConditionsMet = gameLogic ? gameLogic.checkUnlockConditions(building) : true;
            
            // Building is considered unlocked if:
            // 1. It's explicitly unlocked, OR
            // 2. It has no special conditions (LP-only building)
            const isUnlocked = building.unlocked === true || !hasSpecialConditions;
            
            // Building is locked only if it has special conditions that aren't met
            const isLocked = hasSpecialConditions && !unlockConditionsMet;
            
            // Update stats
            const statsElement = buildingElement.querySelector('.building-panel-stats');
            if (statsElement) {
                if (isLocked) {
                    const unlockText = getUnlockRequirementsText(building);
                    const costText = cost > 0 ? `Koszt: ${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost} LP` : '';
                    
                    let displayText = '';
                    if (unlockText && costText) {
                        displayText = `${unlockText} | ${costText}`;
                    } else if (unlockText) {
                        displayText = unlockText;
                    } else if (costText) {
                        displayText = costText;
                    } else {
                        displayText = 'ZABLOKOWANY';
                    }
                    
                    statsElement.innerHTML = `
                        <span>Poziom: ${building.level}/${building.maxLevel}</span>
                        <span class="text-red-400" style="font-size: 0.9em;">${displayText}</span>
                    `;
                } else if (maxLevel) {
                    statsElement.innerHTML = `
                        <span class="text-yellow-400">Poziom: ${building.level}/${building.maxLevel}</span>
                        <span class="text-yellow-400">MAKSYMALNY</span>
                    `;
                } else {
                    statsElement.innerHTML = `
                        <span>Poziom: ${building.level}/${building.maxLevel}</span>
                        <span class="${canAfford ? 'text-green-400' : 'text-red-400'}">
                            Koszt: ${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost} LP
                        </span>
                    `;
                }
            }
            
            // Update description with current effect
            const descriptionElement = buildingElement.querySelector('.building-panel-description');
            if (descriptionElement) {
                descriptionElement.textContent = getBuildingEffectText(building);
            }
            
            // Update button
            const button = buildingElement.querySelector('.building-btn');
            if (button) {
                if (isLocked) {
                    const unlockText = getUnlockRequirementsText(building);
                    const buttonText = unlockText ? unlockText : 'ZABLOKOWANY';
                    
                    button.textContent = buttonText;
                    button.className = 'building-btn btn-disabled';
                    button.disabled = true;
                    button.style.fontSize = '0.85em'; // Smaller font for longer text
                } else if (maxLevel) {
                    button.textContent = 'MAKSYMALNY POZIOM';
                    button.className = 'building-btn max-level-btn';
                    button.disabled = true;
                } else {
                    button.textContent = `Ulepsz! (${window.gameUtils ? window.gameUtils.formatNumber(cost) : cost})`;
                    button.className = `building-btn upgrade-btn ${!canAfford ? 'btn-disabled' : ''}`;
                    button.disabled = !canAfford;
                }
            }
            
            // Update card styling
            let cardClass = 'building-panel-wide ';
            if (isLocked) {
                cardClass += 'locked building-locked';
            } else if (maxLevel) {
                cardClass += 'max-level';
            } else if (canAfford && !isLocked) {
                cardClass += 'unlocked';
            } else {
                cardClass += 'locked';
            }
            buildingElement.className = cardClass;
        });
    }
    
    // Upgrade building with unlock condition validation
    function upgradeBuilding(buildingId) {
        if (!gameData || !gameData.manor[buildingId]) return false;
        
        const building = gameData.manor[buildingId];
        if (building.level >= building.maxLevel) {
            const ui = window.gameModules?.getModule('ui') || window.ui;
            if (ui && ui.showNotification) {
                ui.showNotification('Budynek osiągnął maksymalny poziom', 'error');
            }
            return false;
        }
        
        // Check if building is locked by special conditions
        const gameLogic = getGameLogic();
        const hasSpecialConditions = building.unlockConditions && building.unlockConditions.length > 0;
        const unlockConditionsMet = gameLogic ? gameLogic.checkUnlockConditions(building) : true;
        const isLocked = hasSpecialConditions && !unlockConditionsMet;
        
        if (isLocked) {
            const ui = window.gameModules?.getModule('ui') || window.ui;
            if (ui && ui.showNotification) {
                ui.showNotification('Wymagania nie zostały spełnione', 'error');
            }
            return false;
        }
        
        // Use game logic to handle the upgrade
        if (gameLogic && gameLogic.upgradeBuilding) {
            return gameLogic.upgradeBuilding(buildingId);
        }
        
        return false;
    }
    
    // Display manor map
    function displayManorMap() {
        console.log('Displaying manor buildings');
        renderBuildingsList();
        return true;
    }
    
    // Initialize building module
    function initialize() {
        console.log('Buildings module initialized');
        return true;
    }
    
    // Cleanup
    function cleanup() {
        clearBuildingTooltip();
        console.log('Buildings module cleanup complete');
    }
    
    // Return module interface
    return {
        // Rendering
        renderBuildingsList,
        updateBuildingValues,
        createBuildingCard,
        
        // Building operations
        upgradeBuilding,
        displayManorMap,
        
        // Tooltip system
        showBuildingTooltip,
        clearBuildingTooltip,
        delayedHideBuildingTooltip,
        
        // Module lifecycle
        initialize,
        cleanup
    };
}

// Register module
if (window.gameModules) {
    window.gameModules.registerModule('buildings', createBuildingsModule, ['domElements']);
    console.log('✅ Buildings module registration complete');
    
    // Test module retrieval immediately after registration
    setTimeout(() => {
        try {
            const testModule = window.gameModules.getModule('buildings');
            if (testModule && testModule.renderBuildingsList) {
                console.log('✅ Buildings module successfully registered and accessible');
            } else {
                console.warn('⚠️ Buildings module registered but renderBuildingsList method not found');
            }
        } catch (error) {
            console.error('❌ Error testing buildings module after registration:', error);
        }
    }, 100);
} else {
    console.error('❌ gameModules not available for buildings module');
}

// Global fallback functions for HTML event handlers
window.upgradeBuildingClick = function(buildingId) {
    const buildings = window.gameModules?.getModule('buildings');
    if (buildings) return buildings.upgradeBuilding(buildingId);
    return false;
};

console.log('Buildings module loaded');