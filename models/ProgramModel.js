var mongoose = require('mongoose');

var ProgramSchema = new mongoose.Schema({
	programId: String,
	userCreated: String,
	programTitle: String,
	startDate: Date,
	endDate: Date,
	street: String,
	city: String,
	progress: Number,
	status: String
});

module.exports = mongoose.model('PROGRAMS', ProgramSchema);
