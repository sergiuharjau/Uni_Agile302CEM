#include <MPU6050_tockn.h>
#include <Wire.h>
#include <ArduinoJson.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <DHT_U.h>
#include <DHT.h>
#include <NewPing.h>

MPU6050 mpu6050(Wire);

long timer = 0;

const char* ssid = "Kane";
const char* password = "hello123";
const char* mqttServer = "mqtt.coventry.ac.uk";
const int mqttPort = 8883;
const char* mqttUser = "302CEM";
const char* mqttPassword = "n3fXXFZrjw";
 
const char* ca_cert = \
"-----BEGIN CERTIFICATE-----\n" \
"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\n" \
"-----END CERTIFICATE-----\n" ;
 
#define TRIGGER_PIN 33
#define ECHO_PIN 5
#define MAX_DISTANCE 400

//Servo
#include <ESP32Servo.h>//include library code
//******************************************************
Servo servo2;  //create servo object to control a servo
const int servoPin = 14;//servo motor connected to ESP32 GPIO 14 pin
//******************************************************

WiFiClientSecure espClient;
PubSubClient client(espClient);

float finalDistance = 0;
unsigned int count = 0;

int openDoor = 0 ;

unsigned int distance;

DHT_Unified dht(4, DHT11);


// NewPing setup of pins and maximum distance
NewPing sonar(TRIGGER_PIN, ECHO_PIN, MAX_DISTANCE); 
 

void setup() {
  Serial.begin(9600);
  dht.begin();

  servo2.attach(servoPin); 

  Wire.begin();
  mpu6050.begin();
  mpu6050.calcGyroOffsets(true);

  sensor_t sensor;

  dht.temperature().getSensor(&sensor); 
  dht.humidity().getSensor(&sensor); 


  WiFi.begin(ssid, password);
 
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println("Connected to the WiFi network");
  espClient.setCACert(ca_cert);
  client.setServer(mqttServer, mqttPort);
 
  while (!client.connected()) {
    Serial.println("Connecting to MQTT...");
    if (client.connect("sellers3", mqttUser, mqttPassword )) {
      Serial.println("connected"); 
    } else {
      Serial.print("failed with state ");
      Serial.print(client.state());
      delay(2000);
    }
  }

}

/*
* PIR sensor tester
*/
int ledPin = 21; // choose the pin for the LED
int inputPin = 34; // choose the input pin (for PIR sensor)
int pirState = LOW; // we start, assuming no motion detected
int val = 0; // variable for reading the pin status
void motionSensor (){
    val = digitalRead(inputPin); // read input value
    if (val == HIGH) { // check if the input is HIGH
        digitalWrite(ledPin, HIGH); // turn LED ON
        if (pirState == LOW) {
            // we have just turned on
            Serial.println("Motion detected!");
            client.publish("302CEM/placeholder/sensors/motion", "1");
            // We only want to print on the output change, not state
            pirState = HIGH;
        }
    } else {
    digitalWrite(ledPin, LOW); // turn LED OFF
        if (pirState == HIGH){
            // we have just turned of
            Serial.println("Motion ended!");
            client.publish("302CEM/placeholder/sensors/motion", "0");
            // We only want to print on the output change, not state
        pirState = LOW;
        }
    }
}

void distanceSensor(){
    distance = sonar.ping_cm();
    Serial.print(distance);
    Serial.println("cm");
   
    if(count == 5 ){
        char output[5];
        dtostrf(finalDistance,1,2,output);
        client.publish("302CEM/placeholder/sensors/proximity", output);
        count = 0;
        finalDistance = 0;
    }
    else{
        count++;
        finalDistance += distance/5;
    }
}


