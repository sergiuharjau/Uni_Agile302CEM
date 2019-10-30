'use strict'
const sqlite = require('sqlite-async')
const fs = require('fs')
const readline = require('readline')
const dataFile = './database/createDbFile.sql'

class database {
	constructor(dbName=':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName);
			if (dbName === ':memory:') {
				this.db = await createDatabaseStructure(this.db)
			}
			return this
		})()
	}

	async getAllSensorData(userName) {
		if (userName === null || userName === '' || typeof userName !== 'string') throw new Error('Please provide a username')
		const sql = `SELECT se.sensorName
					, se.location
					, d.value
					, d.dateRecorded 
				FROM data d
					INNER JOIN sensors se on se.sensorName = d.sensorName
					INNER JOIN subscriptions su on su.sensorName = se.sensorName
					INNER JOIN users u on u.userName = su.userName
				WHERE u.userName = '${userName}'
					AND d.dateRecorded BETWEEN su.EFFECT_FROM_DATE AND EFFECT_TO_DATE;`
					return await this.db.all(sql)
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

	async latestReading(userName) {
		if (userName === null || userName === '' || typeof userName !== 'string') throw new Error('Please provide a username')
		const sql = `SELECT se.sensorName
						, se.location
						, d.value
						, d.dateRecorded 
					FROM data d
						INNER JOIN sensors se on se.sensorName = d.sensorName
						INNER JOIN subscriptions su on su.sensorName = se.sensorName
						INNER JOIN users u on u.userName = su.userName
					WHERE u.userName = '${userName}'
						AND d.dateRecorded BETWEEN su.EFFECT_FROM_DATE AND EFFECT_TO_DATE
					ORDER BY d.dateCreated Desc,d.ROWID ASC LIMIT 1;`
		return await this.db.all(sql)
	}

	async getRangeData(userName, startDate, endDate) {
		if (userName === null || userName === '' || typeof userName !== 'string') throw new Error('Please provide a username')
		if (endDate < startDate) throw new Error('Start date must be before end date')
		const searchStartDate = await getDateFormat(startDate)
		const searchEndDate= await getDateFormat(endDate)
		const sql = `SELECT se.sensorName
						, se.location
						, d.value
						, d.dateRecorded 
					FROM data d
						INNER JOIN sensors se on se.sensorName = d.sensorName
						INNER JOIN subscriptions su on su.sensorName = se.sensorName
						INNER JOIN users u on u.userName = su.userName
					WHERE u.userName = '${userName}'
						AND d.dateRecorded BETWEEN su.EFFECT_FROM_DATE AND EFFECT_TO_DATE
						AND d.dateRecorded BETWEEN '${searchStartDate}' AND '${searchEndDate}';`
		return await this.db.all(sql)
	}

	async getTodaysData(userName) {
		if (userName === null || userName === '' || typeof userName !== 'string') throw new Error('Please provide a username')
		const sql = `SELECT se.sensorName
					, se.location
					, d.value
					, d.dateRecorded 
				FROM data d
					INNER JOIN sensors se on se.sensorName = d.sensorName
					INNER JOIN subscriptions su on su.sensorName = se.sensorName
					INNER JOIN users u on u.userName = su.userName
				WHERE u.userName = '${userName}'
					AND d.dateRecorded BETWEEN su.EFFECT_FROM_DATE AND EFFECT_TO_DATE
					AND DATE(d.dateRecorded) = DATE('now');`
		return await this.db.all(sql)
	}

	async getStatistics(userName, sensorName, startDate, endDate) {
		if (userName === null || userName === '' || typeof userName !== 'string') throw new Error('Please provide a username')
		/*
		Check using Object.prototype was found at the following site
		Title: How to check whether an object is a date?
		Author: Alexander Abakumov
		Date Accessed: 29th October 2019
		URL: https://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
		*/
		var searchStartDate = null
		var searchEndDate = null
		if (Object.prototype.toString.call(startDate) === '[object Date]') {
			searchStartDate = await getDateFormat(startDate)
		} else if(startDate !== null) {
			throw new Error('Please provide a valid start date')
		}

		if (Object.prototype.toString.call(endDate) === '[object Date]'  ) {
			searchEndDate = await getDateFormat(endDate)
		} else if (startDate !== null) {
			throw new Error('Please provide a valid end date')
		}

		if (endDate < startDate) throw new Error('Please provide an endDate that is after the startDate')


		
		const sql = `SELECT se.sensorName
						, se.location
						, ROUND(MIN(d.value),2) minValue
						, ROUND(AVG(d.value),2) averageValue
						, ROUND(MAX(d.value),2) maxValue
					FROM data d
						INNER JOIN sensors se on se.sensorName = d.sensorName
						INNER JOIN subscriptions su on su.sensorName = se.sensorName
						INNER JOIN users u on u.userName = su.userName
					WHERE u.userName = '${userName}'
						AND d.dateRecorded BETWEEN su.EFFECT_FROM_DATE AND su.EFFECT_TO_DATE
						AND ('${sensorName}' IS NULL OR se.sensorName = '${sensorName}')
						AND (('${searchStartDate}' = 'null' OR '${searchEndDate}' = 'null') OR d.dateRecorded BETWEEN '${searchStartDate}' AND '${searchEndDate}')
					GROUP BY se.sensorName;`
		return await this.db.all(sql)
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

async function createDatabaseStructure(db) {
    const fileStream = fs.createReadStream(dataFile);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
	});
	
    for await (const line of rl) {
        await db.all(line)
	}

	return db
}

module.exports = {
	database
}