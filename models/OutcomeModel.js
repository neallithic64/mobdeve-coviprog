var mongoose = require('mongoose');

var OutcomeSchema = new mongoose.Schema({
	outcomeName: String,
	programId: String,
	measure: String,
	expectedVal: Number,
	actualVal: Number
});

module.exports = mongoose.model('OUTCOMES', OutcomeSchema);
