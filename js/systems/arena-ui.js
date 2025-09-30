// Arena UI Management System
// Handles all UI rendering, tooltips, and display logic

// Create UI management module
window.ArenaUI = {
    createArenaUI: function() {
    // State management for tooltips and rendering
    let lastRenderTime = 0;
    let lastActivityTime = 0;
    let currentArenaTooltip = null;
    let tooltipTimer = null;
    let tooltipHideTimer = null;
    let currentSimpleTooltip = null;
    let simpleTooltipHideTimer = null;
    
    // Status management to prevent flickering
    let currentStatus = null;
    let statusUpdateTimer = null;
    let lastStatusUpdate = 0;
    
    // Tooltip setup management
    let tooltipsSetupComplete = false;
    let setupInProgress = false;
    
    // Render state management
    let isInitialSetup = false;
    let staticContentSetup = false;

    // === UI Functions ===
    
    function setupStaticContent() {
        const arena = gameData.minigames.arena;
        const statsContainer = document.getElementById('arena-stats-content');
        
        if (!statsContainer) return;
        
        // Create static structure with tooltip-enabled elements (set once)
        statsContainer.innerHTML = `
            <div class="space-y-2">
                <div><strong><span class="arena-stat-tooltip" data-stat="level">Poziom</span>:</strong> <span id="arena-level-value">${arena.level}</span></div>
                <div class="mt-2">
                    <strong><span class="arena-stat-tooltip" data-stat="experience">Doświadczenie</span>:</strong>
                    <div class="w-full bg-gray-300 rounded-full h-2.5 mt-1">
                        <div id="arena-exp-bar" class="h-2.5 rounded-full transition-all duration-300" 
                             style="width: 0%; background-color: #3b82f6"></div>
                    </div>
                    <div id="arena-exp-text" class="text-xs mt-1">0/100 EXP</div>
                </div>
                <div><strong><span class="arena-stat-tooltip" data-stat="status">Status</span>:</strong> <span id="arena-status-value">⚔️ Gotowa</span></div>
                <div><strong><span class="arena-stat-tooltip" data-stat="combat_power">Moc Bojowa</span>:</strong> <span id="arena-power-value">0</span></div>
                <div><strong><span class="arena-stat-tooltip" data-stat="gold">Złoto</span>:</strong> <span id="arena-gold-value">0</span></div>
                <div class="mt-4">
                    <strong><span class="arena-stat-tooltip" data-stat="hp">Kondycja</span>:</strong>
                    <div class="w-full bg-gray-300 rounded-full h-2.5 mt-1">
                        <div id="arena-hp-bar" class="h-2.5 rounded-full transition-all duration-300" 
                             style="width: 100%; background-color: #22c55e"></div>
                    </div>
                    <div id="arena-hp-text" class="text-xs mt-1">100/100 HP</div>
                </div>
                <div class="mt-4">
                    <strong><span class="arena-stat-tooltip" data-stat="statystyki_bojowe">Statystyki Bojowe</span>:</strong>
                    <div id="arena-skill-bars" class="text-sm space-y-2">
                        <!-- Skill bars will be updated here -->
                    </div>
                </div>
                <div class="mt-4">
                    <strong><span class="arena-stat-tooltip" data-stat="atuty_fizyczne">Atuty Fizyczne</span>:</strong>
                    <div class="text-sm">
                        <div><span class="arena-stat-tooltip" data-stat="cyce">Cyce</span>: <span id="arena-cyce-value">10/10 ⭐</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="dupa">Dupa</span>: <span id="arena-dupa-value">10/10 ⭐</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="cipka">Cipka</span>: <span id="arena-cipka-value">Dziewicza</span></div>
                    </div>
                </div>
                <div class="mt-4">
                    <strong><span class="arena-stat-tooltip" data-stat="detale_cipki">Detale Cipki</span>:</strong>
                    <div class="text-sm">
                        <div><span class="arena-stat-tooltip" data-stat="cipka_sensitivity">Wrażliwość</span>: <span id="arena-sensitivity-value">50%</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="cipka_wetness">Wilgotność</span>: <span id="arena-wetness-value">10%</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="cipka_corruption">Korupcja</span>: <span id="arena-corruption-value">0%</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="cipka_magic_resistance">Odporność Mag.</span>: <span id="arena-resistance-value">100%</span></div>
                    </div>
                </div>
                <div class="mt-4">
                    <strong><span class="arena-stat-tooltip" data-stat="rekord">Rekord</span>:</strong>
                    <div class="text-sm">
                        <div><span class="arena-stat-tooltip" data-stat="quests_completed">Questy</span>: <span id="arena-quests-value">0</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="total_deaths">Śmierci</span>: <span id="arena-deaths-value">0</span></div>
                        <div><span class="arena-stat-tooltip" data-stat="items_found">Przedmioty</span>: <span id="arena-items-value">0</span></div>
                    </div>
                </div>
                <div class="mt-4">
                    <strong><span class="arena-stat-tooltip" data-stat="ekwipunek">Ekwipunek</span>:</strong>
                    <div class="text-sm">
                        <div><span class="arena-equipment-tooltip" data-equipment="weapon">Broń</span>: <span id="arena-weapon-value">Brak</span></div>
                        <div><span class="arena-equipment-tooltip" data-equipment="armor">Zbroja</span>: <span id="arena-armor-value">Brak</span></div>
                        <div><span class="arena-equipment-tooltip" data-equipment="accessory">Dodatek</span>: <span id="arena-accessory-value">Brak</span></div>
                        <div><span class="arena-equipment-tooltip" data-equipment="artefakt">Artefakt</span>: <span id="arena-artefakt-value">Brak</span></div>
                    </div>
                </div>
            </div>
        `;
        
        // Setup tooltips after creating static structure
        if (!tooltipsSetupComplete) {
            setupTooltips();
        }
        
        // Mark initial setup as complete
        isInitialSetup = false;
    }
    
    function updateDynamicContent() {
        const arena = gameData.minigames.arena;
        
        // Update all dynamic values without destroying DOM structure
        updateStatValues();
        updateProgressBars();
        updateCurrentActivity();
        updateLogEntries();
    }
    
    function updateStatValues() {
        const arena = gameData.minigames.arena;
        
        // Defensive validation for XP data
        if (typeof arena.experience !== 'number') {
            console.warn('🔥 DEBUG: Invalid arena.experience:', arena.experience, 'Setting to 0');
            arena.experience = 0;
        }
        if (typeof arena.experienceToNext !== 'number' || arena.experienceToNext <= 0) {
            console.warn('🔥 DEBUG: Invalid arena.experienceToNext:', arena.experienceToNext, 'Setting to 100');
            arena.experienceToNext = 100;
        }
        
        // Import calculateTotalPower from logic module
        const totalPower = window.ArenaSystem?.calculateTotalPower?.() || 0;
        const statusText = arena.isResting ? "💤 Odpoczynek" : (arena.hp <= 0 ? "😵 Wyczerpana" : "⚔️ Gotowa");
        
        // Update basic stats
        const levelValue = document.getElementById('arena-level-value');
        const statusValue = document.getElementById('arena-status-value');
        const powerValue = document.getElementById('arena-power-value');
        const goldValue = document.getElementById('arena-gold-value');
        
        if (levelValue) levelValue.textContent = arena.level;
        if (statusValue) statusValue.textContent = statusText;
        if (powerValue) powerValue.textContent = totalPower;
        if (goldValue) goldValue.textContent = formatNumber(gameData.goldCoins);
        
        // Update experience bar and text with defensive checks
        const expBar = document.getElementById('arena-exp-bar');
        const expText = document.getElementById('arena-exp-text');
        
        // Calculate percentage safely
        const expPercentage = Math.min(100, Math.max(0, (arena.experience / arena.experienceToNext) * 100));
        
        if (expBar) {
            expBar.style.width = `${expPercentage}%`;
        }
        if (expText) {
            expText.textContent = `${Math.floor(arena.experience)}/${arena.experienceToNext} EXP`;
        }
        
        // Update HP bar and text
        const hpPercentage = (arena.hp / arena.maxHp) * 100;
        const hpBar = document.getElementById('arena-hp-bar');
        const hpText = document.getElementById('arena-hp-text');
        if (hpBar) {
            hpBar.style.width = `${hpPercentage}%`;
            hpBar.style.backgroundColor = hpPercentage > 50 ? '#22c55e' : hpPercentage > 20 ? '#f59e0b' : '#dc2626';
        }
        if (hpText) hpText.textContent = `${Math.floor(arena.hp)}/${arena.maxHp} HP`;
        
        // Update physical attributes
        const cyceValue = document.getElementById('arena-cyce-value');
        const dupaValue = document.getElementById('arena-dupa-value');
        const cipkaValue = document.getElementById('arena-cipka-value');
        
        if (cyceValue) cyceValue.textContent = `${arena.stats.cyce}/10 ⭐`;
        if (dupaValue) dupaValue.textContent = `${arena.stats.dupa}/10 ⭐`;
        if (cipkaValue) cipkaValue.textContent = arena.stats.cipka;
        
        // Update cipka effects
        const sensitivityValue = document.getElementById('arena-sensitivity-value');
        const wetnessValue = document.getElementById('arena-wetness-value');
        const corruptionValue = document.getElementById('arena-corruption-value');
        const resistanceValue = document.getElementById('arena-resistance-value');
        
        if (sensitivityValue) sensitivityValue.textContent = `${(arena.cipkaEffects.sensitivity * 100).toFixed(0)}%`;
        if (wetnessValue) wetnessValue.textContent = `${(arena.cipkaEffects.wetness * 100).toFixed(0)}%`;
        if (corruptionValue) corruptionValue.textContent = `${(arena.cipkaEffects.corruption * 100).toFixed(0)}%`;
        if (resistanceValue) resistanceValue.textContent = `${(arena.cipkaEffects.magic_resistance * 100).toFixed(0)}%`;
        
        // Update record stats
        const questsValue = document.getElementById('arena-quests-value');
        const deathsValue = document.getElementById('arena-deaths-value');
        const itemsValue = document.getElementById('arena-items-value');
        
        if (questsValue) questsValue.textContent = arena.questsCompleted;
        if (deathsValue) deathsValue.textContent = arena.totalDeaths;
        if (itemsValue) itemsValue.textContent = arena.itemsFound;
        
        // Update equipment
        updateEquipmentDisplay();
        
        // Update skill bars
        updateSkillBars();
    }
    
    function updateEquipmentDisplay() {
        const arena = gameData.minigames.arena;
        
        const weaponValue = document.getElementById('arena-weapon-value');
        const armorValue = document.getElementById('arena-armor-value');
        const accessoryValue = document.getElementById('arena-accessory-value');
        const artefaktValue = document.getElementById('arena-artefakt-value');
        
        if (weaponValue) {
            weaponValue.innerHTML = arena.equipment.weapon ? 
                `<span class="arena-equipment-tooltip" data-item='${JSON.stringify(arena.equipment.weapon)}'>${arena.equipment.weapon.name}</span>` : 
                'Brak';
        }
        if (armorValue) {
            armorValue.innerHTML = arena.equipment.armor ? 
                `<span class="arena-equipment-tooltip" data-item='${JSON.stringify(arena.equipment.armor)}'>${arena.equipment.armor.name}</span>` : 
                'Brak';
        }
        if (accessoryValue) {
            accessoryValue.innerHTML = arena.equipment.accessory ? 
                `<span class="arena-equipment-tooltip" data-item='${JSON.stringify(arena.equipment.accessory)}'>${arena.equipment.accessory.name}</span>` : 
                'Brak';
        }
        if (artefaktValue) {
            artefaktValue.innerHTML = arena.equipment.artefakt ? 
                `<span class="arena-equipment-tooltip" data-item='${JSON.stringify(arena.equipment.artefakt)}'>${arena.equipment.artefakt.name}</span>` : 
                'Brak';
        }
        
        // Re-setup tooltips for new equipment elements if needed
        if (weaponValue || armorValue || accessoryValue || artefaktValue) {
            const newEquipmentElements = document.querySelectorAll('.arena-equipment-tooltip');
            newEquipmentElements.forEach(element => {
                if (!element.onmouseenter) {
                    element.onmouseenter = function(e) { 
                        simpleShowTooltip(e, 'equipment'); 
                    };
                    element.onmouseleave = function() { 
                        simpleDelayedHideTooltip(); 
                    };
                    element.style.cursor = 'help';
                    element.style.textDecoration = 'underline dotted';
                    element.style.color = '#a855f7';
                }
            });
        }
    }
    
    function updateSkillBars() {
        const arena = gameData.minigames.arena;
        const skillBarsContainer = document.getElementById('arena-skill-bars');
        
        if (skillBarsContainer) {
            // Clean up existing tooltip events before innerHTML
            const existingElements = skillBarsContainer.querySelectorAll('.arena-stat-tooltip');
            existingElements.forEach(element => {
                if (element.hasTooltipEvents) {
                    element.hasTooltipEvents = false;
                }
            });
            
            skillBarsContainer.innerHTML = `
                ${createCompactSkillBar('sila', 'Siła', arena.stats.sila, arena.skillProgress.sila, arena.skillCaps.sila, '#dc2626')}
                ${createCompactSkillBar('zrecznosc', 'Zręczność', arena.stats.zrecznosc, arena.skillProgress.zrecznosc, arena.skillCaps.zrecznosc, '#16a34a')}
                ${createCompactSkillBar('inteligencja', 'Inteligencja', arena.stats.inteligencja, arena.skillProgress.inteligencja, arena.skillCaps.inteligencja, '#2563eb')}
                ${createCompactSkillBar('szczescie', 'Szczęście', arena.stats.szczescie, arena.skillProgress.szczescie, arena.skillCaps.szczescie, '#ca8a04')}
            `;
            
            
            // Re-setup tooltips for skill bar elements after innerHTML destroys them
            const newSkillElements = skillBarsContainer.querySelectorAll('.arena-stat-tooltip');
            newSkillElements.forEach(element => {
                if (!element.onmouseenter) {
                    element.onmouseenter = function(e) { 
                        simpleShowTooltip(e, 'stat'); 
                    };
                    element.onmouseleave = function() { 
                        simpleDelayedHideTooltip(); 
                    };
                    element.style.cursor = 'help';
                    element.style.textDecoration = 'underline dotted';
                    element.style.color = '#a855f7';
                    
                    // Add fallback title attribute
                    const statName = element.getAttribute('data-stat');
                    if (statName && window.ArenaData.statDescriptions[statName]) {
                        element.title = window.ArenaData.statDescriptions[statName].title;
                    }
                }
            });
        }
    }
    
    function updateProgressBars() {
        const arena = gameData.minigames.arena;
        const progressContainer = document.getElementById('arena-progress-content');
        
        if (!progressContainer) {
            return;
        }
        
        // Build progress bars efficiently - only rebuild if structure changed
        let progressHtml = '';
        
        // Quest progress (if active) - Handle both quest formats
        if (arena.currentQuest) {
            const quest = arena.currentQuest;
            
            if (quest.objectives && Array.isArray(quest.objectives) && quest.objectives.length > 0) {
                // New objective-based quest format
                const currentObjective = quest.objectives[arena.currentObjectiveIndex || 0];
                if (currentObjective) {
                    const progress = currentObjective.current || 0;
                    const maxProgress = currentObjective.target || 1;
                    const progressPercentage = (progress / maxProgress) * 100;
                    const progressText = `${progress}/${maxProgress}`;
                    
                    // Also show overall activity progress within current objective
                    const activityProgress = arena.activityProgress || 0;
                    
                    progressHtml += createProgressBar(
                        "🎯 AKTUALNY CEL", 
                        `${currentObjective.name} (${progressText})`, 
                        progressPercentage, 100, "#f97316", 
                        currentObjective.description || "Aktualny cel do wykonania", true
                    );
                    
                    // Only show activity progress bar if there's meaningful progress or active quest
                    if (arena.currentQuest && activityProgress > 0) {
                        progressHtml += createProgressBar(
                            "⚡ AKCJA", 
                            `Postęp w celu`, 
                            activityProgress, 100, "#8b5cf6", 
                            `Aktualny postęp w realizacji celu - ${activityProgress.toFixed(1)}%`, true
                        );
                    }
                    
                    // Boss phases for objective-based quests
                    if (quest.currentPhase && quest.maxPhases && quest.phaseProgress !== undefined) {
                        const currentPhase = `Faza ${quest.currentPhase}/${quest.maxPhases}`;
                        const phaseProgress = quest.phaseProgress;
                        progressHtml += createProgressBar("⚡ FAZA BOSSA", currentPhase, phaseProgress, 100, "#b91c1c", `Aktualna faza walki z bossem - ${Math.floor(phaseProgress)}% postępu fazy`);
                    }
                }
            } else {
                // Legacy quest format
                const progress = quest.progress || 0;
                const maxProgress = quest.maxProgress || 100;
                const progressPercentage = (progress / maxProgress) * 100;
                
                progressHtml += createProgressBar(
                    "⚔️ WALKA Z POTWOREM", 
                    `${quest.monster} (${quest.name})`, 
                    progressPercentage, 100, "#dc2626", 
                    `Postęp walki: ${progress}/${maxProgress}`, true
                );
            }
            
            // Combat phases for legacy format
            if (quest.currentPhase && quest.maxPhases && quest.phaseProgress !== undefined) {
                const currentPhase = `Faza ${quest.currentPhase}/${quest.maxPhases}`;
                const phaseProgress = quest.phaseProgress;
                progressHtml += createProgressBar("⚡ FAZA WALKI", currentPhase, phaseProgress, 100, "#b91c1c", `Aktualna faza combat - ${Math.floor(phaseProgress)}% postępu fazy`, true);
            }
        } else if (arena.isResting) {
            // Rest progress
            const restPercentage = ((arena.restDuration - arena.restTimeRemaining) / arena.restDuration) * 100;
            progressHtml += createProgressBar("💤 ODPOCZYNEK", arena.currentActivity, restPercentage, 100, "#10b981", "Regeneracja sił", true);
        }
        
        // Stamina (always shown)
        const staminaPercentage = (arena.stamina.current / arena.stamina.max) * 100;
        progressHtml += createProgressBar("Stamina", `${Math.floor(arena.stamina.current)}/${arena.stamina.max}`, staminaPercentage, 100, "#10b981", "Energia bojowa - regeneruje się szybciej niż HP");
        
        // Active skill training (if active)
        if (arena.skillTraining && arena.skillTraining.active && arena.skillTraining.timeRemaining > 0) {
            const skillNames = { sila: 'Siła', zrecznosc: 'Zręczność', inteligencja: 'Inteligencja', szczescie: 'Szczęście' };
            const trainingPercentage = ((arena.skillTraining.duration - arena.skillTraining.timeRemaining) / arena.skillTraining.duration) * 100;
            progressHtml += createProgressBar("Trening", skillNames[arena.skillTraining.active], trainingPercentage, 100, "#f97316", "Aktywny trening umiejętności podczas walki");
        }
        
        // Milestone progress (every 10 quests = bonus gold)
        const milestoneProgress = (arena.questsCompleted % 10) * 10;
        progressHtml += createProgressBar("Do nagrody", `${arena.questsCompleted % 10}/10`, milestoneProgress, 100, "#8b5cf6", "Co 10 ukończonych questów otrzymujesz bonus złota");
        
        // Cipka effects (animated during combat)
        const cipkaEffects = arena.cipkaEffects;
        progressHtml += createProgressBar("Wrażliwość", `${(cipkaEffects.sensitivity * 100).toFixed(0)}%`, cipkaEffects.sensitivity * 100, 100, "#ec4899", "Poziom wrażliwości - zmienia się podczas walki");
        progressHtml += createProgressBar("Wilgotność", `${(cipkaEffects.wetness * 100).toFixed(0)}%`, cipkaEffects.wetness * 100, 100, "#06b6d4", "Poziom podniecenia - wzrasta podczas intensywnych walk");
        
        // Equipment condition (when equipment exists)
        const equipmentConditions = [];
        Object.entries(arena.equipment).forEach(([slot, item]) => {
            if (item && item.condition !== undefined) {
                equipmentConditions.push(item.condition);
            }
        });
        
        if (equipmentConditions.length > 0) {
            const avgCondition = equipmentConditions.reduce((sum, condition) => sum + condition, 0) / equipmentConditions.length;
            if (avgCondition < 100) {
                progressHtml += createProgressBar("Stan Ekwip.", `${Math.floor(avgCondition)}%`, avgCondition, 100, "#6b7280", "Stan ekwipunku - maleje podczas walki, regeneruje podczas odpoczynku");
                
                // Add Stopień Roznegliżowania - inverse of equipment condition
                const rozneglizowaie = 100 - avgCondition;
                progressHtml += createProgressBar("Stopień Roznegliżowania", `${Math.floor(rozneglizowaie)}%`, rozneglizowaie, 100, "#dc2626", "Im bardziej uszkodzony ekwipunek, tym bardziej Momo jest roznegliżowana");
            }
        }
        
        // Set innerHTML only once at the end to avoid repeated DOM manipulation
        progressContainer.innerHTML = progressHtml;
    }
    
    function updateCurrentActivity() {
        const currentActivityContainer = document.getElementById('arena-current-activity');
        if (!currentActivityContainer) return;
        
        const arena = gameData.minigames.arena;
        const currentActivity = arena.currentQuest ? 
            `⚔️ ${arena.currentQuest.name}` : 
            (arena.isResting ? `💤 ${arena.currentActivity}` : "🔍 Szukanie przeciwników");
            
        currentActivityContainer.innerHTML = `
            <div class="p-3 bg-white/5 rounded-lg border-l-4 border-yellow-500">
                <div class="text-lg font-bold text-yellow-300 mb-2">Status:</div>
                <div class="text-white">${currentActivity}</div>
            </div>
        `;
    }
    
    function updateLogEntries() {
        const logContainer = document.getElementById('arena-log-content');
        if (!logContainer) return;
        
        const arena = gameData.minigames.arena;
        
        // Clear and rebuild log
        logContainer.innerHTML = '';
        const entries = arena.logEntries.slice(-50).reverse(); // Show last 50 entries, newest first
        entries.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'log-entry p-2 mb-2 bg-white/5 rounded border-l-4 border-purple-500 text-sm';
            div.innerHTML = entry;
            logContainer.appendChild(div);
        });
        
        // Auto-scroll to show newest entries (scroll to top since we reverse the list)
        logContainer.scrollTop = 0;
    }
    
    function displayArena() {
        // Set the viewed character ID to enable live updates
        gameData.viewedCharacterId = 'arena';
        
        // Mark arena as visited for the first time to enable progression
        const arena = gameData.minigames.arena;
        
        // Ensure arena data exists
        if (!arena) {
            console.error('Arena data not found in gameData.minigames - cannot display arena');
            return;
        }
        
        if (!arena.hasBeenVisited) {
            arena.hasBeenVisited = true;
            console.log('Arena activated for the first time!');
        }
        
        const container = document.getElementById('main-character-display');
        if (!container) {
            console.error('main-character-display element not found - cannot display arena');
            return;
        }

        container.innerHTML = `
            <div class="w-full h-full flex flex-col space-y-4 relative">
                <button onclick="if(window.displayManor){window.displayManor()}else{console.error('displayManor function not available')}" class="btn-primary absolute top-2 right-2 text-sm px-3 py-1 z-10">Wróć</button>
                <h2 class="text-2xl font-bold text-center">Arena Momo</h2>
                
                <!-- Visual Tooltip Status Indicator -->
                <div class="text-center">
                    <div id="tooltip-status" class="inline-block px-4 py-2 rounded-lg text-sm font-bold" style="background-color: #dc2626; color: white;">
                        🔧 Tooltips: Ładowanie...
                    </div>
                    <button id="fix-tooltips-btn" onclick="window.ArenaSystem?.fixTooltips?.()" class="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                        🔄 Napraw Tooltips
                    </button>
                </div>
                
                <div class="flex flex-1 gap-4">
                    <div class="w-1/3 space-y-4">
                        <div class="bg-white/10 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Statystyki</h3>
                            <div id="arena-stats-content" class="text-sm"></div>
                        </div>
                    </div>
                    
                    <div class="w-1/3 space-y-4">
                        <div class="bg-white/10 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Postęp</h3>
                            <div id="arena-progress-content" class="text-sm"></div>
                        </div>
                    </div>
                    
                    <div class="w-1/3 space-y-4">
                        <div class="bg-white/10 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Obecna Aktywność</h3>
                            <div id="arena-current-activity" class="text-sm mb-4"></div>
                        </div>
                        
                        <div class="bg-white/10 rounded-lg p-4">
                            <h3 class="font-bold mb-2">Log Aktywności</h3>
                            <div id="arena-log-content" class="text-xs max-h-64 overflow-y-auto space-y-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Reset render flags when displaying arena fresh
        tooltipsSetupComplete = false;
        setupInProgress = false;
        isInitialSetup = true;
        staticContentSetup = false;
        
        render();
    }

    function render() {
        const arena = gameData.minigames.arena;
        
        // Ensure arena data is properly initialized
        if (!arena) {
            console.error('Arena data not found in gameData.minigames');
            return;
        }
        
        const statsContainer = document.getElementById('arena-stats-content');
        const progressContainer = document.getElementById('arena-progress-content');
        const logContainer = document.getElementById('arena-log-content');
        
        if (!statsContainer || !progressContainer || !logContainer) return;
        
        // Handle initial setup vs updates
        if (isInitialSetup && !staticContentSetup) {
            setupStaticContent();
            staticContentSetup = true;
        }
        
        // Initialize missing properties with defaults if needed
        if (typeof arena.hp === 'undefined') arena.hp = arena.maxHp || 100;
        if (typeof arena.maxHp === 'undefined') arena.maxHp = 100;
        if (typeof arena.level === 'undefined') arena.level = 1;
        if (typeof arena.experience === 'undefined') arena.experience = 0;
        if (typeof arena.experienceToNext === 'undefined') arena.experienceToNext = 100;
        if (typeof arena.isResting === 'undefined') arena.isResting = false;
        if (!arena.stats) arena.stats = { sila: 10, zrecznosc: 6, inteligencja: 5, szczescie: 7, cyce: 10, dupa: 10, cipka: "Dziewicza" };
        if (!arena.cipkaEffects) arena.cipkaEffects = { sensitivity: 0.5, wetness: 0.1, corruption: 0.0, magic_resistance: 1.0, recovery_time: 1.0 };
        if (!arena.equipment) arena.equipment = { weapon: null, armor: null, accessory: null, artefakt: null };
        if (!arena.skillProgress) arena.skillProgress = { sila: 0, zrecznosc: 0, inteligencja: 0, szczescie: 0, cyce: 0, dupa: 0 };
        if (!arena.skillCaps) arena.skillCaps = { sila: 100, zrecznosc: 100, inteligencja: 100, szczescie: 100, cyce: 10, dupa: 10 };
        if (typeof arena.questsCompleted === 'undefined') arena.questsCompleted = 0;
        if (typeof arena.totalDeaths === 'undefined') arena.totalDeaths = 0;
        if (typeof arena.itemsFound === 'undefined') arena.itemsFound = 0;
        if (!arena.logEntries) arena.logEntries = [];
        
        // Always update dynamic content
        updateDynamicContent();
    }

    // Helper function for number formatting
    function formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }

    // Helper function for creating compact skill bars
    function createCompactSkillBar(statName, label, currentValue, progress, cap, color) {
        // Calculate progress within current level: current progress mod 10 (since every 10 progress = +1 stat)
        const progressInCurrentLevel = Math.floor(progress) % 10;
        const progressPercentage = (progressInCurrentLevel / 10) * 100;
        const tooltip = window.ArenaData.statDescriptions[statName] ? window.ArenaData.statDescriptions[statName].description : "";
        
        return `
            <div class="flex items-center justify-between">
                <span class="w-20 flex-shrink-0"><strong><span class="arena-stat-tooltip" data-stat="${statName}">${label}</span></strong></span>
                <div class="flex items-center space-x-2">
                    <div class="w-20 bg-gray-300 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-300" 
                             style="width: ${progressPercentage}%; background-color: ${color}"></div>
                    </div>
                    <span class="text-sm font-bold w-6 text-right">${currentValue}</span>
                </div>
            </div>
        `;
    }

    // Helper function for creating progress bars
    function createProgressBar(label, text, percentage, maxPercentage, color, tooltip = null, isProminent = false) {
        const clampedPercentage = Math.min(percentage, maxPercentage);
        const tooltipClass = tooltip ? 'arena-progress-tooltip' : '';
        const tooltipAttr = tooltip ? `data-tooltip="${tooltip}"` : '';
        
        if (isProminent) {
            // Prominent progress bar for quest/rest progress
            return `
                <div class="mb-4 p-2 bg-white/10 rounded-lg">
                    <div class="flex justify-between text-sm mb-2">
                        <span><strong><span class="${tooltipClass}" ${tooltipAttr}>${label}</span></strong></span>
                        <span class="font-bold">${clampedPercentage.toFixed(1)}%</span>
                    </div>
                    <div class="text-xs mb-2 text-gray-300">${text}</div>
                    <div class="w-full bg-gray-600 rounded-full h-4">
                        <div class="h-4 rounded-full transition-all duration-500" 
                             style="width: ${clampedPercentage}%; background-color: ${color}"></div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="mb-2">
                <div class="flex justify-between text-xs mb-1">
                    <span><strong><span class="${tooltipClass}" ${tooltipAttr}>${label}</span>:</strong></span>
                    <span>${text}</span>
                </div>
                <div class="w-full bg-gray-300 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-300" 
                         style="width: ${clampedPercentage}%; background-color: ${color}"></div>
                </div>
            </div>
        `;
    }

    // Add log entry
    function addLog(message) {
        const arena = gameData.minigames.arena;
        arena.logEntries.push(message);
        
        // Keep only last 100 entries
        if (arena.logEntries.length > 100) {
            arena.logEntries = arena.logEntries.slice(-100);
        }
    }

    // === Tooltip System ===
    
    function setupTooltips() {
        // Prevent multiple simultaneous setups
        if (setupInProgress || tooltipsSetupComplete) {
            return;
        }
        
        setupInProgress = true;
        updateTooltipStatus('loading', 'Ustawianie...');
        
        try {
            // Check if DOM is ready and arena container exists
            const arenaContainer = document.querySelector('#main-character-display');
            if (!arenaContainer) {
                updateTooltipStatus('error', 'Arena niedostępna');
                setupInProgress = false;
                // Retry after short delay
                setTimeout(() => setupTooltips(), 1000);
                return;
            }
            
            // Find all tooltip elements with more specific selectors
            const statElements = arenaContainer.querySelectorAll('.arena-stat-tooltip');
            const equipmentElements = arenaContainer.querySelectorAll('.arena-equipment-tooltip');
            const progressElements = arenaContainer.querySelectorAll('.arena-progress-tooltip');
            
            const totalElements = statElements.length + equipmentElements.length + progressElements.length;
            
            if (totalElements === 0) {
                updateTooltipStatus('error', 'Brak elementów');
                setupInProgress = false;
                // Retry after delay in case elements are still loading
                setTimeout(() => {
                    if (!tooltipsSetupComplete) {
                        setupTooltips();
                    }
                }, 2000);
                return;
            }
            
            let successCount = 0;
            
            // Setup stat tooltips with better error handling
            statElements.forEach((element, index) => {
                try {
                    if (!element || !element.getAttribute) {
                        console.warn(`Stat element ${index} is invalid:`, element);
                        return;
                    }
                    
                    element.onmouseenter = function(e) { 
                        simpleShowTooltip(e, 'stat'); 
                    };
                    element.onmouseleave = function() { 
                        simpleDelayedHideTooltip(); 
                    };
                    element.style.cursor = 'help';
                    element.style.textDecoration = 'underline dotted';
                    element.style.color = '#a855f7';
                    
                    // Add fallback title attribute
                    const statName = element.getAttribute('data-stat');
                    if (statName && window.ArenaData.statDescriptions[statName]) {
                        element.title = window.ArenaData.statDescriptions[statName].title;
                    }
                    
                    successCount++;
                } catch (err) {
                    console.warn(`Error setting up stat tooltip ${index}:`, err);
                }
            });
            
            // Setup equipment tooltips with better error handling
            equipmentElements.forEach((element, index) => {
                try {
                    if (!element || !element.getAttribute) {
                        console.warn(`Equipment element ${index} is invalid:`, element);
                        return;
                    }
                    
                    element.onmouseenter = function(e) { 
                        simpleShowTooltip(e, 'equipment'); 
                    };
                    element.onmouseleave = function() { 
                        simpleDelayedHideTooltip(); 
                    };
                    element.style.cursor = 'help';
                    element.style.textDecoration = 'underline dotted';
                    element.style.color = '#a855f7';
                    
                    // Add fallback title
                    element.title = 'Equipment tooltip';
                    successCount++;
                } catch (err) {
                    console.warn(`Error setting up equipment tooltip ${index}:`, err);
                }
            });
            
            // Setup progress tooltips with better error handling  
            progressElements.forEach((element, index) => {
                try {
                    if (!element || !element.getAttribute) {
                        console.warn(`Progress element ${index} is invalid:`, element);
                        return;
                    }
                    
                    element.onmouseenter = function(e) { 
                        simpleShowTooltip(e, 'progress'); 
                    };
                    element.onmouseleave = function() { 
                        simpleDelayedHideTooltip(); 
                    };
                    element.style.cursor = 'help';
                    element.style.textDecoration = 'underline dotted';
                    element.style.color = '#a855f7';
                    
                    // Add fallback title
                    const tooltipText = element.getAttribute('data-tooltip');
                    if (tooltipText) {
                        element.title = tooltipText;
                    }
                    successCount++;
                } catch (err) {
                    console.warn(`Error setting up progress tooltip ${index}:`, err);
                }
            });
            
            // Report results
            if (successCount === totalElements) {
                tooltipsSetupComplete = true;
                updateTooltipStatus('success', `${successCount} gotowych`);
            } else if (successCount > 0) {
                tooltipsSetupComplete = true;
                updateTooltipStatus('warning', `${successCount}/${totalElements} gotowych`);
            } else {
                updateTooltipStatus('error', 'Nie udało się skonfigurować tooltipów');
                // Retry after delay
                setTimeout(() => {
                    if (!tooltipsSetupComplete) {
                        setupTooltips();
                    }
                }, 3000);
            }
            
            setupInProgress = false;
            
        } catch (error) {
            console.error('Critical error in setupTooltips:', error);
            updateTooltipStatus('error', `Błąd: ${error.message}`);
            setupInProgress = false;
            
            // Retry after delay for critical errors
            setTimeout(() => {
                if (!tooltipsSetupComplete) {
                    setupTooltips();
                }
            }, 5000);
        }
    }
    
    function updateTooltipStatus(type, message) {
        const statusElement = document.getElementById('tooltip-status');
        if (!statusElement) return;
        
        // Prevent rapid updates (debounce)
        const now = Date.now();
        const newStatus = `${type}:${message}`;
        
        // If same status or updated very recently, skip
        if (currentStatus === newStatus || (now - lastStatusUpdate) < 1000) {
            return;
        }
        
        // Clear any pending status updates
        if (statusUpdateTimer) {
            clearTimeout(statusUpdateTimer);
        }
        
        statusUpdateTimer = setTimeout(() => {
            let bgColor, icon;
            switch(type) {
                case 'loading': bgColor = '#f59e0b'; icon = '🔧'; break;
                case 'success': bgColor = '#22c55e'; icon = '✅'; break;
                case 'warning': bgColor = '#f97316'; icon = '⚠️'; break;
                case 'error': bgColor = '#dc2626'; icon = '❌'; break;
                default: bgColor = '#6b7280'; icon = '❓'; break;
            }
            
            statusElement.style.backgroundColor = bgColor;
            statusElement.textContent = `${icon} Tooltips: ${message}`;
            
            currentStatus = newStatus;
            lastStatusUpdate = Date.now();
            statusUpdateTimer = null;
        }, 100); // Small delay to prevent flickering
    }
    
    function fixTooltips() {
        console.log('🔄 Manual tooltip fix requested');
        updateTooltipStatus('loading', 'Naprawianie...');
        cleanupTooltips();
        
        // Clean up any orphaned tooltips
        const orphanedTooltips = document.querySelectorAll('#simple-arena-tooltip, .arena-tooltip');
        orphanedTooltips.forEach(tooltip => tooltip.remove());
        
        // Reset setup flags to allow re-setup
        tooltipsSetupComplete = false;
        setupInProgress = false;
        
        // Clear any pending timers
        if (statusUpdateTimer) {
            clearTimeout(statusUpdateTimer);
            statusUpdateTimer = null;
        }
        
        setTimeout(() => {
            setupTooltips();
        }, 500);
    }
    
    function simpleShowTooltip(event, type) {
        
        // Clear any pending hide timer to prevent conflicts
        if (simpleTooltipHideTimer) {
            clearTimeout(simpleTooltipHideTimer);
            simpleTooltipHideTimer = null;
        }
        
        // Force immediate cleanup of existing tooltip
        const existingTooltip = document.getElementById('simple-arena-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        currentSimpleTooltip = null;
        
        let title = 'Tooltip';
        let description = 'Opis niedostępny';
        
        if (type === 'stat') {
            const statName = event.target.getAttribute('data-stat');
            const equipmentType = event.target.getAttribute('data-equipment');
            
            if (statName && window.ArenaData.statDescriptions[statName]) {
                const stat = window.ArenaData.statDescriptions[statName];
                title = stat.title;
                description = stat.description + (stat.effect ? `\n\n${stat.effect}` : '');
            } else if (equipmentType && window.ArenaData.equipmentDescriptions[equipmentType]) {
                const equipment = window.ArenaData.equipmentDescriptions[equipmentType];
                title = equipment.title;
                description = equipment.description;
            }
        } else if (type === 'equipment') {
            // Check for data-item first (dynamic equipment)
            const dataItem = event.target.getAttribute('data-item');
            const equipmentType = event.target.getAttribute('data-equipment');
            
            if (dataItem) {
                try {
                    const itemData = JSON.parse(dataItem);
                    title = itemData.name;
                    description = `Moc: ${itemData.power}`;
                    if (itemData.statDescription) description = itemData.statDescription;
                    if (itemData.flavorText) description += `\n\n${itemData.flavorText}`;
                } catch (e) {
                    description = 'Błąd parsowania danych przedmiotu';
                }
            } else if (equipmentType && window.ArenaData.equipmentDescriptions[equipmentType]) {
                // Handle static equipment labels
                const equipment = window.ArenaData.equipmentDescriptions[equipmentType];
                title = equipment.title;
                description = equipment.description;
            }
        } else if (type === 'progress') {
            const tooltip = event.target.getAttribute('data-tooltip');
            if (tooltip) {
                title = event.target.textContent;
                description = tooltip;
            }
        }
        
        // Create elegant tooltip
        const tooltip = document.createElement('div');
        tooltip.id = 'simple-arena-tooltip';
        tooltip.style.position = 'fixed';
        tooltip.style.zIndex = '10000';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.92)'; // Dark semi-transparent
        tooltip.style.color = '#ffffff'; // White text
        tooltip.style.padding = '12px 16px';
        tooltip.style.border = '1px solid rgba(255, 255, 255, 0.3)'; // Subtle white border
        tooltip.style.borderRadius = '8px';
        tooltip.style.fontSize = '14px';
        tooltip.style.fontWeight = 'normal';
        tooltip.style.maxWidth = '320px';
        tooltip.style.boxShadow = '0 8px 32px rgba(0,0,0,0.6)';
        tooltip.style.lineHeight = '1.5';
        tooltip.style.backdropFilter = 'blur(8px)';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.2s ease-in-out';
        tooltip.style.pointerEvents = 'auto'; // Allow interactions with tooltip itself
        
        tooltip.innerHTML = `<div style="color: #a855f7; font-weight: bold; margin-bottom: 6px; font-size: 15px;">${title}</div><div style="color: #e5e7eb;">${description.replace(/\n/g, '<br>')}</div>`;
        
        // Position tooltip
        const rect = event.target.getBoundingClientRect();
        const cursorX = event.clientX;
        const cursorY = event.clientY;
        
        document.body.appendChild(tooltip);
        
        // Get tooltip dimensions after adding to DOM
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Position tooltip above target element with proper spacing
        let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.top + window.scrollY - tooltipRect.height - 15;
        
        // Adjust if tooltip goes off screen OR would interfere with cursor
        const minTopMargin = 20; // Minimum distance from cursor
        if (top < window.scrollY || (top + tooltipRect.height + minTopMargin > cursorY + window.scrollY && cursorY + window.scrollY > top - minTopMargin)) {
            // Show below if no room above or would interfere with cursor
            top = rect.bottom + window.scrollY + 25; // Extra spacing to avoid cursor
        }
        if (left < 0) {
            left = 10; // Margin from left edge
        }
        if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10; // Margin from right edge
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        // Add hover events to tooltip itself to prevent hiding when hovering over it
        tooltip.addEventListener('mouseenter', () => {
            if (simpleTooltipHideTimer) {
                clearTimeout(simpleTooltipHideTimer);
                simpleTooltipHideTimer = null;
            }
        });
        
        tooltip.addEventListener('mouseleave', () => {
            simpleDelayedHideTooltip();
        });
        
        // Fade in tooltip
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        currentSimpleTooltip = tooltip;
    }
    
    function simpleHideTooltip() {
        // Clear any pending hide timer to prevent race conditions
        if (simpleTooltipHideTimer) {
            clearTimeout(simpleTooltipHideTimer);
            simpleTooltipHideTimer = null;
        }
        
        const tooltip = document.getElementById('simple-arena-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            // Use timer reference for proper cleanup
            simpleTooltipHideTimer = setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.remove();
                }
                simpleTooltipHideTimer = null; // Clean up timer reference
            }, 200); // Match transition duration
        }
        currentSimpleTooltip = null;
    }
    
    function simpleDelayedHideTooltip() {
        if (simpleTooltipHideTimer) {
            clearTimeout(simpleTooltipHideTimer);
        }
        
        simpleTooltipHideTimer = setTimeout(() => {
            try {
                const tooltip = document.getElementById('simple-arena-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    setTimeout(() => {
                        if (tooltip.parentNode) {
                            tooltip.remove();
                        }
                    }, 200); // Match transition duration
                }
                currentSimpleTooltip = null;
            } catch (error) {
                console.warn('Error hiding simple tooltip:', error);
            } finally {
                simpleTooltipHideTimer = null;
            }
        }, 300); // Same delay as complex system
    }
    
    // Comprehensive cleanup method for tooltips and timers
    function cleanupTooltips() {
        // Clear all timers
        if (tooltipTimer) {
            clearTimeout(tooltipTimer);
            tooltipTimer = null;
        }
        
        if (tooltipHideTimer) {
            clearTimeout(tooltipHideTimer);
            tooltipHideTimer = null;
        }
        
        if (statusUpdateTimer) {
            clearTimeout(statusUpdateTimer);
            statusUpdateTimer = null;
        }
        
        // Clear simple tooltip timers
        if (simpleTooltipHideTimer) {
            clearTimeout(simpleTooltipHideTimer);
            simpleTooltipHideTimer = null;
        }
        
        // Remove current tooltip
        if (currentArenaTooltip) {
            currentArenaTooltip.remove();
            currentArenaTooltip = null;
        }
        
        // Remove current simple tooltip
        if (currentSimpleTooltip) {
            currentSimpleTooltip.remove();
            currentSimpleTooltip = null;
        }
        
        // Clean up any orphaned tooltips
        const orphanedTooltips = document.querySelectorAll('.arena-tooltip, #simple-arena-tooltip');
        orphanedTooltips.forEach(tooltip => tooltip.remove());
        
        // Reset tooltip setup flags to allow re-setup
        tooltipsSetupComplete = false;
        setupInProgress = false;
        
        // Clear hasTooltipEvents flags from all elements
        const tooltipElements = document.querySelectorAll('.arena-stat-tooltip, .arena-equipment-tooltip, .arena-progress-tooltip');
        tooltipElements.forEach(element => {
            if (element.hasTooltipEvents) {
                element.hasTooltipEvents = false;
            }
        });
    }
    
    // Setup global event handlers for defensive tooltip cleanup
    function setupGlobalEventHandlers() {
        // Hide tooltips when clicking outside of tooltip elements
        document.addEventListener('click', (event) => {
            const clickedElement = event.target;
            const isTooltipElement = clickedElement.closest('.arena-stat-tooltip, .arena-equipment-tooltip, .arena-progress-tooltip, .arena-tooltip');
            
            // Clean up simple tooltip system
            if (!isTooltipElement && currentSimpleTooltip) {
                simpleHideTooltip();
            }
        });
        
        document.addEventListener('scroll', () => {
            if (currentSimpleTooltip) {
                simpleHideTooltip();
            }
        });
        
        window.addEventListener('resize', () => {
            if (currentSimpleTooltip) {
                simpleHideTooltip();
            }
        });
    }
    
    // Public method to cleanup when arena view is closed
    function onViewClosed() {
        console.log('🧹 Arena view closed, cleaning up tooltips');
        cleanupTooltips();
    }

    // Initialize global event handlers
    setupGlobalEventHandlers();

    // Public API
    return {
        setupStaticContent,
        updateDynamicContent,
        updateStatValues,
        updateEquipmentDisplay,
        updateSkillBars,
        updateProgressBars,
        updateCurrentActivity,
        updateLogEntries,
        displayArena,
        render,
        formatNumber,
        createCompactSkillBar,
        createProgressBar,
        addLog,
        setupTooltips,
        fixTooltips,
        cleanupTooltips,
        onViewClosed
    };
    }
};