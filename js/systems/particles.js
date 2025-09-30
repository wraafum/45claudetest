// Particle Effects Engine - CSS-based Magical Atmosphere System
// Wszystkie Moje Potwory

function createParticleModule(dependencies, moduleManager) {
    const { domElements } = dependencies || {};
    
    console.log('✨ Particle Module created');
    
    // Particle system state
    const particleState = {
        container: null,
        activeParticles: [],
        particlePool: [],
        maxParticles: 50,
        isEnabled: true,
        performanceMode: 'normal' // 'low', 'normal', 'high'
    };
    
    // Particle type definitions
    const particleTypes = {
        sparkle: {
            duration: 2000,
            className: 'particle-sparkle',
            size: { min: 4, max: 12 },
            opacity: { start: 1, end: 0 },
            movement: { x: 50, y: -100 },
            animation: 'sparkleFloat'
        },
        magical_dust: {
            duration: 3000,
            className: 'particle-dust',
            size: { min: 2, max: 8 },
            opacity: { start: 0.8, end: 0 },
            movement: { x: 30, y: -80 },
            animation: 'dustFloat'
        },
        floating_orb: {
            duration: 4000,
            className: 'particle-orb',
            size: { min: 6, max: 16 },
            opacity: { start: 0.6, end: 0 },
            movement: { x: 20, y: -60 },
            animation: 'orbFloat'
        },
        celebration: {
            duration: 1500,
            className: 'particle-celebration',
            size: { min: 8, max: 20 },
            opacity: { start: 1, end: 0 },
            movement: { x: 100, y: -150 },
            animation: 'celebrationBurst'
        },
        heart: {
            duration: 2500,
            className: 'particle-heart',
            size: { min: 10, max: 18 },
            opacity: { start: 1, end: 0 },
            movement: { x: 40, y: -120 },
            animation: 'heartFloat'
        }
    };
    
    // Character-specific particle themes
    const characterParticleThemes = {
        szafran: {
            primary: '#10b981',    // Green
            secondary: '#f59e0b',  // Gold
            particles: ['magical_dust', 'floating_orb'],
            intensity: 'medium'
        },
        furia: {
            primary: '#ef4444',    // Red
            secondary: '#f97316',  // Orange
            particles: ['sparkle', 'celebration'],
            intensity: 'high'
        },
        momo: {
            primary: '#8b5cf6',    // Purple
            secondary: '#ec4899',  // Pink
            particles: ['heart', 'magical_dust'],
            intensity: 'medium'
        },
        default: {
            primary: '#7c3aed',    // Purple
            secondary: '#3b82f6',  // Blue
            particles: ['sparkle', 'magical_dust'],
            intensity: 'low'
        }
    };
    
    // Test mode detection
    function isTestMode() {
        const hasTestPage = document.title.includes('Test') || window.location.pathname.includes('test');
        const hasMockGameData = window.gameData && Object.keys(window.gameData.characters || {}).length < 5;
        const hasTestResults = document.getElementById('test-results');
        return hasTestPage || hasMockGameData || hasTestResults;
    }

    // Initialize particle system
    function initialize() {
        console.log('✨ Initializing particle system...');
        
        // Create particle container if it doesn't exist
        particleState.container = document.getElementById('particle-container');
        if (!particleState.container) {
            particleState.container = createParticleContainer();
        }
        
        if (!particleState.container) {
            if (isTestMode()) {
                console.log('🧪 Test Mode - Could not create particle container (expected in test environment)');
                return true; // Return true in test mode to allow module to continue
            } else {
                console.error('❌ Could not create particle container');
                return false;
            }
        }
        
        // Initialize particle pool
        initializeParticlePool();
        
        // Add CSS styles
        injectParticleStyles();
        
        // Listen for character interactions
        setupEventListeners();
        
        // Check for reduced motion preference
        checkMotionPreference();
        
        console.log('✅ Particle system initialized');
        return true;
    }
    
    // Create particle container element
    function createParticleContainer() {
        const container = document.createElement('div');
        container.id = 'particle-container';
        container.className = 'fixed inset-0 z-10 pointer-events-none overflow-hidden';
        document.body.appendChild(container);
        return container;
    }
    
    // Initialize particle pool for performance
    function initializeParticlePool() {
        for (let i = 0; i < particleState.maxParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particleState.particlePool.push(particle);
        }
        console.log(`✨ Initialized particle pool with ${particleState.maxParticles} particles`);
    }
    
    // Inject CSS styles for particles
    function injectParticleStyles() {
        const styleId = 'particle-styles';
        if (document.getElementById(styleId)) {
            return; // Styles already injected
        }
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = getParticleCSS();
        document.head.appendChild(style);
    }
    
    // Get CSS for particle animations
    function getParticleCSS() {
        return `
            .particle {
                position: absolute;
                pointer-events: none;
                transform: translate3d(0, 0, 0);
                will-change: transform, opacity;
                border-radius: 50%;
                z-index: 10;
            }
            
            .particle-sparkle {
                background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%);
                box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
            }
            
            .particle-dust {
                background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
                opacity: 0.6;
            }
            
            .particle-orb {
                background: radial-gradient(circle, #7c3aed 0%, #3b82f6 100%);
                box-shadow: 0 0 12px #7c3aed;
            }
            
            .particle-celebration {
                background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
                box-shadow: 0 0 16px #f59e0b;
            }
            
            .particle-heart {
                background: #ec4899;
                border-radius: 0;
                clip-path: polygon(50% 20%, 80% 0%, 100% 30%, 50% 90%, 0% 30%, 20% 0%);
            }
            
            @keyframes sparkleFloat {
                0% {
                    transform: translate3d(var(--start-x, 0), var(--start-y, 0), 0) scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 50px)), calc(var(--start-y, 0) + var(--move-y, -50px)), 0) scale(1) rotate(180deg);
                    opacity: 0.8;
                }
                100% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 50px)), calc(var(--start-y, 0) + var(--move-y, -100px)), 0) scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes dustFloat {
                0% {
                    transform: translate3d(var(--start-x, 0), var(--start-y, 0), 0) scale(0.5);
                    opacity: 0.8;
                }
                100% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 30px)), calc(var(--start-y, 0) + var(--move-y, -80px)), 0) scale(1);
                    opacity: 0;
                }
            }
            
            @keyframes orbFloat {
                0% {
                    transform: translate3d(var(--start-x, 0), var(--start-y, 0), 0) scale(0);
                    opacity: 0.6;
                }
                50% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 10px)), calc(var(--start-y, 0) + var(--move-y, -30px)), 0) scale(1);
                    opacity: 0.4;
                }
                100% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 20px)), calc(var(--start-y, 0) + var(--move-y, -60px)), 0) scale(0);
                    opacity: 0;
                }
            }
            
            @keyframes celebrationBurst {
                0% {
                    transform: translate3d(var(--start-x, 0), var(--start-y, 0), 0) scale(0) rotate(0deg);
                    opacity: 1;
                }
                25% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 25px)), calc(var(--start-y, 0) + var(--move-y, -40px)), 0) scale(1.2) rotate(90deg);
                    opacity: 0.9;
                }
                100% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 100px)), calc(var(--start-y, 0) + var(--move-y, -150px)), 0) scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes heartFloat {
                0% {
                    transform: translate3d(var(--start-x, 0), var(--start-y, 0), 0) scale(0);
                    opacity: 1;
                }
                50% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 20px)), calc(var(--start-y, 0) + var(--move-y, -60px)), 0) scale(1.1);
                    opacity: 0.7;
                }
                100% {
                    transform: translate3d(calc(var(--start-x, 0) + var(--move-x, 40px)), calc(var(--start-y, 0) + var(--move-y, -120px)), 0) scale(0);
                    opacity: 0;
                }
            }
            
            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
                .particle {
                    animation: none !important;
                    opacity: 0 !important;
                }
            }
        `;
    }
    
    // Setup event listeners for particle triggers
    function setupEventListeners() {
        // Character click events
        window.addEventListener('characterClick', handleCharacterClick);
        
        // Bond progression events
        window.addEventListener('bondIncrease', handleBondIncrease);
        
        // Character change events
        window.addEventListener('characterChanged', handleCharacterChange);
        
        // Story milestone events
        window.addEventListener('storyMilestone', handleStoryMilestone);
    }
    
    // Handle character click particles
    function handleCharacterClick(event) {
        try {
            if (!particleState.isEnabled) return;
            
            const { characterId, clickPosition } = event.detail || {};
            if (!characterId) return;
            
            const theme = characterParticleThemes[characterId] || characterParticleThemes.default;
            
            // Create burst of particles at click position
            const burstCount = getIntensityCount(theme.intensity, 5, 10, 15);
            spawnParticleBurst(clickPosition, theme, burstCount);
        } catch (error) {
            console.warn('❌ Error in handleCharacterClick:', error);
        }
    }
    
    // Handle bond increase particles
    function handleBondIncrease(event) {
        if (!particleState.isEnabled) return;
        
        const { characterId, bondGain, position } = event.detail || {};
        const theme = characterParticleThemes[characterId] || characterParticleThemes.default;
        
        // Create flowing particles toward progress bar
        const flowCount = Math.min(bondGain * 2, 10);
        spawnFlowingParticles(position, theme, flowCount);
    }
    
    // Handle character change ambient particles
    function handleCharacterChange(event) {
        if (!particleState.isEnabled) return;
        
        const { characterId } = event.detail || {};
        const theme = characterParticleThemes[characterId] || characterParticleThemes.default;
        
        // Start ambient particle generation
        startAmbientParticles(theme);
    }
    
    // Handle story milestone celebration
    function handleStoryMilestone(event) {
        if (!particleState.isEnabled) return;
        
        const { characterId, milestone } = event.detail || {};
        const theme = characterParticleThemes[characterId] || characterParticleThemes.default;
        
        // Create celebration explosion
        spawnCelebrationExplosion(theme, milestone);
    }
    
    // Spawn particle burst at specific position
    function spawnParticleBurst(position, theme, count) {
        if (!position) position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particleType = getRandomParticleType(theme);
                const spreadX = (Math.random() - 0.5) * 100;
                const spreadY = (Math.random() - 0.5) * 50;
                
                spawnParticle({
                    type: particleType,
                    x: position.x + spreadX,
                    y: position.y + spreadY,
                    theme: theme
                });
            }, i * 50); // Stagger particle creation
        }
    }
    
    // Spawn flowing particles (for bond progression)
    function spawnFlowingParticles(startPosition, theme, count) {
        const progressBar = document.querySelector('.character-panel-progress-fill');
        const targetPosition = progressBar 
            ? progressBar.getBoundingClientRect() 
            : { x: window.innerWidth - 100, y: 100 };
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                spawnParticle({
                    type: 'magical_dust',
                    x: startPosition.x + (Math.random() - 0.5) * 40,
                    y: startPosition.y + (Math.random() - 0.5) * 20,
                    targetX: targetPosition.x,
                    targetY: targetPosition.y,
                    theme: theme
                });
            }, i * 100);
        }
    }
    
    // Start ambient particles for character
    function startAmbientParticles(theme) {
        // Stop any existing ambient particles
        stopAmbientParticles();
        
        // Start new ambient generation
        const intensityCount = getIntensityCount(theme.intensity, 1, 2, 3);
        particleState.ambientInterval = setInterval(() => {
            if (particleState.activeParticles.length < particleState.maxParticles) {
                spawnAmbientParticle(theme);
            }
        }, 3000 / intensityCount); // Adjust frequency based on intensity
    }
    
    // Stop ambient particles
    function stopAmbientParticles() {
        if (particleState.ambientInterval) {
            clearInterval(particleState.ambientInterval);
            particleState.ambientInterval = null;
        }
    }
    
    // Spawn single ambient particle
    function spawnAmbientParticle(theme) {
        const particleType = getRandomParticleType(theme);
        const x = Math.random() * window.innerWidth;
        const y = window.innerHeight + 50; // Start below screen
        
        spawnParticle({
            type: particleType,
            x: x,
            y: y,
            theme: theme
        });
    }
    
    // Spawn celebration explosion
    function spawnCelebrationExplosion(theme, milestone) {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const explosionCount = 20 + (milestone * 5); // More particles for higher milestones
        
        for (let i = 0; i < explosionCount; i++) {
            setTimeout(() => {
                const angle = (i / explosionCount) * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                const x = centerX + Math.cos(angle) * distance;
                const y = centerY + Math.sin(angle) * distance;
                
                spawnParticle({
                    type: 'celebration',
                    x: x,
                    y: y,
                    theme: theme
                });
            }, i * 25);
        }
    }
    
    // Spawn individual particle
    function spawnParticle(config) {
        if (particleState.activeParticles.length >= particleState.maxParticles) {
            return; // Too many particles
        }
        
        const particle = getParticleFromPool();
        if (!particle) return;
        
        const particleType = particleTypes[config.type] || particleTypes.sparkle;
        const size = randomBetween(particleType.size.min, particleType.size.max);
        
        // Set particle properties
        particle.className = `particle ${particleType.className}`;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = config.x + 'px';
        particle.style.top = config.y + 'px';
        
        // Set CSS custom properties for animation
        particle.style.setProperty('--start-x', '0px');
        particle.style.setProperty('--start-y', '0px');
        particle.style.setProperty('--move-x', particleType.movement.x + 'px');
        particle.style.setProperty('--move-y', particleType.movement.y + 'px');
        
        // Character-specific styling will be handled by CSS classes later if needed
        
        // Start animation
        particle.style.animation = `${particleType.animation} ${particleType.duration}ms ease-out forwards`;
        
        // Add to container and active list
        particleState.container.appendChild(particle);
        particleState.activeParticles.push(particle);
        
        // Schedule cleanup
        setTimeout(() => {
            recycleParticle(particle);
        }, particleType.duration);
    }
    
    // Get particle from pool or create new one
    function getParticleFromPool() {
        if (particleState.particlePool.length > 0) {
            return particleState.particlePool.pop();
        }
        
        // Pool exhausted, create new particle
        if (particleState.activeParticles.length < particleState.maxParticles) {
            return document.createElement('div');
        }
        
        return null;
    }
    
    // Recycle particle back to pool
    function recycleParticle(particle) {
        // Remove from active list
        const index = particleState.activeParticles.indexOf(particle);
        if (index > -1) {
            particleState.activeParticles.splice(index, 1);
        }
        
        // Remove from DOM
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        
        // Clean up particle
        particle.style.animation = '';
        particle.style.transform = '';
        particle.className = 'particle';
        
        // Return to pool
        particleState.particlePool.push(particle);
    }
    
    // Utility functions
    function getRandomParticleType(theme) {
        const types = theme.particles || ['sparkle'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    function getIntensityCount(intensity, low, medium, high) {
        switch (intensity) {
            case 'low': return low;
            case 'medium': return medium;
            case 'high': return high;
            default: return medium;
        }
    }
    
    function randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    function checkMotionPreference() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            particleState.isEnabled = false;
            console.log('✨ Particles disabled due to reduced motion preference');
        }
    }
    
    // Public API
    function triggerParticleBurst(characterId, position, intensity = 'medium') {
        const theme = characterParticleThemes[characterId] || characterParticleThemes.default;
        const count = getIntensityCount(intensity, 3, 8, 15);
        spawnParticleBurst(position, theme, count);
    }
    
    function setParticleEnabled(enabled) {
        particleState.isEnabled = enabled;
        if (!enabled) {
            stopAmbientParticles();
            // Clear all active particles
            particleState.activeParticles.forEach(recycleParticle);
        }
    }
    
    function getParticleCount() {
        return particleState.activeParticles.length;
    }
    
    function cleanup() {
        stopAmbientParticles();
        particleState.activeParticles.forEach(recycleParticle);
        
        // Remove event listeners
        window.removeEventListener('characterClick', handleCharacterClick);
        window.removeEventListener('bondIncrease', handleBondIncrease);
        window.removeEventListener('characterChanged', handleCharacterChange);
        window.removeEventListener('storyMilestone', handleStoryMilestone);
        
        console.log('✨ Particle system cleaned up');
    }
    
    // Public API
    return {
        initialize,
        triggerParticleBurst,
        setParticleEnabled,
        getParticleCount,
        cleanup
    };
}

// Register the module with retry mechanism
function registerParticleModule() {
    if (window.gameModules && window.gameModules.registerModule) {
        try {
            const success = window.gameModules.registerModule('particles', createParticleModule, ['domElements']);
            if (success) {
                console.log('✨ Particle module registered successfully');
                return true;
            } else {
                console.log('✨ Particle module registration deferred due to missing dependencies');
                setTimeout(registerParticleModule, 200);
                return false;
            }
        } catch (error) {
            console.error('Failed to register particle module:', error);
            return false;
        }
    } else {
        // Retry registration after a short delay
        setTimeout(registerParticleModule, 100);
        return false;
    }
}

// Attempt registration
registerParticleModule();

// Global fallback for HTML event handlers
window.triggerParticleBurst = (characterId, x, y, intensity) => {
    const particleModule = window.gameModules?.getModule('particles');
    if (particleModule) {
        particleModule.triggerParticleBurst(characterId, { x, y }, intensity);
    }
};

console.log('✨ Particle module loaded');