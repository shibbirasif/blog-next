// Flag to track if models have been loaded
let modelsLoaded = false;

/**
 * Centralized model loader that ensures all models are registered with Mongoose
 * This prevents MissingSchemaError by loading models in the correct order
 */
export async function loadModels() {
    // Only load models once to prevent re-registration errors
    if (modelsLoaded) {
        return;
    }

    try {
        // Load models in dependency order
        // User model first (no dependencies)
        await import('./User');

        // Tag model next (no dependencies)
        await import('./Tag');

        // Article model last (depends on User and Tag)
        await import('./Article');

        modelsLoaded = true;
        console.log('✅ All models loaded successfully');
    } catch (error) {
        console.error('❌ Error loading models:', error);
        throw error;
    }
}
