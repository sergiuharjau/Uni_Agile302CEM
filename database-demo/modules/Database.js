'use strict'
const sqlite = require('sqlite-async')
const fs = require('fs')
const readline = require('readline')
const dataFile = './database/createDbFile.sql'

class database {
	/**
	 * Instantiates an instance of the database class
	 * @param {String} dbName The name of the database to use. By default this will use the in memory database to prevent any misuse
	 */
	constructor(dbName=':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName);
			if (dbName === ':memory:') {
				this.db = await createDatabaseStructure(this.db)
			}
			return this
		})()
	}

	/**
	 * Get all of the sensor data that the user had access to at anytime
	 * @param {String} userName The username of the logged in user
	 */
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

	/**
	 * Executest the sql statemet provided. This is purely for testing purposes and shouldn't be used in the real world
	 * @param {String} line SQL string to execute
	 * @param {boolean} testing Indicates whether this is for testing or not
	 */
	async insertData(line, testing = false) {
		try {
			if (testing === false) throw new Error("This is for testing only.")
			const sql = line;
			return await this.db.all(sql)
		} catch (err){
			return err
		}
	}

	/**
	 * Retrieves the latest reading for the passed in user
	 * @param {String} userName The username of the logged in user
	 */
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

	/**
	 * Return all of the data for the specified user within the date period specified
	 * @param {String} userName Username of the passed in user
	 * @param {Date} startDate The start date for the range 
	 * @param {Date} endDate The end date for the range
	 */
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

	/**
	 * Retrieves all of todays data for the specified user which they were subscribed to
	 * @param {String} userName The username of the logged in user
	 */
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

	/**
	 * Return Statistical data such and min, average and max based on the passed in parameters.
	 * If username is the only one passed in, then all sensors that the user has previously been subscribed to
	 * will be returned. 
	 * Note: that both startDate and endDate must be provided to limit the time period
	 * @param {String} userName The username of the logged in user
	 * @param {String} sensorName Optional: The name of a specific sensor to retrieve. If left blank then all of the sensors are retrieved 
	 * @param {Date} startDate Optional: The start date of the range required. If startDate or endDate are null then all data will be returned regardles of time period 
	 * @param {Date} endDate Optionall: The end date of the range requested. If startDate or endDate are null then all data will be returned regardles of time period
	 */
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
						AND ('${sensorName}' = 'null' OR se.sensorName = '${sensorName}')
						AND (('${searchStartDate}' = 'null' OR '${searchEndDate}' = 'null') OR d.dateRecorded BETWEEN '${searchStartDate}' AND '${searchEndDate}')
					GROUP BY se.sensorName;`
		return await this.db.all(sql)
	}
}

/**
 * Takes in a date object and returns the appropriate format for the database
 * @private
 * @param {Date} date And date object
 * @returns {String} Return a string with the date in the correct database formay
 */
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

/**
 * Converts the string from a single digits to 2 digits
 * For example if 1 is passed in, then we return 01
 * If 11 is provided then we return 11.
 * The reason for this is that the database requires data to all be 2 characters
 * in length hence the adding of a 0 in a single digit instance
 * @private
 * @param {String} component
 * @returns {String} Returns a digit string
 */
async function formatDatePart(component){
	return component.toString().padStart(2,'0')
}

/**
 * Created the appropriate database structure using the provided database object
 * This is used for the in memory database testing.
 * DO NOT use for production purposes as it may alter the database
 * @param {database} db Passes in a database object
 */
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