// News Ticker System - Pure Atmospheric Fluff
// Wszystkie Moje Potwory

// News Ticker Module Factory
function createNewsTickerModule(dependencies, moduleManager) {
    const { domElements, ui } = dependencies || {};
    
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
    
    console.log('📰 News Ticker Module created with moduleManager:', !!moduleManager);
    
    // News Ticker State
    const newsState = {
        enabled: true,
        currentNews: null,
        newsHistory: [],
        lastUpdate: 0,
        updateInterval: 40000, // 40 seconds per news item (5x longer)
        lastNewsTime: 0,
        cooldowns: new Map(), // Track news cooldowns
        displayElement: null,
        animationId: null,
        isPaused: false
    };
    
    // News Content Storage (will be populated by data files)
    let newsContent = {
        daily: [],
        interactions: [],
        mysteries: [],
        revelations: []
    };
    
    // Initialize news ticker
    function initialize() {
        console.log('📰 Initializing News Ticker...');
        
        if (!domElements) {
            console.error('❌ News ticker requires DOM elements module');
            return false;
        }
        
        // Load news content
        loadNewsContent();
        
        // Setup display element
        const setupSuccess = setupDisplayElement();
        if (!setupSuccess) {
            console.error('❌ Failed to setup news ticker display element');
            return false;
        }
        
        // Start news cycle
        startNewsCycle();
        
        console.log('✅ News Ticker initialized successfully');
        return true;
    }
    
    // Load news content from data files
    function loadNewsContent() {
        console.log('📰 Loading news content from data files...');
        
        // Check if global news content exists
        console.log('Available global news objects:', {
            daily: !!window.newsContentDaily,
            interactions: !!window.newsContentInteractions, 
            mysteries: !!window.newsContentMysteries,
            revelations: !!window.newsContentRevelations
        });
        
        // Load content with fallback
        if (window.newsContentDaily && Array.isArray(window.newsContentDaily)) {
            newsContent.daily = window.newsContentDaily;
            console.log('✅ Daily news loaded:', newsContent.daily.length, 'entries');
        } else {
            console.warn('⚠️ Daily news content not found or invalid');
            newsContent.daily = [];
        }
        
        if (window.newsContentInteractions && Array.isArray(window.newsContentInteractions)) {
            newsContent.interactions = window.newsContentInteractions;
            console.log('✅ Interaction news loaded:', newsContent.interactions.length, 'entries');
        } else {
            console.warn('⚠️ Interaction news content not found or invalid');
            newsContent.interactions = [];
        }
        
        if (window.newsContentMysteries && Array.isArray(window.newsContentMysteries)) {
            newsContent.mysteries = window.newsContentMysteries;
            console.log('✅ Mystery news loaded:', newsContent.mysteries.length, 'entries');
        } else {
            console.warn('⚠️ Mystery news content not found or invalid');
            newsContent.mysteries = [];
        }
        
        if (window.newsContentRevelations && Array.isArray(window.newsContentRevelations)) {
            newsContent.revelations = window.newsContentRevelations;
            console.log('✅ Revelation news loaded:', newsContent.revelations.length, 'entries');
        } else {
            console.warn('⚠️ Revelation news content not found or invalid');
            newsContent.revelations = [];
        }
        
        const totalContent = newsContent.daily.length + newsContent.interactions.length + 
                           newsContent.mysteries.length + newsContent.revelations.length;
        
        console.log('📰 Total news content loaded:', totalContent, 'entries');
        
        if (totalContent === 0) {
            console.error('❌ No news content loaded! Adding fallback content.');
            // Add basic fallback content
            newsContent.daily = [
                {
                    id: 'fallback_001',
                    text: 'W dworze panuje spokojna atmosfera...',
                    requires: {},
                    weight: 1.0,
                    cooldown: 300000,
                    category: 'fallback'
                }
            ];
        }
    }
    
    // Setup display element
    function setupDisplayElement() {
        console.log('📰 Setting up news ticker display element...');
        
        const container = domElements.get('newsTickerContainer');
        if (!container) {
            console.error('❌ News ticker container not found in DOM');
            return false;
        }
        console.log('✅ News ticker container found:', container);
        
        // Try domElements first, then fallback to direct DOM access
        newsState.displayElement = domElements.get('newsTickerText');
        if (!newsState.displayElement) {
            console.warn('⚠️ DOM elements module failed, trying direct DOM access');
            newsState.displayElement = document.getElementById('news-ticker-text');
        }
        
        if (!newsState.displayElement) {
            console.error('❌ News ticker text element not found');
            return false;
        }
        console.log('✅ News ticker text element found:', newsState.displayElement);
        
        // Setup click handler for pause/resume
        container.addEventListener('click', togglePause);
        
        console.log('✅ News ticker display element setup complete');
        return true;
    }
    
    // Start news cycle
    function startNewsCycle() {
        console.log('📰 Starting news cycle...');
        
        if (!newsState.enabled) {
            console.warn('⚠️ News ticker is disabled');
            return;
        }
        
        if (!newsState.displayElement) {
            console.error('❌ Display element not available for news cycle');
            return;
        }
        
        console.log('📰 News ticker enabled and display element ready');
        
        // Initial news display
        selectAndDisplayNews();
        
        // Start update loop
        newsState.animationId = setInterval(() => {
            if (!newsState.isPaused) {
                selectAndDisplayNews();
            }
        }, newsState.updateInterval);
        
        console.log('✅ News cycle started with', newsState.updateInterval + 'ms interval');
    }
    
    // Select and display appropriate news
    function selectAndDisplayNews() {
        console.log('📰 Selecting news to display...');
        
        const eligibleNews = getEligibleNews();
        console.log('📰 Eligible news found:', eligibleNews.length);
        
        if (eligibleNews.length === 0) {
            console.warn('⚠️ No eligible news found, using fallback');
            // Fallback to basic news
            displayNews("W dworze panuje spokojna atmosfera...");
            return;
        }
        
        // Weighted random selection
        const selectedNews = selectWeightedRandom(eligibleNews);
        console.log('📰 Selected news:', selectedNews ? selectedNews.text.substring(0, 50) + '...' : 'none');
        
        if (selectedNews) {
            displayNews(selectedNews.text, selectedNews);
            
            // Set cooldown
            if (selectedNews.id) {
                newsState.cooldowns.set(selectedNews.id, Date.now());
            }
            
            // Add to history
            newsState.newsHistory.push({
                text: selectedNews.text,
                timestamp: Date.now(),
                category: selectedNews.category || 'unknown'
            });
            
            // Keep history manageable
            if (newsState.newsHistory.length > 50) {
                newsState.newsHistory.shift();
            }
        }
    }
    
    // Get news items that meet current conditions
    function getEligibleNews() {
        const now = Date.now();
        const eligible = [];
        
        // Combine all news sources
        const allNews = [
            ...newsContent.daily,
            ...newsContent.interactions,
            ...newsContent.mysteries,
            ...newsContent.revelations
        ];
        
        console.log('📰 Checking', allNews.length, 'total news items for eligibility');
        
        let cooldownBlocked = 0;
        let conditionsFailed = 0;
        
        for (const news of allNews) {
            // Check cooldown
            if (news.cooldown && newsState.cooldowns.has(news.id)) {
                const lastShown = newsState.cooldowns.get(news.id);
                if (now - lastShown < news.cooldown) {
                    cooldownBlocked++;
                    continue;
                }
            }
            
            // Check conditions
            if (meetsConditions(news)) {
                eligible.push(news);
            } else {
                conditionsFailed++;
            }
        }
        
        console.log('📰 News filtering results:', {
            total: allNews.length,
            eligible: eligible.length,
            cooldownBlocked,
            conditionsFailed
        });
        
        return eligible;
    }
    
    // Check if news item meets current game conditions
    function meetsConditions(news) {
        if (!news.requires) {
            return true; // No conditions = always eligible
        }
        
        // Check if gameData is available
        if (!window.gameData) {
            console.warn('⚠️ gameData not available for condition checking');
            return false;
        }
        
        const conditions = news.requires;
        
        // Check character conditions
        if (conditions.characters) {
            for (const [charId, requirements] of Object.entries(conditions.characters)) {
                const character = gameData?.characters?.[charId];
                if (!character) continue;
                
                if (requirements.unlocked && !character.unlocked) {
                    return false;
                }
                
                if (requirements.bondPoints) {
                    const [min, max] = requirements.bondPoints;
                    const bp = character.bondPoints || 0;
                    if (min !== null && bp < min) return false;
                    if (max !== null && bp > max) return false;
                }
                
                if (requirements.level) {
                    const [min, max] = requirements.level;
                    const level = character.level || 0;
                    if (min !== null && level < min) return false;
                    if (max !== null && level > max) return false;
                }
            }
        }
        
        // Check building conditions
        if (conditions.buildings) {
            for (const [buildingId, requirements] of Object.entries(conditions.buildings)) {
                const building = gameData?.manor?.[buildingId];
                if (!building) continue;
                
                if (requirements.unlocked && !building.unlocked) {
                    return false;
                }
                
                if (requirements.level) {
                    const [min, max] = requirements.level;
                    const level = building.level || 0;
                    if (min !== null && level < min) return false;
                    if (max !== null && level > max) return false;
                }
            }
        }
        
        // Check sanctuary conditions
        if (conditions.sanctuary) {
            const sanctuary = gameData?.mainQuest;
            if (sanctuary && conditions.sanctuary.level) {
                const [min, max] = conditions.sanctuary.level;
                const level = sanctuary.level || 0;
                if (min !== null && level < min) return false;
                if (max !== null && level > max) return false;
            }
        }
        
        // Check time conditions
        if (conditions.timeOfDay) {
            const hour = new Date().getHours();
            const timeOfDay = getTimeOfDay(hour);
            if (!conditions.timeOfDay.includes(timeOfDay)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Get time of day string
    function getTimeOfDay(hour) {
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }
    
    // Weighted random selection
    function selectWeightedRandom(items) {
        if (items.length === 0) return null;
        if (items.length === 1) return items[0];
        
        // Calculate total weight
        const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1.0), 0);
        
        // Random selection
        let random = Math.random() * totalWeight;
        
        for (const item of items) {
            random -= (item.weight || 1.0);
            if (random <= 0) {
                return item;
            }
        }
        
        // Fallback to last item
        return items[items.length - 1];
    }
    
    // Display news text with animation
    function displayNews(text, newsItem = null) {
        if (!newsState.displayElement) return;
        
        // Store current news
        newsState.currentNews = { text, newsItem, timestamp: Date.now() };
        
        // Add fade out class
        newsState.displayElement.classList.add('news-fade-out');
        
        // Change text after fade out completes
        setTimeout(() => {
            newsState.displayElement.textContent = text;
            
            // Add fade in class
            newsState.displayElement.classList.remove('news-fade-out');
            newsState.displayElement.classList.add('news-fade-in');
            
            // Remove fade classes after animation
            setTimeout(() => {
                newsState.displayElement.classList.remove('news-fade-in');
            }, 500);
            
        }, 250);
        
        console.log('📰 News displayed:', text.substring(0, 50) + '...');
    }
    
    // Toggle pause/resume
    function togglePause() {
        newsState.isPaused = !newsState.isPaused;
        
        if (newsState.displayElement) {
            if (newsState.isPaused) {
                newsState.displayElement.classList.add('news-paused');
            } else {
                newsState.displayElement.classList.remove('news-paused');
            }
        }
        
        console.log('📰 News ticker', newsState.isPaused ? 'paused' : 'resumed');
    }
    
    // Update method (called from main game loop)
    function update(deltaTime) {
        // News ticker updates are handled by interval, not game loop
        // This method exists for compatibility with module system
    }
    
    // Enable/disable news ticker
    function setEnabled(enabled) {
        newsState.enabled = enabled;
        
        if (enabled && !newsState.animationId) {
            startNewsCycle();
        } else if (!enabled && newsState.animationId) {
            clearInterval(newsState.animationId);
            newsState.animationId = null;
        }
        
        // Save preference
        if (gameData?.settings) {
            gameData.settings.newsTickerEnabled = enabled;
        }
        
        console.log('📰 News ticker', enabled ? 'enabled' : 'disabled');
    }
    
    // Get current state for debugging
    function getState() {
        return {
            ...newsState,
            contentCounts: {
                daily: newsContent.daily.length,
                interactions: newsContent.interactions.length,
                mysteries: newsContent.mysteries.length,
                revelations: newsContent.revelations.length
            }
        };
    }
    
    // Cleanup method
    function cleanup() {
        if (newsState.animationId) {
            clearInterval(newsState.animationId);
            newsState.animationId = null;
        }
        
        newsState.cooldowns.clear();
        newsState.newsHistory = [];
        
        console.log('📰 News ticker cleanup complete');
    }
    
    // Public API
    return {
        // Core functions
        initialize,
        update,
        cleanup,
        
        // Control functions
        setEnabled,
        togglePause,
        
        // Content management
        loadNewsContent,
        selectAndDisplayNews,
        
        // State access
        getState,
        getCurrentNews: () => newsState.currentNews,
        getNewsHistory: () => [...newsState.newsHistory],
        
        // Configuration
        setUpdateInterval: (interval) => {
            newsState.updateInterval = Math.max(3000, interval); // Minimum 3 seconds
        }
    };
}

// Register News Ticker module with validation
if (window.gameModules && typeof window.gameModules.registerModule === 'function') {
    console.log('📰 Registering News Ticker module with module manager...');
    try {
        window.gameModules.registerModule('newsTicker', createNewsTickerModule, ['domElements', 'ui']);
        console.log('✅ News Ticker module registration complete');
    } catch (error) {
        console.error('❌ Failed to register News Ticker module:', error);
        console.log('🔄 Falling back to direct News Ticker module creation...');
        window.newsTicker = createNewsTickerModule({ 
            domElements: window.domElements,
            ui: window.ui 
        });
    }
} else {
    console.error('❌ gameModules not available, creating News Ticker module directly (FALLBACK PATH)');
    window.newsTicker = createNewsTickerModule({ 
        domElements: window.domElements,
        ui: window.ui 
    });
    console.log('⚠️ News Ticker module created via fallback path without moduleManager');
}

// Global functions for HTML event handlers
window.toggleNewsTicker = () => {
    const newsTicker = window.gameModules?.getModule('newsTicker') || window.newsTicker;
    if (newsTicker) {
        newsTicker.togglePause();
    }
};

window.setNewsTickerEnabled = (enabled) => {
    const newsTicker = window.gameModules?.getModule('newsTicker') || window.newsTicker;
    if (newsTicker) {
        newsTicker.setEnabled(enabled);
    }
};

// Global debug functions
window.debugNewsTicker = () => {
    const newsTicker = window.gameModules?.getModule('newsTicker') || window.newsTicker;
    if (newsTicker) {
        console.log('📰 News Ticker Debug Info:', newsTicker.getState());
    } else {
        console.error('❌ News ticker module not found');
    }
};

window.forceNewsUpdate = () => {
    const newsTicker = window.gameModules?.getModule('newsTicker') || window.newsTicker;
    if (newsTicker) {
        newsTicker.selectAndDisplayNews();
        console.log('📰 Forced news update');
    } else {
        console.error('❌ News ticker module not found');
    }
};

window.testNewsDisplay = (text) => {
    const newsElement = document.getElementById('news-ticker-text');
    if (newsElement) {
        newsElement.textContent = text || 'Test news message';
        console.log('📰 Test news displayed:', text);
    } else {
        console.error('❌ News ticker text element not found');
    }
};

console.log('📰 News Ticker System module loaded successfully');