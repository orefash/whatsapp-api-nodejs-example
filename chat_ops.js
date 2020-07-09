
var {  tdb, init_session, get_session, add_item } = require("./dbhelper.js");
var { send_message } = require("./utils.js");


const our_menu = [
	{item: "White Rice", price: 200, code: "WR"},
	{item: "Fried Rice", price: 300, code: "FR"},
	{item: "Jollof Rice", price: 250, code: "JR"},
	{item: "Fried Chicken", price: 200, code: "FC"},
	{item: "BBQ Chicken", price: 200, code: "BBQ"}
];


async function check_item(item){

    console.log("Check item");

    var selected =  our_menu.filter(function(menu) {
        return menu.item == item || menu.code == item;
    });

    console.log("selected item: ", selected[0]);

    return selected;

}


async function get_menu(name) {

	let menu_string = `
		Hello ${name}, Here is a list of things you can do;\n\n 1. Order Food\n 2. Give Feedback
	`;

	console.log("Main menu: ", menu_string);

	return menu_string;
}


async function build_food_menu(conversation){

	let menu_string = "Our Menu\n";

	for(var i=1; i<=our_menu.length; i++){
		let food = our_menu[i-1];
		menu_string += `${food.item}   N${food.price}   (Code: ${food.code})\n`;
	}

	menu_string += "\nTo select items from the menu, reply with quantity and item code/name, separate each with a comma(,)\n\n";
	menu_string += "*E.g. 1 Jollof Rice, 2 FC, 1 BBQ Chicken*";

	console.log("Food:\n", menu_string);

	var query = `update user_session set c_step = 'Place_Order' where pid= '${conversation}' `;

	await tdb.run(query);

	return menu_string;
};



async function handle_msgs(conversation, text){

	// console.log(`hey there: ${conversation}, ${text}`);
    // let body = {};
    
    let session = await get_session(conversation);

    if(session){
        console.log("session found: %j",session);

        let step = session.c_step;

        if(step === 'GET_NAME'){

            console.log("in get name");
        
            var query = `update user_session set c_step = 'none', uname = '${text}' where pid= '${conversation}' `;
            tdb.run(query);
        
            let body = {
            	message: await get_menu(text),
                type: 'text' 
    		};
        
    		console.log("After body in get name: ", body);
    		body.to_number = conversation;
    		await send_message(body);
                
        } else if(step === 'Place_Order'){

            console.log("in place order");
        
            var query = `update user_session set c_step = 'none' where pid= '${conversation}' `;
        
            tdb.run(query);
        
            let order_string = [];
        
            let orders =  text.split(',');
            console.log("Orders: ", orders);

            let valid_cnt = 0;
        
            for(var i=0; i< orders.length; i++){

                let order = orders[i].trim();
                console.log("Order: ", order);

            	let order_obj = [];
                let order_item = order.split(" ");
               
                
                
                console.log("order item: ", order_item);
            	if(order_item.length >= 2){


                    if(order_item.length>2){

                        for(var i=2; i<order_item.length; i++){
                            order_item[1]+=" "+order_item[i];
                        }
                        // order_item.length = 2;
                    }
        
                    var p1 = order_item[0].trim();
                    var p2 = order_item[1].trim();

                    let quantity = 0;
                    let item = "";

                    if(isNaN(p1)){
                        if(isNaN(p2)){
                            continue;
                        }else{
                            quantity = p2;
                            item = p1;
                        }

                    }else{
                        quantity = p1;
                        item = p2;
                    }

                    let selected = await check_item(item);

                    if(selected){
                        selected.quantity = quantity;
                        selected.oid = session.oid;

                        add_item(selected);
                        valid_cnt++;
                        

                    }else{
                        // continue;
                    }



            	}
            }
        
        
            let body = {
            	message: text,
            	type: 'text' 
            };
        
            console.log("After body: ", body);
            
            body.to_number = conversation;
            await send_message(body);
        
        }


    }else{
        

        console.log("session: not found ");
        init_session(conversation);
        let body = { message: "Welcome to our restaurant. What is your name?", type: 'text' };

		console.log("In init: ",body);
		
		body.to_number = conversation;
		await send_message(body);
    }
    

   

	// db.all(
	// 	`SELECT * FROM user_session WHERE pid = '${conversation}' `, 
	// 	async function (err, rows) {
			
	// 		console.log("Rows: ", rows[0]);

	// 		if(rows.length>0){

	// 			let step = rows[0].c_step;


	// 			if(step === 'GET_NAME'){

	// 				console.log("in get name");

	// 				var query = `update user_session set c_step = 'none' where pid= '${conversation}' `;

	// 				db.run(query);

	// 				let body = {
	// 					message: 
	// 					await get_menu(text),
	// 					type: 'text' 
	// 				};

	// 				console.log("After body: ", body);
	// 				// cb(body);
	// 				body.to_number = conversation;
	// 				await send_message(body);
		
	// 			}

	// 		}else if(step === 'Place_Order'){

	// 			console.log("in place order");

	// 				var query = `update user_session set c_step = 'none' where pid= '${conversation}' `;

	// 				db.run(query);

	// 				let order_string = [];

	// 				let orders =  text.split(",");

	// 				for(order in orders){
	// 					let order_obj = {};
	// 					let order_item = order.split(" ", 2);
	// 					if(order_item.length == 2){

	// 					}
	// 				}


	// 				let body = {
	// 					message: 
	// 					await get_menu(text),
	// 					type: 'text' 
	// 				};

	// 				console.log("After body: ", body);
	// 				// cb(body);
	// 				body.to_number = conversation;
	// 				await send_message(body);

	// 		}else{
	// 			console.log("Init");
				
	// 			let oid = await createOid();
	// 			console.log("OID: ", oid);
	// 			 db.run(`insert into user_session values ('${conversation}', 'GET_NAME', '', '${oid}', 1)`);
	// 			let body = { message: "Welcome to our restaurant. What is your name?", type: 'text' };

	// 			console.log("In init: ",body);
	// 			// cb(body);
	// 			body.to_number = conversation;
	// 			await send_message(body);
	// 		}

			

	// 	}
	// );

}


module.exports = {
	
    build_food_menu: build_food_menu,
    get_menu: get_menu,
    handle_msgs: handle_msgs
}