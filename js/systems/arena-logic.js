// Arena Game Logic System
// Core game mechanics, combat, and progression systems

// Main Arena System Class
class ArenaSystem {
    constructor() {
        this.lastRenderTime = 0;
        this.lastActivityTime = 0;
        
        // Initialize with retry mechanism for dependencies
        this.initializeWhenReady();
    }
    
    initializeWhenReady() {
        // Wait for dependencies to be available
        if (window.ArenaData && window.ArenaUI) {
            // Initialize UI module
            this.ui = window.ArenaUI.createArenaUI();
            
            // Reference to global data
            this.statDescriptions = window.ArenaData.statDescriptions;
            this.equipmentDescriptions = window.ArenaData.equipmentDescriptions;
            this.effectDescriptions = window.ArenaData.effectDescriptions;
            this.quests = window.ArenaData.quests;
            this.items = window.ArenaData.items;
        } else {
            // Retry after a short delay
            setTimeout(() => this.initializeWhenReady(), 10);
        }
    }

    // === UI Functions (delegated to UI module) ===
    
    setupStaticContent() {
        return this.ui ? this.ui.setupStaticContent() : null;
    }
    
    updateDynamicContent() {
        return this.ui ? this.ui.updateDynamicContent() : null;
    }
    
    updateStatValues() {
        return this.ui ? this.ui.updateStatValues() : null;
    }
    
    updateEquipmentDisplay() {
        return this.ui ? this.ui.updateEquipmentDisplay() : null;
    }
    
    updateSkillBars() {
        return this.ui ? this.ui.updateSkillBars() : null;
    }
    
    updateProgressBars() {
        return this.ui ? this.ui.updateProgressBars() : null;
    }
    
    updateCurrentActivity() {
        return this.ui ? this.ui.updateCurrentActivity() : null;
    }
    
    updateLogEntries() {
        return this.ui ? this.ui.updateLogEntries() : null;
    }
    
    displayArena() {
        return this.ui ? this.ui.displayArena() : null;
    }

    render() {
        const arena = gameData.minigames.arena;
        
        // Ensure arena data is properly initialized
        if (!arena) {
            console.error('Arena data not found in gameData.minigames');
            return;
        }
        
        // Throttle rendering to match activity processing frequency for consistent updates
        const now = Date.now();
        if (now - this.lastRenderTime < 50) return; // 20 FPS to match activity processing
        this.lastRenderTime = now;
        
        return this.ui ? this.ui.render() : null;
    }

    formatNumber(num) {
        return this.ui ? this.ui.formatNumber(num) : num.toString();
    }

    createCompactSkillBar(statName, label, currentValue, progress, cap, color) {
        return this.ui ? this.ui.createCompactSkillBar(statName, label, currentValue, progress, cap, color) : '';
    }

    createProgressBar(label, text, percentage, maxPercentage, color, tooltip = null, isProminent = false) {
        return this.ui ? this.ui.createProgressBar(label, text, percentage, maxPercentage, color, tooltip, isProminent) : '';
    }

    addLog(message) {
        return this.ui ? this.ui.addLog(message) : null;
    }

    // Tooltip system delegation
    setupTooltips() {
        return this.ui ? this.ui.setupTooltips() : null;
    }
    
    fixTooltips() {
        return this.ui ? this.ui.fixTooltips() : null;
    }
    
    cleanupTooltips() {
        return this.ui ? this.ui.cleanupTooltips() : null;
    }
    
    onViewClosed() {
        return this.ui ? this.ui.onViewClosed() : null;
    }

    // === Game Mechanics ===
    
    processActivity() {
        const arena = gameData.minigames.arena;
        
        // Ensure arena data exists
        if (!arena) {
            console.error('Arena data not found during processActivity');
            return;
        }
        
        if (!arena.unlocked) return;
        
        // Prevent progress until arena has been visited for the first time
        if (!arena.hasBeenVisited) return;

        // Throttle activity processing to 20 FPS (50ms intervals) for stable progression
        const now = Date.now();
        if (now - this.lastActivityTime < 50) return;
        this.lastActivityTime = now;
        
        // Debug: Show how often this runs
        if (Math.random() < 0.01) {
            console.log(`🔥 DEBUG: processActivity running at ${new Date().toLocaleTimeString()}`);
        }

        // Initialize new real-time progress systems if not exists
        if (!arena.combatPhase) arena.combatPhase = { current: 0, total: 5, progress: 0 };
        if (!arena.stamina) arena.stamina = { current: 100, max: 100 };
        if (!arena.skillTraining) arena.skillTraining = { active: null, progress: 0 };
        if (!arena.equipmentCondition) arena.equipmentCondition = { weapon: 100, armor: 100, accessory: 100, artefakt: 100 };

        // Handle resting
        if (arena.isResting) {
            const currentTime = Date.now() / 1000;
            const restElapsed = currentTime - arena.restStartTime;
            
            if (restElapsed >= arena.restDuration) {
                // Finish resting
                arena.isResting = false;
                arena.hp = arena.maxHp;
                arena.currentActivity = "Szukanie przeciwników...";
                arena.activityProgress = 0;
                
                // Choose completion message based on rest activity type
                let restCompletedMessage;
                if (arena.restActivity === 'masturbacja') {
                    const orgasmMessages = [
                        `😈 <strong>INTENSYWNY ODPOCZYNEK!</strong> Po trzykrotnym orgazmie Momo zasnęła szybko, odzyskując pełnię sił. Jej ciało wciąż drży z rozkoszy.`,
                        `💦 <strong>BŁOGOŚĆ OSIĄGNIĘTA!</strong> Masturbacja zakończyła się serią intensywnych orgazmów. Momo budzi się całkowicie zregenerowana i podniecona.`,
                        `🔥 <strong>SAMOZASPOKOJENIE ZAKOŃCZONE!</strong> Po długiej sesji intymnej Momo odzyskała wszystkie siły. Jej oczy błyszczą z satysfakcji.`
                    ];
                    restCompletedMessage = orgasmMessages[Math.floor(Math.random() * orgasmMessages.length)];
                } else if (arena.restActivity === 'intensywna_masturbacja') {
                    const intensiveMessages = [
                        `💥 <strong>WYBUCHOWY FINAŁ!</strong> Po intensywnej sesji samozaspokojenia Momo odpoczęła błyskawicznie. Jej ciało pulsuje energią.`,
                        `⚡ <strong>ELEKTRYZUJĄCE DOZNANIA!</strong> Wielokrotne orgazmy przywróciły Momo pełną moc w rekordowym tempie. Jest gotowa na więcej!`,
                        `🌟 <strong>EKSTAZA KOMPLETNA!</strong> Intensywna masturbacja zakończona totalną euforią. Momo nigdy nie czuła się lepiej!`
                    ];
                    restCompletedMessage = intensiveMessages[Math.floor(Math.random() * intensiveMessages.length)];
                } else {
                    // Standard rest messages
                    const standardMessages = [
                        `😌 <strong>REGENERACJA ZAKOŃCZONA!</strong> Momo wstaje wypoczęta, jej ciało emanuje odnowioną energią. Skóra lśni, a oczy płoną gotowością do walki!`,
                        `💪 <strong>SIŁY ODZYSKANE!</strong> Odpoczynek przywrócił Momo do pełnej mocy. Jej mięśnie są napięte, a serce bije rytmicznie w oczekiwaniu na następne wyzwanie!`,
                        `✨ <strong>ODRODZENIE!</strong> Momo kończy medytację bojową. Jej aura jest silniejsza niż wcześniej, ciało gotowe na kolejne próby!`
                    ];
                    restCompletedMessage = standardMessages[Math.floor(Math.random() * standardMessages.length)];
                }
                
                this.addLog(restCompletedMessage);
                arena.restActivity = null; // Clear rest activity type
            } else {
                // Show rest progress with dynamic activity type
                const restProgress = (restElapsed / arena.restDuration) * 100;
                arena.activityProgress = restProgress;
                
                // Gradually restore HP and stamina during rest
                arena.hp = Math.min(arena.maxHp, arena.hp + 0.5);
                arena.stamina.current = Math.min(arena.stamina.max, arena.stamina.current + 1.0);
            }
            return;
        }

        // Check if HP is too low to continue
        if (arena.hp <= 0) {
            this.startRest();
            return;
        }
        
        // Apply cipka effects during activity
        this.applyCipkaEffects();

        // Gradually drain HP during activity (much slower to prevent constant rest)
        if (arena.currentQuest) {
            const hpDrain = 0.001 + (arena.currentQuest.difficulty * 0.0005);
            arena.hp = Math.max(0, arena.hp - hpDrain);
        } else {
            // Minimal drain when searching
            arena.hp = Math.max(0, arena.hp - 0.0002);
        }

        // Auto-start quest if none is active
        if (!arena.currentQuest) {
            this.startRandomQuest();
        } else {
            // Process quest based on format
            if (arena.currentQuest.objectives) {
                this.processObjectiveQuest();
            } else {
                this.processLegacyQuest();
            }
        }
    }

