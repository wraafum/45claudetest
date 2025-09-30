// Module Manager - Dependency Injection and Module Lifecycle Management
// Wszystkie Moje Potwory

// Enhanced Module Manager with better error handling and lifecycle management
function createModuleManager() {
    // Internal state
    const state = {
        modules: new Map(),
        dependencies: new Map(), 
        initialized: new Set(),
        loadOrder: [],
        errors: new Map(),
        statistics: {
            registered: 0,
            initialized: 0,
            failed: 0,
            totalInitTime: 0
        }
    };
    
    // Module status constants
    const MODULE_STATUS = {
        REGISTERED: 'registered',
        INITIALIZING: 'initializing',
        INITIALIZED: 'initialized',
        FAILED: 'failed',
        CLEANING_UP: 'cleaning_up',
        DESTROYED: 'destroyed'
    };
    
    // Validate dependencies are available
    function validateDependencies(dependencies) {
        const missingDeps = [];
        
        for (const dep of dependencies) {
            // Check for domElements special case
            if (dep === 'domElements') {
                if (!window.domElements) {
                    missingDeps.push(dep);
                }
                continue;
            }
            
            // Check if dependency module exists and is initialized
            const depModule = state.modules.get(dep);
            if (!depModule || depModule.status !== MODULE_STATUS.INITIALIZED) {
                missingDeps.push(dep);
            }
        }
        
        return missingDeps;
    }

    // Register a module with factory function and dependencies
    function registerModule(name, factory, dependencies = []) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new Error('Module name must be a non-empty string');
        }
        
        if (typeof factory !== 'function') {
            throw new Error(`Module factory for '${name}' must be a function`);
        }
        
        if (!Array.isArray(dependencies)) {
            throw new Error(`Dependencies for '${name}' must be an array`);
        }
        
        // Validate dependencies are available
        const missingDeps = validateDependencies(dependencies);
        if (missingDeps.length > 0) {
            const error = new Error(`Module '${name}' has missing dependencies: ${missingDeps.join(', ')}`);
            console.warn(`📦 ${error.message}`);
            
            // Store module for later registration when dependencies are ready
            state.modules.set(name, {
                name,
                factory,
                dependencies: [...dependencies], // Clone array
                status: MODULE_STATUS.REGISTERED,
                instance: null,
                initTime: null,
                error: null,
                pendingDependencies: missingDeps
            });
            
            return false; // Registration deferred
        }
        
        // Check if module already registered
        if (state.modules.has(name)) {
            console.warn(`📦 Module '${name}' is already registered, overriding...`);
        }
        
        // Store module data
        state.modules.set(name, {
            name,
            factory,
            dependencies: [...dependencies], // Clone array
            status: MODULE_STATUS.REGISTERED,
            instance: null,
            initTime: null,
            error: null
        });
        
        state.dependencies.set(name, dependencies);
        state.statistics.registered++;
        
        console.log(`📦 Module registered: ${name}${dependencies.length ? ` (deps: ${dependencies.join(', ')})` : ''}`);
        return true;
    }
    
    // Get a module instance (initialize if needed)
    function getModule(name) {
        if (!name || typeof name !== 'string') {
            console.error('Module name must be a non-empty string');
            return null;
        }
        
        // Return cached instance if already initialized
        if (state.initialized.has(name)) {
            const moduleData = state.modules.get(name);
            return moduleData ? moduleData.instance : null;
        }
        
        // Initialize the module
        return initializeModule(name);
    }
    
    // Initialize a specific module with dependency resolution
    function initializeModule(name) {
        if (state.initialized.has(name)) {
            return state.modules.get(name)?.instance || null;
        }
        
        const moduleData = state.modules.get(name);
        if (!moduleData) {
            console.error(`📦 Module not found: ${name}`);
            return null;
        }
        
        // Check if already initializing (circular dependency)
        if (moduleData.status === MODULE_STATUS.INITIALIZING) {
            console.error(`📦 Circular dependency detected for module: ${name}`);
            moduleData.status = MODULE_STATUS.FAILED;
            moduleData.error = new Error('Circular dependency');
            state.statistics.failed++;
            return null;
        }
        
        // Check if previously failed
        if (moduleData.status === MODULE_STATUS.FAILED) {
            console.error(`📦 Module '${name}' previously failed to initialize`);
            return null;
        }
        
        console.log(`📦 Initializing module: ${name}...`);
        moduleData.status = MODULE_STATUS.INITIALIZING;
        
        const initStartTime = performance.now();
        
        try {
            // Resolve dependencies first
            const resolvedDependencies = {};
            const unresolvedDeps = [];
            
            for (const depName of moduleData.dependencies) {
                console.log(`📦   - Resolving dependency: ${depName} for ${name}`);
                const depInstance = getModule(depName);
                
                if (depInstance === null) {
                    unresolvedDeps.push(depName);
                } else {
                    resolvedDependencies[depName] = depInstance;
                }
            }
            
            // Check if all dependencies were resolved
            if (unresolvedDeps.length > 0) {
                const error = new Error(`Failed to resolve dependencies: ${unresolvedDeps.join(', ')}`);
                console.error(`📦 Module '${name}' dependency resolution failed:`, error);
                moduleData.status = MODULE_STATUS.FAILED;
                moduleData.error = error;
                state.errors.set(name, error);
                state.statistics.failed++;
                return null;
            }
            
            // Create module instance
            const instance = moduleData.factory(resolvedDependencies, this);
            
            if (!instance) {
                throw new Error('Module factory returned null or undefined');
            }
            
            // Store successful initialization
            const initTime = performance.now() - initStartTime;
            moduleData.instance = instance;
            moduleData.status = MODULE_STATUS.INITIALIZED;
            moduleData.initTime = initTime;
            state.initialized.add(name);
            state.loadOrder.push(name);
            state.statistics.initialized++;
            state.statistics.totalInitTime += initTime;
            
            console.log(`✅ Module initialized: ${name} (${Math.round(initTime)}ms)`);
            return instance;
            
        } catch (error) {
            const initTime = performance.now() - initStartTime;
            console.error(`❌ Failed to initialize module '${name}':`, error);
            
            moduleData.status = MODULE_STATUS.FAILED;
            moduleData.error = error;
            moduleData.initTime = initTime;
            state.errors.set(name, error);
            state.statistics.failed++;
            
            return null;
        }
    }
    
    // Initialize all registered modules
    function initializeAll() {
        console.log(`📦 Initializing all modules (${state.modules.size} registered)...`);
        const startTime = performance.now();
        
        const moduleNames = Array.from(state.modules.keys());
        let successful = 0;
        
        for (const name of moduleNames) {
            const instance = getModule(name);
            if (instance) {
                successful++;
            }
        }
        
        const totalTime = performance.now() - startTime;
        console.log(`📦 Module initialization complete: ${successful}/${moduleNames.length} successful (${Math.round(totalTime)}ms)`);
        
        if (state.statistics.failed > 0) {
            console.warn(`📦 ${state.statistics.failed} modules failed to initialize`);
        }
        
        return { successful, total: moduleNames.length, time: totalTime };
    }
    
    // Cleanup all modules (in reverse initialization order)
    function cleanup() {
        console.log('📦 Cleaning up all modules...');
        
        // Cleanup in reverse order of initialization
        const cleanupOrder = [...state.loadOrder].reverse();
        let cleaned = 0;
        
        for (const name of cleanupOrder) {
            const moduleData = state.modules.get(name);
            
            if (moduleData && moduleData.instance) {
                moduleData.status = MODULE_STATUS.CLEANING_UP;
                
                try {
                    if (moduleData.instance.cleanup && typeof moduleData.instance.cleanup === 'function') {
                        console.log(`📦   - Cleaning up: ${name}`);
                        moduleData.instance.cleanup();
                        cleaned++;
                    }
                } catch (error) {
                    console.error(`📦 Error cleaning up module '${name}':`, error);
                }
                
                moduleData.status = MODULE_STATUS.DESTROYED;
                moduleData.instance = null;
            }
        }
        
        // Clear all state
        state.initialized.clear();
        state.loadOrder.length = 0;
        state.errors.clear();
        
        console.log(`📦 Cleanup complete: ${cleaned} modules cleaned`);
    }
    
    // Get module information and statistics
    function getModuleInfo(name = null) {
        if (name) {
            const moduleData = state.modules.get(name);
            if (!moduleData) {
                return null;
            }
            
            return {
                name: moduleData.name,
                status: moduleData.status,
                dependencies: moduleData.dependencies,
                initTime: moduleData.initTime,
                error: moduleData.error,
                hasInstance: !!moduleData.instance
            };
        }
        
        // Return information about all modules
        const modules = {};
        for (const [name, moduleData] of state.modules) {
            modules[name] = {
                status: moduleData.status,
                dependencies: moduleData.dependencies,
                initTime: moduleData.initTime,
                hasInstance: !!moduleData.instance,
                error: moduleData.error?.message || null
            };
        }
        
        return {
            modules,
            statistics: { ...state.statistics },
            loadOrder: [...state.loadOrder],
            errors: Array.from(state.errors.keys())
        };
    }
    
    // Check if a module is available and initialized
    function isModuleReady(name) {
        return state.initialized.has(name) && 
               state.modules.get(name)?.status === MODULE_STATUS.INITIALIZED;
    }
    
    // Get dependency graph for debugging
    function getDependencyGraph() {
        const graph = {};
        
        for (const [name, dependencies] of state.dependencies) {
            graph[name] = {
                dependencies,
                status: state.modules.get(name)?.status || 'unknown',
                dependents: []
            };
        }
        
        // Calculate dependents (reverse dependencies)
        for (const [name, data] of Object.entries(graph)) {
            for (const dep of data.dependencies) {
                if (graph[dep]) {
                    graph[dep].dependents.push(name);
                }
            }
        }
        
        return graph;
    }
    
    // Validate module dependencies (detect circular dependencies, missing modules)
    function validateDependencies() {
        const issues = {
            missing: [],
            circular: [],
            valid: true
        };
        
        for (const [name, dependencies] of state.dependencies) {
            // Check for missing dependencies
            for (const dep of dependencies) {
                if (!state.modules.has(dep)) {
                    issues.missing.push({ module: name, missingDep: dep });
                    issues.valid = false;
                }
            }
        }
        
        // Simple circular dependency detection
        function hasCircularDep(name, visiting = new Set(), visited = new Set()) {
            if (visiting.has(name)) {
                return true; // Circular dependency found
            }
            
            if (visited.has(name)) {
                return false; // Already checked this path
            }
            
            visiting.add(name);
            
            const deps = state.dependencies.get(name) || [];
            for (const dep of deps) {
                if (hasCircularDep(dep, visiting, visited)) {
                    issues.circular.push({ module: name, circularDep: dep });
                    issues.valid = false;
                    return true;
                }
            }
            
            visiting.delete(name);
            visited.add(name);
            return false;
        }
        
        for (const name of state.modules.keys()) {
            hasCircularDep(name);
        }
        
        return issues;
    }
    
    // Public API
    return {
        registerModule,
        getModule,
        initializeModule,
        initializeAll,
        cleanup,
        getModuleInfo,
        isModuleReady,
        getDependencyGraph,
        validateDependencies,
        
        // Read-only access to internal state
        get statistics() { return { ...state.statistics }; },
        get loadOrder() { return [...state.loadOrder]; },
        get moduleCount() { return state.modules.size; },
        get initializedCount() { return state.initialized.size; }
    };
}

// Initialize the global module manager
window.gameModules = createModuleManager();

// Add validation and diagnostics
console.log('📦 Enhanced Module Manager loaded');

// Global debugging functions
window.moduleDebug = {
    info: (name) => window.gameModules.getModuleInfo(name),
    graph: () => window.gameModules.getDependencyGraph(),
    validate: () => window.gameModules.validateDependencies(),
    stats: () => window.gameModules.statistics
};