
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

    item = item.toLowerCase();

    var selected =  our_menu.filter(function(menu) {
        return menu.item.toLowerCase() == item || menu.code.toLowerCase() == item;
    });

    // console.log("selected item: ", selected[0]);

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

async function verify_order(text){

    let orders =  text.split(',');
    console.log("Orders: ", orders);

    let ver_orders = [];
        
    for(var i=0; i< orders.length; i++){

        let order = orders[i].trim();
        // console.log("Order: ", order);

       	let order_obj = [];
        let order_item = order.split(" ");
                
                
        // console.log("order item: ", order_item);
        if(order_item.length >= 2){

            var p1 = order_item[0].trim();
            var p2 = order_item[1].trim();

            if(order_item.length>2){

                // console.log("TEst split if > 2: ", order.split(p1) );
              p2 = order.split(p1)[1].trim();
            }
            

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

            console.log("Selected: ", selected);

            if(selected.length>0){
                let sl = selected[0];
                sl.quantity = quantity;
                ver_orders.push(sl);       
                        

            }

        }
    }


    return ver_orders;
}

async function show_home(conversation) {
    let session = await get_session(conversation);

    if(session){

        let body = {
            message: await get_menu(session.uname),
            type: 'text' 
        };
    
        console.log("After body in get name: ", body);
        body.to_number = conversation;
        await send_message(body);

    }else{

        init_session(conversation);
        let body = { message: "Welcome to our restaurant. What is your name?", type: 'text' };

		console.log("In init: ",body);
		
		body.to_number = conversation;
		await send_message(body);

    }
}

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
        
            let v_orders = await verify_order(text);

            console.log("Verified Orders: ", v_orders);

            if(v_orders.length>0){
                text = "You selected;\n\n";

                for(var i=0; i<v_orders.length; i++){
                    // console.log("Vd: ",v_orders[]);
                    await add_item(v_orders[i], session.oid);
                    text += ` ${v_orders[i].quantity} X ${v_orders[i].item} - N${v_orders[i].price * v_orders[i].quantity}\n\n`;
                }

                text += "Is your order list correct? Type *Yes* to add to your cart and *No* to retake the order. To return to the main menu type 0";

                var query = `update user_session set c_step = 'CHECK_ENTRY' where pid= '${conversation}' `;
        
                tdb.run(query);
            }else{
                text = "Didn't get your order correctly, please retake your order";
            }
        
        
            let body = {
            	message: text,
            	type: 'text' 
            };
        
            console.log("After body: ", body);
            
            body.to_number = conversation;
            await send_message(body);
        
        }else if(step === 'CHECK_ENTRY'){

            let choice = text.toLowerCase();
            let oid = session.oid;

            switch (choice) {

                case 'yes':
                case 'y':

                    var query = `update order_items set status = 'set' where status= 'check' `;
                    tdb.run(query);

                    

                    break;
                case 'no':
                case 'n':
        
        
                    break;
                default:
                    text = "Please type *Yes* to add to your cart and *No* to retake the order. To return to the main menu type 0";

                    let body = {
                        message: text,
                        type: 'text' 
                    };
                
                    console.log("After body: ", body);
                    
                    body.to_number = conversation;
                    await send_message(body);


            }

        }


    }else{
        

        console.log("session: not found ");
        init_session(conversation);
        let body = { message: "Welcome to our restaurant. What is your name?", type: 'text' };

		console.log("In init: ",body);
		
		body.to_number = conversation;
		await send_message(body);
    }
    
}


module.exports = {
	
    build_food_menu: build_food_menu,
    get_menu: get_menu,
    handle_msgs: handle_msgs,
    verify_order: verify_order,
    show_home: show_home
}