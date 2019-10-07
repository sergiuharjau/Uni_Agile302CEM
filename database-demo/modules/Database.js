'use strict'
const sqlite = require('sqlite-async')

module.exports = class database {
	constructor(dbName=':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName);
			if (dbName === ':memory:') {
				console.log("data in memory")
				//TODO: Insert script to create database from scratch
				const sql = 'PRAGMA foreign_keys = off; BEGIN TRANSACTION;  DROP TABLE IF EXISTS data;  CREATE TABLE data (     sensorName   VARCHAR (32) NOT NULL,     location     VARCHAR (32) NOT NULL ON CONFLICT ROLLBACK,     value        VARCHAR (8)  NOT NULL ON CONFLICT ROLLBACK,     dateRecorded DATETIME     NOT NULL ON CONFLICT ROLLBACK,     dateCreated  DATETIME     DEFAULT (CURRENT_TIMESTAMP),     PRIMARY KEY (         sensorName,         dateRecorded     ) );   COMMIT TRANSACTION; PRAGMA foreign_keys = on; '
				await this.db.run(sql)
			}
			return this
		})()
	}

	async getAllSensorData() {
		try {
			var sql = `SELECT * FROM data;`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async insertSensorData(JSON) {
		return this.getConnection()
			.then(function(db) {
				var dbo = db.db("smarthome");
				dbo.collection("data").insertOne(JSON, function(err, res) {
					if (err) throw err;
					console.log("1 document inserted");
					db.close();
				});
			})
	}
}