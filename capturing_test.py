import unittest 
import capturingData
import paho.mqtt.client as mqtt #import the client1
import subprocess
import time

def publish(message):

    broker_address = "mqtt.coventry.ac.uk" 
    broker_port = 8883

    user = "302CEM"
    password = "n3fXXFZrjw"

    client = mqtt.Client() #create new instance

    client.username_pw_set(user, password)

    client.tls_set("/home/pi/Downloads/mqtt.crt")
    client.connect(broker_address, broker_port) #connect to broker

    client.publish("302CEM/placeholder/sensors/test", message)

if __name__ == "__main__":

    proc = subprocess.Popen(['python3', 'capturingData.py'])

    message = '{"label": "temp1", "value":"data", "time":"currently"}'
    publish(message)
    time.sleep(3)
    
    proc.kill()
    #at this point nodeJS checks if db is populated