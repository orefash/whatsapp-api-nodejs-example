
const ngrok = require('ngrok');
const rp = require('request-promise-native');

var { INSTANCE_URL, PRODUCT_ID, PHONE_ID, API_TOKEN } = require("./config.js");


async function createOid() {
	var month,
	  day,
	  hr,
	  min,
	  sec,
	  d = new Date();
	month = ("0" + (d.getUTCMonth() + 1)).slice(-2);
	day = ("0" + d.getUTCDate()).slice(-2);
	hr = ("0" + d.getUTCHours()).slice(-2);
	min = ("0" + d.getUTCMinutes()).slice(-2);
	sec = ("0" + d.getUTCSeconds()).slice(-2);
	var oid = d.getUTCFullYear() + month + day + hr + min + sec;
	return oid;
}


async function setup_network() {
	let public_url = await ngrok.connect(3000);
	console.log(`Public Url:${public_url}`);
	let webhook_url = `${public_url}/webhook`;
	let url = `${INSTANCE_URL}/${PRODUCT_ID}/setWebhook`;
	let response = await rp(url, {
		method: 'POST',
		body: { webhook: webhook_url },
		headers: {
			'x-maytapi-key': API_TOKEN,
			'Content-Type': 'application/json',
		},
		json: true,
	});
	console.log(`Response: ${JSON.stringify(response)}`);
}


async function send_message(body) {
	console.log(`Request Body:${JSON.stringify(body)}`);
	let url = `${INSTANCE_URL}/${PRODUCT_ID}/${PHONE_ID}/sendMessage`;
	let response = await rp(url, {
		method: 'post',
		json: true,
		body,
		headers: {
			'Content-Type': 'application/json',
			'x-maytapi-key': API_TOKEN,
		},
	});
	console.log(`Response: ${JSON.stringify(response)}`);
	return response;
}

module.exports = {
    send_message: send_message,
    createOid: createOid,
    setup_network: setup_network
}