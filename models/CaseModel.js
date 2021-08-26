var mongoose = require('mongoose');

var CaseSchema = new mongoose.Schema({
	caseId: Number,
	email: String,
	street: String,
	barangay: String,
	city: String,
	province: String,
	remarks: String,
	caseStatus: String,
	dateSubmitted: Date
});

module.exports = mongoose.model('CASES', CaseSchema);
