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
			var sql = `SELECT s.sensorName, s.location, d.value, d.dateRecorded FROM sensors s, data d WHERE d.sensorName = s.sensorName;`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async getHistoricData(daysToReturn) {
		try {
			var sql = `SELECT s.sensorName , s.location, d.value, d.dateRecorded FROM data d, sensors s WHERE s.sensorName = d.sensorName AND DATE(d.dateRecorded) BETWEEN DATE('now', '-${daysToReturn} days') and DATE('now')`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async getTodaysData() {
		try {
			var sql = `SELECT s.sensorName , s.location, d.value, d.dateRecorded FROM data d, sensors s WHERE s.sensorName = d.sensorName AND DATE(d.dateRecorded) = DATE('now')`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}
}