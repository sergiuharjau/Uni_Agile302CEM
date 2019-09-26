'use strict'

module.exports = class User {
	constructor() {
		return (async() => {
      this.MongoClient = require('mongodb').MongoClient;
      this.url = "mongodb://localhost:27017/smarthome";
			return this
		})()
	}

	async getAllSensorData() {
    return this.MongoClient.connect(this.url,{ useUnifiedTopology: true, useNewUrlParser: true })
      .then(function(db) {
        var dbo = db.db("smarthome");
        return dbo.collection("data")
                .find({})
                .toArray()
                .then(db.close())
      })
  }
}