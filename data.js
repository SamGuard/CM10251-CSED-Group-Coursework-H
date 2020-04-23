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

router.get("/getActivityByName", function(req, res, next) {
    let username = req.query.username;
    let password = req.query.password;
    let sportName = req.query.sportName.toLowerCase();

    let result = JSON.parse(login.checkUser(username,password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    if(!db.activityExists(sportName)){
        res.send('{"success": 0, "reason": "Sport does not exist"}');
        return;
    }

    res.send(`{"success": 1, "reason": "", "data": ${JSON.stringify(db.getActivity(sportName))}}`);
    return;

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
    if(activity.length > 0 && activity[0].name == sportName && activity[0].sportDesc == sportDesc){
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

    let record = new Record(user.ID,parseInt(sportID), parseFloat(amount), parseInt(date));
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

    let result = JSON.parse(login.checkUser(username, password));
    if(result.loggedIn == 0){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let user = db.getUser(username);
    console.log(user);
    let boards = db.getUserLeaderboards(user.ID);
    console.log(boards);
    output = JSON.parse('{"success": 1, "reason": "", "data": []}');

    for(let i = 0; i < boards.length; i++){
        output.data.push(JSON.parse('{"ID": 0, "name": "", "activity": "", "records": {}}'));
        output.data[i].ID = boards[i].ID;
        output.data[i].name = boards[i].name;
        output.data[i].activity = boards[i].activity;
        let records = db.getAllLeaderboardRecords(boards[i].ID);
        let highest = 0;
        let swap;
        console.log(records);

        for(var j = 0; j < records.length; j++){
            for(var k = 0; k < records.length-j-1; k++){
                if(records[k].record > records[k+1].record){
                    swap = records[k];
                    records[k] = records[k+1];
                    records[k+1] = swap;
                }
            }
        }
        output.data[i].records = records;

        for(var j = 0; j < output.data[i].records.length; j++){
            output.data[i].records[j].username = db.getUser(output.data[i].records[j].userID).username;
        }

    }

    res.send(JSON.stringify(output));
});


router.post("/addLeaderBoard", function(req,res,next) {
    let username = req.body.username;
    let password = req.body.password;
    let sportID = parseInt(req.body.sportID);
    let name = req.body.name;

    let result = JSON.parse(login.checkUser(username, password));
    if (result.loggedIn == 0) {
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let user = db.getUser(username);

    if(!db.activityExists(sportID)){
        res.send('{"success": 0, "reason": "Sport doesn\'t exist"}');
        return;
    }

    db.createLeaderboard(sportID, name);
    db.addUserToLeaderboard(user.ID, db.searchForLeaderboardByName(name)[0].ID);
    res.send('{"success": 1, "reason": ""}');

});

router.post("/joinLeaderBoard", function(req,res,next) {
    let username = req.body.username;
    let password = req.body.password;
    let name = req.body.name;

    let result = JSON.parse(login.checkUser(username, password));
    if (result.loggedIn == 0) {
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    if(!db.leaderboardExists(name)){
        res.send('{"success": 0, "reason": "Leaderboard does not exist"}');
        return;
    }

    let user = db.getUser(username);
    if(db.addUserToLeaderboard(user.ID, db.searchForLeaderboardByName(name)[0].ID) == 0){
        res.send(`{"success": 0, "reason": "User already is on the leader board or is not part of the sport which this leader board is for"}`);
        return;
    }

    res.send(`{"success": 1, "reason": ""}`);

});


router.post("/searchForLeaderboard", function(req, res, next) {
    let username = req.body.username;
    let password = req.body.password;
    let boardName = req.body.boardName;

    let result = JSON.parse(login.checkUser(username, password));
    if (result.loggedIn == 0) {
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let leaderboards = db.searchForLeaderboardByName(boardName);
    res.send(`{"success": 1, "reason": "", "data":${JSON.stringify(leaderboards)}}`);
});



module.exports = router;
