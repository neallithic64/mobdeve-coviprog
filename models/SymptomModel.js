var mongoose = require('mongoose');

var SymptomSchema = new mongoose.Schema({
	caseId: Number,
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

module.exports = mongoose.model('SYMPTOMS', SymptomSchema);
