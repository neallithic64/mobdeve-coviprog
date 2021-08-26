var mongoose = require('mongoose');

var PublicUserSchema = new mongoose.Schema({
	email: String,
	birthday: Date,
	phone: Number,
	street: String,
	barangay: String,
	city: String,
	province: String
});

module.exports = mongoose.model('PUBLIC_USERS', PublicUserSchema);
