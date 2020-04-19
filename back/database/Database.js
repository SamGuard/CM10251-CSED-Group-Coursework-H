const db = require("sqlite-sync");
const {User} = require("../models/User");
const {Activity} = require("../models/Activity");
const {Record} = require("../models/Record");
const {Leaderboard} = require("../models/Leaderboard");

/**
 * This is an interface to the database that abstracts lots of the query logic into parameterized statics.
 * Every static will follow a similar structure:
 *  1. Take in any parameters needed for the query.
 *  2. Open the database connection.
 *  3. Initialise the query variable.
 *  4. Execute the query using the sqlite library run() method, and either:
 *      4a. Store the output directly in a variable.
 *      4b. Perform some checks on the output using a callback method.
 *  5. Close the database connection.
 *  6. Return the output.
 *
 * A remark about point 4: the third variable of the db.run() method is a call back function; a function to be ran after
 * the run() method is finished. This can be useful when we need to perform some checks on the output of a query, but
 * when we just want to get the result of the query we can pass this function as null and run() will default to simply
 * returning the output of the query.
 */

class Database {
	/**
	 * Open the database connection.
	 */
	static connect() {
		db.connect(process.cwd() + "/back/database/fitness-tracker.db");
	}

	/**
	 * Close the database connection.
	 */
	static close() {
		db.close();
	}

	// <USER>

	/**
	 * Creates an instance of the user object in the database.
	 *
	 * @param user
	 */
	static createUser(user) {
		// Throw an error if the user is already in the database
		if (this.userExists(user.username)) {
			return 0; // 0 to show the user is already in the database
		}

		let query = "INSERT INTO users (username, password, salt, email, DOB) VALUES (?, ?, ?, ?, ?);";

		this.connect();
		db.run(query, [user.username, user.password, user.salt, user.email, user.DOBMilliseconds()], null);
		this.close();

		return 1;
	}

	/**
	 * Gets the user represented by the given identifier (either a username or ID).
	 *
	 * @param userIdentifier
	 */
	static getUser(userIdentifier){
		let query;

		if(typeof(userIdentifier) == "number"){
			query = "SELECT * FROM users WHERE ID = ?;"
		}else{
			query = "SELECT * FROM users WHERE username =?;";
		}

		this.connect();
		let output = db.run(query, [userIdentifier], null)[0];
		this.close();

		if(!output){
			return;
		}
		return new User(output.username, output.password, output.salt, output.email, output.DOB, output.ID);
	}

	/**
	 * Returns a boolean indicating whether or not the given username corresponds to a user in the database.
	 *
	 * @param userIdentifier
	 * @returns {boolean}
	 */
	static userExists(userIdentifier) {
		let query;

		this.connect();

		// Allow the user to be checked using either the username or the ID.
		if (typeof (userIdentifier) == "string") {
			query = "SELECT * FROM users WHERE username = ?;";
		} else if (typeof (userIdentifier) == "number") {
			query = "SELECT * FROM users WHERE ID = ?;";
		}

		let output = db.run(query, [userIdentifier], null);
		this.close();

		// If the array contains an item, the user exists (i.e. 1 == 1 -> true)
		return (output.length === 1);
	}

	// </USER>
	// <ACTIVITY>

	/**
	 * Puts the given activity object into the database.
	 *
	 * @param activity
	 */
	static createActivity(activity)
	{
		let query = "INSERT INTO activities (name, description, record_unit, ascending) VALUES (?, ?, ?, ?);";

		this.connect();
		db.run(query, [activity.name, activity.description, activity.record_unit, activity.ascending], null);
		this.close();
	}

	/**
	 * Returns an Activity object based off the ID given.
	 *
	 * @param activityIdentifier
	 * @returns {Array|Object}
	 */
	static getActivity(activityIdentifier)
	{
		let query;

		if(typeof(activityIdentifier) == "number") {
			query = "SELECT * FROM activities WHERE ID = ?;";
		}else{
			query = "SELECT * FROM activities WHERE name = ?;";
		}

		this.connect();
		let output = db.run(query, [activityIdentifier], null)[0];
		this.close();

		return new Activity(output.name, output.description, output.record_unit, output.ascending, output.ID);
	}

