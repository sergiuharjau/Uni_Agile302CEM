# Placeholder Programming Documentation

## Operating System

Server will be a Raspberry Pi 3, running Raspbian.

Micro-controllers will be ESP32's, transmitting data over MQTT.

Client will be able to access a web page to log in and view data.

## Data Stream

Data will be sent from ESP32 onto an MQTT broker in JSON format at least every 1s. 

Example: 
<pre>
{
 l: "temperature"            #Label for incoming data
 t: "2019-09-21/13:48:14.3"  #Timestamp accurate to 0.1 seconds
 d: "34C"                    #Actual data 
 #Happy to add more attributes as needed
}
</pre>

This will then be saved onto the local filesystem of the Raspberry PI, in a MongoDB database. 

The data stored locally will be used for various data analysis and logging which we will serve to the user.

At the same time, the user can access the real time stream of data via MQTT over a websocket.

## Servo

The servo code is included in the Gyro. 
