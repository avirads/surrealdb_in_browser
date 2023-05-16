let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

let WASM_VECTOR_LEN = 0;

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_48(arg0, arg1, arg2) {
    wasm.__wbindgen_export_3(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_55(arg0, arg1) {
    wasm.__wbindgen_export_4(arg0, arg1);
}

/**
*/
export function setup() {
    wasm.setup();
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export_5(addHeapObject(e));
    }
}
function __wbg_adapter_135(arg0, arg1, arg2, arg3) {
    wasm.__wbindgen_export_6(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
*/
export class Surreal {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Surreal.prototype);
        obj.__wbg_ptr = ptr;

        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;

        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_surreal_free(ptr);
    }
    /**
    * Construct the database engine
    *
    * ```js
    * const db = new Surreal();
    * ```
    */
    constructor() {
        const ret = wasm.surreal_init();
        return Surreal.__wrap(ret);
    }
    /**
    * Connect to a database engine
    *
    * ```js
    * const db = new Surreal();
    *
    * // Connect to a WebSocket engine
    * await db.connect('ws://localhost:8000');
    *
    * // Connect to an HTTP engine
    * await db.connect('http://localhost:8000');
    *
    * // Connect to a memory engine
    * await db.connect('mem://');
    *
    * // Connect to an IndxDB engine
    * await db.connect('indxdb://MyDatabase');
    *
    * // Connect to a strict memory engine
    * await db.connect('memory', { strict: true });
    *
    * // Limit number of concurrent connections
    * await db.connect('ws://localhost:8000', { capacity: 100000 });
    * ```
    * @param {string} endpoint
    * @param {any} opts
    * @returns {Promise<void>}
    */
    connect(endpoint, opts) {
        const ptr0 = passStringToWasm0(endpoint, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_connect(this.__wbg_ptr, ptr0, len0, addHeapObject(opts));
        return takeObject(ret);
    }
    /**
    * Switch to a specific namespace or database
    *
    * ```js
    * const db = new Surreal();
    *
    * // Switch to a namespace
    * await db.use({ ns: 'namespace' });
    *
    * // Switch to a database
    * await db.use({ db: 'database' });
    *
    * // Switch both
    * await db.use({ ns: 'namespace', db: 'database' });
    * ```
    * @param {any} value
    * @returns {Promise<void>}
    */
    use(value) {
        const ret = wasm.surreal_use(this.__wbg_ptr, addHeapObject(value));
        return takeObject(ret);
    }
    /**
    * Assign a value as a parameter for this connection
    *
    * ```js
    * await db.set('name', { first: 'Tobie', last: 'Morgan Hitchcock' });
    * ```
    * @param {string} key
    * @param {any} value
    * @returns {Promise<void>}
    */
    set(key, value) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_set(this.__wbg_ptr, ptr0, len0, addHeapObject(value));
        return takeObject(ret);
    }
    /**
    * Remove a parameter from this connection
    *
    * ```js
    * await db.unset('name');
    * ```
    * @param {string} key
    * @returns {Promise<void>}
    */
    unset(key) {
        const ptr0 = passStringToWasm0(key, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_unset(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Sign up a user to a specific authentication scope
    *
    * ```js
    * const token = await db.signup({
    *     namespace: 'namespace',
    *     database: 'database',
    *     scope: 'user_scope',
    *     email: 'john.doe@example.com',
    *     password: 'password123'
    * });
    * ```
    * @param {any} credentials
    * @returns {Promise<any>}
    */
    signup(credentials) {
        const ret = wasm.surreal_signup(this.__wbg_ptr, addHeapObject(credentials));
        return takeObject(ret);
    }
    /**
    * Sign this connection in to a specific authentication scope
    *
    * ```js
    * const token = await db.signin({
    *     namespace: 'namespace',
    *     database: 'database',
    *     scope: 'user_scope',
    *     email: 'john.doe@example.com',
    *     password: 'password123'
    * });
    * ```
    * @param {any} credentials
    * @returns {Promise<any>}
    */
    signin(credentials) {
        const ret = wasm.surreal_signin(this.__wbg_ptr, addHeapObject(credentials));
        return takeObject(ret);
    }
    /**
    * Invalidates the authentication for the current connection
    *
    * ```js
    * await db.invalidate();
    * ```
    * @returns {Promise<void>}
    */
    invalidate() {
        const ret = wasm.surreal_invalidate(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Authenticates the current connection with a JWT token
    *
    * ```js
    * await db.authenticate('<secret token>');
    * ```
    * @param {string} token
    * @returns {Promise<void>}
    */
    authenticate(token) {
        const ptr0 = passStringToWasm0(token, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_authenticate(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Run a SurrealQL query against the database
    *
    * ```js
    * // Run a query without bindings
    * const people = await db.query('SELECT * FROM person');
    *
    * // Run a query with bindings
    * const people = await db.query('SELECT * FROM type::table($table)', { table: 'person' });
    * ```
    * @param {string} sql
    * @param {any} bindings
    * @returns {Promise<any>}
    */
    query(sql, bindings) {
        const ptr0 = passStringToWasm0(sql, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_query(this.__wbg_ptr, ptr0, len0, addHeapObject(bindings));
        return takeObject(ret);
    }
    /**
    * Select all records in a table, or a specific record
    *
    * ```js
    * // Select all records from a table
    * const people = await db.select('person');
    *
    * // Select a range records from a table
    * const people = await db.select('person:jane..john');
    *
    * // Select a specific record from a table
    * const person = await db.select('person:h5wxrf2ewk8xjxosxtyc');
    * ```
    * @param {string} resource
    * @returns {Promise<any>}
    */
    select(resource) {
        const ptr0 = passStringToWasm0(resource, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_select(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Create a record in the database
    *
    * ```js
    * // Create a record with no fields set
    * const person = await db.create('person');
    *
    * Create a record with fields set
    * const person = await db.create('person', {
    *     name: 'Tobie',
    *     settings: {
    *         active: true,
    *         marketing: true
    *     }
    * });
    * ```
    * @param {string} resource
    * @param {any} data
    * @returns {Promise<any>}
    */
    create(resource, data) {
        const ptr0 = passStringToWasm0(resource, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_create(this.__wbg_ptr, ptr0, len0, addHeapObject(data));
        return takeObject(ret);
    }
    /**
    * Update all records in a table, or a specific record
    *
    * ```js
    * // Replace all records in a table with the specified data.
    * const people = await db.update('person', {
    *     name: 'Tobie',
    *     settings: {
    *         active: true,
    *         marketing: true
    *     }
    * });
    *
    * // Replace a range of records with the specified data.
    * const person = await db.update('person:jane..john', {
    *     name: 'Tobie',
    *     settings: {
    *         active: true,
    *         marketing: true
    *     }
    * });
    *
    * // Replace the current document / record data with the specified data.
    * const person = await db.update('person:tobie', {
    *     name: 'Tobie',
    *     settings: {
    *         active: true,
    *         marketing: true
    *     }
    * });
    * ```
    * @param {string} resource
    * @param {any} data
    * @returns {Promise<any>}
    */
    update(resource, data) {
        const ptr0 = passStringToWasm0(resource, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_update(this.__wbg_ptr, ptr0, len0, addHeapObject(data));
        return takeObject(ret);
    }
    /**
    * Merge records in a table with specified data
    *
    * ```js
    * // Merge all records in a table with specified data.
    * const person = await db.merge('person', {
    *     marketing: true
    * });
    *
    * // Merge a range of records with the specified data.
    * const person = await db.merge('person:jane..john', {
    *     marketing: true
    * });
    *
    * // Merge the current document / record data with the specified data.
    * const person = await db.merge('person:tobie', {
    *     marketing: true
    * });
    * ```
    * @param {string} resource
    * @param {any} data
    * @returns {Promise<any>}
    */
    merge(resource, data) {
        const ptr0 = passStringToWasm0(resource, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_merge(this.__wbg_ptr, ptr0, len0, addHeapObject(data));
        return takeObject(ret);
    }
    /**
    * Patch all records in a table or a specific record
    *
    * ```js
    * // Apply JSON Patch changes to all records in the database.
    * const person = await db.patch('person', [{
    *     op: 'replace',
    *     path: '/settings/active',
    *     value: false
    * }]);
    *
    * // Apply JSON Patch to a range of records.
    * const person = await db.patch('person:jane..john', [{
    *     op: 'replace',
    *     path: '/settings/active',
    *     value: false
    * }]);
    *
    * // Apply JSON Patch to a specific record.
    * const person = await db.patch('person:tobie', [{
    *     op: 'replace',
    *     path: '/settings/active',
    *     value: false
    * }]);
    * ```
    * @param {string} resource
    * @param {any} data
    * @returns {Promise<any>}
    */
    patch(resource, data) {
        const ptr0 = passStringToWasm0(resource, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_patch(this.__wbg_ptr, ptr0, len0, addHeapObject(data));
        return takeObject(ret);
    }
    /**
    * Delete all records, or a specific record
    *
    * ```js
    * // Delete all records from a table
    * const records = await db.delete('person');
    *
    * // Delete a range records from a table
    * const people = await db.delete('person:jane..john');
    *
    * // Delete a specific record from a table
    * const record = await db.delete('person:h5wxrf2ewk8xjxosxtyc');
    * ```
    * @param {string} resource
    * @returns {Promise<any>}
    */
    delete(resource) {
        const ptr0 = passStringToWasm0(resource, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.surreal_delete(this.__wbg_ptr, ptr0, len0);
        return takeObject(ret);
    }
    /**
    * Return the version of the server
    *
    * ```js
    * const version = await db.version();
    * ```
    * @returns {Promise<any>}
    */
    version() {
        const ret = wasm.surreal_version(this.__wbg_ptr);
        return takeObject(ret);
    }
    /**
    * Check whether the server is healthy or not
    *
    * ```js
    * await db.health();
    * ```
    * @returns {Promise<void>}
    */
    health() {
        const ret = wasm.surreal_health(this.__wbg_ptr);
        return takeObject(ret);
    }
}

export function __wbg_iterator_c1677479667ea090() {
    const ret = Symbol.iterator;
    return addHeapObject(ret);
};

export function __wbg_length_070e3265c186df02(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbindgen_number_new(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbg_new_18bc2084e9a3e1ff() {
    const ret = new Array();
    return addHeapObject(ret);
};

export function __wbg_set_aee8682c7ee9ac44(arg0, arg1, arg2) {
    getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
};

export function __wbg_new_b6fd0149e79ffce8() {
    const ret = new Map();
    return addHeapObject(ret);
};

export function __wbg_new_7befa02319b36069() {
    const ret = new Object();
    return addHeapObject(ret);
};

export function __wbindgen_is_string(arg0) {
    const ret = typeof(getObject(arg0)) === 'string';
    return ret;
};

export function __wbg_set_841ac57cff3d672b(arg0, arg1, arg2) {
    getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
};

export function __wbg_set_6c1b2b7b73337778(arg0, arg1, arg2) {
    const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
};

export function __wbindgen_bigint_from_i64(arg0) {
    const ret = arg0;
    return addHeapObject(ret);
};

export function __wbindgen_bigint_from_u64(arg0) {
    const ret = BigInt.asUintN(64, arg0);
    return addHeapObject(ret);
};

export function __wbindgen_is_undefined(arg0) {
    const ret = getObject(arg0) === undefined;
    return ret;
};

export function __wbindgen_in(arg0, arg1) {
    const ret = getObject(arg0) in getObject(arg1);
    return ret;
};

export function __wbindgen_number_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_boolean_get(arg0) {
    const v = getObject(arg0);
    const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    return ret;
};

export function __wbindgen_string_get(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'string' ? obj : undefined;
    var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    var len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_is_bigint(arg0) {
    const ret = typeof(getObject(arg0)) === 'bigint';
    return ret;
};

export function __wbindgen_is_object(arg0) {
    const val = getObject(arg0);
    const ret = typeof(val) === 'object' && val !== null;
    return ret;
};

export function __wbindgen_error_new(arg0, arg1) {
    const ret = new Error(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_getwithrefkey_5e6d9547403deab8(arg0, arg1) {
    const ret = getObject(arg0)[getObject(arg1)];
    return addHeapObject(ret);
};

export function __wbindgen_string_new(arg0, arg1) {
    const ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
};

export function __wbindgen_jsval_eq(arg0, arg1) {
    const ret = getObject(arg0) === getObject(arg1);
    return ret;
};

export function __wbg_String_88810dfeb4021902(arg0, arg1) {
    const ret = String(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_new_113855d7ab252420(arg0, arg1) {
    try {
        var state0 = {a: arg0, b: arg1};
        var cb0 = (arg0, arg1) => {
            const a = state0.a;
            state0.a = 0;
            try {
                return __wbg_adapter_135(a, state0.b, arg0, arg1);
            } finally {
                state0.a = a;
            }
        };
        const ret = new Promise(cb0);
        return addHeapObject(ret);
    } finally {
        state0.a = state0.b = 0;
    }
};

export function __wbindgen_memory() {
    const ret = wasm.memory;
    return addHeapObject(ret);
};

export function __wbg_buffer_fcbfb6d88b2732e9(arg0) {
    const ret = getObject(arg0).buffer;
    return addHeapObject(ret);
};

export function __wbg_newwithbyteoffsetandlength_92c251989c485785(arg0, arg1, arg2) {
    const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_randomFillSync_e950366c42764a07() { return handleError(function (arg0, arg1) {
    getObject(arg0).randomFillSync(takeObject(arg1));
}, arguments) };

export function __wbg_subarray_7649d027b2b141b3(arg0, arg1, arg2) {
    const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
    return addHeapObject(ret);
};

export function __wbg_getRandomValues_3774744e221a22ad() { return handleError(function (arg0, arg1) {
    getObject(arg0).getRandomValues(getObject(arg1));
}, arguments) };

export function __wbg_crypto_70a96de3b6b73dac(arg0) {
    const ret = getObject(arg0).crypto;
    return addHeapObject(ret);
};

export function __wbg_process_dd1577445152112e(arg0) {
    const ret = getObject(arg0).process;
    return addHeapObject(ret);
};

export function __wbg_versions_58036bec3add9e6f(arg0) {
    const ret = getObject(arg0).versions;
    return addHeapObject(ret);
};

export function __wbg_node_6a9d28205ed5b0d8(arg0) {
    const ret = getObject(arg0).node;
    return addHeapObject(ret);
};

export function __wbg_require_f05d779769764e82() { return handleError(function () {
    const ret = module.require;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_msCrypto_adbc770ec9eca9c7(arg0) {
    const ret = getObject(arg0).msCrypto;
    return addHeapObject(ret);
};

export function __wbg_newwithlength_89eca18f2603a999(arg0) {
    const ret = new Uint8Array(arg0 >>> 0);
    return addHeapObject(ret);
};

export function __wbindgen_is_function(arg0) {
    const ret = typeof(getObject(arg0)) === 'function';
    return ret;
};

export function __wbg_call_f96b398515635514() { return handleError(function (arg0, arg1) {
    const ret = getObject(arg0).call(getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_get_e52aaca45f37b337(arg0, arg1) {
    const ret = getObject(arg0)[arg1 >>> 0];
    return addHeapObject(ret);
};

export function __wbg_next_5a9700550e162aa3() { return handleError(function (arg0) {
    const ret = getObject(arg0).next();
    return addHeapObject(ret);
}, arguments) };

export function __wbg_done_a184612220756243(arg0) {
    const ret = getObject(arg0).done;
    return ret;
};

export function __wbg_value_6cc144c1d9645dd5(arg0) {
    const ret = getObject(arg0).value;
    return addHeapObject(ret);
};

export function __wbg_next_3975dcca26737a22(arg0) {
    const ret = getObject(arg0).next;
    return addHeapObject(ret);
};

export function __wbg_get_363c3b466fe4896b() { return handleError(function (arg0, arg1) {
    const ret = Reflect.get(getObject(arg0), getObject(arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbindgen_object_clone_ref(arg0) {
    const ret = getObject(arg0);
    return addHeapObject(ret);
};

export function __wbg_self_b9aad7f1c618bfaf() { return handleError(function () {
    const ret = self.self;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_window_55e469842c98b086() { return handleError(function () {
    const ret = window.window;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_globalThis_d0957e302752547e() { return handleError(function () {
    const ret = globalThis.globalThis;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_global_ae2f87312b8987fb() { return handleError(function () {
    const ret = global.global;
    return addHeapObject(ret);
}, arguments) };

export function __wbg_newnoargs_e643855c6572a4a8(arg0, arg1) {
    const ret = new Function(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
};

export function __wbg_isArray_07d89ced8fb14171(arg0) {
    const ret = Array.isArray(getObject(arg0));
    return ret;
};

export function __wbg_instanceof_ArrayBuffer_de688b806c28ff28(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof ArrayBuffer;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_call_35782e9a1aa5e091() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_isSafeInteger_fcdf4c4f25c86778(arg0) {
    const ret = Number.isSafeInteger(getObject(arg0));
    return ret;
};

export function __wbg_new_bc5d9aad3f9ac80e(arg0) {
    const ret = new Uint8Array(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_set_4b3aa8445ac1e91c(arg0, arg1, arg2) {
    getObject(arg0).set(getObject(arg1), arg2 >>> 0);
};

export function __wbg_length_d9c4ded7e708c6a1(arg0) {
    const ret = getObject(arg0).length;
    return ret;
};

export function __wbindgen_jsval_loose_eq(arg0, arg1) {
    const ret = getObject(arg0) == getObject(arg1);
    return ret;
};

export function __wbg_instanceof_Uint8Array_4733577ba827276b(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Uint8Array;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_entries_c3e06bf0354f5d20(arg0) {
    const ret = Object.entries(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_now_9c3c00f027cd0272(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

export function __wbindgen_cb_drop(arg0) {
    const obj = takeObject(arg0).original;
    if (obj.cnt-- == 1) {
        obj.a = 0;
        return true;
    }
    const ret = false;
    return ret;
};

export function __wbg_push_4c1f8265c2fdf115(arg0, arg1) {
    const ret = getObject(arg0).push(getObject(arg1));
    return ret;
};

export function __wbg_newwithstrsequence_0b795ce8cc688732() { return handleError(function (arg0, arg1, arg2) {
    const ret = new WebSocket(getStringFromWasm0(arg0, arg1), getObject(arg2));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_new_39e958ac9d5cae7d() { return handleError(function (arg0, arg1) {
    const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
}, arguments) };

export function __wbg_code_113f1d37adeb1ec8(arg0) {
    const ret = getObject(arg0).code;
    return ret;
};

export function __wbg_setbinaryType_2e2320b177c86b17(arg0, arg1) {
    getObject(arg0).binaryType = takeObject(arg1);
};

export function __wbg_code_261152f41ab15834(arg0) {
    const ret = getObject(arg0).code;
    return ret;
};

export function __wbg_reason_86c40b4d1cd27692(arg0, arg1) {
    const ret = getObject(arg1).reason;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_wasClean_194399a67c51c7b5(arg0) {
    const ret = getObject(arg0).wasClean;
    return ret;
};

export const __wbg_now_1d42230a062c01b3 = typeof Date.now == 'function' ? Date.now : notDefined('Date.now');

export function __wbindgen_bigint_get_as_i64(arg0, arg1) {
    const v = getObject(arg1);
    const ret = typeof(v) === 'bigint' ? v : undefined;
    getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
};

export function __wbindgen_debug_string(arg0, arg1) {
    const ret = debugString(getObject(arg1));
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

export function __wbindgen_object_drop_ref(arg0) {
    takeObject(arg0);
};

export function __wbg_then_65c9631eb0022205(arg0, arg1) {
    const ret = getObject(arg0).then(getObject(arg1));
    return addHeapObject(ret);
};

export function __wbg_resolve_f3a7b38cd2af0fa4(arg0) {
    const ret = Promise.resolve(getObject(arg0));
    return addHeapObject(ret);
};

export function __wbg_setTimeout_fba1b48a90e30862() { return handleError(function (arg0, arg1, arg2) {
    const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
    return ret;
}, arguments) };

export function __wbg_performance_1430613edb72ce03(arg0) {
    const ret = getObject(arg0).performance;
    return addHeapObject(ret);
};

export function __wbg_now_eab901b1d3b8a295(arg0) {
    const ret = getObject(arg0).now();
    return ret;
};

export function __wbg_setonopen_6fd8b28538150568(arg0, arg1) {
    getObject(arg0).onopen = getObject(arg1);
};

export function __wbg_setonerror_9f7532626d7a9ce2(arg0, arg1) {
    getObject(arg0).onerror = getObject(arg1);
};

export function __wbg_setonclose_6b22bc5d93628786(arg0, arg1) {
    getObject(arg0).onclose = getObject(arg1);
};

export function __wbg_setonmessage_493b82147081ec7e(arg0, arg1) {
    getObject(arg0).onmessage = getObject(arg1);
};

export function __wbg_close_18f6acc05e28b66d() { return handleError(function (arg0) {
    getObject(arg0).close();
}, arguments) };

export function __wbg_debug_917e579618ee56f5(arg0) {
    console.debug(getObject(arg0));
};

export function __wbg_error_ea7597dedb63d9a4(arg0) {
    console.error(getObject(arg0));
};

export function __wbg_info_fc2a17f38101c41c(arg0) {
    console.info(getObject(arg0));
};

export function __wbg_log_003c998d6df63565(arg0) {
    console.log(getObject(arg0));
};

export function __wbg_warn_ebfcadd0780df93a(arg0) {
    console.warn(getObject(arg0));
};

export function __wbg_url_17f4d05b4cc2b111(arg0, arg1) {
    const ret = getObject(arg1).url;
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export_0, wasm.__wbindgen_export_1);
    const len1 = WASM_VECTOR_LEN;
    getInt32Memory0()[arg0 / 4 + 1] = len1;
    getInt32Memory0()[arg0 / 4 + 0] = ptr1;
};

export function __wbg_data_ef47af9c565d228b(arg0) {
    const ret = getObject(arg0).data;
    return addHeapObject(ret);
};

export function __wbg_instanceof_Blob_bcf78f4aa78e0af2(arg0) {
    let result;
    try {
        result = getObject(arg0) instanceof Blob;
    } catch {
        result = false;
    }
    const ret = result;
    return ret;
};

export function __wbg_readyState_a5aaf63a7efc5d14(arg0) {
    const ret = getObject(arg0).readyState;
    return ret;
};

export function __wbg_send_45db219b9f40cc7e() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).send(getStringFromWasm0(arg1, arg2));
}, arguments) };

export function __wbg_send_737fddb36434277e() { return handleError(function (arg0, arg1, arg2) {
    getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
}, arguments) };

export function __wbindgen_closure_wrapper5108(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 251, __wbg_adapter_48);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper5461(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 298, __wbg_adapter_48);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper5579(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 251, __wbg_adapter_48);
    return addHeapObject(ret);
};

export function __wbindgen_closure_wrapper5623(arg0, arg1, arg2) {
    const ret = makeMutClosure(arg0, arg1, 251, __wbg_adapter_55);
    return addHeapObject(ret);
};

