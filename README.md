# js-client

isomorphic JS client for illchi

[![GitHub](https://img.shields.io/github/license/illchi/js-client)](https://github.com/illchi/js-client/blob/master/LICENSE)
[![Docs](https://img.shields.io/badge/TypeScript-Documentation-blue)](https://illchi.github.io/js-client/index.html)

## Instalation

See [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)

### Example use

```js
import {Peer, Client} from '@illchi/js-client'
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