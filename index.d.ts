/**
 * @classdesc This is a Peer in illchi system
 */
export declare class Peer {
    private readonly _broker;
    private readonly _id;
    constructor(_broker: string, _id: string);
    /**
     * @returns {string} peer info encoded in `${Broker}/${ID}` format
     */
    toString(): string;
    /**
     * @alias toString
     */
    toJSON(): string;
    /**
     * @param {string} str - peer info encoded in `${Broker}/${ID}` format
     * @returns {Peer}
     */
    static from(str: string): Peer;
    /**
     * returns peer id
     * @returns {string} - a decimal number as string
     */
    get id(): string;
    /**
     * return peer broker
     * @returns {string} - broker net address
     */
    get broker(): string;
    toURL(scheme: 'wss' | 'https', params?: string): string;
}
/**
 * @typedef {( { value: Blob, done: false } | { value: undefined, done: true } )} iterator
 */
declare type iterator = {
    value: Blob;
    done: false;
} | {
    value: undefined;
    done: true;
};
/**
 * @typedef { Blob | ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string} data
 */
declare type data = Blob | ArrayBuffer | ArrayBufferView | ReadableStream<Uint8Array> | string;
/**
 * @classdesc This is a Client for illchi broker
 */
export declare class Client {
    private readonly _peer;
    private readonly _messages;
    private readonly _waiters;
    private _socket?;
    /**
     * @param {Peer} _peer
     */
    constructor(_peer: Peer);
    /**
     *  sends data to peer with optional params
     * @returns {Promise<void>}
     * @param {Peer} target - target peer who receive the data
     * @param {data} data - data that will be sent
     * @param {URLSearchParams} params - optional parameters to send to the broker on send
     * @throws {(Error&{statusCode:number})}
     */
    static send(target: Peer, data: data, params?: URLSearchParams): Promise<void>;
    private _onClose;
    private _onError;
    /**
     * returns true if client is connected to a peer and false otherwise
     * @returns boolean
     */
    get connected(): boolean;
    private _onOpen;
    set onclose(fn: (ev?: Event) => void);
    /**
     * to implement an async iterator.
     * See See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     */
    [Symbol.asyncIterator](): this;
    /**
     * returns next received message if available in iterator protocol format.
     * See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     * @return {Promise<iterator>}
     *
     */
    next(): Promise<iterator>;
    private _onMessage;
    /**
     * static connect connects to the broker as peer and send optional params to the broker
     * See [MDN]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of}
     * @return {Promise<Client>}
     * @param {peer} peer - connect as this peer id and broker
     * @param {URLSearchParams} [params] - optional parameters to send to the broker on connect
     */
    static connect(peer: Peer, params?: URLSearchParams): Promise<Client>;
    /**
     *  connect connects to the broker as provided peer and send optional params to the broker
     * @param {URLSearchParams} [params] - optional parameters to send to the broker on connect
     */
    connect(params?: URLSearchParams): Promise<void>;
}
export {};
