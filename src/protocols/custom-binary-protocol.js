import util from "util"
import { TBinaryProtocol } from "thrift"

/**
 * Custom version of the binary protocol to override writeString, readI64, and
 * readBinary for browser compatibility.
 */
export default function CustomBinaryProtocol(...args) {
    TBinaryProtocol.apply(this, args)
}

util.inherits(CustomBinaryProtocol, TBinaryProtocol)

CustomBinaryProtocol.prototype.writeString = function (arg) {
    if (!(arg instanceof Buffer)) {
        arg = String(arg)
    }
    return TBinaryProtocol.prototype.writeString.call(this, arg)
}

if (process.env.BROWSER) {
    CustomBinaryProtocol.prototype.readI64 = function () {
        const n = TBinaryProtocol.prototype.readI64.call(this)
        return n.toNumber(true)
    }

    CustomBinaryProtocol.prototype.readBinary = function () {
        return TBinaryProtocol.prototype.readBinary.call(this).toString("base64")
    }
}