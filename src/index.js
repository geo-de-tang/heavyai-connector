// Import utilities
import EventEmitter from "eventemitter3"
import pushid from "pushid"
import arrayify from "./utils/arrayify.js"
import { COMPRESSION_LEVEL_DEFAULT } from "./utils/compression-level.js"
import buildClient from "./utils/build-client.js"
import getCompressionLevel from "./utils/get-compression-level.js"
import opts from "./utils/opts.js"
import processQueryResults from "./process-query-results.js"

// Import core functions  
import handleErrors from "./core/handle-errors.js"
import wrapThrift from "./core/wrap-thrift.js"

// Import core functions
import initClients from "./core/init-clients.js"
import getEndpoints from "./core/get-endpoints.js"

// Import method functions
import queryAsync from "./methods/query-async.js"
import queryDFAsync from "./methods/query-df-async.js"
import validateQuery from "./methods/validate-query.js"
import getTablesAsync from "./methods/get-tables-async.js"
import connectAsync from "./methods/connect-async.js"
import disconnectAsync from "./methods/disconnect-async.js"
import getFieldsAsync from "./methods/get-fields-async.js"
import createDatumAsync from "./methods/create-datum-async.js"
import createTableAsync from "./methods/create-table-async.js"
import getDatabasesAsync from "./methods/get-databases-async.js"
import getDashboardsAsync from "./methods/get-dashboards-async.js"
import deleteDashboardAsync from "./methods/delete-dashboard-async.js"
import createDashboardAsync from "./methods/create-dashboard-async.js"
import replaceDashboardAsync from "./methods/replace-dashboard-async.js"
import importTableAsync from "./methods/import-table-async.js"
import importTableGeoAsync from "./methods/import-table-geo-async.js"
import detectColumnTypesAsync from "./methods/detect-column-types-async.js"
import getRenderStatusAsync from "./methods/get-render-status-async.js"
import renderVegaAsync from "./methods/render-vega-async.js"
import getMemoryAsync from "./methods/get-memory-async.js"
import getUsersAsync from "./methods/get-users-async.js"
import createUserAsync from "./methods/create-user-async.js"
import deleteUserAsync from "./methods/delete-user-async.js"
import getStatusAsync from "./methods/get-status-async.js"
import getHardwareInfoAsync from "./methods/get-hardware-info-async.js"
import getRolesAsync from "./methods/get-roles-async.js"

// Import protocol classes
import CustomXHRConnection from "./protocols/custom-xhr-connection.js"

// Import thrift types and services
import {
    TDatumType,
    TEncodingType,
    TDeviceType
} from "../thrift/common_types.js"
import {
    TArrowTransport,
    TCreateParams,
    TDashboardPermissions,
    TDatabasePermissions,
    TDBObjectPermissions,
    TDBObjectType,
    TPixel,
    TDBException,
    TImportHeaderRow,
    TFileType,
    TRasterPointType,
    TSourceType,
    TRasterPointTransform
} from "../thrift/heavy_types.js"

/**
 * Main Database Connection class for HeavyDB
 */
