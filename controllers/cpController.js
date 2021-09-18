const db = require("../models/db");

// ProgramPlan Mongo Model Imports
const Admin = require("../models/AdminModel");
const Feedback = require("../models/FeedbackModel");
const Outcome = require("../models/OutcomeModel");
const ProgChecklist = require("../models/ProgChecklistModel");
const Program = require("../models/ProgramModel");
const Resource = require("../models/ResourceModel");
const UserProg = require("../models/UserProgModel");

// CovID Mongo Model Imports
const AdminUser = require("../models/AdminUserModel");
const Case = require("../models/CaseModel");
const Notif = require("../models/NotifModel");
const PublicUser = require("../models/PublicUserModel");
const Symptom = require("../models/SymptomModel");
const UserCov = require("../models/UserCovModel");

const bcrypt = require("bcrypt");
const saltRounds = 10;

function forceJSON(e) {
	return JSON.parse(JSON.stringify(e));
}

/* A note on CovID IDs:
	All IDs for Users, Cases, and Notifs will be 6 digit integers. The leading digit
	designates the kind of model. Users have 1, Cases have 2, and Notifs have 4. The
	succeeding 5 digits are counted in sequential order.
 */

async function genCovUserId() {
	let userCount = await db.findMany(UserCov, {});
	return 100000 + userCount.length;
}

async function genCovCaseId() {
	let caseCount = await db.findMany(Case, {});
	return 200000 + caseCount.length;
}

async function genCovNotifId() {
	let notiCount = await db.findMany(Notif, {});
	return 400000 + notiCount.length;
}

async function genProProgId() {
	// format: PRXXXXX
	// XX: zero-indexed, 5-padded count of Programs
	let progCount = await db.findMany(Program, {});
	return "PR" + progCount.length.toString().padStart(5, "0");
}

async function genProFeedbackId() {
	// format: FBXXXXX
	// XX: zero-indexed, 5-padded count of Feedbacks
	let feedCount = await db.findMany(Feedback, {});
	return "FB" + feedCount.length.toString().padStart(5, "0");
}

function genChecklist(programId) {
	return [
		{
			progItem: "Gather resources",
			programId: programId,
			checked: false
		},
		{
			progItem: "Mobilise manpower",
			programId: programId,
			checked: false
		},
		{
			progItem: "Set up on site",
			programId: programId,
			checked: false
		},
		{
			progItem: "Execute program",
			programId: programId,
			checked: false
		},
		{
			progItem: "Gather evaluations",
			programId: programId,
			checked: false
		}
	];
}



/* Index Functions
 */
