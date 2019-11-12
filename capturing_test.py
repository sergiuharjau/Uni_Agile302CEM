import capturingData
import paho.mqtt.client as mqtt #import the client1
import time
import sqlite3
import threading


def publish(message):

    broker_address = "mqtt.coventry.ac.uk" 
    broker_port = 8883

    user = "302CEM"
    password = "n3fXXFZrjw"

    client = mqtt.Client() #create new instance

    client.username_pw_set(user, password)

    client.tls_set("/home/pi/Downloads/mqtt.crt")
    client.connect(broker_address, broker_port) #connect to broker

    time.sleep(0.13)
    client.publish("302CEM/placeholder/sensors/test", message)

def createDB():

    cur = capturingData.Capturing.db.cursor()

    for line in open("/home/pi/Documents/AgilePlaceholder/database-demo/database/createDbFile.sql", "r").readlines():
        cur.execute(line)

def insertFakeData():

    cur = capturingData.Capturing.db.cursor()
    i = 0
    for line in open("/home/pi/Documents/AgilePlaceholder/database-demo/database/data.sql", "r").readlines():
        cur.execute(line)
        cur.execute("COMMIT;")

        if i > 10:
            break
        i += 1

def readAllData():

    cur = capturingData.Capturing.db.cursor()

    cur.execute('''SELECT se.sensorName
							, se.location
							, d.value
							, d.dateRecorded 
						FROM data d
							INNER JOIN sensors se on se.sensorName = d.sensorName
							INNER JOIN subscriptions su on su.sensorName = se.sensorName
							INNER JOIN users u on u.userName = su.userName;''')

    rows = cur.fetchall()

    return rows  

if __name__ == "__main__":

    capturingData.Capturing.db = sqlite3.connect(":memory:", check_same_thread=False) 

    createDB() 
    insertFakeData() #fills with empty fake data for 1 row

    message = '{"label": "temp2", "value":"data", "time":"2019-08-10 01:22:04"}'
    t = threading.Thread(target=publish, args=(message,))
    t.start()

    capturingData.Capturing.runMQTT(testing=True)

    t.join()
    if len(readAllData()) == 5:
        print("Passed.")
    else:
        print("Invalid.")

#at this point nodeJS checks if db is populated
