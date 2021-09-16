/**
 * @classdesc This is a Peer in illchi system
 */
export class Peer {
    constructor(_broker, _id) {
        this._broker = _broker;
        this._id = _id;
    }
    /**
     * @returns {string} peer info encoded in `${Broker}/${ID}` format
     */
    toString() {
        return `${this.broker}/${this.id}`;
    }
    /**
     * @alias toString
     */
    toJSON() {
        return this.toString();
    }
    /**
     * @param {string} str - peer info encoded in `${Broker}/${ID}` format
     * @returns {Peer}
     */
    static from(str) {
        const [broker, id] = str.split('/');
        return new Peer(broker, id);
    }
    /**
     * returns peer id
     * @returns {string} - a decimal number as string
     */
    get id() {
        return this._id;
    }
    /**
     * return peer broker
     * @returns {string} - broker net address
     */
    get broker() {
        return this._broker;
    }
    toURL(scheme, params) {
        return `${scheme}://${this.broker}/${this.id}?${params}`;
    }
}
/**
 * @classdesc This is a Client for illchi broker
 */
export class Client {
    /**
     * @param {Peer} _peer
     */
    constructor(_peer) {
        this._peer = _peer;
        this._messages = [];
        this._waiters = [];
    }
    /**
     *  sends data to peer with optional params
     * @returns {Promise<void>}
     * @param {Peer} target - target peer who receive the data
     * @param {data} data - data that will be sent
     * @param {URLSearchParams} params - optional parameters to send to the broker on send
     * @throws {(Error&{statusCode:number})}
     */
    static async send(target, data, params) {
        const response = await fetch(target.toURL('https', params === null || params === void 0 ? void 0 : params.toString()), {
            method: 'POST',
            keepalive: true,
            body: data,
        });
        if (!response.ok) {
            throw Object.assign(new Error(response.statusText), { statusCode: response.status });
        }
    }
    _onClose() {
        while (true) {
            const waiter = this._waiters.shift();
            if (!waiter) {
                break;
            }
            waiter.resolve({ value: undefined, done: true });
        }
    }
    _onError(_ev) {
        var _a;
        try {
            (_a = this._socket) === null || _a === void 0 ? void 0 : _a.close();
        }
        catch (_) {
        }
        while (true) {
            const waiter = this._waiters.shift();
            if (!waiter) {
                break;
            }
            waiter.resolve({ value: undefined, done: true });
        }
    }
    /**
     * returns true if client is connected to a peer and false otherwise
     * @returns boolean
     */
    get connected() {
        var _a;
        return ((_a = this._socket) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
    }
    _onOpen() {
    }
    set onclose(fn) {
        var _a;
        (_a = this._socket) === null || _a === void 0 ? void 0 : _a.addEventListener('error', (ev) => {
            fn(ev);
        });
    }
    /**
     * to implement an async iterator.
     * See See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     */
    [Symbol.asyncIterator]() {
        return this;
    }
    /**
     * returns next received message if available in iterator protocol format.
     * See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     * @return {Promise<iterator>}
     *
     */
    next() {
        return new Promise((resolve, reject) => {
            if (!this.connected) {
                return reject(new Error('NOT CONNECTED'));
            }
            const data = this._messages.shift();
            if (data) {
                return resolve({ value: data, done: false });
            }
            this._waiters.push({ resolve, reject });
        });
    }
    _onMessage({ data }) {
        const waiter = this._waiters.shift();
        if (waiter) {
            return waiter.resolve({ value: data, done: false });
        }
        this._messages.push(data);
    }
    /**
     * static connect connects to the broker as peer and send optional params to the broker
     * See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     * @return {Promise<Client>}
     * @param {peer} peer - connect as this peer id and broker
     * @param {URLSearchParams} [params] - optional parameters to send to the broker on connect
     */
    static async connect(peer, params) {
        const client = new Client(peer);
        await client.connect(params);
        return client;
    }
    /**
     *  connect connects to the broker as provided peer and send optional params to the broker
     * @param {URLSearchParams} [params] - optional parameters to send to the broker on connect
     */
    connect(params) {
        return new Promise((resolve, reject) => {
            if (this._socket) {
                return resolve();
            }
            this._socket = new WebSocket(this._peer.toURL('wss', params === null || params === void 0 ? void 0 : params.toString()));
            this._socket.addEventListener('error', this._onError.bind(this));
            this._socket.addEventListener('open', this._onOpen.bind(this));
            this._socket.addEventListener('close', this._onClose.bind(this));
            this._socket.addEventListener('message', this._onMessage.bind(this));
            this._socket.addEventListener('error', reject, { once: true });
            this._socket.addEventListener('open', () => {
                resolve();
            }, { once: true });
        });
    }
}
