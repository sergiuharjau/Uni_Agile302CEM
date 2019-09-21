#Placeholder Programming Documentation

##Operating System

Server will be a Raspberry Pi 3, running Ubuntu 18.04.3 LTS.

Micro-controllers will be ESP32's, transmitting data over MQTT.

Client will be able to access a web page to log in and view data.

##Data Stream

Data will be sent from ESP32 onto MQTT broker in a JSON format at least every 1s. 

Example: 
<pre>
{l: "temperature"            #Label for incoming data
 t: "2019-09-21/13:48:14.3"  #Timestamp accurate to 0.1 seconds
 d: "34C"                    #Actual data 
 #Happy to add more attributes as needed
}
</pre>

This will then be saved onto the local filesystem of the Raspberry PI, in an SQL-lite database. 

At this point our web service can pull the data from SQL-Lite and display it to our client. 

This approach should yield a comfortable 5s refresh rate.

In the future we might interface MQTT into the Web Page with web sockets to receive real time data.