const Database = require("./modules/Database")

async function getAllData () {
  var database = await new Database();
  database.getAllSensorData().then( data => {
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

getAllData()