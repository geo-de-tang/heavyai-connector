/**
 * Parse and validate options object, handling argument array patterns
 * @param {Object} options - Options object to process
 * @return {Object} Processed options with defaults
 */
export default function opts(options = {}) {
    // Handle common option patterns
    const processed = {
        includeSystemColumns: options.includeSystemColumns || false,
        includeVirtualColumns: options.includeVirtualColumns || false,
        includeColumns: options.includeColumns || false,
        isArrowResult: options.isArrowResult || false,
        ...options
    }

    return processed
}