import paho.mqtt.client as mqtt #import the client1
import sqlite3
import json
from sqlite3 import Error
import time 

class Capturing():
    
    db = None 

    def __init__(self):
        pass

    @staticmethod
    def on_message(client, userdata, msg):
        #print(msg.topic+":\n"+str(msg.payload.decode()))
        Capturing.insertIntoSQL(msg.payload)
   
    @staticmethod
    def insertIntoSQL(jsonString):

        try:
            sql =  '''INSERT INTO data(sensorName, value, dateRecorded)
                        VALUES(?,?,?); '''

            cur = Capturing.db.cursor()

            data = json.loads(jsonString.decode())
            tuple = (data["label"], data["value"], data["time"])
            cur.execute(sql, tuple)
            cur.execute("COMMIT;")

        except Error as e:
            print("Sql error: ", e)

    @staticmethod
    def runMQTT(testing=None):
        broker_address = "mqtt.coventry.ac.uk" 
        broker_port = 8883

        user = "302CEM"
        password = "n3fXXFZrjw"

        client = mqtt.Client() #create new instance

        client.username_pw_set(user, password)

        client.on_message = Capturing.on_message
        client.tls_set("/home/pi/Downloads/mqtt.crt")
        client.connect(broker_address, broker_port) #connect to broker

        client.subscribe("302CEM/placeholder/sensors/#")

        client.loop_start()
        
        startTime = time.time()
        if testing:
            #print("Listening")
            while time.time() - startTime < 0.15:
                pass
            client.loop_stop()

if __name__ == "__main__":

    try:
        Capturing.db = sqlite3.connect("/home/pi/Documents/AgilePlaceholder/database-demo/database/smart_home.db")
        print("No errors.")
    except Error as e:
        raise(e)

    Capturing.runMQTT() # this runs forever
