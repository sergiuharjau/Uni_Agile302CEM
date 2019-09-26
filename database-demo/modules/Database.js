'use strict'

module.exports = class User {
	constructor() {
		return new Promise((resolve, reject) => {
			try {
				this.MongoClient = require('mongodb').MongoClient;
				this.url = "mongodb://localhost:27017/smarthome";
				resolve(this)
			} catch (err) {
				reject(err)
			}
		})
	}

	async getConnection() {
		return new Promise((resolve, reject) => {
			try {
				resolve(this.MongoClient.connect(this.url,{ useUnifiedTopology: true, useNewUrlParser: true }))
			} catch (error) {
				reject(error)
			}
		})
	}

	async getAllSensorData() {
		var db = await this.getConnection()
		var dbo = db.db("smarthome");
		return dbo.collection("data")
					.find({})
					.toArray()
					.then(db.close())
	}

	async getHistoricData(daysToReturn = 0) {
		var db = await this.getConnection()
		var dbo = db.db("smarthome");

		var startDate = new Date(new Date(new Date().setTime( new Date().getTime() - daysToReturn * 86400000 )).setHours(1,0,0,0));
		var endDate = new Date(new Date().setHours(24,59,59,999))

		return dbo.collection("data")
					.find({dateRecorded: {$gte: startDate, $lte: endDate}})
					.toArray()
					.then(db.close())
	}

	async insertSensorData(JSON) {
		return this.getConnection()
			.then(function(db) {
				var dbo = db.db("smarthome");
				dbo.collection("data").insertOne(JSON, function(err, res) {
					if (err) throw err;
					console.log("1 document inserted");
					db.close();
				});
			})
	}
}