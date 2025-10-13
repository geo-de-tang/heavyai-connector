/**
 * Initialize the connector for use. This is similar to `connect()`, but stops short of
 * actually connecting to the server.
 * @return {DbCon} Object.
 */
export default function initClients() {
    const allAreArrays =
        Array.isArray(this._host) &&
        Array.isArray(this._port) &&
        Array.isArray(this._dbName)
    if (!allAreArrays) {
        throw new Error("Host, port, and dbName must be arrays.")
    }

    this._client = []
    this._sessionId = []

    if (!this._host[0]) {
        throw new Error("Please enter a host name.")
    } else if (!this._port[0]) {
        throw new Error("Please enter a port.")
    }

    // now check to see if length of all arrays are the same and > 0
    const hostLength = this._host.length
    if (hostLength < 1) {
        throw new Error("Must have at least one server to connect to.")
    }
    if (hostLength !== this._port.length) {
        throw new Error("Array connection parameters must be of equal length.")
    }

    if (!this._protocol) {
        this._protocol = this._host.map(() =>
            process.env.BROWSER ? window.location.protocol.replace(":", "") : "http"
        )
    }

    const transportUrls = this.getEndpoints()
    const clients = []
    const connections = []
    console.log('before the for loop')

    for (let h = 0; h < hostLength; h++) {
        const { client, connection } = this.buildClient(
            transportUrls[h],
            this._useBinaryProtocol
        )
        clients.push(client)
        connections.push(connection)
    }
    console.log('after the for loop')
    this._client = clients
    this._connections = connections
    this._numConnections = this._client.length
    return this
}