    startRandomQuest() {
        const arena = gameData.minigames.arena;
        const availableQuests = this.quests.filter(q => q.difficulty <= arena.level + 2);
        
        if (availableQuests.length === 0) return;
        
        const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
        
        // Deep copy the quest to avoid modifying the original
        arena.currentQuest = JSON.parse(JSON.stringify(randomQuest));
        
        // Detect quest format and initialize accordingly
        if (arena.currentQuest.objectives && Array.isArray(arena.currentQuest.objectives) && arena.currentQuest.objectives.length > 0) {
            // New objective-based quest format
            arena.currentObjectiveIndex = 0;
            arena.activityProgress = 0;
            arena.questTotalProgress = 0;
            arena.currentActivity = `${arena.currentQuest.objectives[0].name}`;
            
            this.addLog(`⚔️ <strong>NOWE WYZWANIE!</strong> Momo rozpoczyna "${randomQuest.name}". Cel: ${arena.currentQuest.objectives[0].description}`);
        } else {
            // Old stage-based quest format - fallback to original system
            arena.activityProgress = 0;
            arena.currentActivity = `Walka: ${randomQuest.name}`;
            
            this.addLog(`⚔️ <strong>NOWE WYZWANIE!</strong> Momo rozpoczyna "${randomQuest.name}". Jej oczy błyszczą determinacją w obliczu ${randomQuest.monster}!`);
        }
        
        // Reset combat systems for new quest
        arena.combatPhase = { current: 0, total: 5, progress: 0 };
        arena.skillTraining = { active: this.selectRandomSkillToTrain(), progress: 0 };
    }

    processObjectiveQuest() {
        const arena = gameData.minigames.arena;
        const quest = arena.currentQuest;
        
        // Defensive checks
        if (!quest || !quest.objectives || typeof arena.currentObjectiveIndex !== 'number') {
            console.warn('Invalid quest state, resetting quest');
            arena.currentQuest = null;
            return;
        }
        
        const currentObjective = quest.objectives[arena.currentObjectiveIndex];
        
        if (!currentObjective) {
            this.completeQuest();
            return;
        }
        
        // Progress calculation - balanced speed
        const levelBonus = arena.level <= 5 ? 1.3 : (arena.level <= 10 ? 1.1 : 1.0);
        const baseProgressGain = ((Math.random() * 0.003) + 0.003) * levelBonus;
        
        // Different progress rates for different activity types
        let progressMultiplier = 1.0;
        if (currentObjective.type === 'scout') progressMultiplier = 1.2; // Scouting is faster
        if (currentObjective.type === 'boss') progressMultiplier = 0.7; // Boss fights are slower
        
        const progressGain = baseProgressGain * progressMultiplier;
        
        // Initialize subProgress if it doesn't exist
        if (arena.subProgress === undefined) {
            arena.subProgress = 0;
        }
        
        // Accumulate smooth sub-progress between discrete actions
        arena.subProgress += progressGain * 100; // Convert to percentage
        
        // Calculate hybrid progress: base completed actions + smooth interpolation toward next action
        const baseProgress = (currentObjective.current / currentObjective.target) * 100;
        const nextActionProgress = Math.min(arena.subProgress, 100); // Cap at 100%
        const smoothProgress = baseProgress + (nextActionProgress / currentObjective.target);
        
        arena.activityProgress = Math.min(smoothProgress, 100); // Cap total at 100%
        
        // Update combat systems
        this.updateCombatPhases(progressGain);
        this.updateSkillTraining();
        this.updateStamina();
        this.updateEquipmentCondition();
        
        // Check if we should complete an action (kill a monster, gather an item, etc.)
        this.checkForActionCompletion(currentObjective, progressGain);
        
        // Check if current objective is completed
        if (currentObjective.current >= currentObjective.target) {
            this.completeCurrentObjective();
        }
    }

    processLegacyQuest() {
        const arena = gameData.minigames.arena;
        
        // Use original quest progression logic for old-format quests
        const levelBonus = arena.level <= 5 ? 1.5 : (arena.level <= 10 ? 1.2 : 1.0);
        const progressGain = ((Math.random() * 0.3) + 0.3) * levelBonus; // Increased from 0.003 to 0.3 for meaningful progress
        arena.activityProgress += progressGain;
        
        // Update combat systems
        this.updateCombatPhases(progressGain);
        this.updateSkillTraining();
        this.updateStamina();
        this.updateEquipmentCondition();
        
        // Complete quest when progress reaches 100%
        if (arena.activityProgress >= 100) {
            this.completeLegacyQuest();
        }
    }

