const database = require("./database/Database").Database;
const sha256 = require("sha256");
//List of accepted characters the user can use
const acceptedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'*+-=?^_`{|}~@.[]0123456789 "
let tokens = [];
const timeToLive = 86400000; //86400000ms is a day

/**
 * Returns a boolean indicating whether or not the given username and password match the records for a user.
 *
 * @param username
 * @param password
 * @returns {boolean}
 */
function userLoginDetails(username, password) {
	// If the user exists, create an instance of it to allow comparisons
	let dbUser = database.getUser(username);
	if(!dbUser){
		return false;
	}


	return dbUser.password === sha256(password + dbUser.salt);
}



//Checks if the string entered valid
function charCheck(string){
	let c;
	if(!string){
		return false;
	}
	for(let i = 0; i < string.length; i++){
		if(acceptedChars.includes(string.charAt(i)) === false){
			return false;
		}
	}
	return true;
}

function checkStrings(strings){
	for(let i = 0; i < strings.length; i++){
		if(charCheck(strings[i]) === false){
			return false;
		}
	}
	return true;
}

//Checks the username and password, return -1, 0 or 1. 1 means success 0 means incorrect characters and -1 means details are incorrect
function checkUser(username, password){
	if(charCheck(username) === false || charCheck(password) === false){
		return 0;
	}

	if(userLoginDetails(username, password)) {
		return 1;
	}

	return -1;
}

function checkToken(token){
	while(tokens.length > 0 && Date.now() - tokens[0].expire > timeToLive) {
		tokens.shift()
	}

	if(!token){
		return null;
	}

	for(var i = 0; i < tokens.length; i++){
		if(tokens[i].token.localeCompare(token) == 0){
			return tokens[i];
		}
	}

	return null;
}

function getToken(username){
	while(tokens.length > 0 && Date.now() - tokens[0].expire > timeToLive) {
		tokens.shift()
	}

	for(var i = 0; i < tokens.length; i++){
		if(tokens[i].username.localeCompare(username) == 0){
			return tokens[i].token;
		}
	}

	let newToken = sha256(username+(Date.now()+tokens.length*16).toString());
	tokens.push({"username": username, "token": newToken, "expire": Date.now() + timeToLive});
	return newToken;
}


module.exports.checkUser = checkUser;
module.exports.getToken = getToken;
module.exports.charCheck = charCheck;
module.exports.checkToken = checkToken;
module.exports.checkStrings = checkStrings;
