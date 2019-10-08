'use strict'
const sqlite = require('sqlite-async')

module.exports = class database {
	constructor(dbName=':memory:') {
		return (async() => {
			try {
				this.db = await sqlite.open(dbName);
				if (dbName === ':memory:') {
					console.log("data in memory")
					//TODO: Insert script to create database from scratch
					var sql = 'CREATE TABLE sensors (sensorName VARCHAR (32) UNIQUE CONSTRAINT PK_sensors PRIMARY KEY NOT NULL, type VARCHAR (16) NOT NULL, location VARCHAR (16) NOT NULL, dateAdded DATETIME DEFAULT (CURRENT_TIMESTAMP));'
					await this.db.run(sql)
					var sql = 'CREATE TABLE data (sensorName   VARCHAR (32) NOT NULL CONSTRAINT FK_Sensors_data REFERENCES sensors (sensorName), value VARCHAR (8)  NOT NULL ON CONFLICT ROLLBACK, dateRecorded VARCHAR (32) NOT NULL, dateCreated DATETIME DEFAULT (CURRENT_TIMESTAMP), PRIMARY KEY(sensorName, dateRecorded));'
					await this.db.run(sql)
				}
				return this
			} catch (error) {
				console.log(error)
			}
			
		})()
	}

	async getAllSensorData() {
		try {
			var sql = `SELECT s.sensorName, s.location, d.value, d.dateRecorded FROM sensors s, data d WHERE d.sensorName = s.sensorName`
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