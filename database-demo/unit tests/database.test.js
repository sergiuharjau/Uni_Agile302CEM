'use strict'

const fs = require('fs')
const readline = require('readline')

const Database = require("../modules/Database").database
const dataPath = './database/data.sql'

const exec = require("../modules/execute")

describe('Database', () => {
    beforeAll(async() => {
        this.db = await new Database()
        await insertFakeData(this.db)
    });

    describe('getAllSensorData()', () => {
        test('user can select all their data', async done => {
            expect.assertions(1)
            const data = await this.db.getAllSensorData('test')
            expect(data.length).toBe(1000)
            done()
        })
    
        test('procedure will only get data within subscribed dates', async done => {
            expect.assertions(1)
            const data = await this.db.getAllSensorData('test2')
            expect(data.length).toBe(15)
            done()
        })
    })

    describe('latestReading()', () => {
        test('User can select the latest reading', async done => {
            expect.assertions(2)
            const data = await this.db.latestReading('test')
            expect(data.length).toBe(1)
            expect(data[0].dateRecorded).toBe('2019-08-10 01:23:04')
            done()
        })

        test('User who has never been subscribed returns 0', async done => {
            expect.assertions(1)
            const data = await this.db.latestReading('test3')
            expect(data.length).toBe(0)
            done()
        })
    })

	describe('getRangeData()', () => {
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

    describe('insertData()', () => {
        xtest('database can insert a new record', async done => {
            expect.assertions(1)
            let output = await exec.sh("python3 /home/pi/Documents/AgilePlaceholder/capturing_test.py")
            expect(output).toBe("Passed.\n")
            done()
        })

        test('database can insert a new record for testing purposes only', async done => {
            expect.assertions(1)
            const error = await this.db.insertData('test')
            await expect(error.message).toEqual('This is for testing only.')
            done()
        })
    })

    describe('getTodaysData()', () => {
        test('database returns 0 where there is no data today', async done => {
            expect.assertions(1)
            const data = await this.db.getTodaysData('test')
            await expect(data.length).toEqual(0)
            done()
        })
    })
    
    describe('getStatistics()', () => {
        test('database returns error if startDate is not a date', async done => {
            expect.assertions(1)
            try {
                const startDate = '123'
                const endDate = new Date(2019,12,31,23,59,59)
                await this.db.getStatistics('test','temp1',startDate,endDate)
                done.fail('test failed')
            } catch(err) {
                expect(err.message).toBe('Please provide a valid start date')
            } finally {
                done()
            }
        })

        test('database returns error if endDate is not a date', async done => {
            expect.assertions(1)
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = '123'
            await expect(this.db.getStatistics('test','temp1',startDate,endDate)).rejects.toEqual(Error('Please provide a valid end date') )
            done()
        })
        test('database returns error if endDate is before startDate', async done => {
            expect.assertions(1)
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = new Date(2018,1,1,0,0,0)
            await expect(this.db.getStatistics('test','temp1',startDate,endDate)).rejects.toEqual(Error('Please provide an endDate that is after the startDate'))
            done()
        })
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
