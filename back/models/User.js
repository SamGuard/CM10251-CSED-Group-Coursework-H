/**
 * The class to represent a user.
 */
class User {
	/**
	 * Create the user, populating with their data. The ID takes the
	 * default value of -1 to allow the user to be created without an ID.
	 *
	 * @param ID
	 * @param username
	 * @param password
	 * @param salt
	 * @param email
	 * @param DOB
	 */
	constructor(username, password, salt, email, DOB, ID = -1) {
		this.ID = ID;
		this.username = username;
		this.password = password;
		this.salt = salt;
		this.email = email;

		// Stored as unix time in milliseconds - modified by getters and setters
		if(typeof(DOB) == "object")
		{
			// Get the milliseconds if we have a Date() object
			this._DOB = DOB.getTime();
		}
		else
		{
			// Store the milliseconds otherwise.
			this._DOB = DOB;
		}
	}

	/**
	 * Returns the time Date object represented by the seconds stored in the object.
	 *
	 * @returns {Date}
	 * @constructor
	 */
	get DOB() {
		return new Date(this._DOB);
	}

	/**
	 * Sets the DOB to the number of milliseconds represented by the given Date object.
	 *
	 * @param date
	 * @constructor
	 */
	set DOB(date) {
		this._DOB = date.getTime();
	}

	/**
	 * Returns the *actual* milliseconds that the class stores.
	 * It's important that this method is used for DB access.
	 *
	 * @returns {number}
	 * @constructor
	 */
	DOBMilliseconds()
	{
		return this._DOB;
	}
}

module.exports.User = User;