const express = require("express");
const login = require("./login");
const db = require("./back/database/Database").Database;
const Activity = require("./back/models/Activity").Activity;
const Record = require("./back/models/Record").Record;

let router = express.Router();

//This recieves get requests to /data/user-sport-records, this returns all the users records for a sport
router.get("/user-sport-records", function(req, res, next){
    let username = req.query.username;
    let password = req.query.password;
    let sportID = req.query.sportID;

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let user = db.getUser(username);

    let records = db.getUserActivityRecordHistory(user.ID,sportID);
    let index = 0;
    output = JSON.parse('{"success": 1, "reason": "", "data": []}');
    for(var i = 0; i < records.length; i++){
        if(records[i].record != -1){
            output.data[index] = records[i];
            index++;
        }
    }

    res.send(JSON.stringify(output));
    return;
});

//Recieves get requests on /data/user-activities, returns all the sports the user is part of
router.get("/user-activities", function(req, res, next) {
    let username = req.query.username;
    let password = req.query.password;

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let user = db.getUser(username);

    let activities = db.getUserActivities(user.ID);
    output = JSON.parse('{"success": 1, "reason": "", "data": []}');

    for(var i = 0; i < activities.length; i++){
        output.data[i] = activities[i];
    }

    //get sport name, sport id, unit

    res.send(JSON.stringify(output));
});

//Receives post request for /data/user-sport-data, adds a new sport to the database and assigns the user to it
router.post("/user-sport-data", function(req, res, next){
    let username = req.body.username;
    let password = req.body.password;
    let sportName = req.body.sportName;
    let sportDesc = req.body.sportDesc;
    let sportUnit = req.body.sportUnit;
    let sportAsc = req.body.sportAsc;

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    //Where the query needs to go
    if(login.charCheck(sportName) == false || login.charCheck(sportDesc) == false || login.charCheck(sportUnit) == false || login.charCheck(sportAsc) == false){
        res.send('{"success": 0, "reason": "Invalid data entered"}');
        return;
    }

    let activity = db.searchForActivitiesByName(sportName);
    if(activity.length > 0 && activity[0].sportDesc == sportDesc){
        res.send('{"success": 0, "reason":"Sport already exists}');
    }

    activity = new Activity(sportName, sportDesc, sportUnit, sportAsc);
    db.createActivity(activity)
    console.log(db.getUser(username).ID, db.getActivity(sportName));
    db.giveUserActivity(db.getUser(username).ID, db.getActivity(sportName).ID);
    res.send('{"success": 1, "reason": ""}');
    return;

});

//Post request for /data/add-user-to-sport and assigns the user to a given sport
router.post("/add-user-to-sport", function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let sportID = parseInt(req.body.sportID);

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    if(login.charCheck(sportID) == false){
        res.send('{"success": 0, "reason": "Invalid sport ID"}');
        return;
    }

    if(db.activityExists(sportID) == true){
        db.giveUserActivity(db.getUser(username).ID, sportID);
        res.send('{"success": 1, "reason": ""}');
    }else{
        res.send('{"success": 0, "reason": "Sport does not exist"}');
    }


    return;

});

//Post request for /data/add-record, adds a new record for a given sport
router.post("/add-record", function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let sportID = req.body.sportID;
    let amount = req.body.record;
    let date = req.body.date;

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    if(login.charCheck(sportID) == false){
        res.send('{"success": 0, "reason": "Invalid sport ID"}');
        return;
    }

    let user = db.getUser(username);

    let record = new Record(user.ID,parseInt(sportID), parseInt(amount), parseInt(date));
    db.createRecord(record);
    res.send('{"success": 1, "reason": ""}');


    return;

});

//Removes record
router.post("/remove-record", function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let recordID = parseInt(req.body.recordID);

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    if(!recordID){
        res.send('{"success": 0, "reason": "Invalid sport recordID"}');
        return;
    }

    let user = db.getUser(username);
    console.log(recordID);
    db.removeRecord(recordID);
    res.send('{"success": 1, "reason": ""}');


    return;

});


router.post("/getAllLeaderBoards", function(req,res,next){
    let username = req.body.username;
    let password = req.body.password;

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let user = db.getUser(username);

    let boards = db.getUserLeaderboards(user.ID);
    output = JSON.parse('{"success": 1, "reason": "", "data": []}');

    for(let i = 0; i < boards.length; i++){
        output.data[i].ID = boards[i].ID;
        output.data[i].name = db.getActivity(boards[i].activityID);
        let records = db.getAllLeaderboardRecords(boards[i].ID);
        for(let j = 0; j < records.length; j++){
            output.data[i].records = records;
        }

    }

    res.send(JSON.stringify(output));

});


router.post("/addLeaderBoard", function(req,res,next) {
    let username = req.body.username;
    let password = req.body.password;
    let sportID = req.body.sportID;

    let result = JSON.parse(login.checkUser(username, password));
    if (result.loggedIn == 0) {
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let user = db.getUser(username);

    db.createLeaderboard(sportID, user.userID);
    res.send('{"success": 1, "reason": ""}');

});

router.post("/joinLeaderBoard", function(req,res,next) {
    let username = req.body.username;
    let password = req.body.password;
    let sportID = req.body.sportID;

    let result = JSON.parse(login.checkUser(username, password));
    if (result.loggedIn == 0) {
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let user = db.getUser(username);
    db.addUserToLeaderboard(user.ID, sportID);


});



module.exports = router;
