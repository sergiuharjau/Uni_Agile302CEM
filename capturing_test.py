import unittest 
import capturingData
import paho.mqtt.client as mqtt #import the client1

def publish(message):

    broker_address = "mqtt.coventry.ac.uk" 
    broker_port = 8883

    user = "302CEM"
    password = "n3fXXFZrjw"

    client = mqtt.Client() #create new instance

    client.username_pw_set(user, password)

    client.tls_set("/home/pi/Downloads/mqtt.crt")
    client.connect(broker_address, broker_port) #connect to broker

    client.publish("302CEM/placeholders/sensors/test", message)

if __name__ == "__main__":
    message = '{"label": "temp1", "value":"data", "time":"currently"}'
    publish(message)
    #at this point nodeJS checks if db is populated