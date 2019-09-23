'use strict';

const Pusher = require('pusher');
const cloudinary = require('cloudinary');
const AWS = require('aws-sdk');
const moment = require('moment');

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_APP_KEY,
    secret: process.env.PUSHER_APP_SECRET,
    cluster: process.env.PUSHER_APP_CLUSTER,
    useTLS: true
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
};

module.exports.getImages = async () => {
    try {
        const dynamoDbQueryParams = {
            TableName: process.env.DYNAMODB_TABLE,
            ExpressionAttributeValues: {
                ":d": moment().format('L')
            },
            ExpressionAttributeNames: {
                "#d": "date"
            },
            KeyConditionExpression: '#d = :d',
            ScanIndexForward: false,
            Limit: 10
        };

        const { Items } = await dynamoDb.query(dynamoDbQueryParams).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(Items),
        };
    } catch (err) {
        return errorResponse(err);
    }
};

module.exports.addImage = async (event) => {
    try {
        const {image, frame} = JSON.parse(event.body);

        const uploadResult = await cloudinary.v2.uploader.upload(image);

        const date = moment();

        const item = {
            date: date.format('L'),
            time: date.format('HH:mm:ss'),
            frame: frame,
            ...uploadResult
        };

        const dynamoDbPutParams = {
            TableName: process.env.DYNAMODB_TABLE,
            Item: item
        };

        await dynamoDb.put(dynamoDbPutParams).promise();

        pusher.trigger('gallery', 'upload', {
            image: item,
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(item),
        }
    } catch (err) {
        return errorResponse(err);
    }
};

const errorResponse = (error) => {

    console.log(error, 'error');

    return {
        statusCode: 500,
        headers,
        body: error.message,
    };
};
