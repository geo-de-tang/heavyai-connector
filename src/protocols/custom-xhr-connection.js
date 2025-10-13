import util from "util"
import { XHRConnection } from "thrift"

/**
 * Custom version of XHRConnection which can set `withCredentials` for CORS
 * @param {string} host - Host URL
 * @param {number} port - Port number  
 * @param {object} opts - Connection options
 */
export default function CustomXHRConnection(host, port, opts) {
    XHRConnection.call(this, host, port, opts)
    if (opts.headers["Content-Type"] === "application/vnd.apache.thrift.binary") {
        // this is copy/paste from thrift with the noted changes below
        this.flush = () => {
            if (this.url === undefined || this.url === "") {
                return this.send_buf
            }

            const xreq = this.getXmlHttpRequestObject()

            // removed overrideMimeType since we're expecting binary data
            // added responseType
            xreq.responseType = "arraybuffer"
            xreq.onreadystatechange = () => {
                if (xreq.readyState === 4 && xreq.status === 200) {
                    // changed responseText -> response
                    this.setRecvBuffer(xreq.response)
                }
            }

            xreq.open("POST", this.url, true)

            Object.keys(this.headers).forEach((headerKey) => {
                xreq.setRequestHeader(headerKey, this.headers[headerKey])
            })

            xreq.send(this.send_buf)
        }
    }
}

util.inherits(CustomXHRConnection, XHRConnection)

CustomXHRConnection.prototype.getXmlHttpRequestObject = function () {
    const obj = XHRConnection.prototype.getXmlHttpRequestObject.call(this)
    obj.withCredentials = CustomXHRConnection.withCredentials
    return obj
}