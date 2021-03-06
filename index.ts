import "websocket-polyfill";
import axios from 'axios'

/**
 * @classdesc This is a Peer in illchi system
 */
export class Peer {
    constructor(
        private readonly _broker: string,
        private readonly _id: string,
        private readonly _tls: boolean = true
    ) {
    }

    /**
     * @returns {string} peer info encoded in `${Broker}/${ID}` format
     */
    toString() {
        return `${this.broker}/${this.id}`
    }

    /**
     * @alias toString
     */
    toJSON() {
        return this.toString()
    }

    /**
     * @param {string} str - peer info encoded in `${Broker}/${ID}` format
     * @returns {Peer}
     */
    static from(str: string) {
        const [broker, id] = str.split('/')
        return new Peer(broker, id)
    }

    /**
     * returns peer id
     * @returns {string} - a decimal number as string
     */
    get id() {
        return this._id
    }

    /**
     * @returns {boolean} - is tls encrypted
     */
    get isTLS() {
        return this._tls
    }

    /**
     * return peer broker
     * @returns {string} - broker net address
     */
    get broker() {
        return this._broker
    }

    toURL(scheme: 'ws' | 'http', params?: string) {
        if (this.isTLS) {
            scheme += 's'
        }
        return `${scheme}://${this.broker}/${this.id}?${params}`
    }
}

/**
 * @typedef {( { value: Blob, done: false } | { value: undefined, done: true } )} iterator
 */
type iterator = { value: Blob, done: false } | { value: undefined, done: true }

/**
 * @typedef { Blob | ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string} data
 */
type data = Blob | ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string

/**
 * @classdesc This is a Client for illchi broker
 */
export class Client {
    private readonly _messages: Array<Blob> = []
    private readonly _waiters: Array<{ resolve: (o: iterator) => void, reject: (err: Error | ErrorEvent) => void }> = []
    private _socket?: WebSocket

    /**
     * @param {Peer} _peer
     * @param {WebSocket} wsConstructor - optional injectable websocket constructor
     */
    constructor(
        private readonly _peer: Peer,
        private readonly wsConstructor = WebSocket
    ) {
    }

    /**
     *  sends data to peer with optional params
     * @returns {Promise<void>}
     * @param {Peer} target - target peer who receive the data
     * @param {data} data - data that will be sent
     * @param {number} timeout - timeout duration in ms to cancel the context
     * @param {URLSearchParams} params - optional parameters to send to the broker on send
     * @param {(url:string,data:data,config:{timeout:number})=>void} agent - optional agent to send make `POST` request
     * @throws {(Error&{statusCode:number})}
     */
    static async send(target: Peer, data: data, timeout: number, params?: URLSearchParams, agent = axios.post) {
        await agent(target.toURL('http', params?.toString()), data, {
            timeout,
        })
    }

    private _onClose() {
        while (true) {
            const waiter = this._waiters.shift()
            if (!waiter) {
                break
            }
            waiter.resolve({value: undefined, done: true})
        }
    }

    private _onError(_ev: Event) {
        try {
            this._socket?.close()
        } catch (_) {
        }
        while (true) {
            const waiter = this._waiters.shift()
            if (!waiter) {
                break
            }
            waiter.resolve({value: undefined, done: true})
        }
    }

    /**
     * returns true if client is connected to a peer and false otherwise
     * @returns boolean
     */
    get connected() {
        return this._socket?.readyState === WebSocket.OPEN
    }

    private _onOpen() {

    }

    set onclose(fn: (ev?: Event) => void) {
        this._socket?.addEventListener('error', (ev) => {
            fn(ev)
        })
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
        return new Promise<iterator>((resolve, reject) => {
            if (!this.connected) {
                return reject(new Error('NOT CONNECTED'))
            }
            const data = this._messages.shift()
            if (data) {
                return resolve({value: data, done: false})
            }
            this._waiters.push({resolve, reject})
        })
    }

    private _onMessage({data}: MessageEvent) {
        const waiter = this._waiters.shift()
        if (waiter) {
            return waiter.resolve({value: data, done: false})
        }
        this._messages.push(data)
    }

    /**
     * static connect connects to the broker as peer and send optional params to the broker
     * See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     * @return {Promise<Client>}
     * @param {Peer} peer - connect as this peer id and broker
     * @param {URLSearchParams} [params] - optional parameters to send to the broker on connect
     */
    static async connect(peer: Peer, params?: URLSearchParams) {
        const client = new Client(peer)
        await client.connect(params)
        return client
    }

    /**
     *  connect connects to the broker as provided peer and send optional params to the broker
     * @param {URLSearchParams} [params] - optional parameters to send to the broker on connect
     */
    connect(params?: URLSearchParams) {
        return new Promise<void>((resolve, reject) => {
            if (this._socket) {
                return resolve()
            }
            this._socket = new this.wsConstructor(this._peer.toURL('ws', params?.toString()))
            this._socket.addEventListener('error', this._onError.bind(this))
            this._socket.addEventListener('open', this._onOpen.bind(this))
            this._socket.addEventListener('close', this._onClose.bind(this))
            this._socket.addEventListener('message', this._onMessage.bind(this))
            this._socket.addEventListener('error', reject, {once: true})
            this._socket.addEventListener('open', () => {
                resolve()
            }, {once: true})
        })
    }


}