    completeLegacyQuest() {
        const arena = gameData.minigames.arena;
        const quest = arena.currentQuest;
        const totalPower = this.calculateTotalPower();
        
        const baseSuccessRate = Math.min(0.95, 0.5 + (totalPower / (quest.difficulty * 20)));
        const success = Math.random() < baseSuccessRate;
        
        if (success) {
            const goldReward = quest.difficulty * 10 + Math.floor(Math.random() * quest.difficulty * 5);
            const expReward = quest.difficulty * 5 + Math.floor(Math.random() * quest.difficulty * 3);
            
            gameData.goldCoins += goldReward;
            arena.experience += expReward;
            arena.questsCompleted++;
            arena.goldEarned += goldReward;
            
            // Enhanced victory messages
            const victoryMessages = [
                `⚔️ <strong>ZWYCIĘSTWO!</strong> ${quest.monster} poległ pod ciosami Momo! Jej ciało emanuje mocą po triumfie. Zdobyto ${expReward} EXP i ${goldReward} złota.`,
                `🏆 <strong>TRIUMF!</strong> Momo zdominowała ${quest.monster} swoją finezją! Pot zwycięstwa spływa po jej skórze. Nagroda: ${expReward} EXP, ${goldReward} złota.`,
                `💥 <strong>DOSKONAŁE WYKONANIE!</strong> ${quest.monster} nie miał szans przeciwko Momo! Jej oczy błyszczą z satysfakcji. Zdobyto ${expReward} EXP i ${goldReward} złota.`
            ];
            const randomVictory = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
            this.addLog(randomVictory);
            
            // Chance for item drop
            if (Math.random() < 0.3) {
                this.dropRandomItem(quest.difficulty);
            }
            
            // Level up check
            while (arena.experience >= arena.experienceToNext) {
                this.levelUp();
            }
            
        } else {
            this.handleDefeat(quest);
        }
        
        // Clear current quest
        arena.currentQuest = null;
        arena.activityProgress = 0;
        arena.currentActivity = "Szukanie przeciwników...";
        
        // Update base stats
        this.updateBaseStats();
    }

    checkForActionCompletion(objective, progressGain) {
        const arena = gameData.minigames.arena;
        
        // Calculate chance for completing an action based on progress and type
        let actionChance = 0;
        
        switch (objective.type) {
            case 'scout':
                actionChance = progressGain * 10; // Slightly increased scouting frequency
                break;
            case 'hunt':
                actionChance = progressGain * 9; // Slightly increased monster kill frequency
                break;
            case 'gather':
                actionChance = progressGain * 8; // Slightly increased item gathering frequency
                break;
            case 'boss':
                actionChance = progressGain * 4; // Slightly increased boss phases
                break;
            default:
                actionChance = progressGain * 6;
                break;
        }
        
        // Complete action when subProgress reaches 100% instead of random chance
        if (arena.subProgress >= 100 && objective.current < objective.target) {
            arena.subProgress = 0; // Reset for next action
            this.completeAction(objective);
        }
    }

    completeAction(objective) {
        const arena = gameData.minigames.arena;
        
        console.log(`🔥 DEBUG: completeAction called for ${objective.actionText}`);
        
        // Increment objective progress
        objective.current++;
        
        // Give per-action rewards
        if (objective.perActionReward) {
            if (objective.perActionReward.gold) {
                gameData.goldCoins += objective.perActionReward.gold;
                arena.goldEarned += objective.perActionReward.gold;
            }
            if (objective.perActionReward.exp) {
                console.log(`🔥 DEBUG: Adding ${objective.perActionReward.exp} EXP. Current: ${arena.experience}, ToNext: ${arena.experienceToNext}`);
                arena.experience += objective.perActionReward.exp;
                
                // Check for level up after gaining experience
                console.log(`🔥 DEBUG: Checking levelup: ${arena.experience} >= ${arena.experienceToNext}?`);
                while (arena.experience >= arena.experienceToNext) {
                    console.log(`🔥 DEBUG: Calling levelUp() from completeAction`);
                    this.levelUp();
                }
            }
        }
        
        // Show action completion message with rewards
        const progressText = `${objective.current}/${objective.target}`;
        const rewardText = objective.perActionReward ? 
            `+${objective.perActionReward.gold || 0} złota, +${objective.perActionReward.exp || 0} EXP` : '';
        
        // Show messages occasionally to avoid spam - reduced frequency
        if (Math.random() < 0.05) {
            console.log(`🔥 DEBUG: Adding action log message`);
            this.addLog(`✅ ${objective.actionText}! (${progressText}) ${rewardText}`);
        }
    }

    completeCurrentObjective() {
        const arena = gameData.minigames.arena;
        const quest = arena.currentQuest;
        
        // Defensive checks
        if (!quest || !quest.objectives || typeof arena.currentObjectiveIndex !== 'number') {
            console.warn('Invalid quest state during objective completion');
            arena.currentQuest = null;
            return;
        }
        
        const completedObjective = quest.objectives[arena.currentObjectiveIndex];
        
        if (!completedObjective) {
            console.warn('No objective to complete, finishing quest');
            this.completeQuest();
            return;
        }
        
        // Give completion rewards
        if (completedObjective.completionReward) {
            if (completedObjective.completionReward.gold) {
                gameData.goldCoins += completedObjective.completionReward.gold;
                arena.goldEarned += completedObjective.completionReward.gold;
            }
            if (completedObjective.completionReward.exp) {
                arena.experience += completedObjective.completionReward.exp;
                
                // Check for level up after gaining experience
                while (arena.experience >= arena.experienceToNext) {
                    this.levelUp();
                }
            }
            
            // Item chance
            if (completedObjective.completionReward.itemChance && Math.random() < completedObjective.completionReward.itemChance) {
                this.dropRandomItem(arena.currentQuest.difficulty);
            }
        }
        
        // Update total quest progress
        arena.questTotalProgress += completedObjective.progressWeight;
        
        this.addLog(`🎯 <strong>CEL UKOŃCZONY!</strong> ${completedObjective.name} - Momo odniosła sukces! +${completedObjective.completionReward.gold || 0} złota, +${completedObjective.completionReward.exp || 0} EXP`);
        
        // Move to next objective
        arena.currentObjectiveIndex++;
        arena.subProgress = 0; // Reset subProgress for new objective
        // Don't reset activityProgress to 0 - let it calculate based on next objective's progress
        
        if (arena.currentObjectiveIndex < quest.objectives.length) {
            // Start next objective
            const nextObjective = quest.objectives[arena.currentObjectiveIndex];
            arena.currentActivity = nextObjective.name;
            this.addLog(`🎯 <strong>NOWY CEL:</strong> ${nextObjective.description}`);
        } else {
            // All objectives completed, finish quest
            this.completeQuest();
        }
    }

