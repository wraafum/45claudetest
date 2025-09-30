// Advanced Animation Framework - Easing Functions and Animation Utilities
// Wszystkie Moje Potwory

function createAnimationModule(dependencies, moduleManager) {
    console.log('🎬 Animation Module created');
    
    // Animation state management
    const animationState = {
        activeAnimations: new Map(),
        animationQueue: [],
        isProcessingQueue: false,
        animationId: 0
    };
    
    // Easing functions for smooth animations
    const easing = {
        // Basic easing
        linear: t => t,
        
        // Quadratic
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        
        // Cubic
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        
        // Bounce
        easeOutBounce: t => {
            const n1 = 7.5625;
            const d1 = 2.75;
            
            if (t < 1 / d1) {
                return n1 * t * t;
            } else if (t < 2 / d1) {
                return n1 * (t -= 1.5 / d1) * t + 0.75;
            } else if (t < 2.5 / d1) {
                return n1 * (t -= 2.25 / d1) * t + 0.9375;
            } else {
                return n1 * (t -= 2.625 / d1) * t + 0.984375;
            }
        },
        
        // Elastic
        easeOutElastic: t => {
            const c4 = (2 * Math.PI) / 3;
            return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
        },
        
        // Back
        easeOutBack: t => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        }
    };
    
    // Animation presets for common UI transitions
    const presets = {
        fadeIn: {
            duration: 300,
            easing: 'easeOutQuad',
            properties: { opacity: { from: 0, to: 1 } }
        },
        fadeOut: {
            duration: 300,
            easing: 'easeInQuad',
            properties: { opacity: { from: 1, to: 0 } }
        },
        slideUp: {
            duration: 400,
            easing: 'easeOutCubic',
            properties: { 
                transform: { from: 'translateY(20px)', to: 'translateY(0px)' },
                opacity: { from: 0, to: 1 }
            }
        },
        scaleIn: {
            duration: 300,
            easing: 'easeOutBack',
            properties: {
                transform: { from: 'scale(0)', to: 'scale(1)' },
                opacity: { from: 0, to: 1 }
            }
        },
        pulse: {
            duration: 600,
            easing: 'easeOutElastic',
            properties: {
                transform: { from: 'scale(1)', to: 'scale(1.1)', back: 'scale(1)' }
            }
        },
        glow: {
            duration: 1000,
            easing: 'easeInOutQuad',
            properties: {
                boxShadow: { 
                    from: '0 0 0px rgba(124, 58, 237, 0)', 
                    to: '0 0 20px rgba(124, 58, 237, 0.6)',
                    back: '0 0 0px rgba(124, 58, 237, 0)'
                }
            }
        }
    };
    
    // Initialize animation system
    function initialize() {
        console.log('🎬 Initializing animation system...');
        
        // Check for reduced motion preference
        checkMotionPreference();
        
        console.log('✅ Animation system initialized');
        return true;
    }
    
    // Main animation function
    function animate(element, config) {
        return new Promise((resolve, reject) => {
            if (!element) {
                reject(new Error('Element is required for animation'));
                return;
            }
            
            // Handle preset animations
            if (typeof config === 'string' && presets[config]) {
                config = presets[config];
            }
            
            const animationId = ++animationState.animationId;
            const duration = config.duration || 300;
            const easingFunction = easing[config.easing] || easing.easeOutQuad;
            const properties = config.properties || {};
            
            // Store initial values
            const initialValues = {};
            const targetValues = {};
            const hasBackValues = {};
            
            Object.keys(properties).forEach(prop => {
                const propConfig = properties[prop];
                if (typeof propConfig === 'object') {
                    initialValues[prop] = propConfig.from || getComputedValue(element, prop);
                    targetValues[prop] = propConfig.to;
                    hasBackValues[prop] = !!propConfig.back;
                }
            });
            
            const startTime = performance.now();
            animationState.activeAnimations.set(animationId, { element, resolve, reject });
            
            function animationStep(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easingFunction(progress);
                
                // Apply animated values
                Object.keys(properties).forEach(prop => {
                    const initial = parseAnimationValue(initialValues[prop]);
                    const target = parseAnimationValue(targetValues[prop]);
                    const current = interpolateValue(initial, target, easedProgress);
                    
                    if (prop === 'transform') {
                        element.style.transform = current;
                    } else if (prop.includes('Color') || prop.includes('Shadow')) {
                        element.style[prop] = current;
                    } else {
                        element.style[prop] = current;
                    }
                });
                
                if (progress < 1 && animationState.activeAnimations.has(animationId)) {
                    requestAnimationFrame(animationStep);
                } else {
                    // Animation complete
                    animationState.activeAnimations.delete(animationId);
                    
                    // Handle back animation (for pulse effects)
                    const backProperties = Object.keys(properties).filter(prop => hasBackValues[prop]);
                    if (backProperties.length > 0) {
                        const backConfig = {
                            duration: duration / 2,
                            easing: config.easing,
                            properties: {}
                        };
                        
                        backProperties.forEach(prop => {
                            backConfig.properties[prop] = {
                                from: targetValues[prop],
                                to: properties[prop].back
                            };
                        });
                        
                        animate(element, backConfig).then(resolve).catch(reject);
                    } else {
                        resolve();
                    }
                }
            }
            
            requestAnimationFrame(animationStep);
        });
    }
    
    // Animation queue for chaining animations
    function animateSequence(element, animations) {
        return animations.reduce((promise, animation) => {
            return promise.then(() => animate(element, animation));
        }, Promise.resolve());
    }
    
    // Animate multiple elements in parallel
    function animateParallel(animationConfigs) {
        const animations = animationConfigs.map(({ element, config }) => animate(element, config));
        return Promise.all(animations);
    }
    
    // Staggered animations (elements animate one after another with delay)
    function animateStagger(elements, config, staggerDelay = 100) {
        const animations = elements.map((element, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    animate(element, config).then(resolve);
                }, index * staggerDelay);
            });
        });
        
        return Promise.all(animations);
    }
    
    // Utility functions
    function parseAnimationValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Handle transform values
            if (value.includes('translate') || value.includes('scale') || value.includes('rotate')) {
                return value;
            }
            // Handle numeric values with units
            const match = value.match(/^(-?\d*\.?\d+)(.*)$/);
            if (match) {
                return { value: parseFloat(match[1]), unit: match[2] };
            }
        }
        return value;
    }
    
    function interpolateValue(initial, target, progress) {
        if (typeof initial === 'number' && typeof target === 'number') {
            return initial + (target - initial) * progress;
        }
        
        if (typeof initial === 'object' && typeof target === 'object' && initial.unit === target.unit) {
            const value = initial.value + (target.value - initial.value) * progress;
            return value + initial.unit;
        }
        
        // Handle transform interpolation
        if (typeof initial === 'string' && typeof target === 'string') {
            if (initial.includes('translate') && target.includes('translate')) {
                return interpolateTransform(initial, target, progress);
            }
            if (initial.includes('scale') && target.includes('scale')) {
                return interpolateTransform(initial, target, progress);
            }
        }
        
        // Fallback: use target value for non-interpolatable properties
        return progress < 1 ? initial : target;
    }
    
    function interpolateTransform(initial, target, progress) {
        // Simple transform interpolation (can be extended)
        if (initial.includes('translateY') && target.includes('translateY')) {
            const initialValue = parseFloat(initial.match(/translateY\(([^)]+)\)/)[1]);
            const targetValue = parseFloat(target.match(/translateY\(([^)]+)\)/)[1]);
            const currentValue = initialValue + (targetValue - initialValue) * progress;
            return `translateY(${currentValue}px)`;
        }
        
        if (initial.includes('scale') && target.includes('scale')) {
            const initialValue = parseFloat(initial.match(/scale\(([^)]+)\)/)[1]);
            const targetValue = parseFloat(target.match(/scale\(([^)]+)\)/)[1]);
            const currentValue = initialValue + (targetValue - initialValue) * progress;
            return `scale(${currentValue})`;
        }
        
        return progress < 0.5 ? initial : target;
    }
    
    function getComputedValue(element, property) {
        return window.getComputedStyle(element)[property];
    }
    
    // Check for reduced motion preference
    function checkMotionPreference() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            // Reduce all animation durations
            Object.keys(presets).forEach(preset => {
                presets[preset].duration = Math.min(presets[preset].duration, 100);
            });
            console.log('🎬 Reduced motion mode active - animations shortened');
        }
    }
    
    // Cancel animation
    function cancelAnimation(element) {
        for (const [id, animation] of animationState.activeAnimations) {
            if (animation.element === element) {
                animationState.activeAnimations.delete(id);
                animation.reject(new Error('Animation cancelled'));
            }
        }
    }
    
    // Cancel all animations
    function cancelAllAnimations() {
        for (const [id, animation] of animationState.activeAnimations) {
            animation.reject(new Error('All animations cancelled'));
        }
        animationState.activeAnimations.clear();
    }
    
    // Get active animation count
    function getActiveAnimationCount() {
        return animationState.activeAnimations.size;
    }
    
    // Enhanced DOM element creation with animation support
    function createAnimatedElement(tag, config = {}) {
        const element = document.createElement(tag);
        
        if (config.className) element.className = config.className;
        if (config.innerHTML) element.innerHTML = config.innerHTML;
        if (config.style) Object.assign(element.style, config.style);
        
        // Add animation helper methods
        element.animateIn = (preset = 'fadeIn') => animate(element, preset);
        element.animateOut = (preset = 'fadeOut') => animate(element, preset);
        element.pulse = () => animate(element, 'pulse');
        element.glow = () => animate(element, 'glow');
        
        return element;
    }
    
    // Cleanup function
    function cleanup() {
        cancelAllAnimations();
        console.log('🎬 Animation system cleaned up');
    }
    
    // Public API
    return {
        initialize,
        animate,
        animateSequence,
        animateParallel,
        animateStagger,
        createAnimatedElement,
        cancelAnimation,
        cancelAllAnimations,
        getActiveAnimationCount,
        easing,
        presets,
        cleanup
    };
}

// Register the module with retry mechanism
function registerAnimationModule() {
    if (window.gameModules && window.gameModules.registerModule) {
        try {
            window.gameModules.registerModule('animations', createAnimationModule, []);
            console.log('🎬 Animation module registered successfully');
            return true;
        } catch (error) {
            console.error('Failed to register animation module:', error);
            return false;
        }
    } else {
        // Retry registration after a short delay
        setTimeout(registerAnimationModule, 100);
        return false;
    }
}

// Attempt registration
registerAnimationModule();

// Global utility functions for HTML event handlers
window.animateElement = (element, preset) => {
    const animationModule = window.gameModules?.getModule('animations');
    if (animationModule && element) {
        return animationModule.animate(element, preset);
    }
};

window.pulseElement = (element) => {
    const animationModule = window.gameModules?.getModule('animations');
    if (animationModule && element) {
        return animationModule.animate(element, 'pulse');
    }
};

console.log('🎬 Animation module loaded');