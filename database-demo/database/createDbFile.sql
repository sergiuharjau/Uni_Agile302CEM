CREATE TABLE users (username VARCHAR  PRIMARY KEY NOT NULL,dateCreated DATETIME DEFAULT (CURRENT_TIMESTAMP) NOT NULL,password VARCHAR NOT NULL);
CREATE TABLE sensors (sensorName VARCHAR (32) UNIQUE CONSTRAINT PK_sensors PRIMARY KEY NOT NULL,type VARCHAR (16) NOT NULL, location   VARCHAR (16) NOT NULL,dateAdded  DATETIME DEFAULT (CURRENT_TIMESTAMP));
CREATE TABLE subscriptions (_id INTEGER  CONSTRAINT PK_subscriptions PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR  CONSTRAINT FK_subscriptions_users REFERENCES users (username) ON UPDATE CASCADE NOT NULL, sensorName VARCHAR  REFERENCES sensors (sensorName) ON UPDATE CASCADE NOT NULL,EFFECT_FROM_DATE DATETIME NOT NULL DEFAULT (CURRENT_TIMESTAMP),EFFECT_TO_DATE DATETIME);
CREATE TABLE data (sensorName VARCHAR (32) NOT NULL CONSTRAINT FK_Sensors_data REFERENCES sensors (sensorName),value INTEGER  NOT NULL ON CONFLICT ROLLBACK, dateRecorded VARCHAR (32) NOT NULL, dateCreated  DATETIME     DEFAULT (CURRENT_TIMESTAMP),PRIMARY KEY (sensorName,dateRecorded));