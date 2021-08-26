var mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
	email: String,
	username: String,
	password: String
});

module.exports = mongoose.model('ADMINS', AdminSchema);
