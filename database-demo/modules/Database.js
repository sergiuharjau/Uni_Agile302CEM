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
			const sql = `SELECT s.sensorName
							, s.location
							, d.value
							, d.dateRecorded 
						FROM data d
							INNER JOIN sensors s on s.sensorName = d.sensorName;`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async insertData(line, testing = false) {
		try {
			if (testing === false) throw new Error("This is for testing only.")
			const sql = line;
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async latestReading() {
		try {
			const sql = `SELECT s.sensorName
							, s.location
							, d.value
							, d.dateRecorded 
						FROM data d
							INNER JOIN sensors s on s.sensorName = d.sensorName
						ORDER BY d.dateCreated Desc,d.ROWID ASC LIMIT 1;`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async getRangeData(startDate, endDate) {
		try {
			const searchStartDate = await getDateFormat(startDate)
			const searchEndDate= await getDateFormat(endDate)
			const sql = `SELECT s.sensorName
							, s.location
							, d.value
							, d.dateRecorded
						FROM data d,
							INNER JOIN sensors s on s.sensorName = d.sensorName
						WHERE d.dateRecorded BETWEEN '${searchStartDate}' AND '${searchEndDate}';`
									console.log(sql)
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async getTodaysData() {
		try {
			const sql = `SELECT s.sensorName 
							, s.location
							, d.value
							, d.dateRecorded 
						FROM data d
							INNER JOIN sensors s on s.sensorName = d.sensorName
						WHERE DATE(d.dateRecorded) = DATE('now');`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	async getStatistics(sensorName, startDate, endDate) {
		try {
			const searchStartDate = await getDateFormat(startDate)
			const searchEndDate= await getDateFormat(endDate)
			const sql = `SELECT s.sensorName
							, s.location
							, MIN(d.value)
							, AVG(d.value)
							, MAX(d.value)
						FROM data d
							INNER JOIN sensors s on s.sensorName = d.sensorName
						WHERE (${sensorName} IS NULL OR s.sensorName = ${sensorName})
							AND ((${searchStartDate} IS NULL OR ${searchEndDate} IS NULL) OR d.dateRecorded BETWEEN ${searchStartDate} AND ${searchEndDate})
						GROUP BY s.sensorName;`
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

}

async function getDateFormat(date){
	new Date().getMonth()
	const year = date.getFullYear()
	const month = await formatDatePart(date.getMonth())
	const day = await formatDatePart(date.getDate())

	const hour = await formatDatePart(date.getHours())
	const minutes = await formatDatePart(date.getMinutes())
	const seconds = await formatDatePart(date.getSeconds())

	return year+'-'+month+'-'+day+' '+hour+':'+minutes+':'+seconds
}

async function formatDatePart(component){
	return component.toString().padStart(2,'0')
}