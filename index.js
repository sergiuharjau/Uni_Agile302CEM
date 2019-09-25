const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/smarthome";

async function test() {
  return MongoClient.connect(url,{ useUnifiedTopology: true, useNewUrlParser: true })
    .then(function(db) {
      var dbo = db.db("smarthome");
      return dbo.collection("data")
              .find({})
              .toArray()
              .then(db.close())
    })
}
  
test().then( data => {
  data.forEach(element => {
    console.log(element._id.getTimestamp())
    console.log(element.sensorName)
    console.log(element.location)
    console.log(element.value.toString())
    console.log(element.dateRecorded)
    console.log("*******************************")
  });
})