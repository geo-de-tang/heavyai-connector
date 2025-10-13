import pushid from "pushid"

/**
 * Wrap a Thrift method to perform session check and mapping over all clients
 * @param {string} methodName - Name of the Thrift method to call
 * @param {string} overClients - Strategy for client handling (SINGLE_CLIENT or ALL_CLIENTS)
 * @param {Function} processArgs - Function to process arguments before calling Thrift
 * @returns {Function} Wrapped Thrift method
 */
export default function wrapThrift(methodName, overClients, processArgs) {
    return (...args) => {
        console.log('=== wrapThrift START ===');
        console.log('methodName:', methodName);
        console.log('overClients:', overClients);
        console.log('args received:', args);
        console.log('sessionId exists:', !!this._sessionId);
        console.log('sessionId value:', this._sessionId);

        // Check if we have a valid session
        if (!this._sessionId) {
            console.error('❌ No session ID - rejecting promise');
            const error = new Error("You are not connected to a server. Try running the connect method first.");
            console.error('Rejection error:', error);
            return Promise.reject(error);
        }

        console.log('✅ Session ID exists, proceeding...');

        // Process the arguments
        let processedArgs;
        try {
            console.log('Processing args with processArgs function...');
            processedArgs = processArgs(args);
            console.log('Processed args:', processedArgs);
        } catch (error) {
            console.error('❌ Error processing args:', error);
            return Promise.reject(error);
        }

        // Emit browser event if needed
        if (process.env.BROWSER) {
            console.log('🌐 Browser environment - emitting event');
            this.events.emit(this.EVENT_NAMES.METHOD_CALLED, methodName);
        }

        // Handle single client vs all clients
        if (overClients === this.overSingleClient) {
            console.log('📡 Using SINGLE CLIENT strategy');
            return this.executeSingleClient(methodName, processedArgs);
        } else {
            console.log('📡 Using ALL CLIENTS strategy');
            return this.executeAllClients(methodName, processedArgs);
        }
    }
}