const cpController = {
	/**
			GET METHODS
	**/
	
	getHome: async function(req, res) {
		res.status(200).send("Yup, API is working. Welcome!");
	},
	
	//		COVID GET METHODS
	
	getCovHome: async function(req, res) {
		res.status(200).send("Welcome to the CovID API!");
	},
	
	getCovCaseList: async function(req, res) {
		try {
			let cases = await db.findMany(Case, {});
			res.status(200).send(cases);
			// let responded = cases.filter(x => x.caseStatus !== "For Review" || x.caseStatus !== "Verifying");
			// res.status(200).send({cases: cases, reportedCount: cases.length, respondedCount: responded.length});
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	getCovCaseDetail: async function(req, res) {
		let pipes = [
			{"$match": {caseId: req.query.id}},
			{"$lookup": {
				"from": "SYMPTOMS",
				"localField": "caseId",
				"foreignField": "caseId",
				"as": "Symptoms"
			}}
		];
		try {
			let queries = await db.aggregate(Case, pipes);
			if (queries.length === 0) res.status(404).send("No such case found!");
			else res.status(200).send(queries[0]);
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	getCovNotifList: async function(req, res) {
		try {
			let notifs = await db.findMany(Notif, {receiverEmail: req.query.receiverEmail});
			res.status(200).send(notifs);
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	//		PROGPLAN GET METHODS
	
	getProHome: async function(req, res) {
		res.status(200).send("Welcome to the ProgramPlan API!");
	},
	
	getProProgList: async function(req, res) {
		try {
			let progs = await db.findMany(Program, {});
			res.status(200).send(progs);
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	getProFilterProgs: async function(req, res) {
		let pipes = [
			{"$match": {city: req.query.city}},
			{"$gte": ["$startDate", req.query.startDate]},
			{"$lte": ["$endDate", req.query.endDate]}
		];
		try {
			let filterResults = await db.aggregate(Program, pipes);
			res.status(200).send(filterResults);
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	getProProgDetail: async function(req, res) {
		let pipes = [
			{"$match": {programId: req.query.id}},
			{"$lookup": {
				"from": "outcomes",
				"localField": "programId",
				"foreignField": "programId",
				"as": "outcomes"
			}},
			{"$lookup": {
				"from": "progress_checklists",
				"localField": "programId",
				"foreignField": "programId",
				"as": "checklistItems"
			}},
			{"$lookup": {
				"from": "resources",
				"localField": "programId",
				"foreignField": "programId",
				"as": "resources"
			}},
			{"$lookup": {
				"from": "feedback",
				"localField": "programId",
				"foreignField": "programId",
				"as": "feedback"
			}}
		];
		try {
			let queries = await db.aggregate(Program, pipes);
			if (queries.length === 0) res.status(404).send("No such program found!");
			else {
				queries[0].program = {};
				queries[0].program.programId = queries[0].programId;
				queries[0].program.programTitle = queries[0].programTitle;
				queries[0].program.startDate = queries[0].startDate;
				queries[0].program.endDate = queries[0].endDate;
				queries[0].program.street = queries[0].street;
				queries[0].program.city = queries[0].city;
				queries[0].program.progress = queries[0].progress;
				queries[0].program.status = queries[0].status;
				res.status(200).send(queries[0]);
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	/**
			POST METHODS
	**/
	
	//		COVID POST METHODS
	
	postCovAddPublic: async function(req, res) {
		let {password, firstName, lastName, email, birthday, phone, street, barangay, city, province} = req.body;
		try {
			let userMatch = await db.findOne(UserCov, {email: email});
			if (userMatch) res.status(400).send("User already exists!");
			else {
				let hash = await bcrypt.hash(password, saltRounds);
				let newUser = {
					userId: await genCovUserId(),
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
				res.status(200).send("Public User created!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postCovAddAdmin: async function(req, res) {
		let {email, password, firstName, lastName} = req.body;
		try {
			let userMatch = await db.findOne(UserCov, {email: email});
			if (userMatch) res.status(400).send("User already exists!");
			else {
				let hash = await bcrypt.hash(password, saltRounds);
				let newUser = {
					userId: await genCovUserId(),
					email: email,
					password: hash,
					firstName: firstName,
					lastName: lastName
				}, newAdUser = {
					email: email
				};
				await db.insertOne(UserCov, newUser);
				await db.insertOne(AdminUser, newAdUser);
				res.status(200).send("Admin User created!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postCovLogin: async function(req, res) {
		let {email, password} = req.body;
		try {
			let user = await db.findOne(UserCov, {email: email});
			if (!user) res.status(400).send("Incorrect credentials!");
			else {
				let compare = await bcrypt.compare(password, user.password),
					type = await db.findOne(PublicUser, {email: email});
				if (compare) {
					if (type) res.status(200).send({uType: 1});
					else res.status(200).send({uType: 2});
				} else res.status(400).send("Incorrect credentials!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postCovReportCase: async function(req, res) {
		let {email, street, barangay, city, province, symptoms, remarks} = req.body;
		let genCaseId = await genCovCaseId();
		try {
			let newCase = {
				caseId: genCaseId,
				email: email,
				street: street,
				barangay: barangay,
				city: city,
				province: province,
				remarks: remarks,
				caseStatus: "For Review",
				dateSubmitted: new Date()
			};
			await db.insertOne(Case, newCase);
			
			// draft for case symptoms recording:
			for (let i = 0; i < symptoms.length; i++) {
				let arr = symptoms[i].split("+"), newSymp = {
					caseId: genCaseId,
					sympName: arr[0],
					sympDays: arr[1]
				};
				await db.insertOne(Symptom, newSymp);
			}
			
			// TODO: new notif
			await db.insertOne(Notif, {});
			res.status(200).send("Case submitted!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postCovEditCase: async function(req, res) {
		let {caseId, newStatus} = req.body;
		try {
			await db.updateOne(Case, {caseId: caseId}, {caseStatus: newStatus});
			// TODO: new notif
			await db.insertOne(Notif, {});
			res.status(200).send("Case status updated!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	//		PROGPLAN POST METHODS
	
	postProLogin: async function(req, res) {
		let {email, password} = req.body;
		try {
			let user = await db.findOne(UserProg, {email: email});
			if (!user) {
				let admin = await db.findOne(Admin, {email: email});
				if (!admin) res.status(400).send("Incorrect credentials!");
				else {
					let compA = await bcrypt.compare(password, admin.password);
					if (compA) res.status(200).send({userType: 2, email: admin.email, username: admin.username, city: ""});
					else res.status(400).send("Incorrect credentials!");
				}
			}
			else {
				let compU = await bcrypt.compare(password, user.password);
				if (compU) res.status(200).send({userType: 1, email: user.email, username: user.username, city: user.city});
				else res.status(400).send("Incorrect credentials!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postProAddUser: async function(req, res) {
		let {email, username, password, city} = req.body;
		try {
			let userMatch = await db.findOne(UserProg, {email: email});
			if (userMatch) res.status(400).send("User already exists!");
			else {
				let hash = await bcrypt.hash(password, saltRounds);
				let newUser = {
					email: email,
					username: username,
					password: hash,
					city: city
				};
				await db.insertOne(UserProg, newUser);
				res.status(200).send("User created!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postProAddAdmin: async function(req, res) {
		let {email, username, password} = req.body;
		try {
			let userMatch = await db.findOne(Admin , {email: email});
			if (userMatch) res.status(400).send("User already exists!");
			else {
				let hash = await bcrypt.hash(password, saltRounds);
				let newUser = {
					email: email,
					username: username,
					password: hash
				};
				await db.insertOne(Admin, newUser);
				res.status(200).send("Admin created!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postProCreateProg: async function(req, res) {
		try {
			let {userEmail, programTitle, startDate, endDate, street, city} = req.body.program,
				{outcomes, resources} = req.body,
				programId = await genProProgId();
			let newProg = {
				programId: programId,
				userCreated: userEmail,
				programTitle: programTitle,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				street: street,
				city: city,
				progress: 0,
				status: "Pending"
			};
			outcomes.forEach(e => e.programId = programId);
			resources.forEach(e => e.programId = programId);
			await db.insertOne(Program, newProg);
			await db.insertMany(Outcome, outcomes);
			await db.insertMany(Resource, resources);
			await db.insertMany(ProgChecklist, genChecklist(programId));
			res.status(200).send("Program created!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
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
			res.status(200).send("Program edited!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postProProgressProg: async function(req, res) {
		let listItems = req.body;
		console.log(listItems);
		try {
			for (let i = 0; i < listItems.length; i++) {
				let filter = {
					progItem: listItems[i].progItem,
					programId: listItems[i].programId
				}, update = {
					checked: listItems[i].checked
				};
				// console.table(filter);
				// console.table(update);
				await db.updateOne(ProgChecklist, filter, update);
			}
			console.log("PROGRAM ID RESPONSE: " + listItems[0].programId);
			res.status(200).send(listItems[0].programId + " checklist updated!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postProEvalProg: async function(req, res) {
		let {programId, resources, outcomes, comments} = req.body;
		try {
			for (let i = 0; i < resources.length; i++) {
				let arr = resources[i].split("+"), filter = {
					programId: programId,
					resourceName: arr[0]
				}, update = {
					actualAmt: arr[1]
				};
				await db.updateOne(Resource, filter, update);
			}
			for (let i = 0; i < outcomes.length; i++) {
				let arr = outcomes[i].split("+"), filter = {
					programId: programId,
					outcomeName: arr[0]
				}, update = {
					actualVal: arr[1]
				};
				await db.updateOne(Outcome, filter, update);
			}
			await db.updateOne(Program, {programId: programId}, {comments: comments});
			res.status(200).send("Evaluation submitted!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	}
};

module.exports = cpController;
