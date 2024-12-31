const SOCKET = io();

SOCKET.on('message', (message) => {
    console.log(`${message}`);
})

document.querySelector('#message-form').addEventListener(
    'submit',
    (e) => {
        e.preventDefault();

        let message = e.target.elements.message.value;

        SOCKET.emit('sendMessage', message);
    }
)



