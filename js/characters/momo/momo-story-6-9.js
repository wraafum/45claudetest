// Momo - Story Events 6-9
// Intimacy, arena unlock, and relationship culmination

if (window.characterData && window.characterData.momo) {
    window.characterData.momo.storyEvents.push(
        {
            id: 'momo_6',
            title: "Pierwsza Bliskość",
            cg: "imgs/cg/momo/momo_6.png",
            text: "Momo w końcu otwiera kapsułę na krótko, pozwalając ci dotknąć jej prawdziwego ciała. Jej skóra jest jednocześnie miękka i twarda od mięśni. Drży pod twoim dotykiem.\n\n'To... to nie jest jak w arenie,' szepcze, jej oddech staje się szybki. 'Tam czuję tylko walkę. Ale to...' Jej dłoń łapie twoją, przyciskając ją do swojego serca. 'To jest prawdziwe. Ty jesteś prawdziwy.' Jej usta zbliżają się do twoich. 'Pokarz mi, jak wygląda zwycięstwo w prawdziwym świecie.'"
        },
        {
            id: 'momo_7',
            title: "Arena Namiętności",
            cg: "imgs/cg/momo/momo_7.png",
            text: "Momo w końcu decyduje się na coś niezwykłego - tworzy prywatną arenę, gdzie jej awatar może walczyć z twoim. Ale te walki to nie zwykły combat - to taniec ciał, gdzie każdy ruch kończy się coraz bardziej intymnym kontaktem. 'Walczymy, ale nie o zwycięstwo,' szepcze, gdy wasz taniec staje się coraz bardziej namiętny. 'Walczymy o to, kto pierwszy się podda przyjemności. Chcę założyć prawdziwą arenę, gdzie inni mogą zobaczyć naszą moc!'",
            unlocks: { minigame: 'arena' },
            onShow: function() {
                console.log('🎮 momo_7 onShow triggered - starting arena unlock process');
                
                // Ensure arena minigame data exists in gameData
                if (!window.gameData) {
                    console.error('❌ gameData not found - cannot unlock arena');
                    return;
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
                
                // Direct arena unlock
                window.gameData.minigames.arena.unlocked = true;
                console.log('✅ Arena unlocked directly by momo_7 event');
                
                // Trigger Momo's arena unlock callback
                const momo = window.characterData?.momo;
                if (momo && momo.arenaCallbacks && momo.arenaCallbacks.onArenaUnlock) {
                    try {
                        momo.arenaCallbacks.onArenaUnlock.call(momo);
                        console.log('✅ Momo arena callback triggered successfully');
                    } catch (error) {
                        console.error('❌ Error triggering Momo arena callback:', error);
                    }
                } else {
                    console.warn('⚠️ Momo arena callbacks not found');
                }
                
                // Show notification
                if (window.showNotification) {
                    window.showNotification('🎮 Arena odblokowana! Momo stworzyła własną arenę!', 'success', 5000);
                } else {
                    console.log('🎮 Arena unlocked (notification system not available)');
                }
                
                // Force UI update if possible
                if (window.updateAllUI) {
                    setTimeout(() => {
                        window.updateAllUI();
                        console.log('🔄 UI updated after arena unlock');
                    }, 100);
                }
                
                // Add to story completion log
                if (window.gameData.story) {
                    if (!window.gameData.story.globalFlags) {
                        window.gameData.story.globalFlags = {};
                    }
                    window.gameData.story.globalFlags.arenaUnlockedByMomo = true;
                }
                
                console.log('🎮 momo_7 arena unlock process completed');
            }
        },
        {
            id: 'momo_8',
            title: "Mistrzyni Dwóch Światów",
            cg: "imgs/cg/momo/momo_8.png",
            text: "Momo opuszcza kapsułę na dobre, jej ciało w końcu zjednoczyło się z mocą awatara. Jest teraz wojowniczką w dwóch światach - magicznej areny i prawdziwej rzeczywistości. Jej dotyk ma moc zarówno miecza, jak i czułości."
        },
        {
            id: 'momo_9',
            title: "Niezwyciężona Para",
            cg: "imgs/cg/momo/momo_9.png",
            text: "Razem stajecie się legendą areny. Momo, wojowniczka o sile tysięcy, i ty, jej partner, który nauczył ją, że prawdziwe zwycięstwo to nie dominacja, ale jedność. Wasz taniec w arenie staje się legendą, a złoto płynie strumieniami."
        }
    );
}

console.log('Momo story events 6-9 loaded');