	/**
	 * Returns an array containing all of the activities in the DB
	 * @returns {[]}
	 */
	static getAllActivities()
	{
		let query = "SELECT * FROM activities";
		let activities = [];

		this.connect();
		let output = db.run(query, null, null);
		this.close();

		for(let item = 0; item < output.length; item++)
		{
			activities.push(new Activity(output.name, output.description, output.record_unit, output.ascending, output.ID));
		}

		return activities;
	}

	/**
	 * Returns an array containing all activities with a name containing the given string.
	 *
	 * @param name
	 * @returns {[]}
	 */
	static searchForActivitiesByName(name)
	{
		let query = "SELECT * FROM activities WHERE name LIKE '%?%;'";
		let activities = [];

		this.connect();
		let output = db.run(query, [name], null);
		this.close();

		for(let item = 0; item < output.length; item++)
		{
			activities.push(new Activity(output.name, output.description, output.record_unit, output.ascending, output.ID));
		}

		return activities;
	}

	/**
	 * Returns an array containing all the activities that a user participates in
	 * @param userID the user's activities
	 */
	static getUserActivities(userID)
	{
		let activities = [];
		let query = "SELECT activities.ID FROM activities JOIN activityRecords r ON activities.ID = r.activity_ID WHERE r.user_ID = ? AND r.record = -1;";

		this.connect();
		let output = db.run(query, [userID], null);
		this.close();

		console.log(output);

		for (let i = 0; i < output.length; i++) {
			// | In case an activity is deleted
			if(this.activityExists(output[i].ID))
			{
				activities.push(this.getActivity(output[i].ID));
			}
		}

		return activities;
	}

	/**
	 * Returns a boolean indicating whether or not the given user takes part in the given sport.
	 *
	 * @param userID
	 * @param activityID
	 * @returns {boolean}
	 */
	static userHasActivity(userID, activityID)
	{
		let query = "SELECT * FROM activityRecords WHERE user_ID = ? AND activity_ID = ? AND record = -1;";

		this.connect();
		let output = db.run(query, [userID, activityID], null);
		this.close();

		return (output.length === 1);
	}

	/**
	 * Gives, if they don't already have it, the given user access to the given activity
	 *
	 * @param userID
	 * @param activityID
	 * @return number an int describing whether this succeeded or failed.
	 */
	static giveUserActivity(userID, activityID)
	{
		if(this.userHasActivity(userID, activityID)){
			return 0;
		}

		let query = "INSERT INTO activityRecords (user_ID, activity_ID, record, date) VALUES (?, ?, -1, ?);";

		this.connect();
		db.run(query, [userID, activityID, Date.now()], null);
		this.close();

		return 1;
	}

	/**
	 * Removes the user from the activity.
	 *
	 * @param userID
	 * @param activityID
	 * @return {number}
	 */
	static removeUserFromActivity(userID, activityID)
	{
		// Return 0 if the user doesn't have the activity.
		if(!this.userHasActivity(userID, activityID))
		{
			return 0;
		}

		// We only delete the record with -1, so that if the user decides to re-enroll in the sport, they still have their previous records.
		let query = "DELETE FROM activityRecords WHERE user_ID = ? AND activity_ID = ? AND record = -1;";

		this.connect();
		db.run(query, [userID, activityID], null);
		this.close();

		// 1 for success.
		return 1;
	}

	/**
	 * Returns a boolean indicating whether the given activity is in the db.
	 *
	 * @param activityIdentifier either the ID or the name of the activity.
	 * @returns {boolean}
	 */
	static activityExists(activityIdentifier)
	{
		let query;

		if(typeof(activityIdentifier) == "number")
		{
			query = "SELECT * FROM activities WHERE ID = ?;";
		}else{
			query = "SELECT * FROM activities WHERE name = ?;";
		}

		this.connect();
		let output = db.run(query, [activityIdentifier], null);
		this.close();

		return (output.length === 1);
	}

	// </ACTIVITY>
	// <RECORD>

	/**
	 * Puts the given record into the database.
	 *
	 * @param record
	 */
	static createRecord(record)
	{
		let query = "INSERT INTO activityRecords (user_ID, activity_ID, record, date) VALUES (?, ?, ?, ?)";

		this.connect();
		db.run(query, [record.userID, record.activityID, record.record, record.getDateMillis()], null);
		this.close();

		this.checkLeaderboardPB(record); // Check for new PB and update on leaderboards.
	}

