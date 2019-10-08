'use strict'

const fs = require('fs');
const readline = require('readline');

const Database = require("../modules/Database")
const dataPath = './database/data.sql'

describe('register()', () => {
    this.db

    beforeAll(async() => {
        this.db = await new Database()
        await insertFakeData(this.db)
    });

	test('database can select all data', async done => {
        expect.assertions(1)
        const data = await this.db.getAllSensorData()
        expect(data.length).toBe(1000)
        done()
	})

})

async function insertFakeData(db) {
    const fileStream = fs.createReadStream(dataPath);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    for await (const line of rl) {
        // console.log(line)
        await db.insertData(line)
    }
}