export class DbCon {
    constructor() {
        // Initialize private variables
        this._client = []
        this._sessionId = []
        this._connections = []
        this._protocol = []
        this._host = []
        this._user = []
        this._password = []
        this._dbName = []
        this._port = []
        this._transport = []
        this._logging = false
        this._platform = "heavyai"
        this._nonce = 0
        this._balanceStrategy = "adaptive"
        this._numConnections = 0
        this._lastRenderCon = 0
        this._connectionTimeout = null

        // Timing and caching
        this.queryTimes = {}
        this.DEFAULT_QUERY_TIME = 1000
        this._pendingRequests = []

        // Event handling
        this.events = new EventEmitter()
        this.EVENT_NAMES = {
            ERROR: "error",
            METHOD_CALLED: "method-called"
        }

        // Constants for client strategies
        this.overSingleClient = "SINGLE_CLIENT"
        this.overAllClients = "ALL_CLIENTS"

        // Initialize type mappings
        this.invertDatumTypes()
        this.buildTFileTypeMap()
        this.buildTEncodingTypeMap()
        this.buildTImportHeaderRowMap()
        this.buildTRasterPointTypeMap()
        this.buildTRasterPointTransformMap()
        this.buildTSourceTypeMap()

        // Bind core methods to this instance
        this.handleErrors = handleErrors.bind(this)
        this.wrapThrift = wrapThrift.bind(this)
        this.initClients = initClients.bind(this)
        this.getEndpoints = getEndpoints.bind(this)

        // Bind method functions to this instance  
        this.queryAsync = this.handleErrors(queryAsync.bind(this))
        this.queryDFAsync = this.handleErrors(queryDFAsync.bind(this))
        this.validateQuery = this.handleErrors(validateQuery.bind(this))
        this.getTablesAsync = this.handleErrors(getTablesAsync.bind(this))
        this.connectAsync = this.handleErrors(connectAsync.bind(this))
        this.disconnectAsync = this.handleErrors(disconnectAsync.bind(this))
        this.getFieldsAsync = this.handleErrors(getFieldsAsync.bind(this))
        this.createDatumAsync = this.handleErrors(createDatumAsync.bind(this))
        this.createTableAsync = this.handleErrors(createTableAsync.bind(this))
        this.getDatabasesAsync = this.handleErrors(getDatabasesAsync.bind(this))
        this.getDashboardsAsync = this.handleErrors(getDashboardsAsync.bind(this))
        this.deleteDashboardAsync = this.handleErrors(deleteDashboardAsync.bind(this))
        this.createDashboardAsync = this.handleErrors(createDashboardAsync.bind(this))
        this.replaceDashboardAsync = this.handleErrors(replaceDashboardAsync.bind(this))
        this.importTableAsync = this.handleErrors(importTableAsync.bind(this))
        this.importTableGeoAsync = this.handleErrors(importTableGeoAsync.bind(this))
        this.detectColumnTypesAsync = this.handleErrors(detectColumnTypesAsync.bind(this))
        this.getRenderStatusAsync = this.handleErrors(getRenderStatusAsync.bind(this))
        this.renderVegaAsync = this.handleErrors(renderVegaAsync.bind(this))
        this.getMemoryAsync = this.handleErrors(getMemoryAsync.bind(this))
        this.getUsersAsync = this.handleErrors(getUsersAsync.bind(this))
        this.createUserAsync = this.handleErrors(createUserAsync.bind(this))
        this.deleteUserAsync = this.handleErrors(deleteUserAsync.bind(this))
        this.getStatusAsync = this.handleErrors(getStatusAsync.bind(this))
        this.getHardwareInfoAsync = this.handleErrors(getHardwareInfoAsync.bind(this))
        this.getRolesAsync = this.handleErrors(getRolesAsync.bind(this))

        // Initialize utility methods
        this.arrayify = arrayify
        this.buildClient = buildClient
        this.getCompressionLevel = getCompressionLevel
        this.opts = opts

        // Setup process results handler
        this.processResults = (options = {}, promise) =>
            promise
                .catch((error) => {
                    if (this._logging && options.query) {
                        console.error('this where the error is thrown')
                        console.error(options.query, "\n", error)
                    }
                    console.error("Error with query:", options.query)
                    throw error
                })
                .then((result) => {
                    const processor = processQueryResults(
                        this._logging,
                        this.updateQueryTimes
                    )
                    const processResultsObject = processor(
                        options,
                        this._datumEnum,
                        result
                    )
                    return processResultsObject
                })

        return this
    }

    // Core utility methods that need to stay in the class
    removeConnection(conId, reason) {
        if (conId < 0 || conId >= this.numConnections) {
            const err = {
                msg: "Remove connection id invalid"
            }
            throw err
        }
        this._client.splice(conId, 1)
        this._sessionId.splice(conId, 1)
        this._connections.splice(conId, 1)
        this.rejectPendingRequests(conId, reason)
        this._numConnections--
    }

    updateQueryTimes = (
        conId,
        queryId,
        estimatedQueryTime,
        execution_time_ms
    ) => {
        this.queryTimes[queryId] = execution_time_ms
    }

    // Track pending requests by client
    addPendingRequest = (clientIdx, requestId, promise) => {
        console.log('Adding pending request for clientIdx:', clientIdx, 'requestId:', requestId);
        if (this._pendingRequests[clientIdx]) {
            this._pendingRequests[clientIdx][requestId] = promise
        } else {
            this._pendingRequests[clientIdx] = { [requestId]: promise }
        }
    }

    // Reject all pending requests for a given client
    rejectPendingRequests = (clientIdx, reason) => {
        if (this._pendingRequests[clientIdx]) {
            Object.values(this._pendingRequests[clientIdx]).forEach(({ reject }) => {
                reject(new Error(reason))
            })
            this._pendingRequests[clientIdx] = {}
        }
    }

    // Type mapping initialization methods
    invertDatumTypes() {
        this._datumEnum = {}
        Object.keys(TDatumType).forEach((key) => {
            this._datumEnum[TDatumType[key]] = key
        })
    }

    buildTFileTypeMap() {
        this._fileTypeMap = {}
        if (TFileType) {
            Object.keys(TFileType).forEach((key) => {
                this._fileTypeMap[TFileType[key]] = key
            })
        } else {
            console.warn('TFileType is undefined, skipping file type mapping')
        }
    }

