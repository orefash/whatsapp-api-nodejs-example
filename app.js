const express = require('express');
const bodyParser = require('body-parser');


var { get_sessions, clean_db, reset_convo, del_up_table, check_order, fetch_orders, fetch_order_info, update_order } = require("./dbhelper.js");
var { build_food_menu, show_home, handle_msgs, verify_order } = require("./chat_ops.js");
var { setup_network, send_message } = require("./utils.js");
var { init_checkout, finish_order } = require("./checkout_handler.js");
var { PAYSTACK_KEY } = require("./config.js");


const app = express();

const port = 3000;


app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// app.engine("html", require("ejs").renderFile);
app.set('view engine', 'ejs');

app.get('/', (req, res) => res.send('Hello World!'));



app.post('/update-order', async (req, res) => {

	await update_order(req.body);

	res.status(200).json({
        message: 'Order Updated'
    });

});


app.post('/finish-order', async (req, res) => {

	console.log("In finsih order req: ",req.body);

	// var oid = req.body.oid;
	// var address = req.body.address;
	// var email = req.body.email;
	// var phone = req.body.phone;
	// var name = req.body.name;

	await finish_order(req.body);

	res.status(200).json({
        message: 'Order COmpleted'
    });

});

app.get('/checkout/:oid', async (req, res) => {

	var oid = req.params.oid;
	var orders = await fetch_orders(oid);

	var order_info = await fetch_order_info(oid);

	var resp = {
		orders: orders,
		info: order_info,
		PKEY: PAYSTACK_KEY
	};

	console.log("Resp: ", resp);

	res.render('checkout', resp);

});



app.get('/test', async (req, res) => {

	let data = await get_sessions();
	console.log("DB get: ", data);

	res.render('payment.html');

});

app.get("/formatable", async (request, response) => {
	
	clean_db();
  
	response.send(JSON.stringify("DOne"));
});


app.get("/drop_table", async (request, response) => {
	
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

			case 'checkout':

				let result = await init_checkout(conversation);

				if(result != "none"){
					let bu = req.protocol+"://"+req.headers.host;
					var checkout_url = bu+"/checkout/"+result;

					var msg = `
						By clicking on the link below, you will be redirected to our secure payment portal.

						${checkout_url}

						Reply *home* - for the Main Menu
					
					`;

					body = {
						message: msg,
						type: 'text' 
					};
	
					body.to_number = conversation;
					await send_message(body);

				}else{

					var msg = `
						There are no items in your cart. 

						Reply *home* - for the Main Menu or *Menu* to Place an order					
					`;

					body = {
						message: msg,
						type: 'text' 
					};
	
					body.to_number = conversation;
					await send_message(body);

				}

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



  


