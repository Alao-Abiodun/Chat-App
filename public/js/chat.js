const SOCKET = io();

const $MESSAGE_FORM = document.querySelector('#message-form');
const $MESSAGE_FORM_INPUT = $MESSAGE_FORM.querySelector('input');
const $MESSAGE_FORM_BUTTON = $MESSAGE_FORM.querySelector('button');
const $LOCATION_BUTTON = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const sendLocationTemplate = document.querySelector('#send-location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // Visible height
    const visibleHeight = $messages.offsetHeight;

    // Height of messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTo + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

SOCKET.on('message', ({username, text, createdAt}) => {
    console.log({text, createdAt});
    const html = Mustache.render(messageTemplate, {
        username,
        message: text,
        createdAt: moment(createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

SOCKET.on('locationMessage', ({username, url, createdAt}) => {
    console.log({url, createdAt});
    const html = Mustache.render(sendLocationTemplate, {
        username,
        url,
        createdAt: moment(createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

SOCKET.on('roomData', ({ room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
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

SOCKET.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
});