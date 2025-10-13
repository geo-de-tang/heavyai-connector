/**
 * Create a connection to the MapD server, generating a client and session ID.
 * @return {Promise.DbCon} Object.
 */
export default function connectAsync() {
    if (!Array.isArray(this._user) || !Array.isArray(this._password)) {
        return Promise.reject("Username and password must be arrays.")
    }

    if (!this._dbName[0]) {
        return Promise.reject("Please enter a database.")
    } else if (!this._user[0]) {
        return Promise.reject("Please enter a username.")
    } else if (!this._password[0]) {
        return Promise.reject("Please enter a password.")
    }

    // now check to see if length of all arrays are the same and > 0
    const hostLength = this._host.length
    if (hostLength < 1) {
        return Promise.reject("Must have at least one server to connect to.")
    }
    if (
        hostLength !== this._port.length ||
        hostLength !== this._user.length ||
        hostLength !== this._password.length ||
        hostLength !== this._dbName.length
    ) {
        return Promise.reject(
            "Array connection parameters must be of equal length."
        )
    }

    let clients = []
    this.initClients()
    console.log('after initClients in connectAsync')
    clients = this._client

    // Reset the client property, so we can add only the ones that we can connect to below
    this._client = []
    return Promise.allSettled(
        clients.map((client, h) => {
            // Log user and password for each connection attempt
            console.log(`Connecting with user: ${this._user[h]}, password: ${this._password[h]}, db: ${this._dbName[h]}`)
            console.log('this._connectionTimeout:', this._connectionTimeout)
            return this.wrapTimeout(
                client.connect(this._user[h], this._password[h], this._dbName[h]),
                this._connectionTimeout
            ).then((sessionId) => {
                console.log(`Connected to server ${this._host[h]}:${this._port[h]} with sessionId: ${sessionId}`)
                return { client, sessionId, connection: this._connections[h] }
            })
        })
    ).then((results) => {
        this._connections = []
        console.log('after Promise.allSettled in connectAsync')
        console.log('Connection results:')

        results.forEach(({ status, value }, index) => {
            console.log(`Connection ${index}: ${status}`)
            if (status === "fulfilled") {
                this._client.push(value.client)
                this._sessionId.push(value.sessionId)
                this._connections.push(value.connection)

                value.connection.on("error", (error) => {
                    if (this._shouldRejectPendingOnError(error)) {
                        this.rejectPendingRequests(index, `Connection error: ${error}`)
                    }
                    console.error(error) // eslint-disable-line no-console
                })
            }
        })

        if (this._client.length === 0) {
            return Promise.reject("Failed to connect to any servers.")
        }

        if (this._client.length < results.length) {
            console.error("Some connections did not succeed") // eslint-disable-line no-console
        }

        return this
    })
}