    buildTEncodingTypeMap() {
        this._encodingTypeMap = {}
        Object.keys(TEncodingType).forEach((key) => {
            this._encodingTypeMap[TEncodingType[key]] = key
        })
    }

    buildTImportHeaderRowMap() {
        this._importHeaderRowMap = {}
        if (TImportHeaderRow) {
            Object.keys(TImportHeaderRow).forEach((key) => {
                this._importHeaderRowMap[TImportHeaderRow[key]] = key
            })
        } else {
            console.warn('TImportHeaderRow is undefined, skipping import header row mapping')
        }
    }

    buildTRasterPointTypeMap() {
        this._rasterPointTypeMap = {}
        if (TRasterPointType) {
            Object.keys(TRasterPointType).forEach((key) => {
                this._rasterPointTypeMap[TRasterPointType[key]] = key
            })
        } else {
            console.warn('TRasterPointType is undefined, skipping raster point type mapping')
        }
    }

    buildTRasterPointTransformMap() {
        this._rasterPointTransformMap = {}
        if (TRasterPointTransform) {
            Object.keys(TRasterPointTransform).forEach((key) => {
                this._rasterPointTransformMap[TRasterPointTransform[key]] = key
            })
        } else {
            console.warn('TRasterPointTransform is undefined, skipping raster point transform mapping')
        }
    }

    buildTSourceTypeMap() {
        this._sourceTypeMap = {}
        if (TSourceType) {
            Object.keys(TSourceType).forEach((key) => {
                this._sourceTypeMap[TSourceType[key]] = key
            })
        } else {
            console.warn('TSourceType is undefined, skipping source type mapping')
        }
    }

    // Configuration methods
    protocol(protocol) {
        if (!arguments.length) {
            return this._protocol
        }
        this._protocol = arrayify(protocol)
        return this
    }

    host(host) {
        if (!arguments.length) {
            return this._host
        }
        this._host = arrayify(host)
        return this
    }

    port(port) {
        if (!arguments.length) {
            return this._port
        }
        this._port = arrayify(port)
        return this
    }

    dbName(dbName) {
        if (!arguments.length) {
            return this._dbName
        }
        this._dbName = arrayify(dbName)
        return this
    }

    user(user) {
        if (!arguments.length) {
            return this._user
        }
        this._user = arrayify(user)
        return this
    }

    password(password) {
        if (!arguments.length) {
            return this._password
        }
        this._password = arrayify(password)
        return this
    }

    logging(logging) {
        if (!arguments.length) {
            return this._logging
        }
        this._logging = Boolean(logging)
        return this
    }

    // Utility method needed by validateQuery
    convertFromThriftTypes(fields) {
        const fieldsArray = []
        // silly to change this from map to array
        // - then later it turns back to map
        for (const key in fields) {
            if (fields.hasOwnProperty(key)) {
                fieldsArray.push({
                    name: key,
                    type: this._datumEnum[fields[key].col_type.type],
                    precision: fields[key].col_type.precision,
                    is_array: fields[key].col_type.is_array,
                    is_dict: fields[key].col_type.encoding === 4 // TEncodingType.DICT
                })
            }
        }
        return fieldsArray
    }

    /**
     * Configure the timeout value in milliseconds for establishing connections.
     * @param {Number} timeout The timeout value in milliseconds.
     * @return {Number|DbCon} The current timeout value or the connector instance.
     * 
     * @example <caption>Set connection timeout to 2 seconds:</caption>
     * var connector = new DbCon()
     *   .host('localhost')
     *   .port('9091')
     *   .dbName('myDatabase')
     *   .user('foo')
     *   .password('bar')
     *   .connectionTimeout(2000)
     *   .connect()
     */
    connectionTimeout(timeout) {
        if (!arguments.length) {
            return this._connectionTimeout
        }
        this._connectionTimeout = timeout
        return this
    }

