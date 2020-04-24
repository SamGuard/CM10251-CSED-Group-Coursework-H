const database = require("./database/Database").Database;
const sha256 = require("sha256");
//List of accepted characters the user can use
const acceptedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'*+-=?^_`{|}~@.[]0123456789 "

class Authenticate {
	/**
	 * Returns a boolean indicating whether or not the given username and password match the records for a user.
	 *
	 * @param username
	 * @param password
	 * @returns {boolean}
	 */
	static userLoginDetails(username, password) {
		// If the user exists, create an instance of it to allow comparisons
		let dbUser = database.getUser(username);
		if(!dbUser){
			return false;
		}


		return dbUser.password === sha256(password + dbUser.salt);
	}



    //Checks if the string entered valid
	static charCheck(string){
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

    //Checks the username and password, return -1, 0 or 1. 1 means success 0 means incorrect characters and -1 means details are incorrect
	static checkUser(username, password){
		if(this.charCheck(username) === false || this.charCheck(password) === false){
			return 0;
		}

		if(this.userLoginDetails(username, password)) {
			console.log("Verified");
			return 1;
		}

		return -1;
	}
}

module.exports.Authenticate = Authenticate;