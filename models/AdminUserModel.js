var mongoose = require('mongoose');

var AdminUserSchema = new mongoose.Schema({
	email: String
});

module.exports = mongoose.model('ADMIN_USERS', AdminUserSchema);
