var mongoose = require('mongoose');

var NotifSchema = new mongoose.Schema({
	senderEmail: String,
	receiverEmail: String,
	notifId: Number,
	caseId: Number,
	caseStatus: String,
	message: String,
	dateCreated: Date
});

module.exports = mongoose.model('NOTIFS', NotifSchema);
