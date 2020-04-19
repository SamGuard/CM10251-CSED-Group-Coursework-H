class Activity
{
	/**
	 * Creates the activity, defaulting the ID as -1 to allow the activity to be created to
	 * without an ID (i.e. when creating a new activity not yet in the DB).
	 *
	 * @param name
	 * @param description
	 * @param record_unit
	 * @param ascending
	 * @param ID
	 */
	constructor(name, description, record_unit, ascending, ID = -1) {
		this.ID = ID;
		this.name = name;
		this.description = description;
		this.record_unit = record_unit;
		this.ascending = ascending;
	}
}

module.exports.Activity = Activity;