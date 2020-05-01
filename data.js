const express = require("express");
const login = require("./login");
const db = require("./back/database/Database").Database;
const Activity = require("./back/models/Activity").Activity;
const Record = require("./back/models/Record").Record;
const Auth = require("./back/Authenticate");

let router = express.Router();

/*Structure of these function:
Each of these functions handle a http request using to different http request types: get and post the differences
between these aren't really important.
Each http request has to be sent to a URL, each url is "the domain name"/route so for example the login page is under
the route "/" route as its the page you want to go to first and returns the web page. all the function in here represent
a endpoint under the "/data" route as defined in app.js. So to send a get request to "/user-sport-records" a get request
will be made to localhost:3000/data/user-sport-records.
These endpoints here return data, they can be web pages, JSON data or just plain text. Every endpoint in this file
returns a JSON string with whether the request was successful in what it intended to do for example if the user gives an
invalid login token this will return  {"success": 0, "reason": "Invalid login"} to show that the request couldn't be
carried out as the data was invalid.

Each of these functions (apart from delete user) take a token, this token is given to them when the login in
(login is in login.js and its route is /login) then checks the token and gets the username/user data. This is so only
the user can request their data.
*/


//This recieves get requests to /data/user-sport-records, this returns all the users records for a sport
router.get("/user-sport-records", function(req, res, next){
    let sportID = req.query.sportID;
    let token = req.query.token;
    let result = Auth.checkToken(token);

    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;
    let user = db.getUser(username);

    if(Auth.checkStrings([sportID]) === false){
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
        return;
    }

    let records = db.getUserActivityRecordHistory(user.ID,sportID);
    let index = 0;

    let output = JSON.parse('{"success": 1, "reason": "", "data": []}');
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
    let token = req.query.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let username = result.username;
    let user = db.getUser(username);

    let activities = db.getUserActivities(user.ID);

    let output = JSON.parse('{"success": 1, "reason": "", "data": []}');

    for(var i = 0; i < activities.length; i++){
        output.data[i] = activities[i];
    }

    //get sport name, sport id, unit

    res.send(JSON.stringify(output));
});