    updateCombatPhases(progressGain) {
        const arena = gameData.minigames.arena;
        const phases = ["🔍 Obserwacja", "⚔️ Atak", "🛡️ Obrona", "💥 Finisz", "🏆 Triumf"];
        
        arena.combatPhase.progress += progressGain * 3.0; // Reasonable phase progression speed
        
        // Add intermediate progress messages - reduced frequency to prevent spam
        if (arena.combatPhase.progress >= 8 && Math.random() < 0.003) {
            const currentPhase = phases[arena.combatPhase.current] || phases[0];
            const subActions = {
                "🔍 Obserwacja": ["skanuje otoczenie", "obserwuje przeciwnika", "analizuje słabości"],
                "⚔️ Atak": ["wykonuje precyzyjny cios", "kontratakuje", "naciera z determinacją"],
                "🛡️ Obrona": ["unika ataku", "blokuje cios", "odskakuje w tył"],
                "💥 Finisz": ["przygotowuje finałowy cios", "koncentruje moc", "szuka idealnego momentu"],
                "🏆 Triumf": ["cieszy się ze zwycięstwa", "odpoczywa po walce", "zbiera łupy"]
            };
            const actions = subActions[currentPhase] || ["działa strategicznie"];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            this.addLog(`⚡ ${currentPhase}: Momo ${randomAction}...`);
        }
        
        if (arena.combatPhase.progress >= 20) {
            arena.combatPhase.current = Math.min(arena.combatPhase.total - 1, arena.combatPhase.current + 1);
            arena.combatPhase.progress = 0;
            
            if (arena.combatPhase.current < phases.length) {
                const phaseText = phases[arena.combatPhase.current];
                if (Math.random() < 0.05) { // Reduced phase update frequency to prevent spam
                    this.addLog(`⚡ <strong>FAZA WALKI:</strong> ${phaseText} - Momo przechodzi do następnej fazy walki!`);
                }
            }
        }
    }

    updateSkillTraining() {
        const arena = gameData.minigames.arena;
        if (!arena.skillTraining.active) return;
        
        arena.skillTraining.progress += Math.random() * 0.5 + 0.2;
        
        if (arena.skillTraining.progress >= 100) {
            const skill = arena.skillTraining.active;
            arena.skillProgress[skill] += Math.random() * 1 + 0.5;
            arena.skillTraining.progress = 0;
            arena.skillTraining.active = this.selectRandomSkillToTrain();
            
            const skillNames = { sila: 'Siła', zrecznosc: 'Zręczność', inteligencja: 'Inteligencja', szczescie: 'Szczęście' };
            if (Math.random() < 0.02) { // Moderate training updates
                this.addLog(`💪 <strong>TRENING:</strong> ${skillNames[skill]} Momo wzrasta podczas walki!`);
            }
        }
    }

    updateStamina() {
        const arena = gameData.minigames.arena;
        
        // Stamina drains slower than HP but recovers faster
        if (arena.currentQuest) {
            // Calculate stamina efficiency from level and equipment
            const levelBonus = Math.max(0.5, 1 - (arena.level * 0.02)); // 2% reduction per level, min 50%
            const equipmentBonus = this.calculateEquipmentStaminaBonus();
            const finalDrain = 0.015 * levelBonus * equipmentBonus;
            arena.stamina.current = Math.max(0, arena.stamina.current - finalDrain);
        } else {
            arena.stamina.current = Math.min(arena.stamina.max, arena.stamina.current + 0.3);
        }
    }

    updateEquipmentCondition() {
        const arena = gameData.minigames.arena;
        
        // Equipment slowly degrades during combat
        if (arena.currentQuest) {
            const degradeRate = 0.02;
            Object.keys(arena.equipmentCondition).forEach(slot => {
                if (arena.equipment[slot]) {
                    arena.equipmentCondition[slot] = Math.max(0, arena.equipmentCondition[slot] - degradeRate);
                }
            });
        } else {
            // Equipment slowly repairs when not fighting
            const repairRate = 0.05;
            Object.keys(arena.equipmentCondition).forEach(slot => {
                arena.equipmentCondition[slot] = Math.min(100, arena.equipmentCondition[slot] + repairRate);
            });
        }
    }

    selectRandomSkillToTrain() {
        const skills = ['sila', 'zrecznosc', 'inteligencja', 'szczescie'];
        return skills[Math.floor(Math.random() * skills.length)];
    }

    completeQuest() {
        const arena = gameData.minigames.arena;
        const quest = arena.currentQuest;
        
        // Always succeed with the new objective system (failure handled at objective level)
        // Give final quest rewards
        if (quest.finalReward) {
            if (quest.finalReward.gold) {
                gameData.goldCoins += quest.finalReward.gold;
                arena.goldEarned += quest.finalReward.gold;
            }
            if (quest.finalReward.exp) {
                arena.experience += quest.finalReward.exp;
            }
            
            // Final item chance
            if (quest.finalReward.itemChance && Math.random() < quest.finalReward.itemChance) {
                this.dropRandomItem(quest.difficulty);
            }
        }
        
        arena.questsCompleted++;
        
        // Enhanced victory messages
        const victoryMessages = [
            `🏆 <strong>QUEST UKOŃCZONY!</strong> Momo triumfuje nad ${quest.monster}! Wszystkie cele zrealizowane z mistrzowską precyzją. Finalna nagroda: +${quest.finalReward.gold || 0} złota, +${quest.finalReward.exp || 0} EXP`,
            `⚔️ <strong>PEŁNE ZWYCIĘSTWO!</strong> ${quest.name} zakończony sukcesem! Momo pokonała wszystkie wyzwania. Jej ciało drży z satysfakcji. Nagroda: +${quest.finalReward.gold || 0} złota, +${quest.finalReward.exp || 0} EXP`,
            `💥 <strong>MISJA UKOŃCZONA!</strong> Momo błyszczy triumfem nad ${quest.monster}! Wszystkie etapy przeszła z gracją. Finał: +${quest.finalReward.gold || 0} złota, +${quest.finalReward.exp || 0} EXP`,
            `✨ <strong>TOTALNY TRIUMF!</strong> ${quest.name} - pełny sukces! Momo dominuje pole bitwy swoją determinacją. Ostateczna nagroda: +${quest.finalReward.gold || 0} złota, +${quest.finalReward.exp || 0} EXP`,
            `🔥 <strong>LEGEND QUEST!</strong> Momo kończy ${quest.name} w wielkim stylu! Jej oczy płoną dumą z osiągnięcia. Nagroda: +${quest.finalReward.gold || 0} złota, +${quest.finalReward.exp || 0} EXP`
        ];
        const randomVictory = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
        this.addLog(randomVictory);
        
        // Level up check (handle multiple level-ups)
        while (arena.experience >= arena.experienceToNext) {
            this.levelUp();
        }
        
        // Clear current quest
        arena.currentQuest = null;
        arena.currentObjectiveIndex = 0;
        arena.activityProgress = 0;
        arena.questTotalProgress = 0;
        arena.currentActivity = "Szukanie przeciwników...";
        
        // Update base stats based on skill progress
        this.updateBaseStats();
    }

