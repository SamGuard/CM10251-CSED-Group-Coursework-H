const db = require("sqlite-sync");

var dir = "./routes/db/userdata.db";

function verify(attemptPassword, actual){
	if(attemptPassword == actual){
		return true;
	}
	return false;
}

function addUser(username, password){
	db.connect(dir);

	let user = [username, password, 50];


	let sql = `SELECT * FROM users WHERE username = ?`

	let output = true;
	db.run(sql, [username], (res) => {
		if (res.error) {
			throw res.error;
		}

		if(res.length > 0){
			output = false;
		}
	});

	if(output == false){
		return false;
	}
	


	sql = `INSERT INTO users(username, pass, avg_score) VALUES(?, ?, ?)`;

	console.log("running");
	db.run(sql, user, function(res) {
		if (res.error) {
			return console.error(res.error);
		}
		console.log(`A user has been created with id ${res}`);
	});

	db.close();

	return output;
}

function userInDB(username, password){
	db.connect(dir);

	let sql = 'SELECT DISTINCT pass pass FROM users WHERE username = ?';

	var output = true;

	db.run(sql, [username], (res) => {
			if (res.error) {
				throw res.error;
			}

			if(res.length > 0){
				output = verify(password, res[0].pass);
			}else{
				output = false;
			}
		});
	

	db.close();
	return output;
}

