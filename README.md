# Brainamic 
Backend service built with NestJs

#
### HTTP API docs can be found on
{baseURL}/api-doc
### Websocket Price Stream

This is a straigh-forward example of how to stream price data from the Brainamic websocket stream

```javascript

const { io } = require("socket.io-client")

const symbol = "BTC/USD"
const baseURL = "" // backend service url

const socket = io(`${baseURL}?symbol=${symbol}`)

socket.on("connect", () => {
    console.log("connection open")
})

socket.on(`price@${symbol}`, (data) => {
    console.log(data)
})

```

To stop listening to data stream simply close connection. An exaxmple is shown below

```javascript
socket.disconnect()
```