    startRest() {
        const arena = gameData.minigames.arena;
        arena.isResting = true;
        arena.restStartTime = Date.now() / 1000;
        arena.currentQuest = null;
        arena.questProgress = 0;
        arena.activityProgress = 0;
        
        // Determine rest type and duration based on cipka effects
        const sensitivity = arena.cipkaEffects.sensitivity;
        const wetness = arena.cipkaEffects.wetness;
        
        if (sensitivity > 0.7 && wetness > 0.7) {
            // Very high sensitivity and wetness - intensywna masturbacja
            arena.restDuration = 20 + (arena.level * 1); // Level-based: 20-45s range
            arena.restActivity = 'intensywna_masturbacja';
            arena.currentActivity = "Intensywna Masturbacja";
            const intensiveMessages = [
                `🔥 <strong>DESPERACKA POTRZEBA!</strong> Momo jest tak napalona, że nie może się powstrzymać. Zaczyna intensywną masturbację, jej ręce wędrują po całym ciele... (${arena.restDuration}s)`,
                `💥 <strong>EKSPLOZJA POŻĄDANIA!</strong> Kombinacja wyczerpania i podniecenia zmusza Momo do natychmiastowej akcji. Intensywnie się masturbuje... (${arena.restDuration}s)`,
                `⚡ <strong>NIEPOHAMOWANA ŻĄDZA!</strong> Momo nie może się oprzeć - jej ciało płonie. Rozpoczyna dziko intensywną sesję samozaspokojenia... (${arena.restDuration}s)`
            ];
            const randomMessage = intensiveMessages[Math.floor(Math.random() * intensiveMessages.length)];
            this.addLog(randomMessage);
        } else if (sensitivity > 0.5 || wetness > 0.5) {
            // Moderate sensitivity or wetness - regular masturbacja
            arena.restDuration = 30 + (arena.level * 2); // Level-based: 30-75s range
            arena.restActivity = 'masturbacja';
            arena.currentActivity = "Masturbacja";
            const masturbationMessages = [
                `😈 <strong>INTYMNA PRZERWA!</strong> Wyczerpanie miesza się z podnieceniem. Momo decyduje się na masturbację, by odzyskać siły w przyjemny sposób... (${arena.restDuration}s)`,
                `💦 <strong>SŁODKA REGENERACJA!</strong> Momo czuje, że potrzebuje czegoś więcej niż zwykły odpoczynek. Zaczyna się masturbować, by połączyć przyjemność z regeneracją... (${arena.restDuration}s)`,
                `🔥 <strong>ZMYSŁOWY ODPOCZYNEK!</strong> Zamiast zwykłej regeneracji, Momo wybiera bardziej... osobistą metodę. Jej ręce wędrują w intymne miejsca... (${arena.restDuration}s)`
            ];
            const randomMessage = masturbationMessages[Math.floor(Math.random() * masturbationMessages.length)];
            this.addLog(randomMessage);
        } else {
            // Low sensitivity/wetness - standard rest
            arena.restDuration = 60 + (arena.level * 4); // Level-based: 60-160s range
            arena.restActivity = 'standard';
            arena.currentActivity = "Odpoczynek";
            const standardMessages = [
                `💤 <strong>POTRZEBA REGENERACJI</strong> Momo opada z wyczerpania, jej ciało domaga się odpoczynku. Zamyka oczy i skupia się na odzyskaniu sił... (${arena.restDuration}s)`,
                `😴 <strong>MEDYTACJA BOJOWA</strong> Wyczerpanie bierze górę. Momo siada w pozycji lotosu, jej oddech staje się głęboki i rytmiczny... (${arena.restDuration}s)`,
                `💫 <strong>CZAS NA REGENERACJĘ</strong> Momo czuje, jak energia opuszcza jej ciało. Kładzie się wygodnie, pozwalając swojemu ciału się zregenerować... (${arena.restDuration}s)`
            ];
            const randomMessage = standardMessages[Math.floor(Math.random() * standardMessages.length)];
            this.addLog(randomMessage);
        }
    }

    calculateTotalPower() {
        const arena = gameData.minigames.arena;
        let power = 0;
        
        // Base stats
        power += arena.stats.sila;
        power += arena.stats.zrecznosc;
        power += arena.stats.inteligencja;
        power += arena.stats.szczescie;
        
        // Physical attributes with bonuses
        power += arena.stats.cyce * 2; // Cyce give bonus to enemy morale (negative for them)
        power += arena.stats.dupa * 1.5; // Dupa gives bonus to agility
        
        if (arena.equipment.weapon) power += arena.equipment.weapon.power;
        if (arena.equipment.armor) power += arena.equipment.armor.power;
        if (arena.equipment.accessory) power += arena.equipment.accessory.power;
        if (arena.equipment.artefakt) power += arena.equipment.artefakt.power;
        
        return Math.floor(power);
    }

    calculateEquipmentStaminaBonus() {
        const arena = gameData.minigames.arena;
        let bonus = 1.0; // Base multiplier (no bonus)
        
        // Equipment bonuses - better equipment reduces stamina drain
        if (arena.equipment.weapon) {
            bonus -= Math.min(0.1, arena.equipment.weapon.power * 0.002); // Max 10% reduction
        }
        if (arena.equipment.armor) {
            bonus -= Math.min(0.15, arena.equipment.armor.power * 0.003); // Max 15% reduction
        }
        if (arena.equipment.accessory) {
            bonus -= Math.min(0.08, arena.equipment.accessory.power * 0.002); // Max 8% reduction
        }
        if (arena.equipment.artefakt) {
            bonus -= Math.min(0.2, arena.equipment.artefakt.power * 0.004); // Max 20% reduction
        }
        
        // Ensure bonus doesn't go below 0.5 (max 50% total reduction)
        return Math.max(0.5, bonus);
    }

