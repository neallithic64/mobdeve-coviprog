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
	dateSubmitted: Date,
	fever: Number,
	cough: Number,
	shortbreath: Number,
	fatigue: Number,
	bodyache: Number,
	headache: Number,
	smell: Number,
	sorethroat: Number,
	runnynose: Number,
	nausea: Number,
	diarrhea: Number
});

module.exports = mongoose.model('CASES', CaseSchema);
