/**
 * Get information about the server hardware:
 * - Number of GPUs.
 * - Number of GPUs allocated to HeavyDB.
 * - Start GPU.
 * - Number of SMs, SMXs, or CUs (streaming multiprocessors).
 * - Clock frequency of each GPU.
 * - Physical memory of each GPU.
 * - Compute capability of each GPU.
 * @return {Promise<Object>} An object that contains hardware information.
 * @example <caption>Get the hardware information:</caption>
 * con.getHardwareInfoAsync().then(res => console.log(res))
 */
export default function getHardwareInfoAsync() {
    return this.wrapThrift('get_hardware_info', [
        this._client,
        this._sessionId
    ])
}