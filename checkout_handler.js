var {  tdb, init_session, get_session, add_item, fetch_orders, set_order    } = require("./dbhelper.js");
var { send_message, createOid } = require("./utils.js");
var { show_home } = require("./chat_ops.js");

async function init_checkout(conversation) {

    let session = await get_session(conversation);

    if(session){
        console.log("session found: %j",session);
        var oid = session.oid;

        let orders = await fetch_orders(oid);

        if(orders.length > 0){

            return oid;


        }

    }

    return "none";

}

async function finish_order(params) {

    console.log("In finish Order");

    var oid = params.oid;
    var total = params.amount;

    await set_order(oid);

    let session = await tdb.get(`SELECT * FROM user_session WHERE oid = '${oid}' `);

    var pid = session.pid;
     
    var text = `Your payment of N${total} has been completed successfully 😋\n\n\ Your meal will be delivered shortly. Do enjoy your meal 🤗.`;

    var bd = {
        message: text,
        type: 'text' 
    };

    console.log("After body: ", bd);
    
    bd.to_number = pid;

    oid = await createOid();

    var query = `update user_session set c_step = 'none', oid = '${oid}' where pid= '${pid}' `;
        
    await tdb.run(query);

    await send_message(bd);

    await show_home(pid);

}

module.exports = {

    init_checkout: init_checkout,
    finish_order: finish_order

}