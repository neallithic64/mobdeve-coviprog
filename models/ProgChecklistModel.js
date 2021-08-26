var mongoose = require('mongoose');

var ProgChecklistSchema = new mongoose.Schema({
	progItem: String,
	programId: String,
	checked: Boolean
});

module.exports = mongoose.model('PROGRESS_CHECKLIST', ProgChecklistSchema);
