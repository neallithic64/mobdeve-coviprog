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

async function genProgId() {
	// format: PRXXXXX
	// XX: zero-indexed, 5-padded count of Programs
	let progCount = await db.findMany(Program, {});
	return "PR" + progCount.length.toString().padStart(5, '0');
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
	/**
			GET METHODS
	**/
	
	getHome: async function(req, res) {
		res.status(201).send("Yup, API is working. Welcome!");
	},
	
	//		COVID GET METHODS
	
	getCovHome: async function(req, res) {
		res.status(201).send("Welcome to the CovID API!");
	},
	
	getCovTest: async function(req, res) {
		let obj = {
			code: 200,
			hello: "hi"
		};
		res.status(201).send(obj);
	},
	
	//		PROGPLAN GET METHODS
	
	getProHome: async function(req, res) {
		res.status(201).send("Welcome to the ProgramPlan API!");
	},
	
	getProProgList: async function(req, res) {
		let progs = await db.findMany(Program, {});
		res.status(201).send(progs);
	},
	
	getProFilterProgs: async function(req, res) {
		// TODO: req.query
	},
	
	getSupplOrds: async function(req, res) {
		try {
			let items = await db.findMany(Product, {supplier: req.query.supplier}, 'prodName');
			res.status(200).send(forceJSON(items));
		} catch (e) {
			res.status(500).send(e);
		}
	},
	
	/**
			POST METHODS
	**/
	
	//		COVID POST METHODS
	postCovAddPubUser: async function(req, res) {
		let {password, firstName, lastName, email, birthday, phone, street, barangay, city, province} = req.body;
		try {
			let hash = await bcrypt.hash(password, saltRounds);
			let newUser = {
				// userId: Number,
				email: email,
				password: Hidden,
				firstName: firstName,
				lastName: lastName
			}, newPubUser = {
				email: email,
				birthday: new Date(birthday),
				phone: phone,
				street: street,
				barangay: barangay,
				city: city,
				province: province
			};
			await db.insertOne(UserCov, newUser);
			await db.insertOne(PublicUser, newPubUser);
			res.status(200).send();
		} catch (e) {
			res.status(500).send(e);
		}
	},
	
	postCovLogin: async function(req, res) {
		let {email, password} = req.body;
		try {
			let user = await db.findOne(UserCov, {email: email});
			if (!user) res.status(400).send("Incorrect credentials!");
			else {
				let compare = await bcrypt.compare(password, user.password);
				if (compare) res.status(201).send("Welcome!");
				else res.status(400).send("Incorrect credentials!");
			}
		} catch (e) {
			res.status(500).send(e);
		}
	},
	
	//		PROGPLAN POST METHODS
	
	postProLogin: async function(req, res) {
		let {email, password} = req.body;
		try {
			let user = await db.findOne(UserProg, {email: email});
			if (!user) res.status(400).send("Incorrect credentials!");
			else {
				let compare = await bcrypt.compare(password, user.password);
				if (compare) res.status(201).send("Welcome!");
				else res.status(400).send("Incorrect credentials!");
			}
		} catch (e) {
			res.status(500).send('Server error.');
		}
	},
	
	postProAddUser: async function(req, res) {
		let {email, username, password, city} = req.body;
		try {
			let userMatch = await db.findOne(UserProg, {email: email});
			if (userMatch) res.status(400).send('User already exists!');
			else {
				let hash = await bcrypt.hash(password, saltRounds);
				let newUser = {
					email: email,
					username: username,
					password: hash,
					city: city
				};
				await db.insertOne(UserProg, newUser);
				res.status(201).send();
			}
		} catch (e) {
			res.status(500).send('Server error.');
		}
	},
	
	postProCreateProg: async function(req, res) {
		try {
			let {userEmail, programTitle, startDate, endDate, street, city} = req.body;
			let newProg = {
				programId: await genProgId(),
				userCreated: userEmail,
				programTitle: programTitle,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				street: street,
				city: city,
				progress: 0,
				status: "Pending"
			};
			await db.insertOne(Program, newProg);
			res.status(201).send("Program created!");
		} catch (e) {
			res.status(500).send(e);
		}
	},
	
	postProEditProg: async function(req, res) {
		try {
			let {programId, startDate, endDate, street, city} = req.body;
			let update = {
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				street: street,
				city: city
			};
			await db.updateOne(Program, {programId: programId}, update);
			res.status(201).send("Program created!");
		} catch (e) {
			res.status(500).send(e);
		}
	}
};

module.exports = cpController;