router.get("/getActivityByName", function(req, res, next) {
    let sportName = req.query.sportName.toLowerCase();
    let token = req.query.token;
    let result = Auth.checkToken(token);

    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    if(Auth.checkStrings([sportName]) === false){
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
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
    let sportName = req.body.sportName;
    let sportDesc = req.body.sportDesc;
    let sportUnit = req.body.sportUnit;
    let sportAsc = req.body.sportAsc;
    let token = req.body.token;
    let result = Auth.checkToken(token);

    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(Auth.checkStrings([sportName, sportDesc, sportUnit, sportAsc]) === false){
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
        return;
    }

    //Where the query needs to go
    if(Auth.charCheck(sportName) == false || Auth.charCheck(sportDesc) == false || Auth.charCheck(sportUnit) == false || Auth.charCheck(sportAsc) == false){
        res.send('{"success": 0, "reason": "Invalid data entered"}');
        return;
    }

    let activity = db.searchForActivitiesByName(sportName);
    if(activity.length > 0 && activity[0].name == sportName && activity[0].sportDesc == sportDesc){
        res.send('{"success": 0, "reason":"Sport already exists}');
    }

    activity = new Activity(sportName, sportDesc, sportUnit, sportAsc);
    db.createActivity(activity)

    db.giveUserActivity(db.getUser(username).ID, db.getActivity(sportName).ID);
    res.send('{"success": 1, "reason": ""}');
    return;

});


router.post("/removeFromSport", function(req, res, next){
    let sportID = parseInt(req.body.sportID);
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(Auth.charCheck(sportID) === false){
        res.send('{"success": 0, "reason": "Invalid sport ID"}');
        return;
    }

    if(db.activityExists(sportID) === true){
        db.removeUserFromActivity(db.getUser(username).ID, sportID);
        res.send(JSON.stringify({"success": 1, "reason": ""}));
    }else{
        res.send(JSON.stringify({"success": 0, "reason": ""}));
    }

});

//Post request for /data/add-user-to-sport and assigns the user to a given sport
router.post("/add-user-to-sport", function(req, res, next) {
    let sportID = parseInt(req.body.sportID);
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(db.activityExists(sportID) === true){
        db.giveUserActivity(db.getUser(username).ID, sportID);
        res.send('{"success": 1, "reason": ""}');
    }else{
        res.send('{"success": 0, "reason": "Sport does not exist"}');
    }

});

//Post request for /data/add-record, adds a new record for a given sport
router.post("/add-record", function(req, res, next) {
    let sportID = req.body.sportID;
    let amount = req.body.record;
    let date = req.body.date;

    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(Auth.charCheck(sportID) === false){
        res.send('{"success": 0, "reason": "Invalid sport ID"}');
        return;
    }

    let user = db.getUser(username);

    let record = new Record(user.ID,parseInt(sportID), parseFloat(amount), parseInt(date));
    db.createRecord(record);
    res.send('{"success": 1, "reason": ""}');

});

//Post request for /data/search-activity, searches for a record
router.post("/search-activity", function(req, res, next) {
    let sportName = req.body.sportName;
    let token = req.body.token;
    let result = Auth.checkToken(token);

    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;


    if(Auth.charCheck(sportName) === false){
        res.send('{"success": 0, "reason": "Invalid sport name"}');
        return;
    }

    let activities = db.searchForActivitiesByName(sportName);
    let output = {"success": 1, "reason": "", "data": activities};

    res.send(JSON.stringify(output));


    return;

});

//Removes record
router.post("/remove-record", function(req, res, next) {
    let recordID = parseInt(req.body.recordID);

    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(charCheck(recordID) === false){
        res.send('{"success": 0, "reason": "Invalid sport recordID"}');
        return;
    }

    let user = db.getUser(username);

    db.removeRecord(recordID);
    res.send('{"success": 1, "reason": ""}');
});

//Gets all the leaderboards for a given user
router.post("/getAllLeaderBoards", function(req,res,next){
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    let user = db.getUser(username);

    let boards = db.getUserLeaderboards(user.ID);

    output = JSON.parse('{"success": 1, "reason": "", "data": []}');

    for(let i = 0; i < boards.length; i++){

        output.data.push(JSON.parse('{"ID": 0, "name": "", "activity": "", "records": {}}'));
        output.data[i].ID = boards[i].ID;
        output.data[i].name = boards[i].name;
        output.data[i].activity = boards[i].activity;
        let records = db.getAllLeaderboardRecords(boards[i].ID);
        let highest = 0;
        let swap;

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

//Adds a new leaderboard
router.post("/addLeaderBoard", function(req,res,next) {
    let sportID = parseInt(req.body.sportID);
    let name = req.body.name;
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;
    let user = db.getUser(username);

    if(Auth.charCheck(name) === false){
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
        return;
    }

    if(!db.activityExists(sportID)){
        res.send('{"success": 0, "reason": "Sport doesn\'t exist"}');
        return;
    }



    if(db.getUserActivityRecordHistory(user.ID, sportID).length < 2){
        res.send('{"success": 0, "reason": "User has no data for this sport"}');
        return;
    }
    if(db.leaderboardExists(name) === true){
        res.send('{"success": 0, "reason": "Leaderboard with this name already exists"}');
    }


    db.createLeaderboard(sportID, name);

    let board = db.getLeaderboard(name);

    db.addUserToLeaderboard(user.ID, board.ID);
    res.send('{"success": 1, "reason": ""}');

});

//Given the leaderboard name, attempts to add the user to a leaderboard
router.post("/joinLeaderBoard", function(req,res,next) {
    let name = req.body.name;
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(Auth.charCheck(name) === false) {
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
        return;
    }

    if(!db.leaderboardExists(name)){
        res.send('{"success": 0, "reason": "Leaderboard does not exist"}');
        return;
    }

    let user = db.getUser(username);

    let board = db.getLeaderboard(name);

    let recordHist = db.getUserActivityRecordHistory(user.ID, board.activity.ID);
    if(recordHist.length < 2){
        res.send(`{"success": 0, "reason": "User has no data for this sport"}`);
        return;
    }


    let userBoards = db.getUserLeaderboards(user.ID);

    for(let i = 0; i < userBoards.length; i++){
        if(name.localeCompare(userBoards[i].name) === 0){
            res.send(JSON.stringify({"success": 0, "reason": "User is already part of this leader board"}));
            return;
        }
    }


    if(db.addUserToLeaderboard(user.ID, board.ID) === 0){
        res.send(`{"success": 0, "reason": "User already is on the leader board or is not part of the sport which this leader board is for"}`);
        return;
    }

    res.send(`{"success": 1, "reason": ""}`);

});


router.post("/removeUserFromLeaderboard", function(req, res, next){
    let boardName = req.body.boardName;
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }
    let username = result.username;

    if(Auth.checkStrings([boardName]) === false){
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
        return;
    }

    if(db.leaderboardExists(boardName) === false){
        res.send(JSON.stringify({"success": 0, "reason": "Leaderboard does not exist"}));
        return;
    }

    if(db.removeUserFromLeaderboard(db.getUser(username).ID, db.getLeaderboard(boardName).ID) === 0){
        res.send(JSON.stringify({"success": 0, "reason": "User is not part of leaderboard"}));
    }else {
        res.send(JSON.stringify({"success": 1, "reason": ""}));
    }

});


//Searches for leaderboard given a name
router.post("/searchForLeaderboard", function(req, res, next) {
    let boardName = req.body.boardName;
    let token = req.body.token;
    let result = Auth.checkToken(token);


    if(result == null){
        res.send('{"success": 0, "reason": "Invalid login"}');
        return;
    }

    let username = result.username;

    if(Auth.checkStrings([boardName]) === false){
        res.json({"success": 0, "reason": "Invalid characters in parameters"});
        return;
    }

    let leaderboards = db.searchForLeaderboardByName(boardName);
    res.send(`{"success": 1, "reason": "", "data":${JSON.stringify(leaderboards)}}`);
});


//Gets username given their token
router.post("/getUsername", function(req, res, next){
    let token = req.body.token;
    let result = Auth.checkToken(token);

    if(result == null){
        res.send(JSON.stringify({"success": 0, "reason": "Invalid token", "data" : {}}));
    }else{
        res.send(JSON.stringify({"success": 1, "reason": "", "data": {"username": result.username}}));
    }


});

//Deletes user
router.post("/removeUser", function(req, res, next){
    //let username = req.body.username;
    //let password = req.body.password;
    let token = req.body.token;
    let result = Auth.checkToken(token);

    if(result != null){
        db.removeUser(result.username);
        res.send(JSON.stringify({"success": 1, "reason": "Account deleted, goodbye"}));
    }else{
        res.send(JSON.stringify({"success": 0, "reason": "Incorrect login details"}));
    }
});


module.exports = router;
