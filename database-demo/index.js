const Database = require("./modules/database")

async function getAllData () {
	var database = await new Database('./database/smart_home.db')
	var data = await database.getAllSensorData()
	await PrintData(data)
}

async function PrintData (JSONData) {
	JSONData.forEach(element => {
		console.log("Sensor Name is " + element.sensorName)
		console.log("Location: " + element.location)
		console.log("Value recorded: " + element.value.toString())
		console.log("Date value was recorded: " + element.dateRecorded)
		console.log("Date row created in sqlite: " + element.dateCreated)
		console.log("*******************************")
	});
}

getAllData();


//Comment out the appropriate lines
