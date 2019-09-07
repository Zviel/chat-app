// generateMessage

const generateMessage = (username, text) => {

    return {

        username,
        text,
        createdAt: new Date().getTime()

    }

}

// generateLocation

const generateLocation = (username, url) => {

    return {

        username,
        address: url,
        createdAt: new Date().getTime()

    }

}

module.exports = { generateMessage, generateLocation }