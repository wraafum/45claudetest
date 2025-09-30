// Passive Tree System - Character Skill Trees and Progression
// Wszystkie Moje Potwory

// Passive Tree Module Factory
function createPassiveTreeModule(dependencies, moduleManager) {
    const { domElements, ui, character } = dependencies || {};
    
    // Tree state
    const treeState = {
        currentCharacter: null,
        selectedNode: null,
        hoveredNode: null,
        previewMode: false
    };
    
    // Passive tree definitions
    const passiveTrees = {
        // Universal tree available to all characters
        universal: {
            name: 'Uniwersalne Umiejętności',
            description: 'Umiejętności dostępne dla wszystkich postaci',
            costType: 'experience',
            nodes: {
                'efficiency_1': {
                    id: 'efficiency_1',
                    name: 'Wydajność I',
                    description: 'Zwiększa produkcję wszystkich postaci o 10%',
                    type: 'production_multiplier',
                    value: 1.1,
                    cost: 10,
                    maxLevel: 1,
                    requirements: [],
                    position: { x: 2, y: 1 }
                },
                'bond_mastery_1': {
                    id: 'bond_mastery_1',
                    name: 'Mistrzostwo Więzi I',
                    description: 'Zwiększa zdobywanie więzi o 15%',
                    type: 'bond_multiplier',
                    value: 1.15,
                    cost: 15,
                    maxLevel: 1,
                    requirements: [],
                    position: { x: 1, y: 2 }
                },
                'lust_focus_1': {
                    id: 'lust_focus_1',
                    name: 'Skupienie Pożądania I',
                    description: 'Zwiększa wartość kliknięć o 20%',
                    type: 'click_multiplier',
                    value: 1.2,
                    cost: 12,
                    maxLevel: 1,
                    requirements: [],
                    position: { x: 3, y: 2 }
                },
                'efficiency_2': {
                    id: 'efficiency_2',
                    name: 'Wydajność II',
                    description: 'Dodatkowo zwiększa produkcję o 15%',
                    type: 'production_multiplier',
                    value: 1.15,
                    cost: 25,
                    maxLevel: 1,
                    requirements: ['efficiency_1'],
                    position: { x: 2, y: 3 }
                },
                'synergy': {
                    id: 'synergy',
                    name: 'Synergia',
                    description: 'Każda odblokowana postać zwiększa produkcję innych o 5%',
                    type: 'character_synergy',
                    value: 1.05,
                    cost: 50,
                    maxLevel: 1,
                    requirements: ['bond_mastery_1', 'lust_focus_1'],
                    position: { x: 2, y: 4 }
                }
            }
        },
        
        // Character-specific tree template
        character_specific: {
            name: 'Umiejętności Postaci',
            description: 'Unikalne umiejętności dla tej postaci',
            costType: 'bond_points',
            nodes: {
                'mastery_1': {
                    id: 'mastery_1',
                    name: 'Mistrzostwo I',
                    description: 'Zwiększa produkcję tej postaci o 25%',
                    type: 'personal_production',
                    value: 1.25,
                    cost: 100,
                    maxLevel: 3,
                    requirements: [],
                    position: { x: 2, y: 1 }
                },
                'charm': {
                    id: 'charm',
                    name: 'Urok',
                    description: 'Zmniejsza koszty ulepszania tej postaci o 10%',
                    type: 'cost_reduction',
                    value: 0.9,
                    cost: 150,
                    maxLevel: 2,
                    requirements: [],
                    position: { x: 1, y: 2 }
                },
                'passion': {
                    id: 'passion',
                    name: 'Namiętność',
                    description: 'Zwiększa zdobywanie więzi z tą postacią o 30%',
                    type: 'personal_bond',
                    value: 1.3,
                    cost: 120,
                    maxLevel: 2,
                    requirements: [],
                    position: { x: 3, y: 2 }
                },
                'mastery_2': {
                    id: 'mastery_2',
                    name: 'Mistrzostwo II',
                    description: 'Dodatkowo zwiększa produkcję o 40%',
                    type: 'personal_production',
                    value: 1.4,
                    cost: 300,
                    maxLevel: 1,
                    requirements: ['mastery_1'],
                    position: { x: 2, y: 3 }
                },
                'specialization': {
                    id: 'specialization',
                    name: 'Specjalizacja',
                    description: 'Odblokowuje unikalne zdolności postaci',
                    type: 'special_ability',
                    value: 'unlock',
                    cost: 500,
                    maxLevel: 1,
                    requirements: ['charm', 'passion'],
                    position: { x: 2, y: 4 }
                }
            }
        }
    };
    
    // Get character's passive tree data
    function getCharacterTreeData(characterId) {
        if (!gameData || !gameData.characters || !gameData.characters[characterId]) {
            return null;
        }
        
        const character = gameData.characters[characterId];
        
        // Initialize passive tree data if not exists
        if (!character.passiveTree) {
            character.passiveTree = {
                universal: {},
                character: {},
                spentPoints: { universal: 0, character: 0 },
                availablePoints: { 
                    universal: Math.floor(character.level / 2), // 1 point per 2 levels
                    character: Math.floor(character.bondPoints / 50) // 1 point per 50 bond
                }
            };
        }
        
        return character.passiveTree;
    }
    
    // Check if player can afford a passive node
    function canAffordNode(characterId, treeType, nodeId) {
        const treeData = getCharacterTreeData(characterId);
        const tree = treeType === 'universal' ? passiveTrees.universal : passiveTrees.character_specific;
        const node = tree.nodes[nodeId];
        
        if (!treeData || !node) return false;
        
        const currentLevel = treeData[treeType][nodeId] || 0;
        
        // Check max level
        if (currentLevel >= node.maxLevel) return false;
        
        // Check requirements
        for (const reqId of node.requirements) {
            if (!treeData[treeType][reqId] || treeData[treeType][reqId] < 1) {
                return false;
            }
        }
        
        // Check cost
        const pointType = treeType === 'universal' ? 'universal' : 'character';
        const cost = node.cost * (currentLevel + 1); // Scaling cost
        
        return treeData.availablePoints[pointType] >= cost;
    }
    
    // Purchase a passive node
    function purchaseNode(characterId, treeType, nodeId) {
        if (!canAffordNode(characterId, treeType, nodeId)) {
            return { success: false, reason: 'cannot_afford' };
        }
        
        const treeData = getCharacterTreeData(characterId);
        const tree = treeType === 'universal' ? passiveTrees.universal : passiveTrees.character_specific;
        const node = tree.nodes[nodeId];
        
        const currentLevel = treeData[treeType][nodeId] || 0;
        const cost = node.cost * (currentLevel + 1);
        const pointType = treeType === 'universal' ? 'universal' : 'character';
        
        // Deduct points
        treeData.availablePoints[pointType] -= cost;
        treeData.spentPoints[pointType] += cost;
        
        // Increase node level
        treeData[treeType][nodeId] = currentLevel + 1;
        
        // Apply the passive effect
        applyPassiveEffect(characterId, node, currentLevel + 1);
        
        console.log(`🌳 Purchased ${node.name} level ${currentLevel + 1} for ${characterId}`);
        
        // Show notification
        if (window.showNotification) {
            window.showNotification(`${node.name} (Poziom ${currentLevel + 1}) zakupione!`, 'success', 3000);
        }
        
        return { 
            success: true, 
            nodeLevel: currentLevel + 1,
            cost,
            node 
        };
    }
    
    // Apply passive effect to character
    function applyPassiveEffect(characterId, node, level) {
        const character = gameData.characters[characterId];
        if (!character) return;
        
        // Initialize passive bonuses if not exists
        if (!character.passiveBonuses) {
            character.passiveBonuses = {};
        }
        
        const effectValue = calculateEffectValue(node, level);
        
        switch (node.type) {
            case 'production_multiplier':
                character.passiveBonuses.productionMultiplier = 
                    (character.passiveBonuses.productionMultiplier || 1) * effectValue;
                break;
                
            case 'personal_production':
                character.passiveBonuses.personalProduction = 
                    (character.passiveBonuses.personalProduction || 1) * effectValue;
                break;
                
            case 'bond_multiplier':
                character.passiveBonuses.bondMultiplier = 
                    (character.passiveBonuses.bondMultiplier || 1) * effectValue;
                break;
                
            case 'personal_bond':
                character.passiveBonuses.personalBond = 
                    (character.passiveBonuses.personalBond || 1) * effectValue;
                break;
                
            case 'click_multiplier':
                character.passiveBonuses.clickMultiplier = 
                    (character.passiveBonuses.clickMultiplier || 1) * effectValue;
                break;
                
            case 'cost_reduction':
                character.passiveBonuses.costReduction = 
                    (character.passiveBonuses.costReduction || 1) * effectValue;
                break;
                
            case 'character_synergy':
                // Global effect - calculate based on unlocked characters
                const unlockedCount = Object.values(gameData.characters).filter(c => c.unlocked).length;
                const synergyBonus = Math.pow(effectValue, unlockedCount - 1);
                
                // Apply to all characters
                Object.values(gameData.characters).forEach(char => {
                    if (char.unlocked) {
                        char.passiveBonuses = char.passiveBonuses || {};
                        char.passiveBonuses.synergyBonus = synergyBonus;
                    }
                });
                break;
                
            case 'special_ability':
                character.passiveBonuses.specialAbility = true;
                // Trigger character-specific special ability
                triggerSpecialAbility(characterId);
                break;
        }
        
        console.log(`🌳 Applied ${node.type} effect: ${effectValue} to ${characterId}`);
    }
    
    // Calculate effect value based on node and level
    function calculateEffectValue(node, level) {
        if (node.type === 'special_ability') {
            return node.value; // Special case
        }
        
        // For multiplicative effects
        if (node.type.includes('multiplier') || node.type.includes('reduction')) {
            return Math.pow(node.value, level);
        }
        
        // For additive effects
        return node.value * level;
    }
    
    // Trigger special abilities
    function triggerSpecialAbility(characterId) {
        const character = gameData.characters[characterId];
        if (!character) return;
        
        // Character-specific special abilities
        switch (characterId) {
            case 'szafran':
                // Garden efficiency boost
                if (gameData.minigames?.garden) {
                    gameData.minigames.garden.growthMultiplier = 
                        (gameData.minigames.garden.growthMultiplier || 1) * 1.5;
                }
                break;
                
            case 'alina':
                // Building cost reduction
                character.passiveBonuses.buildingCostReduction = 0.8;
                break;
                
            case 'bastet':
                // Luck boost for all activities
                character.passiveBonuses.luckBonus = 1.3;
                break;
                
            case 'momo':
                // Arena benefits
                if (gameData.minigames?.arena) {
                    gameData.minigames.arena.experienceMultiplier = 
                        (gameData.minigames.arena.experienceMultiplier || 1) * 1.4;
                }
                break;
                
            case 'furia':
                // Combat power boost
                character.passiveBonuses.combatPower = 2.0;
                break;
        }
        
        console.log(`🌟 Special ability activated for ${characterId}`);
    }
    
    // Display passive tree for a character
    function displayPassiveTree(characterId) {
        if (!domElements) return;
        
        const character = gameData.characters[characterId];
        const treeData = getCharacterTreeData(characterId);
        
        if (!character || !treeData) {
            console.warn(`Cannot display passive tree for ${characterId}`);
            return;
        }
        
        treeState.currentCharacter = characterId;
        
        const treeHTML = `
            <div class="passive-tree-view h-full flex flex-col">
                <!-- Tree Header -->
                <div class="tree-header bg-white/10 rounded-lg p-4 mb-4">
                    <h2 class="text-xl font-bold mb-2">🌳 Drzewo Umiejętności: ${character.name}</h2>
                    <div class="flex justify-between text-sm">
                        <div class="text-blue-300">
                            Uniwersalne: ${treeData.availablePoints.universal} punktów
                        </div>
                        <div class="text-purple-300">
                            Indywidualne: ${treeData.availablePoints.character} punktów
                        </div>
                    </div>
                </div>
                
                <!-- Tree Tabs -->
                <div class="tree-tabs mb-4">
                    <div class="flex space-x-2">
                        <button id="universal-tab" onclick="showTreeTab('universal')" 
                                class="tab-button active px-4 py-2 rounded-lg bg-blue-600/50">
                            Uniwersalne
                        </button>
                        <button id="character-tab" onclick="showTreeTab('character')" 
                                class="tab-button px-4 py-2 rounded-lg bg-purple-600/50">
                            ${character.name}
                        </button>
                    </div>
                </div>
                
                <!-- Universal Tree -->
                <div id="universal-tree" class="tree-content flex-1 bg-white/5 rounded-lg p-4">
                    ${renderTreeNodes('universal', treeData)}
                </div>
                
                <!-- Character Tree -->
                <div id="character-tree" class="tree-content flex-1 bg-white/5 rounded-lg p-4 hidden">
                    ${renderTreeNodes('character', treeData)}
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', treeHTML);
        domElements.setContent('centerPanelTitle', `Drzewo Umiejętności`);
    }
    
    // Render tree nodes
    function renderTreeNodes(treeType, treeData) {
        const tree = treeType === 'universal' ? passiveTrees.universal : passiveTrees.character_specific;
        const pointType = treeType === 'universal' ? 'universal' : 'character';
        
        let nodesHTML = `
            <div class="tree-grid relative" style="height: 400px;">
        `;
        
        // Render nodes
        for (const [nodeId, node] of Object.entries(tree.nodes)) {
            const currentLevel = treeData[treeType][nodeId] || 0;
            const canAfford = canAffordNode(treeState.currentCharacter, treeType, nodeId);
            const isMaxLevel = currentLevel >= node.maxLevel;
            const cost = node.cost * (currentLevel + 1);
            
            const nodeHTML = `
                <div class="tree-node absolute cursor-pointer" 
                     style="left: ${node.position.x * 80}px; top: ${node.position.y * 80}px;"
                     onclick="purchasePassiveNode('${treeType}', '${nodeId}')"
                     title="${node.description}">
                    <div class="node-circle w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold
                                ${isMaxLevel ? 'bg-yellow-500 border-yellow-400' : 
                                  currentLevel > 0 ? 'bg-green-500 border-green-400' : 
                                  canAfford ? 'bg-blue-500 border-blue-400 hover:bg-blue-400' : 
                                  'bg-gray-600 border-gray-500'}">
                        ${currentLevel}/${node.maxLevel}
                    </div>
                    <div class="node-label text-xs text-center mt-1 max-w-16">
                        ${node.name}
                    </div>
                    <div class="node-cost text-xs text-center text-gray-400">
                        ${!isMaxLevel ? cost + 'p' : 'MAX'}
                    </div>
                </div>
            `;
            
            nodesHTML += nodeHTML;
        }
        
        // Render connections between nodes
        for (const [nodeId, node] of Object.entries(tree.nodes)) {
            for (const reqId of node.requirements) {
                const reqNode = tree.nodes[reqId];
                if (reqNode) {
                    const currentLevel = treeData[treeType][nodeId] || 0;
                    const reqLevel = treeData[treeType][reqId] || 0;
                    
                    nodesHTML += `
                        <div class="connection absolute w-0.5 bg-gray-500" 
                             style="left: ${reqNode.position.x * 80 + 24}px; 
                                    top: ${reqNode.position.y * 80 + 48}px;
                                    height: ${(node.position.y - reqNode.position.y) * 80 - 48}px;
                                    ${reqLevel > 0 && currentLevel > 0 ? 'background-color: #10b981;' : ''}">
                        </div>
                    `;
                }
            }
        }
        
        nodesHTML += '</div>';
        return nodesHTML;
    }
    
    // Update available points for character
    function updateAvailablePoints(characterId) {
        const treeData = getCharacterTreeData(characterId);
        const character = gameData.characters[characterId];
        
        if (!treeData || !character) return;
        
        // Universal points based on level
        const universalPoints = Math.floor(character.level / 2);
        const characterPoints = Math.floor(character.bondPoints / 50);
        
        treeData.availablePoints.universal = universalPoints - treeData.spentPoints.universal;
        treeData.availablePoints.character = characterPoints - treeData.spentPoints.character;
    }
    
    // Initialize passive tree system
    function initialize() {
        console.log('🌳 Passive Tree system initialized');
        
        // Update available points for all characters
        if (gameData && gameData.characters) {
            for (const characterId of Object.keys(gameData.characters)) {
                updateAvailablePoints(characterId);
            }
        }
        
        return true;
    }
    
    // Public API
    return {
        initialize,
        getCharacterTreeData,
        canAffordNode,
        purchaseNode,
        displayPassiveTree,
        updateAvailablePoints,
        
        // For external access
        get trees() { return passiveTrees; },
        get currentCharacter() { return treeState.currentCharacter; },
        
        cleanup: function() {
            treeState.currentCharacter = null;
            treeState.selectedNode = null;
        }
    };
}

// Register the module
if (window.gameModules) {
    window.gameModules.registerModule('passiveTree', createPassiveTreeModule, ['domElements', 'ui', 'character']);
}

// Global functions for HTML event handlers
window.showPassiveTree = function(characterId) {
    const passiveTree = window.gameModules?.getModule('passiveTree');
    if (passiveTree) {
        passiveTree.displayPassiveTree(characterId);
    }
    
    // Update UI state
    if (gameData) {
        gameData.ui.currentView = 'passive_tree';
        gameData.viewedCharacterId = characterId;
    }
};

window.purchasePassiveNode = function(treeType, nodeId) {
    const passiveTree = window.gameModules?.getModule('passiveTree');
    if (passiveTree && passiveTree.currentCharacter) {
        const result = passiveTree.purchaseNode(passiveTree.currentCharacter, treeType, nodeId);
        
        if (result.success) {
            // Refresh the tree display
            passiveTree.displayPassiveTree(passiveTree.currentCharacter);
        }
        
        return result;
    }
};

window.showTreeTab = function(tabType) {
    // Hide all tree contents
    const universalTree = document.getElementById('universal-tree');
    const characterTree = document.getElementById('character-tree');
    const universalTab = document.getElementById('universal-tab');
    const characterTab = document.getElementById('character-tab');
    
    if (universalTree && characterTree && universalTab && characterTab) {
        universalTree.classList.add('hidden');
        characterTree.classList.add('hidden');
        universalTab.classList.remove('active');
        characterTab.classList.remove('active');
        
        if (tabType === 'universal') {
            universalTree.classList.remove('hidden');
            universalTab.classList.add('active');
        } else {
            characterTree.classList.remove('hidden');
            characterTab.classList.add('active');
        }
    }
};

console.log('🌳 Passive Tree module loaded');