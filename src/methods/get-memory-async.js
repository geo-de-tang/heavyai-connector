/**
 * Get memory information from the server.
 * @param {String} memory_level - Level of memory information to retrieve.
 * @return {Promise<Object>} Returns memory usage information.
 * @example <caption>Get memory information:</caption>
 * con.getMemoryAsync("gpu").then(res => console.log(res))
 */
export default function getMemoryAsync(memory_level = "gpu") {
    return this.wrapThrift('get_memory', [
        this._client,
        this._sessionId,
        memory_level
    ])
}