    handleDefeat(quest) {
        const arena = gameData.minigames.arena;
        
        // Base defeat message with more engaging descriptions
        const defeatMessages = [
            `💥 <strong>${quest.name}</strong> zakończony porażką! ${quest.monster} przytłoczył Momo swoją potęgą, zmuszając ją do uległości...`,
            `⚔️ <strong>PORAŻKA!</strong> ${quest.monster} okazał się zbyt doświadczony dla Momo. Jej ciało drży po intensywnej walce...`,
            `🔥 <strong>${quest.name}</strong> nieudany! ${quest.monster} zdominował Momo, pozostawiając ją wyczerpaną i pokonaną...`,
            `💫 <strong>KLĘSKA!</strong> Momo nie mogła sprostać ${quest.monster}. Jej oddech jest szybki, a ciało pokryte potem...`
        ];
        const randomMessage = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
        this.addLog(randomMessage);
        
        // Determine what happens based on monster type and current cipka status
        const defeatOutcomes = [
            {
                condition: () => quest.monster.includes("Succubus"),
                action: () => {
                    if (arena.stats.cipka === "Dziewicza") {
                        arena.stats.cipka = "Naznaczona";
                        arena.cipkaEffects.corruption += 0.3;
                        arena.cipkaEffects.sensitivity += 0.2;
                        arena.cipkaEffects.magic_resistance = Math.max(0, arena.cipkaEffects.magic_resistance - 0.2);
                        this.addLog(`💋 <strong>NAZNACZENIE!</strong> Succubus zostawiła swój znak na ciele Momo. Jej cipka jest teraz <strong>Naznaczona</strong> mocą demona. Korupcja +30%, Wrażliwość +20%!`);
                    } else {
                        arena.cipkaEffects.corruption = Math.min(1, arena.cipkaEffects.corruption + 0.1);
                        this.addLog(`💋 Succubus próbowała naznacz Momo, ale jej cipka jest już zbyt doświadczona. Korupcja +10%.`);
                    }
                }
            },
            {
                condition: () => quest.monster.includes("Amazonka"),
                action: () => {
                    if (["Dziewicza", "Wilgotna"].includes(arena.stats.cipka)) {
                        arena.stats.cipka = "Rozciągnięta";
                        arena.cipkaEffects.sensitivity = Math.max(0, arena.cipkaEffects.sensitivity - 0.1);
                        arena.cipkaEffects.wetness = Math.min(1, arena.cipkaEffects.wetness + 0.3);
                        this.addLog(`🏹 <strong>DOMINACJA!</strong> Dzika Amazonka użyła swoich narzędzi. Cipka Momo jest teraz <strong>Rozciągnięta</strong>. Wilgotność +30%!`);
                    } else {
                        arena.cipkaEffects.wetness = Math.min(1, arena.cipkaEffects.wetness + 0.1);
                        this.addLog(`🏹 Amazonka próbowała zdominować Momo, ale jej ciało jest już przyzwyczajone. Wilgotność +10%.`);
                    }
                }
            },
            {
                condition: () => quest.monster.includes("Wiedźma"),
                action: () => {
                    arena.stats.cipka = "Przeklęta";
                    arena.cipkaEffects.magic_resistance = Math.max(0, arena.cipkaEffects.magic_resistance - 0.5);
                    arena.cipkaEffects.corruption = Math.min(1, arena.cipkaEffects.corruption + 0.4);
                    arena.cipkaEffects.sensitivity = Math.min(1, arena.cipkaEffects.sensitivity + 0.3);
                    this.addLog(`🔮 <strong>KLĄTWA!</strong> Stara Wiedźma rzuciła na Momo potężną klątwę. Jej cipka jest teraz <strong>Przeklęta</strong>. Odporność Mag. -50%, Korupcja +40%!`);
                }
            },
            {
                condition: () => quest.monster.includes("Bogini"),
                action: () => {
                    arena.stats.cipka = "Błogosławiona";
                    arena.cipkaEffects.magic_resistance = Math.min(1, arena.cipkaEffects.magic_resistance + 0.3);
                    arena.cipkaEffects.corruption = Math.max(0, arena.cipkaEffects.corruption - 0.2);
                    arena.cipkaEffects.sensitivity = Math.min(1, arena.cipkaEffects.sensitivity + 0.1);
                    this.addLog(`✨ <strong>BŁOGOSŁAWIEŃSTWO!</strong> Bogini Miłości błogosławi Momo. Jej cipka jest teraz <strong>Błogosławiona</strong>. Odporność Mag. +30%, Korupcja -20%!`);
                }
            },
            {
                condition: () => quest.monster.includes("Minotaur"),
                action: () => {
                    if (["Dziewicza", "Wilgotna", "Rozgrzana"].includes(arena.stats.cipka)) {
                        arena.stats.cipka = "Zniszczona";
                        arena.cipkaEffects.sensitivity = Math.max(0, arena.cipkaEffects.sensitivity - 0.3);
                        arena.cipkaEffects.wetness = Math.min(1, arena.cipkaEffects.wetness + 0.5);
                        arena.cipkaEffects.recovery_time = Math.min(2, arena.cipkaEffects.recovery_time + 0.5);
                        this.addLog(`🐂 <strong>ZNISZCZENIE!</strong> Żelazny Minotaur nie miał litości. Cipka Momo została <strong>Zniszczona</strong>. Wrażliwość -30%, Wilgotność +50%!`);
                    } else {
                        arena.cipkaEffects.wetness = Math.min(1, arena.cipkaEffects.wetness + 0.2);
                        this.addLog(`🐂 Minotaur próbował zdominować Momo, ale jej ciało wytrzymało atak. Wilgotność +20%.`);
                    }
                }
            },
            {
                condition: () => quest.monster.includes("Demon"),
                action: () => {
                    arena.cipkaEffects.corruption = Math.min(1, arena.cipkaEffects.corruption + 0.2);
                    arena.cipkaEffects.magic_resistance = Math.max(0, arena.cipkaEffects.magic_resistance - 0.1);
                    arena.cipkaEffects.sensitivity = Math.min(1, arena.cipkaEffects.sensitivity + 0.15);
                    this.addLog(`👹 <strong>DEMONICZNE DOTKNIĘCIE!</strong> Demon pozostawił swój ślad na ciele Momo. Korupcja +20%, Wrażliwość +15%!`);
                }
            },
            {
                condition: () => quest.monster.includes("Anioł"),
                action: () => {
                    arena.cipkaEffects.corruption = Math.max(0, arena.cipkaEffects.corruption - 0.15);
                    arena.cipkaEffects.magic_resistance = Math.min(1, arena.cipkaEffects.magic_resistance + 0.1);
                    arena.cipkaEffects.sensitivity = Math.min(1, arena.cipkaEffects.sensitivity + 0.05);
                    this.addLog(`👼 <strong>ANIELSKI DOTYK!</strong> Anioł oczyszcza część korupcji z ciała Momo. Korupcja -15%, Odporność Mag. +10%!`);
                }
            },
            {
                condition: () => true, // Default case
                action: () => {
                    const genericOutcomes = [
                        `😈 <strong>DOMINACJA!</strong> ${quest.monster} wykorzystał moment słabości Momo. Jej ciało drży, ale duch pozostaje nieugięty.`,
                        `⚔️ <strong>BOLESNA LEKCJA!</strong> ${quest.monster} pokazał Momo jej miejsce. Pot spływa po jej skórze, a oddech jest ciężki.`,
                        `🩸 <strong>SUROWA RZECZYWISTOŚĆ!</strong> ${quest.monster} nie miał litości. Momo leży pokonana, ale jej oczy płoną żądzą rewanżu.`,
                        `💥 <strong>PRZYTŁACZAJĄCA SIŁA!</strong> ${quest.monster} zdominował Momo swoją potęgą. Jej ciało jest wyczerpane, ale pragnienie zwycięstwa pozostaje.`,
                        `🔥 <strong>INTENSYWNE STARCIE!</strong> ${quest.monster} zmusił Momo do poddania. Jej skóra jest rozgrzana, a serce bije szybko.`,
                        `💫 <strong>LEKCJA POKORY!</strong> ${quest.monster} pokazał Momo, co to prawdziwa moc. Drży z wyczerpania, ale jej determinacja nie słabnie.`
                    ];
                    const randomOutcome = genericOutcomes[Math.floor(Math.random() * genericOutcomes.length)];
                    this.addLog(randomOutcome);
                }
            }
        ];
        
        // Apply the first matching outcome
        const outcome = defeatOutcomes.find(o => o.condition());
        if (outcome) {
            outcome.action();
        }
        
        // Additional HP damage from defeat
        arena.hp = Math.max(0, arena.hp - 10);
    }

