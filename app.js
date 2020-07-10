const express = require('express');
const bodyParser = require('body-parser');


var { get_sessions, clean_db, reset_convo, del_up_table, check_order } = require("./dbhelper.js");
var { build_food_menu, show_home, handle_msgs, verify_order } = require("./chat_ops.js");
var { setup_network, send_message } = require("./utils.js");

const app = express();

const port = 3000;


app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.engine("html", require("ejs").renderFile);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/payment', (req, res) => {

	res.render('payment.html');

});


app.get('/test', async (req, res) => {

	let data = await get_sessions();
	console.log("DB get: ", data);

	res.send('payment.html');

});

app.get("/formatable", (request, response) => {
	
	clean_db();
  
	response.send(JSON.stringify("DOne"));
});


app.get("/drop_table", (request, response) => {
	
	del_up_table();
  
	response.send(JSON.stringify("DOne"));
});



app.get("/vtest", (request, response) => {
	
	var txt = "1 Jollof Rice, 2 BBQ Chicken, 1 FR";
	verify_order(txt);
  
	response.send(JSON.stringify(txt));
});


app.post('/sendMessage', async (req, res) => {
	let { message, to_number } = req.body;
	let response = await send_message({ type: 'text', message, to_number });
	res.send({ response });
});

app.post('/webhook', async (req, res) => {
	
	res.sendStatus(200);

	// console.log("Req body: ", req.body);
	let { message, conversation } = req.body;
	let { type, text, fromMe } = message;
	if (fromMe) return;
	if (type === 'text') {
		let body = {};
		let lower = text.toLowerCase();
		switch (lower) {
			case 'reset':
				await reset_convo();

				
				body = {
					message: 'Chat Reset',
					type: 'text' 
				};

				body.to_number = conversation;
				await send_message(body);

				break;

			case '0':
			case 'home':
				await show_home(conversation);

				break;

			case '1':
			case 'menu':
			case 'order food':
			case 'order':

				await check_order(conversation);

				body = {
					message: await build_food_menu(conversation),
					type: 'text' 
				};

				body.to_number = conversation;
				await send_message(body);

				break;
			default:
				body = { message: 'Echo - ' + text, type: 'text' };

				try {
					await handle_msgs(conversation, text);					
					
				} catch (error) {
					console.log("In cse: ", error);
				}
		}


	} else {
		console.log(`Ignored Message Type:${type}`);
	}
});


app.listen(port, async () => {
	console.log(`Example app listening at http://localhost:${port}`);
	await setup_network();
});



  


