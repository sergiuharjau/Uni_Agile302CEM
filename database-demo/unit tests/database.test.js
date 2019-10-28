'use strict'

const fs = require('fs')
const readline = require('readline')

const Database = require("../modules/Database").database
const dataPath = './database/data.sql'

const exec = require("../modules/execute")

describe('register()', () => {
    this.db

    beforeAll(async() => {
        this.db = await new Database()
        await insertFakeData(this.db)
    });

	test('user can select all their data', async done => {
        expect.assertions(1)
        const data = await this.db.getAllSensorData('test')
        expect(data.length).toBe(1000)
        done()
    })

    test('user can only get data within subscribed dates', async done => {
        expect.assertions(1)
        const data = await this.db.getAllSensorData('test2')
        expect(data.length).toBe(15)
        done()
    })

    test('database can insert a new record', async done => {
        expect.assertions(1)
        let output = await exec.sh("python3 /home/pi/Documents/AgilePlaceholder/capturing_test.py")
        expect(output).toBe("Passed.\n")
        done()
    })

    test('database can select the latest reading', async done => {
        expect.assertions(2)
        const data = await this.db.latestReading('test')
        expect(data.length).toBe(1)
        expect(data[0].dateRecorded).toBe('2019-08-10 01:23:04')
        done()
    })

    test('database select range - start date after end date', async done => {
        expect.assertions(1)

        const startDate = new Date()
        const endDate = new Date(new Date()- 120000000) 
        
        await expect(this.db.getRangeData('test',startDate,endDate)).rejects.toEqual( Error('Start date must be before end date'))
        done()
    })

    test('database select range - retrieve data for a specified date', async done => {
        expect.assertions(1)

        const startDate = new Date(2019,7,1,0,0,0,0)
        const endDate = new Date(2019,7,2,0,0,0,0)
        const data = await this.db.getRangeData('test',startDate,endDate)
        await expect(data.length).toEqual(7)
        done()
    })
})

async function insertFakeData(db) {
    const fileStream = fs.createReadStream(dataPath);
    
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    const testing = true;

    for await (const line of rl) {
        await db.insertData(line, testing)
    }
}