function getUserScore(username) {
	db.connect(dir);

	let sql = `SELECT avg_score FROM users
				WHERE username = ?`;

	var output;

	db.run(sql, [username], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getUser(username){
	db.connect(dir);

	let sql = 'SELECT * FROM users WHERE username=?';

	var output;

	db.run(sql, [username], (res) => {
		if (res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getAllUsers(){
	db.connect(dir);

	let sql = 'SELECT username FROM users';

	var output;

	db.run(sql, [], (res) => {
		if (res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getTracks(){
	db.connect(dir);

	let sql = 'SELECT * FROM tracks';

	var output;

	db.run(sql, [], (res) => {
			if (res.error) {
				throw res.error;
			}
			output = res;
		});
	

	db.close();
	return output;
}

function getTrackNames() {
	db.connect(dir);

	let sql = `SELECT track_id, name, desc FROM tracks
				ORDER BY name`;

	var output;

	db.run(sql, [], (res) => {
		if (res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();

	return output;
}

function getGoal(goalID) {
	db.connect(dir);

	let sql = `SELECT * FROM goals WHERE goal_id = ?`;

	var output;

	db.run(sql, [goalID], (res) => {
		if (res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getGoalsForTrack(trackID) {
	db.connect(dir);

	let sql = `SELECT goal_id, name, desc, max_num_per_week FROM goals 
				WHERE track_id = ?
				ORDER BY name`;

	var output;

	db.run(sql, [trackID], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getWeeklyScore(username, dateStart) {
	db.connect(dir);

	dateStart = Math.floor(dateStart/604800000);

	let sql = `SELECT * FROM weeklyScore
				WHERE username = ?
				AND date_start = ?`;

	var output;

	db.run(sql, [username, dateStart], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getTrackScore(username, dateStart, trackID) {
	db.connect(dir);

	dateStart = Math.floor(dateStart/604800000);

	let sql = `SELECT * FROM trackScores 
				WHERE track_id = ?
				AND week_id = (SELECT week_id FROM weeklyScore
								WHERE username = ?
								AND date_start = ?)`;

	var output;

	db.run(sql, [trackID, username, dateStart], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getGoalScore(username, dateStart, trackID, goalID) {
	db.connect(dir);

	dateStart = Math.floor(dateStart/604800000);

	let sql = `SELECT * FROM goalScores 
				WHERE goal_id = ?
				AND track_score_id = (SELECT track_score_id FROM trackScores
										WHERE track_id = ?
										AND week_id = (SELECT week_id FROM weeklyScore
														WHERE username = ?
														AND date_start = ?))`;

	var output;

	db.run(sql, [goalID, trackID, username, dateStart], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res;
	});

	db.close();
	return output;
}

function getNextID(table) {
	db.connect(dir);

	let sql = `SELECT * FROM ?`;

	var output;

	db.run(sql, [table], (res) => {
		if(res.error) {
			//throw res.error;
		}
		output = res.length;
	});

	db.close();
	return output;
}

function getNumGoals(trackID) {
	db.connect(dir);

	let sql = `SELECT goal_id FROM goals
				WHERE track_id = ?`;

	var output;

	db.run(sql, [trackID], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res.length;
	});

	db.close();
	return output;
}

function setGoalScores(trackID, trackScoreID, numGoals, nextGoalID) {
	for(var i=1; i<=numGoals; i++) {
		db.connect(dir);

		let sql = `SELECT * FROM goalScores`;

		var nextID;

		db.run(sql, [], (res) => {
			if(res.error) {
				throw res.error;
			}
			nextID = res.length;
		});

		sql = `INSERT INTO goalScores(goal_score_id, track_score_id, goal_id, goal_score, num_this_week)
					VALUES(?, ?, ?, ?, ?)`;

		let newGoal = [nextID, trackScoreID, nextGoalID+i, 0, 0];

		db.run(sql, newGoal, (res) => {
			if(res.error) {
				throw res.error;
			}
		});

		db.close();
	}
}

function setTrackScores(weekID) {
	var nextGoalID = 0;
	for (var i=1; i<=8; i++){
		db.connect(dir);

		let sql = `SELECT * FROM trackScores`;

		var nextID;

		db.run(sql, [], (res) => {
			if(res.error) {
				throw res.error;
			}
			nextID = res.length;
		});

		sql = `INSERT INTO trackScores(track_score_id, week_id, track_id, track_score)
					VALUES(?, ?, ?, ?)`;

		let newTrack = [nextID, weekID, i, 0];

		db.run(sql, newTrack, (res) => {
			if(res.error) {
				throw res.error;
			}
		});

		db.close();

		var numGoals = getNumGoals(i);
		setGoalScores(i, nextID, numGoals, nextGoalID);
		nextGoalID += numGoals;
	}
}

function setWeeklyScore(username, date) {
	db.connect(dir);

	date = Math.floor(date/604800000);

	let sql = `SELECT * FROM weeklyScore`;

	var nextID;

	db.run(sql, [], (res) => {
		if(res.error) {
			throw res.error;
		}
		nextID = res.length;
	});

	sql = `INSERT INTO weeklyScore(week_id, username, date_start, total_score)
				VALUES(?, ?, ?, ?)`;

	let newWeek = [nextID, username, date, 0];

	db.run(sql, newWeek, (res) => {
		if(res.error) {
			throw res.error;
		}
	});

	db.close();

	setTrackScores(nextID);
	console.log(`A new week has been started for ${username} starting at ${date}`);
}

function updateWeeklyScore(weekID, increment) {
	db.connect(dir);

	let sql = `SELECT total_score FROM weeklyScore
				WHERE week_id = ?`;

	var newScore;

	db.run(sql, [weekID], (res) => {
		if (res.error) {
			throw res.error;
		}
		newScore = res[0].total_score + increment;
	})

	sql = `UPDATE weeklyScore
				SET total_score = ?
				WHERE week_id = ?`;

	db.run(sql, [newScore, weekID], (res) => {
		if (res.error) {
			throw res.error;
		}
	});

	db.close();
}

function updateTrackScore(trackScoreID, increment) {
	db.connect(dir);

	let sql = `SELECT tracks.threshold, tracks.weight, trackScores.track_score, trackScores.week_id
				FROM tracks, trackScores
				WHERE trackScores.track_score_id = ?
				AND tracks.track_id = (SELECT trackScores.track_id FROM trackScores
										WHERE trackScores.track_score_id = ?)`;

	var threshold;
	var weight;
	var newScore;
	var weekID;

	db.run(sql, [trackScoreID, trackScoreID], (res) => {
		if(res.error) {
			throw res.error;
		}
		threshold = res[0].threshold;
		weight = res[0].weight;
		newScore = res[0].track_score + increment;
		weekID = res[0].week_id;
		if (newScore > threshold) {
			newScore = threshold;
		}
	});

	sql = `UPDATE trackScores
				SET track_score = ?
				WHERE track_score_id = ?`;

	db.run(sql, [newScore, trackScoreID], (res) => {
		if(res.error) {
			throw res.error;
		}
	});

	db.close();

	var scoreForward = ((newScore/threshold)*weight);

	updateWeeklyScore(weekID, scoreForward);
}

function updateGoalScore(username, date, trackID, goalID) {
	db.connect(dir);

	date = Math.floor(date/604800000);

	let sql = `SELECT goal_score_id FROM goalScores
				WHERE goal_id = ?
				AND track_score_id = (SELECT track_score_id FROM trackScores
										WHERE track_id = ?
										AND week_id = (SELECT week_id FROM weeklyScore
														WHERE username = ?
														AND date_start = ?))`;

	var goalScoreID;

	db.run(sql, [goalID, trackID, username, date], (res) => {
		if(res.error) {
			throw res.error;
		}
		console.log(res);
		goalScoreID = res[0].goal_score_id;
	});



	sql = `SELECT goals.max_num_per_week, goalScores.num_this_week
				FROM goals, goalScores
				WHERE goalScores.goal_score_id = ?
				AND goals.goal_id = (SELECT goalScores.goal_id FROM goalScores 
										WHERE goalScores.goal_score_id = ?)`;

	var output = true;
	var currentNum;

	db.run(sql, [goalScoreID, goalScoreID], (res) => {
		if(res.error) {
			throw res.error;
		}
		
		currentNum = res[0].num_this_week;
		if (res[0].num_this_week >= res[0].max_num_per_week) {
			output = false;
		}
	});

	if (output) {
		sql = `SELECT weight FROM goals
					WHERE goal_id = (SELECT goal_id FROM goalScores
										WHERE goal_score_id = ?)`;

		var weight;

		db.run(sql, [goalScoreID], (res) => {
			if(res.error) {
				throw res.error;
			}
			weight = res[0].weight;
		});

		sql = `SELECT goal_score FROM goalScores
					WHERE goal_score_id = ?`;

		var currentScore;

		db.run(sql, [goalScoreID], (res) => {
			if(res.error) {
				throw res.error;
			}
			currentScore = res[0].goal_score;
		});

		sql = `UPDATE goalScores
					SET goal_score = ?,
						num_this_week = ?
					WHERE
						goal_score_id = ?`;

		db.run(sql, [currentScore+weight, currentNum+1, goalScoreID], (res) => {
			if(res.error) {
				throw res.error;
			}
		});

		sql = `SELECT track_score_id FROM goalScores
					WHERE goal_score_id = ?`;

		var trackScoreID;

		db.run(sql, [goalScoreID], (res) => {
			if(res.error) {
				throw res.error;
			}
			trackScoreID = res[0].track_score_id;
		});

		db.close();

		updateTrackScore(trackScoreID, weight);
	} else {
		db.close();
	}

}

function updateUserScore(username, date) {
	db.connect(dir);

	date = Math.floor(date/604800000);

	let sql = `SELECT total_score FROM weeklyScore
				WHERE username = ?
				AND date_start = ?`;

	var weekScore;

	db.run(sql, [username, date], (res) => {
		if(res.error) {
			throw res.error;
		}
		console.log(res);
		console.log(username);
		weekScore = res[0].total_score;
	});

	sql = `UPDATE users
				SET avg_score = ?
				WHERE username = ?`;

	db.run(sql, [weekScore, username], (res) => {
		if(res.error) {
			throw res.error;
		}
	});

	db.close();
}

function getGoalHist(username, goalId) {
	db.connect(dir);

	let sql = `SELECT date_start FROM weeklyScore
				WHERE username = ?
				ORDER BY date_start`;

	var dates;

	db.run(sql, [username], (res) => {
		if(res.error) {
			throw res.error;
		}
		dates = res;
	});

	sql = `SELECT num_this_week FROM goalScores
				WHERE goal_id = ?
				AND track_score_id = (SELECT track_score_id FROM trackScores
										WHERE track_id = (SELECT track_id FROM goals 
															WHERE goal_id = ?)
										AND week_id = (SELECT week_id FROM weeklyScore
														WHERE username = ?
														AND date_start = ?))`;


	var output;
	output = JSON.parse('{}');
	output.x = [];
	output.y = [];


	for (var i = 0; i < dates.length; i++) {
		db.run(sql, [goalId, goalId, username, dates[i].date_start], (res) => {
			if(res.error) {
				throw res.error;
			}

			output.x.push(dates[i].date_start);
			output.y.push(res[0].num_this_week);
		});

	}



	db.close();
	return output;
}

function getTrackFromGoal(goalId) {
	db.connect(dir);

	let sql = `SELECT track_id FROM goals
				WHERE goal_id = ?`;

	var output;

	db.run(sql, [goalId], (res) => {
		if(res.error) {
			throw res.error;
		}
		output = res[0].track_id;
	});

	db.close();
	return output;
}

function newGoal(goalId, trackId, name, weight, desc, maxNum){
	console.log("lol nope");
}

function avgTrackScore(username, trackID) {
	db.connect(dir); 

	let sql = `SELECT week_id FROM weeklyScore
				WHERE username = ?`;

	var weeks;
	var numWeeks;

	db.run(sql, [username], (res) => {
		if(run.error) {
			throw run.error;
		}
		weeks = res;
		numWeeks = res.length;
	});

	sql = `SELECT track_score FROM trackScores
			WHERE week_id = ?
			AND track_id = ?`;

	var totalScore = 0;

	for (var i=0; i<numWeeks; i++) {
		db.run(sql, [weeks[i].week_id, trackID], (res) => {
			if(res.error) {
				throw res.error;
			}
			totalScore += res[0].track_score;
		});
	}

	var output = Math.round(totalScore/numWeeks);

	return output;
}



module.exports.addUser = addUser;
module.exports.userInDB = userInDB;
module.exports.getAllUsers = getAllUsers;
module.exports.getTracks = getTracks;
module.exports.getTrackNames = getTrackNames;
module.exports.getGoal = getGoal;
module.exports.getGoalsForTrack = getGoalsForTrack;
module.exports.getWeeklyScore = getWeeklyScore;
module.exports.getTrackScore = getTrackScore;
module.exports.getGoalScore = getGoalScore;
module.exports.setWeeklyScore = setWeeklyScore;
module.exports.updateGoalScore = updateGoalScore;
module.exports.updateUserScore = updateUserScore;
module.exports.getUser = getUser;
module.exports.getTrackFromGoal = getTrackFromGoal;
module.exports.getGoalHist = getGoalHist;
module.exports.avgTrackScore = avgTrackScore;