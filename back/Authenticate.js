const database = require("./database/Database").Database;
const sha256 = require("sha256");

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
}

module.exports.Authenticate = Authenticate;