    levelUp() {
        const arena = gameData.minigames.arena;
        
        console.log(`🔥 DEBUG: levelUp() called! Current: level=${arena.level}, exp=${arena.experience}, expToNext=${arena.experienceToNext}`);
        
        // Ensure experience doesn't go negative or overflow
        const excessExp = arena.experience - arena.experienceToNext;
        
        arena.level++;
        arena.experienceToNext = Math.floor(arena.experienceToNext * 1.5);
        arena.experience = Math.max(0, excessExp); // Carry over excess experience
        
        // Award level up items and bonuses
        this.awardLevelUpItems();
        
        const skills = ['sila', 'zrecznosc', 'inteligencja', 'szczescie']; // Only trainable stats for level-up
        const skillNames = { sila: 'Siła', zrecznosc: 'Zręczność', inteligencja: 'Inteligencja', szczescie: 'Szczęście', cyce: 'Cyce', dupa: 'Dupa' };
        
        const randomStat = skills[Math.floor(Math.random() * skills.length)];
        const statIncrease = Math.floor(Math.random() * 3) + 1;
        
        if (arena.skillProgress[randomStat] !== undefined) {
            arena.skillProgress[randomStat] += statIncrease * 10;
        }
        
        const goldReward = arena.level * 50;
        gameData.goldCoins += goldReward;
        arena.goldEarned += goldReward;
        
        const levelUpMessages = [
            `🌟 <strong>EWOLUCJA MOCY!</strong> Momo osiągnęła poziom ${arena.level}! Jej ${skillNames[randomStat]} wzrosła o ${statIncrease} punktów. Ciało przeszywa fala energii! Bonus: ${goldReward} złota.`,
            `⭐ <strong>TRANSCENDENCJA!</strong> Poziom ${arena.level} odblokowany! ${skillNames[randomStat]} Momo zwiększyła się o ${statIncrease}. Czuje, jak moc przepływa przez jej żyły! Złoto: ${goldReward}.`,
            `💫 <strong>PRZEBUDZENIE SIŁY!</strong> Momo awansowała na poziom ${arena.level}! Jej ${skillNames[randomStat]} rozwinęła się o ${statIncrease} punktów. Jej ciało drży z nowej mocy! Nagroda: ${goldReward} złota.`,
            `✨ <strong>METAMORFOZA!</strong> Poziom ${arena.level} osiągnięty! ${skillNames[randomStat]} Momo wzmocniła się o ${statIncrease}. Jej aura staje się bardziej intensywna! Bonus: ${goldReward} złota.`
        ];
        const randomLevelUp = levelUpMessages[Math.floor(Math.random() * levelUpMessages.length)];
        this.addLog(randomLevelUp);
        
        // Major milestone rewards and cipka status changes
        if (arena.level % 5 === 0) {
            const bonusGold = arena.level * 100;
            gameData.goldCoins += bonusGold;
            arena.goldEarned += bonusGold;
            this.addLog(`🏆 <strong>KAMIEŃ MILOWY!</strong> Poziom ${arena.level} osiągnięty! Bonus: ${bonusGold} złota!`);
            
            // Update cipka status based on level milestones
            this.updateCipkaStatus();
        }
    }

    updateCipkaStatus() {
        const arena = gameData.minigames.arena;
        const level = arena.level;
        
        if (level >= 25) {
            arena.stats.cipka = "Legendarna";
            this.addLog(`💎 <strong>TRANSCENDENCJA INTYMNOŚCI!</strong> Cipka Momo przekroczyła wszystkie granice, osiągając status <strong>Legendarny</strong>! Emanuje nieziemską aurą pożądania...`);
        } else if (level >= 20) {
            arena.stats.cipka = "Doświadczona";
            this.addLog(`🔥 <strong>MISTRZOSTWO CIAŁA!</strong> Niezliczone walki ukształtowały cipkę Momo. Jest teraz <strong>Doświadczona</strong> i gotowa na każde wyzwanie!`);
        } else if (level >= 15) {
            arena.stats.cipka = "Zapoznana";
            this.addLog(`💫 <strong>ODKRYWANIE GRANIC!</strong> Cipka Momo przeszła intensywną metamorfozę. Jest teraz <strong>Zapoznana</strong> z najgłębszymi tajnikami walki!`);
        } else if (level >= 10) {
            arena.stats.cipka = "Rozgrzana";
            this.addLog(`🌡️ <strong>PŁOMIEŃ NAMIĘTNOŚCI!</strong> Walki rozpaliły ogień w ciele Momo. Jej cipka staje się <strong>Rozgrzana</strong>, pulsując z energią!`);
        } else if (level >= 5) {
            arena.stats.cipka = "Wilgotna";
            this.addLog(`💧 <strong>PIERWSZE PRZEBUDZENIE!</strong> Intensywność walk budzi nowe odczucia w Momo. Jej cipka staje się <strong>Wilgotna</strong> z oczekiwania...`);
        }
    }

    applyCipkaEffects() {
        const arena = gameData.minigames.arena;
        
        // Gradual changes during combat
        if (arena.currentQuest) {
            // More dynamic wetness changes during combat
            const intensityMultiplier = arena.currentQuest.difficulty / 10;
            arena.cipkaEffects.wetness = Math.min(1, arena.cipkaEffects.wetness + (0.003 * intensityMultiplier));
            
            // Sensitivity increases during combat phases
            if (arena.combatPhase && arena.combatPhase.current >= 2) {
                arena.cipkaEffects.sensitivity = Math.min(1, arena.cipkaEffects.sensitivity + 0.002);
            }
            
            // High corruption affects sensitivity more dramatically
            if (arena.cipkaEffects.corruption > 0.5) {
                arena.cipkaEffects.sensitivity = Math.min(1, arena.cipkaEffects.sensitivity + 0.001);
            }
            
            // Magic resistance slowly recovers over time
            if (arena.cipkaEffects.magic_resistance < 1) {
                arena.cipkaEffects.magic_resistance = Math.min(1, arena.cipkaEffects.magic_resistance + 0.0002);
            }
            
            // Corruption slowly decreases over time if not reinforced
            if (arena.cipkaEffects.corruption > 0) {
                arena.cipkaEffects.corruption = Math.max(0, arena.cipkaEffects.corruption - 0.0001);
            }
        }
        
        // Rest helps recover from extreme states
        if (arena.isResting) {
            arena.cipkaEffects.wetness = Math.max(0, arena.cipkaEffects.wetness - 0.005);
            arena.cipkaEffects.sensitivity = Math.max(0.5, arena.cipkaEffects.sensitivity - 0.002);
            arena.cipkaEffects.recovery_time = Math.max(1, arena.cipkaEffects.recovery_time - 0.001);
        }
        
        // Apply cipka effects to combat performance
        const effects = arena.cipkaEffects;
        
        // High corruption can unlock special abilities but increases risk
        if (effects.corruption > 0.8) {
            // Chance for corruption-based combat bonus
            if (Math.random() < 0.002) {
                this.addLog(`🖤 <strong>MROK DAJE MOC!</strong> Korupcja przepływa przez ciało Momo jak czarna magia, wzmacniając jej każdy ruch! Jej oczy błyszczą niebezpiecznym blaskiem...`);
                arena.experience += 10;
            }
        }
        
        // Low magic resistance makes her vulnerable to magical attacks
        if (effects.magic_resistance < 0.3 && Math.random() < 0.002) {
            this.addLog(`🔮 <strong>PRZEBICIE OBRONY!</strong> Magiczne energie przenikają przez osłabione bariery Momo! Jej ciało drży pod wpływem niestabilnych sił...`);
            arena.hp = Math.max(0, arena.hp - 2);
        }
        
        // High sensitivity affects her performance
        if (effects.sensitivity > 0.8 && Math.random() < 0.002) {
            this.addLog(`💫 <strong>ZMYSŁOWE PRZECIĄŻENIE!</strong> Każdy dotyk, każdy ruch wywołuje w Momo fale intensywnych doznań! Jej oddech staje się ciężki, trudno jej się skupić...`);
            arena.hp = Math.max(0, arena.hp - 1);
        }
    }

