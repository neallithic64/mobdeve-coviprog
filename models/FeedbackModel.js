var mongoose = require('mongoose');

var FeedbackSchema = new mongoose.Schema({
	feedbackId: String,
	programId: String,
	comments: String
});

module.exports = mongoose.model('FEEDBACK', FeedbackSchema);
