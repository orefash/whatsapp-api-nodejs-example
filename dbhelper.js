
const fs = require("fs");
const dbFile = "./data/sqlite.db";
const exists = fs.existsSync(dbFile);
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(dbFile);

const util = require('util');
var { createOid } = require("./utils.js");




// if ./.data/sqlite.db does not exist, create it, otherwise print records to console
db.serialize(() => {
	if (!exists) {

	}else{
		console.log("New table created!");

		
		db.run(
			"CREATE TABLE IF NOT EXISTS c_orders (" +
			  "order_id varchar(30) NOT NULL," +
			  "pay_ref varchar(30)," +
			  "name varchar(30) NOT NULL," +
			  "email varchar(50) DEFAULT NULL," +
			  "phone varchar(15) DEFAULT NULL," +
			  "address text," +
			  "total_price decimal(10,2) DEFAULT NULL," +
			  "status varchar(30) DEFAULT NULL," +
			  "order_info text," +
			  "PRIMARY KEY (order_id)" +
			  ")"
		  );
	  
	  
		  db.run(
			"CREATE TABLE IF NOT exists order_items (" +
			  "oitem_id INTEGER PRIMARY KEY AUTOINCREMENT," +
			  "order_id varchar(30) NOT NULL," +
			  "item_id int(11)," +
			  "item varchar(30)," +
			  "quantity int(11) DEFAULT NULL," +
			  "FOREIGN KEY (order_id) REFERENCES userorders (order_id) "+			
			")"
		  );
	  
		  db.run(
			"CREATE TABLE IF NOT exists user_session (" +
			  "pid varchar(30) PRIMARY KEY ," +
			  "uname varchar(30) ," +
			  "c_step varchar(30) ," +
			  "value varchar(30)," +
			  "oid varchar(30) ," +
			  "cnt int(11)" +
			")"
		  );


	}
});

db.run = util.promisify(db.run);
db.get = util.promisify(db.get);
db.all = util.promisify(db.all);

// empty all data from db
db.clean_db = async function() {

	await db.run("DELETE FROM  order_items");
	await db.run("DELETE FROM  c_orders");
	await db.run("DELETE FROM  user_session");

  	db.run("vacuum");
}

// drop tables for updates
db.drop_tb = async function() {

	
	await db.run("DROP table order_items");
	await db.run("DROP table user_session");
	await db.run("DROP table  c_orders");

  	db.run("vacuum");
}


async function get_sessions() {
	
	let data = await db.all(`SELECT * FROM user_session `);

	return data;

}

async function get_session(conversation) {
	
	let session = await db.get(`SELECT * FROM user_session WHERE pid = '${conversation}' `);

	return session;

}

async function reset_convo(){
	await db.clean_db();
}

async function del_up_table(){
	await db.drop_tb();
}

async function init_session(conversation){
	console.log("Init");
				
	let oid = await createOid();
	console.log("OID: ", oid);
	await db.run(`insert into user_session values ('${conversation}', '', 'GET_NAME', '', '${oid}', 1)`);
}

async function init_order(params){
	console.log("Init");
				
	let oid = params.oid;
	let name = params.uname;
	let phone = params.phone;
	console.log("OID: ", oid);
	await db.run(`insert into c_orders values ('${oid}', '', '${name}', '', '${phone}', '', 0, 'incomplete', '')`);
}

async function check_order(conversation){
	let session = await get_session(conversation);

	let oid = session.oid;

	let uorder = await db.get(`SELECT * FROM c_orders WHERE order_id = '${oid}' `);

	if(!uorder){
		var params = {
			oid: oid,
			name: session.uname,
			phone: session.pid.split("@")[0]
		}

		console.log("In init order param: ",params);

		await init_order(params);
	}

}

async function add_item(params){

}

module.exports = {
	
	get_sessions: get_sessions,
	clean_db: db.clean_db,
	tdb: db,
	reset_convo: reset_convo,
	del_up_table: del_up_table,
	init_session: init_session,
	init_order: init_order,
	get_session: get_session,
	check_order: check_order,
	add_item: add_item
}