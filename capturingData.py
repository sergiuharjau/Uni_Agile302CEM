import paho.mqtt.client as mqtt #import the client1
import sqlite3
import json
from sqlite3 import Error
global db 

def on_message(client, userdata, msg):
    print(msg.topic+":\n"+str(msg.payload.decode()))
    insertIntoSQL(msg.payload)

def insertIntoSQL(jsonString):

    try:
        sql =  '''INSERT INTO data(sensorName, value, dateRecorded)
                  VALUES(?,?,?); '''
        cur = db.cursor()
        data = json.loads(jsonString.decode())
        tuple = (data["label"], data["value"], data["time"])
        cur.execute(sql, tuple)
        cur.execute("COMMIT;")
    except Error as e:
        print("Sql error: ", e)

def runMQTT():
    broker_address = "mqtt.coventry.ac.uk" 
    broker_port = 8883

    user = "302CEM"
    password = "n3fXXFZrjw"

    client = mqtt.Client() #create new instance

    client.username_pw_set(user, password)

    client.on_message = on_message
    client.tls_set("/home/pi/Downloads/mqtt.crt")
    client.connect(broker_address, broker_port) #connect to broker

    client.subscribe("302CEM/placeholder/message/#")

    client.loop_forever()

if __name__ == "__main__":
    global db
    try:
        db = sqlite3.connect("../../Documents/database-demo/database/smart_home.db")
        print("No errors.")
    except Error as e:
        raise(e)

    runMQTT() # this runs forever
