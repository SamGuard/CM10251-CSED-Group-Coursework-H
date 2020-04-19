class Record
{
    /**
     * Creates a new instance of Record() with the given details, defaulting the ID to -1 for when creating a new entry in the DB.
     * @param userID
     * @param activityID
     * @param record
     * @param date
     * @param ID
     */
    constructor(userID, activityID, record, date, ID= - 1) {
        this.ID = ID;
        this.userID = userID;
        this.activityID = activityID;
        this.record = record;

        // Stored as unix time in milliseconds - modified by getters and setters
		if(typeof(date) == "object")
		{
			// Get the milliseconds if we have a Date() object
			this._date = date.getTime();
		}
		else
		{
			// Store the milliseconds otherwise.
			this._date = date;
		}
    }

    /**
     * Returns a Date() object based on the milliseconds stored in this object.
     * @returns {Date}
     */
    get date()
    {
        return new Date(this._date);
    }

    /**
     * Sets the this object's milliseconds to be that based off the Date() object passed.
     * @param date
     */
    set date(date)
    {
        this._date = date.getTime();
    }

    /**
     * Returns the actual milliseconds that represent this object's date.
     * @returns {number}
     */
    getDateMillis()
    {
        return this._date;
    }
}

module.exports.Record = Record;