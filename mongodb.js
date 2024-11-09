const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://shashanksaini201104:6sdlisILxPriWmaL@healthcare.a5cso.mongodb.net/Healthcare').then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("DB Connection Failed:", err);
});

// Create a schema
const AccountSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const Account = mongoose.model("Account", AccountSchema);

module.exports = Account;
