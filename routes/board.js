var conn = require('../connect_db');

exports.load_total = function(req, res) {
	var load_total_callback = function(err, rows) {
		if(err) {
			throw err;
		}
		var total = rows[0].total;
		
		res.json({total: total});		
	};
	conn.load_total(load_total_callback);
};

exports.load = function(req, res){
	var start = req.body.start;
	var list_num = req.body.list_num;
	var load_callback = function(err, rows) {
		if(err) {
			throw err;
		}
		res.json(rows);
	};
	
	conn.load(start, list_num, load_callback);
};

exports.write = function(req, res){
	var nick = req.body.nick;
	var msg = req.body.msg;
	
	var write_callback = function(err) {
		if(err) {
			throw err;
		}
		res.json({isSuccess: true})
	};
    conn.write(msg, nick, write_callback);
};

exports.delete_write = function(req, res) {
	var list_id = req.body.list_id;
	
	var delete_callback = function(err) {
		if(err) {
			throw err;
		}
		res.json({list_id: list_id});
	}
	conn.delete_write(list_id, delete_callback);
}
















