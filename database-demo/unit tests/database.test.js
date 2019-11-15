'use strict'

const fs = require('fs')
const readline = require('readline')

const Database = require("../modules/Database").database
const dataPath = './database/data.sql'
const databasePath = './database/smart_home.db'

const exec = require("../modules/execute")

describe('Database', () => {
    beforeAll(async() => {
        this.db = await new Database()
        await insertFakeData(this.db)
    });

    describe('Instantiation', () => {
        test('Database class can be instantiated', async done => {
            expect.assertions(0)
            try {
                const DatabaseInstance = await new Database(databasePath)
                done()
            } catch(err) {
                done.fail('Database could not be instantiated correctly')
            } finally {
                done()
            }
        })
    })

    describe('getAllSensorData()', () => {
        test('Error is thrown if username is null', async done => {
            expect.assertions(1)
            const userName = null
            await expect(this.db.getAllSensorData(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is blank', async done => {
            expect.assertions(1)
            const userName = ''
            await expect(this.db.getAllSensorData(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is not a string', async done => {
            expect.assertions(1)
            const userName = 123
            await expect(this.db.getAllSensorData(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

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
        test('Error is thrown if username is null', async done => {
            expect.assertions(1)
            const userName = null
            await expect(this.db.latestReading(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is blank', async done => {
            expect.assertions(1)
            const userName = ''
            await expect(this.db.latestReading(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is not a string', async done => {
            expect.assertions(1)
            const userName = 123
            await expect(this.db.latestReading(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

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
        test('Error is thrown if username is null', async done => {
            expect.assertions(1)
            const userName = null
            const startDate = new Date(2019,7,1,0,0,0,0)
            const endDate = new Date(2019,7,2,0,0,0,0)
            await expect(this.db.getRangeData(userName,startDate,endDate)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is blank', async done => {
            expect.assertions(1)
            const userName = ''
            const startDate = new Date(2019,7,1,0,0,0,0)
            const endDate = new Date(2019,7,2,0,0,0,0)
            await expect(this.db.getRangeData(userName,startDate,endDate)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is not a string', async done => {
            expect.assertions(1)
            const userName = 123
            const startDate = new Date(2019,7,1,0,0,0,0)
            const endDate = new Date(2019,7,2,0,0,0,0)
            await expect(this.db.getRangeData(userName,startDate,endDate)).rejects.toEqual(Error('Please provide a username'))
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

    describe('insertData()', () => {
        test('database can insert a new record', async done => {
            expect.assertions(1)
            let output = await exec.sh("python3 /home/pi/Downloads/AgilePlaceholder/capturing_test.py")
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
        test('Error is thrown if username is null', async done => {
            expect.assertions(1)
            const userName = null
            await expect(this.db.getTodaysData(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is blank', async done => {
            expect.assertions(1)
            const userName = ''
            await expect(this.db.getTodaysData(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is not a string', async done => {
            expect.assertions(1)
            const userName = 123
            await expect(this.db.getTodaysData(userName)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('database returns 0 where there is no data today', async done => {
            expect.assertions(1)
            const userName = 'test'
            const data = await this.db.getTodaysData(userName)
            await expect(data.length).toEqual(0)
            done()
        })
    })
    
    describe('getStatistics()', () => {
        test('Error is thrown if username is null', async done => {
            expect.assertions(1)
            const userName = null
            const sensorName = 'temp1'
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = new Date(2020,1,1,0,0,0)
            await expect(this.db.getStatistics(userName,sensorName,startDate,endDate)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is blank', async done => {
            expect.assertions(1)
            const userName = ''
            const sensorName = 'temp1'
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = new Date(2020,1,1,0,0,0)
            await expect(this.db.getStatistics(userName,sensorName,startDate,endDate)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if username is not a string', async done => {
            expect.assertions(1)
            const userName = 123
            const sensorName = 'temp1'
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = new Date(2020,1,1,0,0,0)
            await expect(this.db.getStatistics(userName,sensorName,startDate,endDate)).rejects.toEqual(Error('Please provide a username'))
            done()
        })

        test('Error is thrown if startDate is not a date', async done => {
            expect.assertions(1)
            const userName = 'test'
            const sensorName = 'temp1'
            const startDate = '123'
            const endDate = new Date(2019,12,31,23,59,59)
            await expect(this.db.getStatistics(userName,sensorName,startDate,endDate)).rejects.toEqual(Error('Please provide a valid start date'))
            done()
        })

        test('Error is thrown if endDate is not a date', async done => {
            expect.assertions(1)
            const userName = 'test'
            const sensorName = 'temp1'
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = '123'
            await expect(this.db.getStatistics(userName,sensorName,startDate,endDate)).rejects.toEqual(Error('Please provide a valid end date') )
            done()
        })

        test('Error is thrown if endDate is before startDate', async done => {
            expect.assertions(1)
            const userName = 'test'
            const sensorName = 'temp1'
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = new Date(2018,1,1,0,0,0)
            await expect(this.db.getStatistics(userName,sensorName,startDate,endDate)).rejects.toEqual(Error('Please provide an endDate that is after the startDate'))
            done()
        })

        test('No data returned if sensorName does not exist', async done => {
            expect.assertions(1)
            const userName = 'test'
            const sensorName = 'fakeName'
            const startDate = new Date(2019,1,1,0,0,0)
            const endDate = new Date(2020,1,1,0,0,0)
            const data = await this.db.getStatistics(userName,sensorName,startDate,endDate)
            expect(data.length).toBe(0)
            done()
        })

        test('Valid data returned when no dates are provided', async done => {
            expect.assertions(6)
            const userName = 'test'
            const sensorName = 'temp1'
            const startDate = null
            const endDate = null
            const data = await this.db.getStatistics(userName,sensorName,startDate,endDate)
            expect(data.length).toBe(1)
            expect(data[0].sensorName).toBe('temp1')
            expect(data[0].location).toBe('Kitchen')
            expect(data[0].minValue).toBe(1)
            expect(data[0].averageValue).toBe(14.72)
            expect(data[0].maxValue).toBe(30)
            done()
        })

        test('Valid data returned when no optional parameters are provided', async done => {
            expect.assertions(16)
            const userName = 'test'
            const sensorName = null
            const startDate = null
            const endDate = null
            const data = await this.db.getStatistics(userName,sensorName,startDate,endDate)
            expect(data.length).toBe(3)
            expect(data[0].sensorName).toBe('temp1')
            expect(data[0].location).toBe('Kitchen')
            expect(data[0].minValue).toBe(1)
            expect(data[0].averageValue).toBe(14.72)
            expect(data[0].maxValue).toBe(30)

            expect(data[1].sensorName).toBe('temp2')
            expect(data[1].location).toBe('Lounge')
            expect(data[1].minValue).toBe(1)
            expect(data[1].averageValue).toBe(14.44)
            expect(data[1].maxValue).toBe(30)

            expect(data[2].sensorName).toBe('temp3')
            expect(data[2].location).toBe('Master Bedroom')
            expect(data[2].minValue).toBe(1)
            expect(data[2].averageValue).toBe(15.78)
            expect(data[2].maxValue).toBe(30)
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