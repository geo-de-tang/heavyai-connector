/**
 * Get compression level, ensuring it's within valid range
 * @param {Number} level - Compression level to validate
 * @return {Number} Valid compression level between 1-10
 */
export default function getCompressionLevel(level) {
    if (typeof level === "undefined" || level === null) {
        return 3 // COMPRESSION_LEVEL_DEFAULT
    }

    // Ensure level is within valid range (1-10)
    return Math.max(1, Math.min(10, parseInt(level, 10) || 3))
}