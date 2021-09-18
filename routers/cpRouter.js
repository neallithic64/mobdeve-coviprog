const express = require("express");
const router = express();
const cpController = require("../controllers/cpController");


// GET routes
router.get("/", cpController.getHome);
router.get("/api", cpController.getHome);

router.get("/api/covid/", cpController.getCovHome);
router.get("/api/covid/cases", cpController.getCovCaseList);
router.get("/api/covid/casedeets*", cpController.getCovCaseDetail);
router.get("/api/covid/notifs*", cpController.getCovNotifList);
// router.get("/api/covid/clearDB*", cpController.getCovClearDb);

router.get("/api/progp/", cpController.getProHome);
router.get("/api/progp/progs", cpController.getProProgList);
router.get("/api/progp/progs*", cpController.getProFilterProgs);
router.get("/api/progp/progdeets*", cpController.getProProgDetail);
router.get("/api/progp/clearDB*", cpController.getProClearDb);


// POST routes
router.post("/api/covid/login", cpController.postCovLogin);
router.post("/api/covid/pubreg", cpController.postCovAddPublic);
router.post("/api/covid/adminreg", cpController.postCovAddAdmin);
router.post("/api/covid/caserep", cpController.postCovReportCase);
router.post("/api/covid/caseedit", cpController.postCovEditCase);

router.post("/api/progp/login", cpController.postProLogin);
router.post("/api/progp/userreg", cpController.postProAddUser);
router.post("/api/progp/adminreg", cpController.postProAddAdmin);
router.post("/api/progp/progadd", cpController.postProCreateProg);
router.post("/api/progp/progedit", cpController.postProEditProg);
router.post("/api/progp/progchkl", cpController.postProProgressProg);
router.post("/api/progp/progeval", cpController.postProEvalProg);


// error route
router.get("/api/*", function(req, res) {
	res.send("404 not found! Not a valid API route.");
});
router.get("*", function(req, res) {
	res.send("404 not found! Invalid route.");
});

module.exports = router;
