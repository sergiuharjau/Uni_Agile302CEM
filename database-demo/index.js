const Database = require("./modules/Database")

async function getAllData () {
  var database = await new Database();
  await database.getAllSensorData().then( data => {
    data.forEach(element => {
      console.log(element._id.getTimestamp())
      console.log(element.sensorName)
      console.log(element.location)
      console.log(element.value.toString())
      console.log(element.dateRecorded)
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

getAllData()
insertSensorData()