	/**
	 * Gets all of the user's records for a given activity.
	 *
	 * @param userID
	 * @param activityID
	 * @return {[]}
	 */
	static getUserActivityRecordHistory(userID, activityID)
	{
		let records = [];
		let query = "SELECT * FROM activityRecords WHERE user_ID = ? AND activity_ID = ? ORDER BY date;";
		//let query = "SELECT * FROM activityRecords WHERE user_ID = ? AND activity_ID = ? AND record != -1 ORDER BY date ASC;";

		this.connect();
		let output = db.run(query, [userID, activityID], null);
		this.close();

		for (let i = 0; i < output.length; i++)
		{
			records.push(new Record(output[i].user_ID, output[i].activity_ID, output[i].record, output[i].date, output[i].ID));
		}

		return records;
	}

	/**
	 * Gets the user's PB for a given activity
	 *
	 * @param userID
	 * @param activityID
	 * @return {Record}
	 */
	static getUserActivityPB(userID, activityID)
	{
		let activity = this.getActivity(activityID);

		let order;

		if(activity.ascending === 1){
			order = "ASC";
		}
		else
		{
			order = "DESC";
		}

		let query = "SELECT * FROM activityRecords WHERE user_ID = ? AND activity_ID = ? ORDER BY ?;";

		this.connect();
		let output = db.run(query, [userID, activityID, order], null);
		this.close();

		// | The first item in the collection will be the PB.
		output = output[0];

		return new Record(output.user_id, output.activity_id, output.record, output.date, output.ID);
	}

	/**
	 * Returns the record that demonstrates a user's participation in an activity.
	 * @param userID
	 * @param activityID
	 * @return {Record}
	 */
	static getUserActivityParticipationRecord(userID, activityID)
	{
		let query = "SELECT date, ID FROM activityRecords WHERE user_ID = ? AND activity_ID = ? AND record = -1;";

		this.connect();
		let output = db.run(query, [userID, activityID], null);
		this.close();

		return new Record(userID, activityID, -1, output[0].date, output[0].ID);
	}

	/**
	 * Deletes the given record from the database
	 *
	 * @param recordID
	 */
	static removeRecord(recordID)
	{
		let query = "DELETE FROM activityRecords WHERE ID = ?;";

		this.connect();
		db.run(query, [recordID], null);
		this.close();
	}

	// </RECORD>
	// <LEADERBOARD>

	/**
	 * Creates a new leaderboard
	 *
	 * @param activityID
	 * @param name
	 * @return {number}
	 */
	static createLeaderboard(activityID, name)
	{
		if(this.leaderboardExists(name))
		{
			return 0;
		}

		let query = "INSERT INTO leaderboards (activity_ID, name) VALUES (?, ?);";

		this.connect();
		db.run(query, [activityID, name], null);
		this.close();

		return 1;
	}

	/**
	 * Returns a list containing all of the leaderboards that the given user is
	 * registered to be on.
	 *
	 * @param userID
	 */
	static getUserLeaderboards(userID)
	{
		let query = "SELECT leaderboard_ID FROM leaderboard_entries JOIN activityRecords aR on leaderboard_entries.record_ID = aR.ID WHERE user_ID = ? AND record = -1;";
		let leaderboards = [];

		this.connect();
		let output = db.run(query, [userID], null);
		this.close();

		for (let i = 0; i < output.length; i++) {
			leaderboards.push(this.getLeaderboard(output[i].leaderboard_ID))
		}

		return leaderboards;
	}

	/**
	 * Returns a leaderboard object based off of the given ID or name.
	 *
	 * @param leaderboardIdentifier
	 * @return
	 */
	static getLeaderboard(leaderboardIdentifier)
	{
		let query;

		if(typeof(leaderboardIdentifier) == "number")
		{
			query = "SELECT * FROM leaderboards WHERE ID = ?;";
		}
		else
		{
			query = "SELECT * FROM leaderboards WHERE name = ?;";
		}


		this.connect();
		let output = db.run(query, [leaderboardIdentifier], null);
		this.close();

		return new Leaderboard(this.getActivity(output[0].activity_ID), output[0].name, output[0].ID);
	}

	/**
	 * Returns a boolean indicating whether or no the given leaderboard exists.
	 *
	 * @param leaderboardIdentifier
	 * @return {boolean}
	 */
	static leaderboardExists(leaderboardIdentifier)
	{
		let query;

		if(typeof(leaderboardIdentifier) == "string")
		{
			query = "SELECT * FROM leaderboards WHERE name = ?;";
		}
		else
		{
			query = "SELECT * FROM leaderboards WHERE ID =?;";
		}

		this.connect();
		let output = db.run(query, [leaderboardIdentifier], null);
		this.close();

		return (output.length === 1);
	}

