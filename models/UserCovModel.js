var mongoose = require('mongoose');

var UserCovSchema = new mongoose.Schema({
	userId: Number,
	email: String,
	password: String,
	firstName: String,
	lastName: String
});

module.exports = mongoose.model('USERSCOV', UserCovSchema);
