
const INSTANCE_URL = 'https://api.maytapi.com/api';
const PRODUCT_ID = '64aaa03f-a134-4d72-afca-50f56ac30b8d';
const PHONE_ID = '3411';
const API_TOKEN = '531e4977-d699-4161-839e-c6afc0ddfd80';


if (!PRODUCT_ID || !PHONE_ID || !API_TOKEN) throw Error('You need to change PRODUCT_ID, PHONE_ID and API_KEY values in app.js file.');



module.exports = {
    INSTANCE_URL: INSTANCE_URL,
    PRODUCT_ID: PRODUCT_ID,
    PHONE_ID: PHONE_ID,
    API_TOKEN: API_TOKEN
}