	/**
	 * Returns an array of leaderboards relating to the given name.
	 *
	 * @param name
	 * @return {[]}
	 */
	static searchForLeaderboardByName(name)
	{
		let leaderboards = [];
		let query = "SELECT * FROM leaderboards WHERE name LIKE '%?%';";

		this.connect();
		let output = db.run(query, [name], null);
		this.close();

		for(let i = 0; i < output.length; i++)
		{
			leaderboards.push(new Leaderboard(this.getActivity(output[i].activity_ID), output[i].name, output[i].ID));
		}

		return leaderboards;
	}

	/**
	 * Adds the user's activity participation record to the leaderboard.
	 *
	 * @param userID
	 * @param leaderboardID
	 * @return {number}
	 */
	static addUserToLeaderboard(userID, leaderboardID)
	{
		if(this.userHasLeaderboard(userID, leaderboardID))
		{
			return 0; // If the user already has the leaderboard there is no need to add again.
		}

		// so add a record to leaderboard_entries that has the record for this leaderboard and this user's activity -1
		let activity = this.getLeaderboard(leaderboardID).activity;
		if(!this.userHasActivity(userID, activity.ID))
		{
			return 0; // Return 0 to indicate that the user cannot be added to this leaderboard.
		}

		let activityRecord = this.getUserActivityPB(userID, activity.ID); // Add the user's PB to the leaderboard

		let query = "INSERT INTO leaderboard_entries (leaderboard_ID, record_ID) VALUES (?, ?);";

		this.connect();
		db.run(query, [leaderboardID, activityRecord.ID], null);
		this.close();

		return 1; // Return 1 to indicate success.
	}

	/**
	 * Removes a user (and all their entries) from a leaderboard.
	 *
	 * @param userID
	 * @param leaderboardID
	 * @return {number}
	 */
	static removeUserFromLeaderboard(userID, leaderboardID)
	{
		if(!this.userHasLeaderboard(userID, leaderboardID))
		{
			return 0; // If the user isn't on the leaderboard they can't be removed.
		}

		let query = "DELETE FROM leaderboard_entries WHERE record_ID IN (SELECT record_ID FROM leaderboard_entries JOIN activityRecords aR on leaderboard_entries.record_ID = aR.ID WHERE user_ID = ? AND leaderboard_ID = ?);";

		this.connect();
		db.run(query, [userID, leaderboardID], null);
		this.close();

		return 1; // 1 to indicate success.
	}

	/**
	 * Returns a boolean indicating whether or not the user is on the given leaderboard.
	 * @param userID
	 * @param leaderboardID
	 * @return {boolean}
	 */
	static userHasLeaderboard(userID, leaderboardID)
	{
		let query = "SELECT * FROM leaderboard_entries JOIN activityRecords aR on leaderboard_entries.record_ID = aR.ID WHERE user_ID = ? AND leaderboard_ID = ? AND record = -1;";

		this.connect();
		let output = db.run(query, [userID, leaderboardID], null);
		this.close();

		return output.length === 1;
	}

	/**
	 * Verifies whether the new record is a new PB, and updates that PB for every leaderboard that the record is in.
	 *
	 * @param newRecord
	 */
	static checkLeaderboardPB(newRecord)
	{
		let currentRecord = this.getUserActivityPB(newRecord.userID, newRecord.activityID);
		let activity = this.getActivity(newRecord.activityID);

		let isPB;

		// If this activity has ascending records, then smaller is better.
		if(activity.ascending === 1)
		{
			isPB = newRecord.record < currentRecord.record;
		}
		// If descending, bigger is better.
		else
		{
			isPB = newRecord.record > currentRecord.record;
		}

		// Update the record if it's a PB.
		if(isPB)
		{
			let query = "UPDATE leaderboard_entries SET record_ID = ? WHERE record_ID = ?;";

			this.connect();
			db.run(query, [newRecord.ID, currentRecord.ID], null);
			this.close();
		}
	}

	/**
	 * Returns a list of the records that make up a leaderboard
	 * @param leaderboardID
	 * @return {*[]}
	 */
	static getAllLeaderboardRecords(leaderboardID)
	{
		// implement logic go get the records

		return [];
	}

	//</LEADERBOARD>
}



module.exports.Database = Database;
