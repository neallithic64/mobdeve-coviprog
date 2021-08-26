var mongoose = require('mongoose');

var UserProgSchema = new mongoose.Schema({
	email: String,
	username: String,
	password: String,
	city: String
});

module.exports = mongoose.model('USERSPROG', UserProgSchema);
