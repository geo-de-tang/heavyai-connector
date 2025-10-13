import { TBufferedTransport, createConnection, createHttpConnection, createClient, createXHRClient } from "thrift"
import MapDThrift from "../../thrift/Heavy.js"
import CustomXHRConnection from "../protocols/custom-xhr-connection.js"
import CustomBinaryProtocol from "../protocols/custom-binary-protocol.js"
import CustomTJSONProtocol from "../protocols/custom-json-protocol.js"

/**
 * Build client and connection for the given URL and protocol
 * @param {string} url - The connection URL
 * @param {boolean} useBinaryProtocol - Whether to use binary protocol
 * @returns {object} Object containing client and connection
 */
export default function buildClient(url, useBinaryProtocol) {
    const urlObj = new URL(url)
    const protocol = urlObj.protocol
    const hostname = urlObj.hostname
    let port = urlObj.port
    if (port === "") {
        port = protocol === "https:" ? "443" : "80"
    }
    console.log(port)

    let client = null
    let connection = null
    if (!process.env.BROWSER) {
        console.log('not in browser')

        console.log('using ssl');
        if (protocol !== "http:" && protocol !== "https:") {
            console.log(hostname, port);
            connection = createConnection(hostname, port, {
            })
            client = createClient(MapDThrift, connection)
        } else {
            console.log('using http');
            console.log('useBinaryProtocol', useBinaryProtocol);
            connection = createHttpConnection(hostname, port, {
                transport: TBufferedTransport,
                protocol: useBinaryProtocol ? CustomBinaryProtocol : CustomTJSONProtocol,
                path: "/",
                headers: {
                    Connection: "close",
                    "Content-Type": `application/vnd.apache.thrift.${useBinaryProtocol ? "binary" : "json"
                        }`
                },
                https: protocol === "https:"
            })
            client = createClient(MapDThrift, connection)
        }
    } else {
        if (protocol !== "http:" && protocol !== "https:") {
            console.log(hostname, port);
            connection = createConnection(hostname, port, {
            })
            client = createClient(MapDThrift, connection)
        } else {
            connection = new CustomXHRConnection(hostname, port, {
                transport: TBufferedTransport,
                protocol: useBinaryProtocol ? CustomBinaryProtocol : CustomTJSONProtocol,
                path: "/",
                headers: {
                    "Content-Type": `application/vnd.apache.thrift.${useBinaryProtocol ? "binary" : "json"
                        }`
                },
                https: protocol === "https:"

            })
            client = createXHRClient(MapDThrift, connection)
        }
    }

    console.log("returning client and connection")
    return { client, connection }
}