const Database = require("./modules/database")
const databasePath = './database/smart_home.db'

async function getAllData () {
	var database = await new Database(databasePath)
	var data = await database.getAllSensorData()
	await PrintData(data)
}

async function getTodaysData () {
	var database = await new Database(databasePath)
	var data = await database.getTodaysData()
	await PrintData(data)
}

async function getDataRange (startDate,endDate) {
	var database = await new Database(databasePath)
	var data = await database.getRangeData(startDate,endDate)
	await PrintData(data)
}

async function latestReading () {
	var database = await new Database(databasePath)
	var data = await database.latestReading()
	await PrintData(data)
}

async function getStatistics () {
	var database = await new Database(databasePath)
	// var listOfSensors = "'temp2'"
	var listOfSensors = 'NULL'
	var data = await database.getStatistics(listOfSensors, 'NULL', 'NULL')
	console.log(data)
}

async function PrintData (JSONData) {
	JSONData.forEach(element => {
		console.log("Sensor Name is " + element.sensorName)
		console.log("Location: " + element.location)
		console.log("Value recorded: " + element.value.toString())
		console.log("Date value was recorded: " + element.dateRecorded)
		console.log("*******************************")
	});
}

// getAllData()

// getTodaysData()

// const date = new Date(2019,09,01,00,00,00,00)
// const todaysDate = new Date()
// getDataRange(date, todaysDate)

// latestReading();

getStatistics();