    /**
     * Wraps a promise with a timeout that rejects the promise if it takes longer than the specified time.
     * @param {Promise} promise - The promise to be wrapped with a timeout.
     * @param {number} timeout - The time in milliseconds after which the promise will be rejected if not settled.
     * @return {Promise} A new promise that resolves with the original promise's value, or rejects with an error if the original promise rejects or if the timeout is reached.
     */
    wrapTimeout(promise, timeout) {
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

    /**
     * Track pending requests by client.
     * @param {Number} clientIdx - The client index to track the request for.
     * @param {String} requestId - The unique request identifier.
     * @param {Object} promise - The promise object containing resolve and reject functions.
     */
    addPendingRequest = (clientIdx, requestId, promise) => {
        console.log('Adding pending request for clientIdx:', clientIdx, 'requestId:', requestId);

        if (this._pendingRequests[clientIdx]) {
            this._pendingRequests[clientIdx][requestId] = promise
        } else {
            this._pendingRequests[clientIdx] = { [requestId]: promise }
        }
    }

    /**
     * Execute a Thrift method on a single client (client 0).
     * @param {String} methodName - The name of the Thrift method to execute.
     * @param {Array} processedArgs - The processed arguments for the method.
     * @return {Promise} A promise that resolves with the method result.
     */
    executeSingleClient = (methodName, processedArgs) => {
        console.log('=== executeSingleClient START ===');
        console.log('Client array length:', this._client?.length);
        console.log('First client exists:', !!this._client?.[0]);
        console.log('Method exists on client:', !!this._client?.[0]?.[methodName]);

        return new Promise((resolve, reject) => {
            const requestId = pushid();
            console.log('Generated request ID:', requestId);

            try {
                this.addPendingRequest(0, requestId, { resolve, reject });
                console.log('Added pending request for client 0');

                const client = this._client[0];
                const sessionId = this._sessionId[0];
                const finalArgs = [sessionId].concat(processedArgs);

                console.log('Final args for Thrift call:', finalArgs);
                console.log('Calling client method:', methodName);

                // Make the actual Thrift call
                const thriftPromise = client[methodName].apply(client, finalArgs);
                console.log('Thrift promise created:', !!thriftPromise);

                return thriftPromise
                    .then((res) => {
                        console.log('✅ Single client success');
                        console.log('Response type:', typeof res);
                        console.log('Response length (if array):', Array.isArray(res) ? res.length : 'not array');

                        // Clean up pending request
                        delete this._pendingRequests[0][requestId];
                        console.log('Cleaned up pending request');

                        console.log('=== executeSingleClient END (SUCCESS) ===');
                        return resolve(res);
                    })
                    .catch((error) => {
                        console.error('❌ Single client error');
                        console.error('Error name:', error.name);
                        console.error('Error error_msg:', error.error_msg);
                        console.error('Full error object:', error);

                        // Clean up pending request
                        delete this._pendingRequests[0][requestId];
                        console.log('Cleaned up pending request after error');

                        console.log('=== executeSingleClient END (ERROR) ===');
                        return reject(error.error_msg);
                    });

            } catch (syncError) {
                console.error('❌ Synchronous error in executeSingleClient:', syncError);
                delete this._pendingRequests[0][requestId];
                reject(syncError);
            }
        });
    }

    /**
     * Execute a Thrift method on all clients.
     * @param {String} methodName - The name of the Thrift method to execute.
     * @param {Array} processedArgs - The processed arguments for the method.
     * @return {Promise} A promise that resolves with all method results.
     */
    executeAllClients = (methodName, processedArgs) => {
        console.log('=== executeAllClients START ===');
        console.log('Number of clients:', this._client?.length);

        const clientPromises = this._client.map((client, index) => {
            console.log(`Creating promise for client ${index}`);

            return new Promise((resolve, reject) => {
                const requestId = pushid();
                console.log(`Client ${index} request ID:`, requestId);

                try {
                    this.addPendingRequest(index, requestId, { resolve, reject });
                    console.log(`Added pending request for client ${index}`);

                    const sessionId = this._sessionId[index];
                    const finalArgs = [sessionId].concat(processedArgs);

                    console.log(`Client ${index} final args:`, finalArgs);

                    return client[methodName]
                        .apply(client, finalArgs)
                        .then((res) => {
                            console.log(`✅ Client ${index} success`);
                            delete this._pendingRequests[index][requestId];
                            return resolve(res);
                        })
                        .catch((error) => {
                            console.error(`❌ Client ${index} error:`, error);
                            delete this._pendingRequests[index][requestId];
                            return reject(error);
                        });

                } catch (syncError) {
                    console.error(`❌ Synchronous error in client ${index}:`, syncError);
                    delete this._pendingRequests[index][requestId];
                    reject(syncError);
                }
            });
        });

        console.log('Created all client promises, calling Promise.all');

        return Promise.all(clientPromises)
            .then((results) => {
                console.log('✅ All clients succeeded');
                console.log('Results length:', results.length);
                console.log('=== executeAllClients END (SUCCESS) ===');
                return results;
            })
            .catch((error) => {
                console.error('❌ One or more clients failed:', error);
                console.log('=== executeAllClients END (ERROR) ===');
                throw error;
            });
    }
}

// Export DbCon as both named and default export
export default DbCon

export * from "../thrift/Heavy"
export * from "../thrift/common_types"
export * from "../thrift/completion_hints_types"
export * from "../thrift/extension_functions_types"
export * from "../thrift/heavy_types"
export * from "../thrift/serialized_result_set_types"