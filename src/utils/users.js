// Keep Track Of Users

const users = []

// addUser

const addUser = ({ id, username, room }) => {

    // Clean Data

    username = username.trim().toLowerCase()
    // room = room.trim().toLowerCase()

    // Validate Data

    if (!(username) || (!(room)))
        return { error: 'כינוי וחדר הנם שדות נדרשים!' }

    // Check For Existing User

    const existingUser = users.find((user) => {

        return user.room === room && user.username === username

    })

    // Validate Username

    if (existingUser)
        return { error: 'הכינוי תפוס!' }

    // Store User

    const user = { id, username, room }
    users.push(user)

    return { user }

}

// removeUser

const removeUser = id => {

    const index = users.findIndex((user) => user.id === id)

    // The 'Splice' Method Returns An Array. 
    // We Remove 1 Element From Index 'Index', And Return The Removed
    // Value By Accessing Index 0.

    if (index !== -1)
        return users.splice(index, 1)[0]

}

// getUser

const getUser = id => {

    return users.find(user => user.id === id)

}

// getRoomUsers

const getRoomUsers = room => {

    return users.filter(user => user.room === room)

}

// Export Functions

module.exports = { addUser, removeUser, getUser, getRoomUsers }