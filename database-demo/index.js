const Database = require("./modules/Database")

async function getAllData () {
	var database = await new Database();
	await database.getAllSensorData()
	.then( data => {
		data.forEach(element => {
		console.log("Date object created in Mongo: " + element._id.getTimestamp())
		console.log("Sensor Name is " + element.sensorName)
		console.log("Location: " + element.location)
		console.log("Value recorded: " + element.value.toString())
		console.log("Date value was recorded: " + element.dateRecorded)
		console.log("*******************************")
		});
	})
}

async function getDaysData(daysToReturn = 0) {
	var database = await new Database();
	await database.getDaysData(daysToReturn)
	.then( data => {
		data.forEach(element => {
		console.log("Date object created in Mongo: " + element._id.getTimestamp())
		console.log("Sensor Name is " + element.sensorName)
		console.log("Location: " + element.location)
		console.log("Value recorded: " + element.value.toString())
		console.log("Date value was recorded: " + element.dateRecorded)
		console.log("*******************************")
		});
	})
}

async function insertSensorData () {
	var database = await new Database();
	var exampleJSON = {
		sensorName: "temp-2",
		location: "Lounge",
		value: 16,
		dateRecorded: new Date()
	}
	await database.insertSensorData(exampleJSON)
}


//Comment out the appropriate lines
getAllData()
insertSensorData()
getDaysData(1)
getDaysData(0)