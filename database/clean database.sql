create table activities
(
    ID          int  not null
        constraint activities_pk
            primary key,
    name        TEXT not null,
    description TEXT not null,
    record_unit TEXT not null,
    "order"     int default 1 not null
);

create unique index activities_ID_uindex
    on activities (ID);

create table leaderboards
(
    ID          int
        constraint leaderboards_pk
            primary key,
    activity_ID int
        references activities
);

create table users
(
    ID       int  not null
        constraint users_pk
            primary key,
    username TEXT not null,
    password TEXT not null,
    salt     TEXT not null,
    email    TEXT not null,
    DOB      int  not null
);

create table records
(
    ID          int
        constraint records_pk
            primary key,
    user_ID     int  not null
        references users,
    activity_ID int  not null
        references activities,
    record      REAL not null
);

create table leaderboard_entries
(
    leaderboard_ID int
        references leaderboards,
    user_ID        int
        references users,
    record_ID      int
        references records,
    constraint leaderboard_entries_pk
        primary key (leaderboard_ID, user_ID, record_ID)
);

create unique index users_ID_uindex
    on users (ID);

create unique index users_email_uindex
    on users (email);

create unique index users_salt_uindex
    on users (salt);

create unique index users_username_uindex
    on users (username);


