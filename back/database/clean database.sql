-- we don't know how to generate root <with-no-name> (class Root) :(
create table activities
(
	ID INTEGER not null
		constraint activities_pk
			primary key autoincrement,
	name TEXT not null,
	description TEXT not null,
	record_unit TEXT not null,
	ascending int default 1 not null
);

create unique index activities_ID_uindex
	on activities (ID);

create table leaderboards
(
	ID integer not null
		constraint leaderboards_pk
			primary key autoincrement,
	activity_ID int
		references activities,
	name text
);

create unique index leaderboards_name_uindex
	on leaderboards (name);

create table users
(
	ID integer not null
		constraint users_pk
			primary key autoincrement,
	username TEXT not null,
	password TEXT not null,
	salt TEXT not null,
	email TEXT not null,
	DOB int not null
);

create table activityRecords
(
	ID integer not null
		constraint records_pk
			primary key autoincrement,
	user_ID int not null
		references users,
	activity_ID int not null
		references activities,
	record REAL not null,
	date int
);

create table leaderboard_entries
(
	leaderboard_ID int
		references leaderboards,
	record_ID int
		references activityRecords,
	constraint leaderboard_entries_pk
		primary key (leaderboard_ID, record_ID)
);

create unique index users_ID_uindex
	on users (ID);

create unique index users_email_uindex
	on users (email);

create unique index users_salt_uindex
	on users (salt);

create unique index users_username_uindex
	on users (username);

