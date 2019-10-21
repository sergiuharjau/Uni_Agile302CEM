import capturingData
import paho.mqtt.client as mqtt #import the client1
import subprocess
import time
import sqlite3
import threading

def publish(message):

    time.sleep(0.5)

    broker_address = "mqtt.coventry.ac.uk" 
    broker_port = 8883

    user = "302CEM"
    password = "n3fXXFZrjw"

    client = mqtt.Client() #create new instance

    client.username_pw_set(user, password)

    client.tls_set("../../../mqtt.crt")
    client.connect(broker_address, broker_port) #connect to broker

    print("Just published")
    client.publish("302CEM/placeholder/sensors/test", message)

def createDB():

    cur = capturingData.Capturing.db.cursor()

    sensors =  '''CREATE TABLE sensors (sensorName VARCHAR (32) UNIQUE 
    CONSTRAINT PK_sensors PRIMARY KEY NOT NULL, 
    type VARCHAR (16) NOT NULL, location VARCHAR (16) NOT NULL, 
    dateAdded DATETIME DEFAULT (CURRENT_TIMESTAMP));'''
    cur.execute(sensors)

    data = '''CREATE TABLE data (sensorName   VARCHAR (32) NOT NULL 
    CONSTRAINT FK_Sensors_data REFERENCES sensors (sensorName), 
    value VARCHAR (8)  NOT NULL ON CONFLICT ROLLBACK, 
    dateRecorded VARCHAR (32) NOT NULL, dateCreated DATETIME DEFAULT 
    (CURRENT_TIMESTAMP), PRIMARY KEY(sensorName, dateRecorded));'''
    cur.execute(data)

def insertFakeData():

    cur = capturingData.Capturing.db.cursor()

    for line in open("database-demo/database/data.sql", "r").readlines():
        cur.execute(line)
        cur.execute("COMMIT;")

def readAllData():

    cur = capturingData.Capturing.db.cursor()

    cur.execute('''SELECT s.sensorName
							, s.location
							, d.value
							, d.dateRecorded 
						FROM data d
							INNER JOIN sensors s on s.sensorName = d.sensorName;''')

    rows = cur.fetchall()

    return rows  

if __name__ == "__main__":

    capturingData.Capturing.db = sqlite3.connect(":memory:", check_same_thread=False) 

    createDB() 
    insertFakeData() #fills with empty fake data for 1000 rows

    print(len(readAllData()))
    print(id(capturingData.Capturing.db))

    message = '{"label": "temp1", "value":"data", "time":"currently"}'
    t = threading.Thread(target=publish, args=(message,))
    t.start()

    #time.sleep(0.3)
    capturingData.Capturing.cur = capturingData.Capturing.db.cursor() 

    capturingData.Capturing.runMQTT(testing=True)

    time.sleep(0.5)
    t.join()

    time.sleep(0.1)
    
    print(len(readAllData()))

    #time.sleep(3)
    

    #at this point nodeJS checks if db is populated