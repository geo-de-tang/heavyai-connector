/**
 * Disconnect from the server and then clear the client and session values.
 * @return {Promise.DbCon} Object.
 */
export default function disconnectAsync() {
    console.log('[HeavyDB] disconnectAsync called');
    return Promise.all(
        this._client.map((client, c) =>
            client.disconnect(this._sessionId[c]).catch((error) => {
                // ignore timeout errors
                if (error && !this.isTimeoutError(error)) {
                    throw error
                }
            })
        )
    ).then(() => {
        this._sessionId = null
        this._client = null
        this._numConnections = 0
        this.serverPingTimes = null
        return this
    })
}