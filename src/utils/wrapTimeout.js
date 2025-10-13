/**
  * Rejects the passed promise if timeout is exceeded
  *
  * @param {Promise} promise - The promise to wrap with a timeout.
  * @param {number} timeout - The time in milliseconds after which the promise will be rejected if not settled.
  * @return {Promise} A new promise that resolves with the original promise's value, or rejects with an error if the original promise rejects or if the timeout is reached.
  */
export default function wrapTimeout(promise, timeout) {
    if (timeout === null) {
        return promise
    }

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timed out")), timeout)

        promise
            .then((result) => {
                clearTimeout(timer)
                resolve(result)
            })
            .catch((err) => {
                clearTimeout(timer)
                reject(err)
            })
    })
}