    updateBaseStats() {
        const arena = gameData.minigames.arena;
        const allSkills = ['sila', 'zrecznosc', 'inteligencja', 'szczescie', 'cyce', 'dupa'];
        
        allSkills.forEach(skill => {
            const progress = Math.floor(arena.skillProgress[skill]);
            const baseValue = skill === 'sila' ? 10 : 
                             skill === 'zrecznosc' ? 6 : 
                             skill === 'inteligencja' ? 5 : 
                             skill === 'szczescie' ? 7 : 
                             10; // cyce and dupa start at 10
                             
            // Base stat = initial value + progress bonus
            const bonusFromProgress = Math.floor(progress / 10); // Every 10 progress = +1 stat
            const newValue = Math.min(baseValue + bonusFromProgress, arena.skillCaps[skill]);
            
            if (skill === 'cyce' || skill === 'dupa') {
                // Physical attributes stay at 10 but can't go higher
                arena.stats[skill] = Math.min(10, newValue);
            } else {
                arena.stats[skill] = newValue;
            }
        });
    }

    awardLevelUpItems() {
        // 20% chance for item drop on level up
        if (Math.random() < 0.2) {
            this.dropRandomItem(Math.min(10, gameData.minigames.arena.level));
        }
    }

    dropRandomItem(difficulty) {
        const arena = gameData.minigames.arena;
        const availableItems = this.items.filter(item => {
            const itemLevel = item.power / 5; // Rough item level based on power
            return itemLevel <= difficulty + 2;
        });
        
        if (availableItems.length === 0) return;
        
        const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        const currentEquipped = arena.equipment[randomItem.type];
        
        // Only equip if it's better or if no item is equipped
        if (!currentEquipped || randomItem.power > currentEquipped.power) {
            arena.equipment[randomItem.type] = randomItem;
            arena.itemsFound++;
            
            let rarityColor = '';
            switch(randomItem.rarity) {
                case 'common': rarityColor = '🤍'; break;
                case 'uncommon': rarityColor = '💚'; break;
                case 'rare': rarityColor = '💙'; break;
                case 'legendary': rarityColor = '🧡'; break;
                default: rarityColor = '⚪'; break;
            }
            
            const effectText = randomItem.effect ? ` z efektem ${this.effectDescriptions[randomItem.effect] || randomItem.effect}` : '';
            this.addLog(`✨ <strong>ZNALEZISKO!</strong> ${rarityColor} Momo zdobyła "${randomItem.name}" (${randomItem.power} mocy)${effectText}! Automatycznie wyposażono.`);
        } else {
            // Item wasn't useful, give small gold compensation
            const goldValue = Math.floor(randomItem.power * 2);
            gameData.goldCoins += goldValue;
            arena.goldEarned += goldValue;
            this.addLog(`💰 <strong>DUPLIKAT:</strong> "${randomItem.name}" sprzedany za ${goldValue} złota (słabszy od obecnego wyposażenia).`);
        }
    }
}

// Create global instance
window.ArenaSystem = new ArenaSystem();

// ======= EMERGENCY DEBUG COMMANDS =======
// These are temporary emergency functions to repair the broken system

// Force unlock arena (call from console: forceUnlockArena())
window.forceUnlockArena = function() {
    console.log('🎆 EMERGENCY: Force unlocking arena...');
    
    // Ensure game data structure exists
    if (!window.gameData) {
        console.error('❌ gameData not found!');
        return false;
    }
    
    if (!window.gameData.minigames) {
        console.log('⚠️ Creating missing minigames structure');
        window.gameData.minigames = {};
    }
    
    if (!window.gameData.minigames.arena) {
        console.log('⚠️ Creating missing arena structure');
        window.gameData.minigames.arena = {
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
            questsCompleted: 0
        };
    }
    
    // Force unlock
    window.gameData.minigames.arena.unlocked = true;
    console.log('✅ Arena unlocked in gameData');
    
    // Check if Momo exists and trigger callback
    if (window.characterData && window.characterData.momo && window.characterData.momo.arenaCallbacks) {
        try {
            window.characterData.momo.arenaCallbacks.onArenaUnlock.call(window.characterData.momo);
            console.log('✅ Momo arena callback triggered');
        } catch (error) {
            console.error('❌ Error triggering Momo callback:', error);
        }
    }
    
    console.log('✨ Arena force unlock complete! Try accessing arena now.');
    return true;
};

// Debug arena state (call from console: debugArenaState())
window.debugArenaState = function() {
    console.log('🔍=== ARENA DEBUG STATE ===');
    console.log('gameData exists:', !!window.gameData);
    console.log('gameData.minigames exists:', !!window.gameData?.minigames);
    console.log('gameData.minigames.arena exists:', !!window.gameData?.minigames?.arena);
    console.log('Arena unlocked:', window.gameData?.minigames?.arena?.unlocked);
    console.log('ArenaSystem exists:', !!window.ArenaSystem);
    console.log('Momo character exists:', !!window.characterData?.momo);
    console.log('Momo unlocked:', window.gameData?.characters?.momo?.unlocked);
    console.log('Story system exists:', !!window.storySystem);
    console.log('=========================');
};

// Test arena functionality (call from console: testArenaFunctionality())
window.testArenaFunctionality = function() {
    console.log('🧪 Testing arena functionality...');
    
    if (!window.ArenaSystem) {
        console.error('❌ ArenaSystem not found!');
        return false;
    }
    
    try {
        // Test basic methods
        console.log('Testing processActivity:', typeof window.ArenaSystem.processActivity);
        console.log('Testing displayArena:', typeof window.ArenaSystem.displayArena);
        
        // Try to display arena
        if (typeof window.ArenaSystem.displayArena === 'function') {
            window.ArenaSystem.displayArena();
            console.log('✅ Arena display attempted');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error testing arena:', error);
        return false;
    }
};