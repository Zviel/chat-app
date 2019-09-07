// Client Side File

// In The 'Index' File We Are Loading The SocketIO Library Before Loading 
// This File. It Allows Us To Call The 'IO' Function In This File In Order
// To See The Communication In Real Time.

const socket = io()

// Elements

const form = document.querySelector('#message-form')
const message = form.querySelector('input')
const submitButton = form.querySelector('button')
const locationButton = document.querySelector('#location-button')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('div.chat-sidebar')

// Templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Auto Scroll

const autoScroll = () => {

    // Get Newest Message Element

    const newMessage = messages.lastElementChild

    // Extract The 'Margin Bottom' Value Of The Newest Message

    const messageStyles = getComputedStyle(newMessage)
    const messageMargin = parseInt(messageStyles.marginBottom)

    // And Combine That With The Height Of The Newest Message

    const newMessageHeight = newMessage.offsetHeight + messageMargin

    // Get Visible Height

    const visibleHeight = messages.offsetHeight

    // Get The Height Of The Messages Container

    const containerHeight = messages.scrollHeight

    // How Far Has The User Scrolled?

    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset)
        messages.scrollTop = messages.scrollHeight

}

// Get Room Data From The Server

socket.on('roomData', ({ room, users }) => {

    const html = Mustache.render(sidebarTemplate, {

        room,
        users

    })

    sidebar.innerHTML = html

})

// Receive A Location URL From The Server & Display It

socket.on('locationMessage', url => {

    const html = Mustache.render(locationTemplate, {

        username: url.username,
        url: url.address,
        createdAt: moment(url.createdAt).format('k:mm')

    })

    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()

})

// Receive A Message From The Server & Display It

socket.on('message', message => {
    
    const html = Mustache.render(messageTemplate, {

        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('k:mm')

    })

    // Insert The Message Before The Closing Tag Of The 'Messages' Div

    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
    
})

form.addEventListener('submit', e => {

    // Don't Refresh The Page After Submitting The Message

    e.preventDefault()

    // Disable Button After Submitting The Message

    submitButton.setAttribute('disabled', 'disabled')

    // Store The Text Value Of The Input Field 

    const msg = e.target.elements.message.value

    socket.emit('sendMessage', msg, (error) => {

        // If Message Is Empty, Inform The User About It
        
        if (!(msg.trim()))
            alert ('לא ניתן לשלוח הודעות חסרות תוכן!')

        // Enable Button Again When The User Wants To Send A Message

        submitButton.removeAttribute('disabled')

        // Clear Input Field After Sending The Message

        message.value = ''

        // Keep Focusing On The Input Field All The Time

        message.focus()

        if (error)
            return console.log(error)

        console.log('Message Delivered!')

    })

})

locationButton.addEventListener('click', () => {

    if (!(navigator.geolocation))
        return alert('Geolocation Is Not Supported By Your Browser!')

    locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {

            lat: position.coords.latitude,
            long: position.coords.longitude

        }, () => {

            locationButton.removeAttribute('disabled')
            console.log('Location Shared!')

        })

    })

})

// When A Socket Joins The Chat, It Sends Its Username & Room To The Server

socket.emit('join', { username, room }, (error) => {

    if (error) {

        alert(error)
        location.href = '/'

    }

})