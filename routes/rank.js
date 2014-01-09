var conn = require('../connect_db');

exports.load_rank = function(req, res) {
	var start = req.body.start;
	var list_num = req.body.list_num;
	var type = req.body.type;
	
	var load_rank_callback = function(err, rows) {
		if(err) {
			throw err;
		}
		res.json(rows);
	};
	
	conn.load_rank(start, list_num, type, load_rank_callback);
}
