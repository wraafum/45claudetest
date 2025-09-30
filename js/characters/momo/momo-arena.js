// Momo - Arena System Integration
// Connects Momo character with the Arena minigame system

if (window.characterData && window.characterData.momo) {
    // Arena-specific properties for Momo
    window.characterData.momo.arenaData = {
        // Arena unlock requirements
        arenaUnlockEvent: 'momo_7', // Arena unlocks after story event 7
        arenaUnlockMessage: 'Momo tworzy własną arenę! Nowy minigra odblokowany!',
        
        // Arena integration bonuses
        arenaBonuses: {
            lustMultiplier: 0.1, // 10% bonus lust generation when arena is active
            bondMultiplier: 0.15, // 15% bonus bond generation from arena activities
            experienceShare: true // Momo gains bond when arena experience is gained
        },
        
        // Special arena interactions
        arenaInteractions: [
            {
                threshold: 100, // Bond threshold
                message: "Momo obserwuje twoje walki w arenie z fascynacją. 'Stajesz się silniejszy,' mruczy z aprobatą.",
                bonus: { lust: 50 }
            },
            {
                threshold: 500,
                message: "Momo zaczyna dawać ci wskazówki bojowe. Jej doświadczenie przekłada się na lepsze wyniki w arenie.",
                bonus: { arenaExpBonus: 0.2 }
            },
            {
                threshold: 1000,
                message: "'Jesteś już prawdziwym wojownikiem,' mówi Momo, dotykając delikatnie twojej dłoni. Czujesz przepływ jej mocy.",
                bonus: { arenaExpBonus: 0.5, lustMultiplier: 0.2 }
            }
        ]
    };
    
    // Arena event callbacks for Momo
    window.characterData.momo.arenaCallbacks = {
        onArenaUnlock: function() {
            console.log('🎮 Momo arena unlock callback triggered');
            
            // Ensure gameData structure exists
            if (!gameData) {
                console.error('❌ gameData not found in Momo arena callback');
                return;
            }
            
            if (!gameData.minigames) {
                console.log('⚠️ Creating missing minigames structure in Momo callback');
                gameData.minigames = {};
            }
            
            if (!gameData.minigames.arena) {
                console.log('⚠️ Creating missing arena structure in Momo callback');
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
            console.log('✅ Arena unlocked by Momo callback');
                
            // Show notification
            if (typeof showNotification === 'function') {
                showNotification(this.arenaData.arenaUnlockMessage, 'success', 5000);
            } else if (typeof window.showNotification === 'function') {
                window.showNotification('🎮 Arena Momo została odblokowana!', 'success', 5000);
            }
            
            // Add essence reward for arena unlock
            if (gameData.sanctuaryEssence !== undefined) {
                gameData.sanctuaryEssence += 2;
                if (typeof showNotification === 'function') {
                    showNotification('Otrzymano 2 Esencję Sanktuarium!', 'info', 3000);
                } else if (typeof window.showNotification === 'function') {
                    window.showNotification('Otrzymano 2 Esencję Sanktuarium!', 'info', 3000);
                }
            }
            
            // Force UI update
            if (typeof updateAllUI === 'function') {
                setTimeout(updateAllUI, 100);
            } else if (typeof window.updateAllUI === 'function') {
                setTimeout(window.updateAllUI, 100);
            }
            
            console.log('🎮 Momo arena unlock callback completed successfully');
        },
        
        onArenaLevelUp: function(newLevel) {
            if (this.arenaData.arenaBonuses.experienceShare) {
                const bondGain = newLevel * 5; // 5 bond per arena level
                
                // Apply bond points only to the active character
                if (gameData.activeCharacterId === this.id) {
                    this.bondPoints += bondGain;
                    
                    if (typeof showNotification === 'function') {
                        showNotification(`Momo czuje twoją rosnącą siłę! +${bondGain} więzi`, 'info', 2000);
                    }
                } else if (typeof showNotification === 'function') {
                    showNotification(`Momo cieszyłaby się z twojej siły, ale inna postać jest aktywna`, 'warning', 2000);
                }
            }
        },
        
        onArenaQuest: function(questCompleted) {
            // Check for special interactions based on bond level
            const interactions = this.arenaData.arenaInteractions;
            for (const interaction of interactions) {
                if (this.bondPoints >= interaction.threshold && !interaction.triggered) {
                    interaction.triggered = true;
                    
                    if (typeof showNotification === 'function') {
                        showNotification(interaction.message, 'special', 4000);
                    }
                    
                    // Apply bonuses
                    if (interaction.bonus) {
                        if (interaction.bonus.lust) {
                            gameData.lustPoints += interaction.bonus.lust;
                        }
                        // Other bonuses can be applied here
                    }
                    break;
                }
            }
        }
    };
}

// Hook into arena system if available
if (window.ArenaSystem) {
    const originalProcessActivity = window.ArenaSystem.processActivity.bind(window.ArenaSystem);
    
    // Preserve arena's throttling mechanism by adding our own throttling to the wrapper
    let lastMomoUpdateTime = 0;
    
    window.ArenaSystem.processActivity = function() {
        // CRITICAL: Call original function first - it has its own throttling
        originalProcessActivity();
        
        // Throttle Momo-specific updates to same frequency as arena (50ms = 20 FPS)
        const now = Date.now();
        if (now - lastMomoUpdateTime < 50) return;
        lastMomoUpdateTime = now;
        
        // Notify Momo of arena activities
        const momo = gameData?.characters?.momo;
        if (momo && momo.unlocked && momo.arenaCallbacks) {
            // Check if arena level changed
            const arena = gameData.minigames.arena;
            if (arena && arena.level !== momo._lastArenaLevel) {
                momo._lastArenaLevel = arena.level;
                momo.arenaCallbacks.onArenaLevelUp.call(momo, arena.level);
            }
            
            // Check for completed quests
            if (arena && arena.questsCompleted !== momo._lastQuestsCompleted) {
                momo._lastQuestsCompleted = arena.questsCompleted;
                momo.arenaCallbacks.onArenaQuest.call(momo, true);
            }
        }
    };
}

console.log('Momo arena integration loaded');