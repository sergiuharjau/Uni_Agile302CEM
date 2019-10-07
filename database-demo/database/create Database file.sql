PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: data
DROP TABLE IF EXISTS data;

CREATE TABLE data (
    sensorName   VARCHAR (32) NOT NULL
                              CONSTRAINT FK_Sensors_data REFERENCES sensors (sensorName),
    value        VARCHAR (8)  NOT NULL ON CONFLICT ROLLBACK,
    dateRecorded VARCHAR (32) NOT NULL,
    dateCreated  DATETIME     DEFAULT (CURRENT_TIMESTAMP),
    PRIMARY KEY (
        sensorName,
        dateRecorded
    )
);


-- Table: sensors
DROP TABLE IF EXISTS sensors;

CREATE TABLE sensors (
    sensorName VARCHAR (32) UNIQUE
                            CONSTRAINT PK_sensors PRIMARY KEY
                            NOT NULL,
    type       VARCHAR (16) NOT NULL,
    location                NOT NULL,
    dateAdded  DATETIME     DEFAULT (CURRENT_TIMESTAMP) 
);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
