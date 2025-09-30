// Views Management System
// Complete implementation for all game views

function createViewsModule(dependencies, moduleManager) {
    const { domElements } = dependencies || {};
    
    // View state management
    const viewState = {
        currentView: 'manor',
        previousView: null,
        viewHistory: ['manor'],
        animating: false
    };
    
    // Display the main manor view
    function displayManor() {
        setCurrentView('manor');
        console.log('Displaying manor view');
        
        if (!domElements) return false;
        
        domElements.setContent('centerPanelTitle', 'Dwór');
        
        const manorHTML = `
            <div class="manor-view h-full flex flex-col">
                <!-- Manor Header -->
                <div class="manor-header text-center mb-6">
                    <h2 class="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Twój Dwór
                    </h2>
                    <p class="text-gray-300">Witaj w swoim dworze. Wybierz miejsce, które chcesz odwiedzić.</p>
                </div>
                
                <!-- Manor Navigation Grid -->
                <div class="manor-grid flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    ${generateManorButton('Sanktuarium', 'displaySanctuaryCore()', 'Miejsce mocy i rozwoju', '🏛️', gameData?.mainQuest?.level > 0)}
                    ${generateManorButton('Ogród', 'displayGarden()', 'Magiczny ogród Szafran', '🌸', gameData?.minigames?.garden?.unlocked)}
                    ${generateManorButton('Arena', 'displayArena()', 'Miejsce walk Momo', '⚔️', gameData?.minigames?.arena?.unlocked)}
                    ${generateManorButton('Galeria', 'displayGallery()', 'Wspomnienia i osiągnięcia', '🎨', true)}
                    ${generateManorButton('Ustawienia', 'displaySettings()', 'Konfiguracja gry', '⚙️', true)}
                    ${generateManorButton('Mapa Dworu', 'displayManorMap()', 'Interaktywna mapa', '🗺️', gameData?.mainQuest?.level >= 2)}
                </div>
                
                <!-- Manor Stats Footer -->
                <div class="manor-footer bg-white/5 rounded-lg p-4 mt-4">
                    <div class="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                            <div class="text-lg font-bold text-purple-300">${Object.values(gameData?.characters || {}).filter(c => c.unlocked).length}</div>
                            <div class="text-gray-400">Odblokowane Postacie</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-blue-300">${gameData?.mainQuest?.level || 0}</div>
                            <div class="text-gray-400">Poziom Sanktuarium</div>
                        </div>
                        <div>
                            <div class="text-lg font-bold text-green-300">${gameData?.statistics?.totalClicks || 0}</div>
                            <div class="text-gray-400">Całkowite Kliknięcia</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', manorHTML, { html: true });
        return true;
    }
    
    // Generate manor navigation button
    function generateManorButton(title, onclick, description, icon, unlocked = true) {
        return `
            <button onclick="${unlocked ? onclick : 'showLockedFeature()'}" 
                    class="manor-button bg-white/10 hover:bg-white/20 ${unlocked ? '' : 'opacity-50 cursor-not-allowed'} 
                           rounded-lg p-6 transition-all duration-200 transform hover:scale-105 
                           border border-white/20 hover:border-white/30">
                <div class="text-4xl mb-2">${icon}</div>
                <div class="font-bold text-lg mb-1">${title}</div>
                <div class="text-sm text-gray-300">${description}</div>
                ${!unlocked ? '<div class="text-xs text-red-400 mt-2">Zablokowane</div>' : ''}
            </button>
        `;
    }
    
    // Display interactive manor map
    function displayManorMap() {
        setCurrentView('manor_map');
        
        if (!domElements) return false;
        
        domElements.setContent('centerPanelTitle', 'Mapa Dworu');
        
        const mapHTML = `
            <div class="manor-map h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Interaktywna Mapa Dworu</h2>
                    <button onclick="displayManor()" class="btn-secondary">← Wróć</button>
                </div>
                
                <!-- Manor Map SVG or Image -->
                <div class="manor-map-container flex-1 relative bg-white/5 rounded-lg p-4">
                    <img src="imgs/dwor.png" alt="Manor Map" class="w-full h-full object-contain">
                    
                    <!-- Interactive Hotspots -->
                    ${generateMapHotspot('Pokój Szafran', 20, 30, 'displayCharacter("szafran")', gameData?.characters?.szafran?.unlocked)}
                    ${generateMapHotspot('Sanktuarium', 50, 20, 'displaySanctuaryCore()', gameData?.mainQuest?.level > 0)}
                    ${generateMapHotspot('Piwnica (Momo)', 70, 80, 'displayCharacter("momo")', gameData?.characters?.momo?.unlocked)}
                    ${generateMapHotspot('Ogród', 10, 70, 'displayGarden()', gameData?.minigames?.garden?.unlocked)}
                    ${generateMapHotspot('Arena', 85, 50, 'displayArena()', gameData?.minigames?.arena?.unlocked)}
                </div>
                
                <!-- Map Legend -->
                <div class="map-legend bg-white/5 rounded-lg p-3 mt-4">
                    <h4 class="font-bold mb-2">Legenda:</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><span class="text-green-400">●</span> Dostępne</div>
                        <div><span class="text-red-400">●</span> Zablokowane</div>
                        <div><span class="text-blue-400">●</span> Postać</div>
                        <div><span class="text-purple-400">●</span> Minigra</div>
                    </div>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', mapHTML, { html: true });
        return true;
    }
    
    // Generate map hotspot
    function generateMapHotspot(title, x, y, onclick, unlocked = true) {
        const color = unlocked ? 'bg-green-400' : 'bg-red-400';
        return `
            <div class="absolute w-4 h-4 ${color} rounded-full cursor-pointer hover:scale-125 transition-transform
                        border-2 border-white shadow-lg"
                 style="left: ${x}%; top: ${y}%; transform: translate(-50%, -50%)"
                 onclick="${unlocked ? onclick : 'showLockedFeature()'}"
                 title="${title}">
            </div>
        `;
    }
    
    // Display sanctuary core
    function displaySanctuaryCore() {
        setCurrentView('sanctuary');
        
        if (!domElements) return false;
        
        domElements.setContent('centerPanelTitle', 'Serce Dworu');
        
        const currentLevel = gameData?.mainQuest?.level || 0;
        const nextThreshold = gameData?.mainQuest?.thresholds?.[currentLevel];
        const currentEssence = gameData?.sanctuaryEssence || 0;
        const canLevelUp = nextThreshold !== undefined && currentEssence >= nextThreshold;
        
        const sanctuaryHTML = `
            <div class="sanctuary-view h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Sanktuarium</h2>
                    <button onclick="displayManor()" class="btn-secondary">← Wróć</button>
                </div>
                
                <!-- Sanctuary Display -->
                <div class="sanctuary-core flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Left: Sanctuary Image and Level -->
                    <div class="sanctuary-display">
                        <div class="bg-white/10 rounded-lg p-6 text-center">
                            <div class="sanctuary-image mb-4">
                                <img src="imgs/sanctuary/level_${currentLevel}.png" 
                                     alt="Sanctuary Level ${currentLevel}" 
                                     class="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                                     onerror="this.src='imgs/dwor.png'">
                            </div>
                            <h3 class="text-2xl font-bold mb-2">Poziom ${currentLevel}</h3>
                            <div class="text-gray-300">
                                ${getSanctuaryDescription(currentLevel)}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right: Progress and Actions -->
                    <div class="sanctuary-controls space-y-4">
                        <!-- Essence Progress -->
                        <div class="bg-white/10 rounded-lg p-4">
                            <h4 class="font-bold mb-3">Esencja Sanktuarium</h4>
                            <div class="essence-display mb-4">
                                <div class="text-3xl font-bold text-purple-300 mb-1">
                                    ${window.gameUtils ? window.gameUtils.formatNumber(currentEssence) : currentEssence}
                                </div>
                                <div class="text-sm text-gray-400">
                                    ${nextThreshold ? `/ ${window.gameUtils ? window.gameUtils.formatNumber(nextThreshold) : nextThreshold} wymagane` : 'Maksymalny poziom'}
                                </div>
                            </div>
                            
                            ${nextThreshold ? `
                                <div class="progress-bar mb-4">
                                    <div class="w-full bg-gray-700 rounded-full h-3">
                                        <div class="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                                             style="width: ${Math.min(100, (currentEssence / nextThreshold) * 100)}%"></div>
                                    </div>
                                </div>
                                
                                ${canLevelUp ? `
                                    <button onclick="levelUpSanctuary()" class="btn-primary w-full">
                                        Ulepsz Sanktuarium (${nextThreshold} Esencji)
                                    </button>
                                ` : `
                                    <div class="text-center text-gray-400 text-sm">
                                        Potrzebujesz więcej esencji do ulepszenia
                                    </div>
                                `}
                            ` : `
                                <div class="text-center text-green-400">
                                    Sanktuarium osiągnęło maksymalny poziom!
                                </div>
                            `}
                        </div>
                        
                        <!-- Sanctuary Features -->
                        <div class="bg-white/10 rounded-lg p-4">
                            <h4 class="font-bold mb-3">Odblokowane Funkcje</h4>
                            <div class="space-y-2 text-sm">
                                ${generateSanctuaryFeatures(currentLevel)}
                            </div>
                        </div>
                        
                        <!-- Essence Sources -->
                        <div class="bg-white/10 rounded-lg p-4">
                            <h4 class="font-bold mb-3">Źródła Esencji</h4>
                            <div class="space-y-1 text-sm text-gray-300">
                                <div>• Wydarzenia fabularne postaci</div>
                                <div>• Ukończenie questów w arenie</div>
                                <div>• Specjalne osiągnięcia</div>
                                <div>• Wybory podczas wydarzeń</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', sanctuaryHTML, { html: true });
        return true;
    }
    
    // Get sanctuary description for current level
    function getSanctuaryDescription(level) {
        const descriptions = [
            "Sanktuarium dopiero się budzi. Energia jest słaba, ale pełna potencjału.",
            "Pierwsze iskry magii zaczynają płynąć przez kamienie.",
            "Sanktuarium tętni mocą. Postacie czują się silniejsze w jego obecności.",
            "Potężna aura otacza sanktuarium. Nowe możliwości się otwierają.",
            "Sanktuarium promieniuje magią. Jego wpływ sięga całego dworu.",
            "Maksymalny poziom mocy. Sanktuarium jest sercem twojego dworu."
        ];
        return descriptions[Math.min(level, descriptions.length - 1)];
    }
    
    // Generate sanctuary features list
    function generateSanctuaryFeatures(level) {
        const features = [
            { level: 0, name: "Podstawowe zarządzanie postaciami", unlocked: true },
            { level: 1, name: "Ulepszony system więzi", unlocked: level >= 1 },
            { level: 2, name: "Dostęp do mapy dworu", unlocked: level >= 2 },
            { level: 3, name: "Zaawansowane minigry", unlocked: level >= 3 },
            { level: 4, name: "System prestiżu", unlocked: level >= 4 },
            { level: 5, name: "Wszystkie funkcje odblokowane", unlocked: level >= 5 }
        ];
        
        return features.map(feature => `
            <div class="flex items-center space-x-2">
                <span class="${feature.unlocked ? 'text-green-400' : 'text-gray-500'}">
                    ${feature.unlocked ? '✓' : '✗'}
                </span>
                <span class="${feature.unlocked ? 'text-white' : 'text-gray-500'}">
                    ${feature.name}
                </span>
            </div>
        `).join('');
    }
    
    // Display gallery view
    function displayGallery() {
        setCurrentView('gallery');
        
        if (!domElements) return false;
        
        domElements.setContent('centerPanelTitle', 'Galeria');
        
        const galleryHTML = `
            <div class="gallery-view h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Galeria Wspomnień</h2>
                    <button onclick="displayManor()" class="btn-secondary">← Wróć</button>
                </div>
                
                <!-- Gallery Tabs -->
                <div class="gallery-tabs flex space-x-2 mb-4">
                    <button onclick="showGalleryTab('characters')" 
                            class="tab-button active px-4 py-2 rounded-lg" id="gallery-characters-tab">
                        Postacie
                    </button>
                    <button onclick="showGalleryTab('events')" 
                            class="tab-button px-4 py-2 rounded-lg" id="gallery-events-tab">
                        Wydarzenia
                    </button>
                    <button onclick="showGalleryTab('achievements')" 
                            class="tab-button px-4 py-2 rounded-lg" id="gallery-achievements-tab">
                        Osiągnięcia
                    </button>
                </div>
                
                <!-- Gallery Content -->
                <div class="gallery-content flex-1 overflow-y-auto">
                    <div id="gallery-characters-content" class="gallery-tab-content">
                        ${generateCharacterGallery()}
                    </div>
                    <div id="gallery-events-content" class="gallery-tab-content hidden">
                        ${generateEventsGallery()}
                    </div>
                    <div id="gallery-achievements-content" class="gallery-tab-content hidden">
                        ${generateAchievementsGallery()}
                    </div>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', galleryHTML, { html: true });
        return true;
    }
    
    // Generate character gallery
    function generateCharacterGallery() {
        const characters = gameData?.characters || {};
        
        return `
            <div class="character-gallery grid grid-cols-2 lg:grid-cols-3 gap-4">
                ${Object.values(characters).map(character => `
                    <div class="character-gallery-card bg-white/10 rounded-lg p-4 ${character.unlocked ? 'cursor-pointer hover:bg-white/20' : 'opacity-50'}" 
                         ${character.unlocked ? `onclick="displayCharacter('${character.id}')"` : ''}>
                        <img src="${character.avatar || character.image}" 
                             alt="${character.name}" 
                             class="w-full h-32 object-cover rounded-lg mb-2">
                        <h4 class="font-bold">${character.name}</h4>
                        <p class="text-sm text-gray-300">${character.title || ''}</p>
                        <div class="text-xs mt-2">
                            ${character.unlocked ? `Poziom ${character.level || 0}` : 'Zablokowana'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Generate events gallery
    function generateEventsGallery() {
        const allEvents = [];
        const characters = gameData?.characters || {};
        
        // Collect all completed events from all characters
        Object.values(characters).forEach(character => {
            if (character.storyEvents && character.storyProgress > 0) {
                const completedEvents = character.storyEvents.slice(0, character.storyProgress);
                allEvents.push(...completedEvents.map(event => ({
                    ...event,
                    characterName: character.name,
                    characterId: character.id
                })));
            }
        });
        
        if (allEvents.length === 0) {
            return `
                <div class="text-center text-gray-400 py-8">
                    <p>Brak odblokowanych wydarzeń</p>
                    <p class="text-sm mt-2">Rozwijaj więzi z postaciami, aby odblokować ich historie</p>
                </div>
            `;
        }
        
        return `
            <div class="events-gallery grid grid-cols-1 lg:grid-cols-2 gap-4">
                ${allEvents.map(event => `
                    <div class="event-card bg-white/10 rounded-lg p-4 cursor-pointer hover:bg-white/20" 
                         onclick="replayStoryEvent('${event.id}')">
                        <div class="flex items-center space-x-3 mb-2">
                            <div class="text-sm text-purple-300">${event.characterName}</div>
                            <div class="text-xs text-gray-400">•</div>
                            <div class="text-sm font-bold">${event.title}</div>
                        </div>
                        <div class="text-xs text-gray-300 line-clamp-2">
                            ${event.text ? event.text.substring(0, 100) + '...' : 'Kliknij aby odtworzyć'}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Generate achievements gallery
    function generateAchievementsGallery() {
        return `
            <div class="achievements-gallery">
                <div class="text-center text-gray-400 py-8">
                    <p>System osiągnięć będzie dostępny wkrótce</p>
                    <p class="text-sm mt-2">Twoje postępy są automatycznie śledzone</p>
                </div>
            </div>
        `;
    }
    
    // Display settings view
    function displaySettings() {
        setCurrentView('settings');
        
        if (!domElements) return false;
        
        domElements.setContent('centerPanelTitle', 'Ustawienia');
        
        const settings = gameData?.settings || {};
        
        const settingsHTML = `
            <div class="settings-view h-full flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold">Ustawienia Gry</h2>
                    <button onclick="displayManor()" class="btn-secondary">← Wróć</button>
                </div>
                
                <div class="settings-content flex-1 space-y-6 overflow-y-auto">
                    <!-- Audio Settings -->
                    <div class="settings-section bg-white/10 rounded-lg p-4">
                        <h3 class="font-bold mb-4">Dźwięk</h3>
                        <div class="space-y-3">
                            <div class="setting-item">
                                <label class="flex justify-between items-center">
                                    <span>Główna głośność</span>
                                    <input type="range" min="0" max="1" step="0.1" 
                                           value="${settings.masterVolume || 0.7}"
                                           onchange="updateSetting('masterVolume', this.value)"
                                           class="w-32">
                                </label>
                            </div>
                            <div class="setting-item">
                                <label class="flex justify-between items-center">
                                    <span>Muzyka</span>
                                    <input type="range" min="0" max="1" step="0.1" 
                                           value="${settings.musicVolume || 0.5}"
                                           onchange="updateSetting('musicVolume', this.value)"
                                           class="w-32">
                                </label>
                            </div>
                            <div class="setting-item">
                                <label class="flex justify-between items-center">
                                    <span>Efekty dźwiękowe</span>
                                    <input type="range" min="0" max="1" step="0.1" 
                                           value="${settings.sfxVolume || 0.8}"
                                           onchange="updateSetting('sfxVolume', this.value)"
                                           class="w-32">
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Game Settings -->
                    <div class="settings-section bg-white/10 rounded-lg p-4">
                        <h3 class="font-bold mb-4">Gra</h3>
                        <div class="space-y-3">
                            <div class="setting-item">
                                <label class="flex justify-between items-center">
                                    <span>Auto-zapis</span>
                                    <input type="checkbox" 
                                           ${settings.autoSave !== false ? 'checked' : ''}
                                           onchange="updateSetting('autoSave', this.checked)">
                                </label>
                            </div>
                            <div class="setting-item">
                                <label class="flex justify-between items-center">
                                    <span>Powiadomienia</span>
                                    <input type="checkbox" 
                                           ${settings.showNotifications !== false ? 'checked' : ''}
                                           onchange="updateSetting('showNotifications', this.checked)">
                                </label>
                            </div>
                            <div class="setting-item">
                                <label class="flex justify-between items-center">
                                    <span>Animacje</span>
                                    <input type="checkbox" 
                                           ${settings.enableAnimations !== false ? 'checked' : ''}
                                           onchange="updateSetting('enableAnimations', this.checked)">
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Save/Load -->
                    <div class="settings-section bg-white/10 rounded-lg p-4">
                        <h3 class="font-bold mb-4">Zapisywanie i Wczytywanie</h3>
                        <div class="space-y-3">
                            <button onclick="exportSave()" class="btn-primary w-full">
                                Eksportuj Zapis
                            </button>
                            <button onclick="importSave()" class="btn-secondary w-full">
                                Importuj Zapis
                            </button>
                            <button onclick="confirmResetGame()" class="btn-danger w-full">
                                Resetuj Grę
                            </button>
                        </div>
                    </div>
                    
                    <!-- Game Info -->
                    <div class="settings-section bg-white/10 rounded-lg p-4">
                        <h3 class="font-bold mb-4">Informacje</h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span>Wersja gry:</span>
                                <span>${gameData?.version || '0.1.0'}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Czas gry:</span>
                                <span>${formatPlaytime(gameData?.playtime || 0)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Ostatni zapis:</span>
                                <span>${gameData?.lastSaved ? new Date(gameData.lastSaved).toLocaleString() : 'Nigdy'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        domElements.setContent('mainCharacterDisplay', settingsHTML, { html: true });
        return true;
    }
    
    // Format playtime for display
    function formatPlaytime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }
    
    // Helper function to set current view
    function setCurrentView(view) {
        viewState.previousView = viewState.currentView;
        viewState.currentView = view;
        viewState.viewHistory.push(view);
        
        // Keep history manageable
        if (viewState.viewHistory.length > 10) {
            viewState.viewHistory.shift();
        }
        
        // Update game data
        if (gameData && gameData.ui) {
            gameData.ui.currentView = view;
        }
    }
    
    // Go back to previous view
    function goBack() {
        if (viewState.viewHistory.length > 1) {
            viewState.viewHistory.pop(); // Remove current
            const previousView = viewState.viewHistory[viewState.viewHistory.length - 1];
            
            switch (previousView) {
                case 'manor':
                    displayManor();
                    break;
                case 'manor_map':
                    displayManorMap();
                    break;
                case 'sanctuary':
                    displaySanctuaryCore();
                    break;
                case 'gallery':
                    displayGallery();
                    break;
                case 'settings':
                    displaySettings();
                    break;
                default:
                    displayManor();
            }
        } else {
            displayManor();
        }
    }
    
    // Display arena view (delegates to ArenaSystem)
    function displayArena() {
        setCurrentView('arena');
        
        // Ensure arena structure exists
        if (!gameData?.minigames) {
            console.log('⚠️ Creating missing minigames structure in displayArena');
            gameData.minigames = {};
        }
        
        if (!gameData.minigames.arena) {
            console.log('⚠️ Creating missing arena structure in displayArena');
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
        
        if (!gameData.minigames.arena.unlocked) {
            console.log('❌ Arena not unlocked, checking Momo story progress');
            
            // Check if Momo has progressed enough to unlock arena
            const momo = gameData.characters?.momo;
            if (momo && momo.unlocked && momo.bondPoints >= 60000) {
                console.log('🎮 Momo has 60k+ bond points, arena should be unlocked! Forcing unlock...');
                gameData.minigames.arena.unlocked = true;
                
                if (window.showNotification) {
                    window.showNotification('🎮 Arena została automatycznie odblokowana!', 'success', 5000);
                }
            } else {
                if (window.showNotification) {
                    window.showNotification('Arena nie jest jeszcze odblokowana! Potrzebujesz 60,000 więzi z Momo.', 'warning');
                }
                displayManor();
                return false;
            }
        }
        
        if (window.ArenaSystem && typeof window.ArenaSystem.displayArena === 'function') {
            console.log('Delegating to ArenaSystem.displayArena()');
            try {
                window.ArenaSystem.displayArena();
                return true;
            } catch (error) {
                console.error('Error calling ArenaSystem.displayArena():', error);
                if (window.showNotification) {
                    window.showNotification('Wystąpił błąd podczas ładowania areny', 'error');
                }
                displayManor();
                return false;
            }
        } else {
            console.error('ArenaSystem not available');
            if (window.showNotification) {
                window.showNotification('System areny nie jest dostępny!', 'error');
            }
            displayManor();
            return false;
        }
    }
    
    // Module cleanup
    function cleanup() {
        viewState.currentView = 'manor';
        viewState.previousView = null;
        viewState.viewHistory = ['manor'];
        console.log('Views module cleanup complete');
    }
    
    // Return module interface
    return {
        displayManor,
        displayManorMap,
        displaySanctuaryCore,
        displayGallery,
        displaySettings,
        displayArena,
        goBack,
        
        // View state access
        getCurrentView: () => viewState.currentView,
        getPreviousView: () => viewState.previousView,
        
        cleanup
    };
}

// Register module
if (window.gameModules) {
    window.gameModules.registerModule('views', createViewsModule, ['domElements']);
    console.log('Views module registration complete');
} else {
    console.error('gameModules not available for views module');
}

// Global fallback functions for HTML event handlers
window.displayManor = function() {
    const views = window.gameModules?.getModule('views');
    if (views) return views.displayManor();
    return false;
};

window.displayManorMap = function() {
    const views = window.gameModules?.getModule('views');
    if (views) return views.displayManorMap();
    return false;
};

window.displaySanctuaryCore = function() {
    const views = window.gameModules?.getModule('views');
    if (views) return views.displaySanctuaryCore();
    return false;
};

window.displayGallery = function() {
    const views = window.gameModules?.getModule('views');
    if (views) return views.displayGallery();
    return false;
};

window.displaySettings = function() {
    const views = window.gameModules?.getModule('views');
    if (views) return views.displaySettings();
    return false;
};

window.displayArena = function() {
    const views = window.gameModules?.getModule('views');
    if (views) return views.displayArena();
    return false;
};

// Additional global functions for gallery and settings
window.showGalleryTab = function(tabName) {
    // Hide all tab contents
    const tabs = ['characters', 'events', 'achievements'];
    tabs.forEach(tab => {
        const content = document.getElementById(`gallery-${tab}-content`);
        const button = document.getElementById(`gallery-${tab}-tab`);
        if (content) content.classList.add('hidden');
        if (button) button.classList.remove('active');
    });
    
    // Show selected tab
    const selectedContent = document.getElementById(`gallery-${tabName}-content`);
    const selectedButton = document.getElementById(`gallery-${tabName}-tab`);
    if (selectedContent) selectedContent.classList.remove('hidden');
    if (selectedButton) selectedButton.classList.add('active');
};

window.updateSetting = function(key, value) {
    if (gameData && gameData.settings) {
        gameData.settings[key] = value;
        console.log(`Setting updated: ${key} = ${value}`);
    }
};

window.showLockedFeature = function() {
    if (typeof showNotification === 'function') {
        showNotification('Ta funkcja jest jeszcze zablokowana!', 'warning');
    }
};

console.log('Views module loaded');