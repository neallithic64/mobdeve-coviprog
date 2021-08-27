const db = require('../models/db');

// ProgramPlan Mongo Model Imports
const Admin = require('../models/AdminModel');
const Feedback = require('../models/FeedbackModel');
const Outcome = require('../models/OutcomeModel');
const ProgChecklist = require('../models/ProgChecklistModel');
const Program = require('../models/ProgramModel');
const Resource = require('../models/ResourceModel');
const UserProg = require('../models/UserProgModel');

// CovID Mongo Model Imports
const AdminUser = require('../models/AdminUserModel');
const Case = require('../models/CaseModel');
const Notif = require('../models/NotifModel');
const PublicUser = require('../models/PublicUserModel');
const Symptom = require('../models/SymptomModel');
const UserCov = require('../models/UserCovModel');

const bcrypt = require("bcrypt");
const saltRounds = 10;

function forceJSON(e) {
	return JSON.parse(JSON.stringify(e));
}

async function genItemCode(itGroup) {
	// format: XX-YYYYYY
	// XX: item group code (use index, pad 2 digits)
	let itemGrp = await db.findOne(ItemGroup, {_id: itGroup});
	// YY: sequential number
	let prodCount = await db.findMany(Product, {itemGroup: itGroup});
	return itemGrp.index.toString().padStart(2, '0') + '-' + prodCount.length.toString().padStart(6, '0');
}

async function genOrderCode(ordType) {
	if (ordType === "PO") {
		let ords = await db.findMany(PurchaseOrder, {});
		return "PO-" + ords.length.toString().padStart(6, '0');
	} else {
		let ords = await db.findMany(SalesOrder, {});
		return "SO-" + ords.length.toString().padStart(6, '0');
	}
}

/* Index Functions
 */
const cpController = {
	getHome: async function(req, res) {
		res.status(201).send("Yup, API is working. Welcome!");
	},
	
	getCovHome: async function(req, res) {
		res.status(201).send("Welcome to the CovID API!");
	},
	
	getProHome: async function(req, res) {
		res.status(201).send("Welcome to the ProgramPlan API!");
	},
	
	getSupplOrds: async function(req, res) {
		try {
			let items = await db.findMany(Product, {supplier: req.query.supplier}, 'prodName');
			res.status(200).send(forceJSON(items));
		} catch (e) {
			res.status(500).send(e);
		}
	}
};

module.exports = cpController;
