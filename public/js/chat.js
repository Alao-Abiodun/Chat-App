const SOCKET = io();

const $MESSAGE_FORM = document.querySelector('#message-form');
const $MESSAGE_FORM_INPUT = $MESSAGE_FORM.querySelector('input');
const $MESSAGE_FORM_BUTTON = $MESSAGE_FORM.querySelector('button');
const $LOCATION_BUTTON = document.querySelector('#send-location');

SOCKET.on('message', (message) => {
    console.log(`${message}`);
})

$MESSAGE_FORM.addEventListener(
    'submit',
    (e) => {
        e.preventDefault();

        $MESSAGE_FORM_BUTTON.setAttribute('disabled', 'disabled');

        let message = e.target.elements.message.value;

        SOCKET.emit('sendMessage', message, (error) => {
            $MESSAGE_FORM_BUTTON.removeAttribute('disabled');
            $MESSAGE_FORM_INPUT.value = '';
            $MESSAGE_FORM_INPUT.focus();

            if (error) {
                return console.log(error);
            }
            console.log('Message delivered!');
        });
    }
)

$LOCATION_BUTTON.addEventListener(
    'click',
    () => {
        if (!navigator.geolocation) {
            return alert('Geolocation is not supported by your browser.')
        }

        $LOCATION_BUTTON.setAttribute('disabled', 'disabled');
        
        navigator.geolocation.getCurrentPosition((position) => {
            SOCKET.emit('sendLocation', {
                latitude: position.coords.latitude, 
                longitude: position.coords.longitude
            }, () => {
                $LOCATION_BUTTON.removeAttribute('disabled');
                console.log('Location shared!')
            });
        })

    }
)



