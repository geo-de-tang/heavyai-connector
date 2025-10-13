import util from "util"
import { TJSONProtocol } from "thrift"

/**
 * Custom version of TJSONProtocol - thrift 0.14.0 throws an exception if
 * anything other than a string or Buffer is passed to writeString. For
 * example: we use a number for a nonce that is defined as a string type. So,
 * let's just coerce things to a string.
 */
export default function CustomTJSONProtocol(...args) {
    TJSONProtocol.apply(this, args)
}

util.inherits(CustomTJSONProtocol, TJSONProtocol)

CustomTJSONProtocol.prototype.writeString = function (arg) {
    if (!(arg instanceof Buffer)) {
        arg = String(arg)
    }
    return TJSONProtocol.prototype.writeString.call(this, arg)
}

// Additionally, the browser version of connector relied on thrift's old
// behavior of returning a Number for a 64-bit int. Technically, javascript
// does not have 64-bits of precision in a Number, so this can end up giving
// incorrect results.
//
// Lastly, the browser version relied on thrift returning a string from a
// binary type.
if (process.env.BROWSER) {
    CustomTJSONProtocol.prototype.readI64 = function () {
        const n = TJSONProtocol.prototype.readI64.call(this)
        return n.toNumber(true)
    }

    CustomTJSONProtocol.prototype.readBinary = function () {
        return TJSONProtocol.prototype.readString.call(this)
    }
}