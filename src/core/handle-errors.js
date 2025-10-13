/**
 * Error handling wrapper for async methods
 * @param {Function} method - The method to wrap with error handling
 * @returns {Function} Wrapped method with error handling
 */
export default function handleErrors(method) {
    return (...args) =>
        method.apply(this, args).catch((error) => {
            console.error('handleErrors', error)
            this.events.emit(this.EVENT_NAMES.ERROR, error)
            throw error
        })
}