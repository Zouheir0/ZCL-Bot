// utils/database.js
const db = require('quick.db'); // or any other database module you are using

module.exports = {
    get: (key) => db.get(key),  // Retrieve a value from the database
    set: (key, value) => db.set(key, value),  // Set a value in the database
    delete: (key) => db.delete(key),  // Delete a value from the database
};