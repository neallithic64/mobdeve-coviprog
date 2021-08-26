var mongoose = require('mongoose');

var SymptomSchema = new mongoose.Schema({
	caseId: Number,
	sympName: String,
	sympDays: Number
});

module.exports = mongoose.model('SYMPTOMS', SymptomSchema);
