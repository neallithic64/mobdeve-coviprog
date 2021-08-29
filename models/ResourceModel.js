var mongoose = require('mongoose');

var ResourceSchema = new mongoose.Schema({
	resourceName: String,
	programId: String,
	expectedAmt: Number,
	actualAmt: Number
});

module.exports = mongoose.model('RESOURCES', ResourceSchema);
