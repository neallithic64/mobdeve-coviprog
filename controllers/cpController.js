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
// const Symptom = require("../models/SymptomModel");
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

function getPStatus(filtered) {
	switch (filtered.length) {
		case 1:
		case 2:
		case 3: return "In Progress";
		case 4: return "Needs Evaluation";
		case 5: return "Complete";
		default: return "Pending";
	}
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

	getCovUsrAddr: async function(req, res) {
		try {
			let user = await db.findOne(PublicUser, {email: req.query.email});
			if (!user) res.status(400).send("Email not found!");
			else {
				let locArr = [user.street, user.barangay, user.city, user.province];
				console.table(locArr);
				res.status(200).send(locArr);
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	getCovCaseDetail: async function(req, res) {
		try {
			let query = await db.findOne(Case, {caseId: req.query.id});
			if (!query) res.status(404).send("No such case found!");
			else res.status(200).send(query);
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	getCovNotifList: async function(req, res) {
		try {
			let notifs = await db.findMany(Notif, {receiverEmail: req.query.receiverEmail});
			console.log(notifs);
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
		// filtering only by city, date range will happen in-app
		// due to limitations
		let pipes = [
			{"$match": {city: req.query.city}}
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
				"from": "feedbacks",
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
				queries[0].feedback = queries[0].feedback[0];
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
		let {password, firstName, lastName, email, token, birthday, phone, street, barangay, city, province} = req.body;
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
					lastName: lastName,
					token: token
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
			if (!user) {
				res.status(400).send("Email not found!");
			} else {
				let compare = await bcrypt.compare(password, user.password),
					type = await db.findOne(PublicUser, {email: email});
				if (compare) {
					if (type) res.status(200).send({ email: user.email,
						userId: user.userId,
						firstName: user.firstName,
						lastName: user.lastName,
						userType: 1,
						street: user.street,
						barangay: user.barangay,
						city: user.city,
						province: user.province
					});
					else res.status(200).send({ email: user.email,
						userId: user.userId,
						firstName: user.firstName,
						lastName: user.lastName,
						userType: 0
					});
				} else res.status(400).send("Incorrect credentials!");
			}
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postCovReportCase: async function(req, res) {
		let {email, street, barangay, city, province, remarks,
			fever, cough, shortbreath, fatigue, bodyache, headache,
			smell, sorethroat, runnynose, nausea, diarrhea} = req.body;
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
				dateSubmitted: new Date(),
				fever: fever,
				cough: cough,
				shortbreath: shortbreath,
				fatigue: fatigue,
				bodyache: bodyache,
				headache: headache,
				smell: smell,
				sorethroat: sorethroat,
				runnynose: runnynose,
				nausea: nausea,
				diarrhea: diarrhea
			};
			await db.insertOne(Case, newCase);
			
			let newNotif = {
				senderEmail: email,
				receiverEmail: "admin",
				notifId: await genCovNotifId(),
				caseId: genCaseId,
				caseStatus: "For Review",
				message: "New possible case in " + city + " for review!",
				dateCreated: new Date()
			};
			await db.insertOne(Notif, newNotif);
			res.status(200).send("Case submitted!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postCovEditCase: async function(req, res) {
		let {caseId, caseStatus} = req.body;
		try {
			let updateCase = await db.findOne(Case, {caseId: caseId});
			if (updateCase) {
				await db.updateOne(Case, {caseId: caseId}, {caseStatus: caseStatus});
				let newNotif = {
					senderEmail: "admin",
					receiverEmail: updateCase.email,
					notifId: await genCovNotifId(),
					caseId: caseId,
					caseStatus: caseStatus,
					message: "Case " + caseId + " has been updated to " + caseStatus + "!",
					dateCreated: new Date()
				};
				await db.insertOne(Notif, newNotif);
				res.status(200).send("Case status updated!");
			} else res.status(404).send("Case not found!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},

	postCovSetToken: async function(req, res) {
		let {email, token} = req.body;
		try {
			let admin = await db.findOne(AdminUser, {email: email});
			if (admin) {
				await db.updateOne(UserCov, {email: email}, {token: token});
				res.status(200).send("Admin token updated!");
			} else res.status(400).send("No such admin email found!");
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
		try {
			for (let i = 0; i < listItems.length; i++) {
				let filter = {
					progItem: listItems[i].progItem,
					programId: listItems[i].programId
				}, update = {
					checked: listItems[i].checked
				};
				await db.updateOne(ProgChecklist, filter, update);
			}
			let progress = listItems.filter(e => e.checked), status = getPStatus(progress);
			await db.updateOne(Program,
					{programId: listItems[0].programId},
					{progress: progress.length/5*100, status: status});
			res.status(200).send(listItems[0].programId + " checklist updated!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},
	
	postProEvalProg: async function(req, res) {
		let {program, resources, outcomes, feedback} = req.body;
		let newFeedbackId = await genProFeedbackId();
		try {
			for (let i = 0; i < resources.length; i++) {
				let filter = {
					programId: program.programId,
					resourceName: resources[i].resourceName
				}, update = {
					actualAmt: resources[i].actualAmt
				};
				await db.updateOne(Resource, filter, update);
			}
			for (let i = 0; i < outcomes.length; i++) {
				let filter = {
					programId: program.programId,
					outcomeName: outcomes[i].outcomeName
				}, update = {
					actualVal: outcomes[i].actualVal
				};
				await db.updateOne(Outcome, filter, update);
			}
			await db.insertOne(Feedback, {
				feedbackId: newFeedbackId,
				programId: program.programId,
				comments: feedback.comments
			});
			await db.updateOne(Program, {programId: program.programId}, {status: "Completed"});
			res.status(200).send("Evaluation submitted!");
		} catch (e) {
			console.log(e);
			res.status(500).send("Server error.");
		}
	},

	//		DATABASE CLEAR METHODS
	//		TREAT WITH CARE!!!

	getCovClearDb: async function(req, res) {
		let conf = req.query.conf;
		if (conf === "CONFIRM") {
			try {
				// await db.deleteMany(, {});
				res.status(201).send("Database cleared. Sad to see you go!");
			} catch (e) {
				console.log(e);
				res.status(500).send("Server error.");
			}
		} else res.status(400).send("No.");
	},

	getProClearDb: async function(req, res) {
		let conf = req.query.conf;
		if (conf === "CONFIRM") {
			try {
				await db.deleteMany(Feedback, {});
				await db.deleteMany(Outcome, {});
				await db.deleteMany(ProgChecklist, {});
				await db.deleteMany(Program, {});
				await db.deleteMany(Resource, {});
				res.status(201).send("Database cleared except users. Sad to see you go!");
			} catch (e) {
				console.log(e);
				res.status(500).send("Server error.");
			}
		} else res.status(400).send("No.");
	}
};

module.exports = cpController;