void loop() {
  delay(200);

//  for (int pos = 0; pos <= 180; pos += 10) { //goes from 0 degrees to 180 degrees
//     // in steps of 1 degree
//     servo2.write(pos);              //tell servo to go to position in variable 'pos'
//     Serial.println(pos);            //prints degrees
//     delay(200);                       //waits 20ms for the servo to reach the position
//   }
//   for (int pos = 180; pos >= 0; pos -= 10) { // goes from 180 degrees to 0 degrees
//     servo2.write(pos);              //tell servo to go to position in variable 'pos'
//     Serial.println(pos);            //prints degrees
//     delay(200);                       //waits 20ms for the servo to reach the position
//   }

  sensors_event_t event;

  mpu6050.update();

  if(millis() - timer > 1000){
      motionSensor();
      distanceSensor();

      if (distance < 10 && openDoor == 0)
      {
        for (int pos = 0; pos <= 90; pos += 10) { //goes from 0 degrees to 180 degrees
          // in steps of 1 degree
          servo2.write(pos);              //tell servo to go to position in variable 'pos'
          Serial.println(pos);            //prints degrees
          delay(200);                       //waits 20ms for the servo to reach the position
        }
        Serial.print("We're open for business");
        openDoor = 1;
      }
      else if (distance > 10 && openDoor == 1)
      {
        openDoor = 0;
        for (int pos = 90; pos >= 0; pos -= 10) { //goes from 0 degrees to 180 degrees
          // in steps of 1 degree
          servo2.write(pos);              //tell servo to go to position in variable 'pos'
          Serial.println(pos);            //prints degrees
          delay(200);                       //waits 20ms for the servo to reach the position
        }
        Serial.print("Stay away.");
      }
    
    Serial.println("=======================================================");
    Serial.print("temp : ");Serial.println(mpu6050.getTemp());
    Serial.print("accX : ");Serial.print(mpu6050.getAccX());
    Serial.print("\taccY : ");Serial.print(mpu6050.getAccY());
    Serial.print("\taccZ : ");Serial.println(mpu6050.getAccZ());
  
    Serial.print("gyroX : ");Serial.print(mpu6050.getGyroX());
    Serial.print("\tgyroY : ");Serial.print(mpu6050.getGyroY());
    Serial.print("\tgyroZ : ");Serial.println(mpu6050.getGyroZ());
  
    Serial.print("accAngleX : ");Serial.print(mpu6050.getAccAngleX());
    Serial.print("\taccAngleY : ");Serial.println(mpu6050.getAccAngleY());
  
    Serial.print("gyroAngleX : ");Serial.print(mpu6050.getGyroAngleX());
    Serial.print("\tgyroAngleY : ");Serial.print(mpu6050.getGyroAngleY());
    Serial.print("\tgyroAngleZ : ");Serial.println(mpu6050.getGyroAngleZ());
    
    Serial.print("angleX : ");Serial.print(mpu6050.getAngleX());
    Serial.print("\tangleY : ");Serial.print(mpu6050.getAngleY());
    Serial.print("\tangleZ : ");Serial.println(mpu6050.getAngleZ());
    Serial.println("=======================================================\n");
    timer = millis();


    StaticJsonDocument<300> doc;

    dht.temperature().getEvent(&event); 

    if (! isnan(event.temperature))
    {
      doc["temp"] = event.temperature ;
      Serial.print("Temperature: "); Serial.println(event.temperature) ;
    }

    dht.humidity().getEvent(&event); 

    if (! isnan(event.relative_humidity))
    {
      doc["humid"] = event.relative_humidity ;
      Serial.print("Humidity: "); Serial.println(event.relative_humidity) ;
    }

    doc["x"]= mpu6050.getAngleX();
    doc["y"]= mpu6050.getAngleY();
    doc["z"]= mpu6050.getAngleZ();
    doc["ax"]= mpu6050.getAccX();
    doc["ay"]= mpu6050.getAccY();
    doc["az"]= mpu6050.getAccZ();
    doc["t"]= mpu6050.getTemp();

    String newVariable ;
    serializeJson(doc, newVariable);

    char realOutput[300];
    newVariable.toCharArray(realOutput, 300);

    Serial.println(realOutput);
    client.publish("302CEM/placeholder/sensors/gyro", realOutput);

  }

}