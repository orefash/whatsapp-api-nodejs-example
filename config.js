
const INSTANCE_URL = 'https://api.maytapi.com/api';
const PRODUCT_ID = '65f6c2b3-5a45-4c38-804b-64b5d6286e4a';
const PHONE_ID = '3553';
const API_TOKEN = 'f6a87644-defa-4e72-b2ad-e8ebd39c81c8';

const PAYSTACK_KEY = 'pk_test_232f010e41b15a3b9175d42d2e1eda3b4a317bd0';


if (!PRODUCT_ID || !PHONE_ID || !API_TOKEN) throw Error('You need to change PRODUCT_ID, PHONE_ID and API_KEY values in app.js file.');



module.exports = {
    INSTANCE_URL: INSTANCE_URL,
    PRODUCT_ID: PRODUCT_ID,
    PHONE_ID: PHONE_ID,
    API_TOKEN: API_TOKEN,
    PAYSTACK_KEY: PAYSTACK_KEY
}