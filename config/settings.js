/* Author: Elias Kalapanidas */

'use strict';



const version = '0.1.1'; // change once here for all environments
/*
    Delivered Versions log

    0.1.0   implementation of very basic upload functionality with hard-coded (local) file storage
    0.2.0   integration with AWS S3 service, settings to select storage facility (local files or s3), download endpoint

    Planned Versions log

*/


const settings = {
    production: {
        environment: 'production',
        version: process.env.APP_VERSION || version,
        serverPort: process.env.PORT || 3030,
        logLevel: process.env.LOG_LEVEL || 'warn',
        storageEngine: process.env.STORAGE_ENGINE || 'file-system',     // one of 'file-system', 'aws-s3'
        serverId: process.env.DYNO || 'unspecified',
        S3BucketName: process.env.S3_BUCKET_NAME || 'sportimo-media',
        S3AccessKey: process.env.AWS_ACCESS_KEY_ID,
        S3SecretKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    development: {
        environment: 'development',
        version: process.env.APP_VERSION || version,
        serverPort: process.env.PORT || 3030,
        logLevel: process.env.LOG_LEVEL || 'debug',
        storageEngine: process.env.STORAGE_ENGINE || 'file-system',     // one of 'file-system', 'aws-s3'
        serverId: process.env.DYNO || 'unspecified',
        S3BucketName: process.env.S3_BUCKET_NAME || 'sportimo-media',
        S3AccessKey: process.env.AWS_ACCESS_KEY_ID,
        S3SecretKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    local: {
        environment: 'local',
        version: process.env.APP_VERSION || version,
        serverPort: process.env.PORT || 3030,
        logLevel: process.env.LOG_LEVEL || 'debug',
        storageEngine: process.env.STORAGE_ENGINE || 'file-system',     // one of 'file-system', 'aws-s3'
        serverId: process.env.DYNO || 'unspecified',
        S3BucketName: process.env.S3_BUCKET_NAME || 'sportimo-media',
        S3AccessKey: process.env.AWS_ACCESS_KEY_ID,
        S3SecretKey: process.env.AWS_SECRET_ACCESS_KEY
    }
};

const defaultEnvironment = 'local';
const selectedEnvironment = process.env.NODE_ENV || defaultEnvironment;

if (Object.keys(settings).indexOf(selectedEnvironment) == -1) {
    const errorMsg = `Environment not recognized: ${selectedEnvironment}. Aborting...`;
    //console.error(errorMsg);
    throw (new Error(errorMsg));
}

module.exports = settings[process.env.NODE_ENV || defaultEnvironment];