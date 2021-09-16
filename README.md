# js-client

JS version of illchi client for node and browser

[![GitHub](https://img.shields.io/github/license/illchi/js-client)](https://github.com/illchi/js-client/blob/master/LICENSE)
[![Docs](https://img.shields.io/badge/TypeScript-Documentation-blue)](https://illchi.github.io/js-client/index.html)

##### example use

```js
//peer
const peer = new Peer('example-broker.com', (123456).toString())

//send
try {
    Client.send(peer, "hello")
} catch (error) {
    console.error('failed to send')
}
//receive
try {
    const receiver = await Client.connect(peer)
} catch (error) {
    console.error('failed to connect')
}
//
try {
    for await(const message of client) {
        console.log(`Received data ${message}`)
    }
    console.warn('disconnected')
} catch (error) {
    console.error('something failed')
}

```