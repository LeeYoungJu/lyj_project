var conn = require('./connect_db');
var user_list = require('./user_list');


module.exports = function(app) {	
	var io = require('socket.io').listen(app);
		
	io.configure(function() {
		io.set('log level', 3);
		io.set('transports', [
	  	  'websocket'
	  	  , 'flashsocket'
	  	  , 'htmlfile'
		  , 'xhr-polling'
	  	  , 'jsonp-polling'
		]);
	});
	
	var Room_page = io.of('/room_page').on('connection', function(socket) {
		socket.on('add_me', function(data) {
			user_list.add_user(data.user_id, data.nick, data.win, data.lose);
			var users = user_list.get_user_list();
			
			socket.emit('here_user_list', {user_list:users});
		});
		
		socket.on('get_users', function() {
			
		});
		
		socket.on('remove_me', function(data) {
			user_list.remove_user(data.user_id);
		});
		
		var get_total_room_callback = function(err, rows) {
			if(err) {
				throw err;
			}
			if(rows[0]) {
				var total = rows[0].num;
			
			    socket.emit('here_total', {total: total}); 
			}						
		};
		var load_page_callback = function (err, rows) {
			if(err) {
				throw err;
			}			
			socket.emit('here_room_list', {rooms: rows});
		};
		
		conn.get_total_room('all', get_total_room_callback);		
		conn.load_rooms(0, 10, 'all', load_page_callback);
		
		
		socket.on('get_win_lose', function(data) {
			var user_id = data.user_id;
			
			var get_user_win_lose_callback = function(err, rows) {
				if(err) {
					throw err;
				}
				if(rows[0]) {
					var win = rows[0].win;
				    var lose = rows[0].lose;
				    socket.emit('here_win_lose', {win: win, lose: lose});
				}
			}
			conn.get_user_win_lose(user_id, get_user_win_lose_callback)
		});
		
		socket.on('get_total', function(data) {
			conn.get_total_room(data.is_there_password, get_total_room_callback);
		});
		
		
		socket.on('go_other_page', function(data) {
			conn.load_rooms(data.start, data.list_num, data.is_there_password, load_page_callback);
		});		
	});
	
	
	var room_ready = {};
	
	var Room = io.of('/room').on('connection', function(socket) {
		var joinedRoom = null;
		
		//var is_ok1 = false;
		//var is_ok2 = false;		
		//var card_arr1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		//var card_arr2 = [2, 3, 5, 4, 1, 9, 8, 7, 6, 10, 10, 9, 8, 7, 6, 5, 3, 4, 2, 1];
		socket.on('join', function(data) {			
			  
			var complete_join_callback = function(err, result) {
				if(err) {
					throw err;
				}				
			};
			
			var joined_callback = function(err, rows) {
				if(err) {
					throw err;
				}				
				if(rows[0] && rows[0].mem_number < 2) {
					if(data.room_id in room_ready) {
						if(room_ready[data.room_id]['ready'] == 1) {
							isReady = true;
						} else {
							isReady = false;
						}
					} else {
						isReady = false;
					}
					
					joinedRoom = data.room_id;
					
					conn.change_room_wait(joinedRoom, complete_join_callback);										
					
					socket.join(joinedRoom);
					socket.emit('joined', {
						isSuccess:true, nick:data.nick, isReady:isReady
					}) ;
					socket.broadcast.to(joinedRoom).emit('joined', {
						isSuccess:true, nick:data.nick, isReady:false
					});
				} else {
					socket.emit('joined', {isSuccess: false});
				}
			};
			conn.is_empty_room(data.room_id, joined_callback);
		});
		
		socket.on('one_more_game', function(data) {			
			var card = require('./make_card')();
			var one_more_game_callback = function(err) {
				if(err) {
					throw err;
				}
				socket.emit('go_one_more_game');
				socket.broadcast.to(joinedRoom).emit('go_one_more_game');
			}
			conn.update_card(joinedRoom, card, one_more_game_callback);
		});
		
		socket.on('send_my_nick', function(data) {
			if(joinedRoom) {
				var nick = data.nick;
				socket.broadcast.to(joinedRoom).emit('here_my_nick', {nick:nick});
			}
		});
		
		socket.on('get_win_lose', function(data) {
			var user_id = data.user_id;
			
			var get_user_win_lose_callback = function(err, rows) {
				if(err) {
					throw err;
				}
				if(rows[0]) {
					var win = rows[0].win;
				    var lose = rows[0].lose;
				
				    socket.emit('here_win_lose', {win: win, lose: lose, user_id: user_id});
				    socket.broadcast.to(joinedRoom).emit('here_win_lose', {win: win, lose: lose});
				}				
			}
			conn.get_user_win_lose(user_id, get_user_win_lose_callback)
		});
		
		socket.on('send_win_lose_one_more', function(data) {			
			socket.broadcast.to(joinedRoom).emit('here_master_win_lose', {win_lose:data.win_lose});
		});
		
		socket.on('message', function(data) {
			if(joinedRoom) {				
				socket.broadcast.to(joinedRoom).json.send(data);
			}
		});
		
		socket.on('ready', function(data, callback) {
			if(joinedRoom in room_ready) {
				if(data.user_id in room_ready[joinedRoom]) {
								
				} else {					
					var ready_num = room_ready[joinedRoom]['ready'];					
					if(ready_num == 1) {
						delete room_ready[joinedRoom];
						
						socket.emit('start');
					    socket.broadcast.to(joinedRoom).emit('start');
					} else if(ready_num == 0)  {
						room_ready[joinedRoom]['ready']++;
						room_ready[joinedRoom][data.user_id] = true;
						
						socket.broadcast.to(joinedRoom).emit('others_ready');
				    	callback();						
					}	
				}
			} else {
				room_ready[joinedRoom] = {};
				room_ready[joinedRoom]['ready'] = 1;
				room_ready[joinedRoom][data.user_id] = true;
				
				
				socket.broadcast.to(joinedRoom).emit('others_ready');
				callback();						
			}				
				
			/*var increase_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {
					if(rows[0]) {
						var ready_level = rows[0].ready_level;
						
						if(ready_level == 2) {
							socket.emit('start');
							socket.broadcast.to(joinedRoom).emit('start');
						} else if(ready_level === 1) {						
							socket.broadcast.to(joinedRoom).emit('others_ready');
							callback();						
						} else if(ready_level > 2) {
							socket.emit('error', {desc: '준비하는 과정에서 에러가 발생하였습니다. 죄송합니다.'});
						}
					} else {
						socket.emit('error', {desc: '준비하는 과정에서 에러가 발생하였습니다. 죄송합니다.'});
					}					
				}
			};*/
			
			/*var callback1 = function() {
				socket.emit('start');
				socket.broadcast.to(joinedRoom).emit('start');
			};
			
			var callback2 = function() {
				socket.broadcast.to(joinedRoom).emit('others_ready');
				callback();						
			};
			
			var callback3 = function() {
				socket.emit('error', {desc: '준비하는 과정에서 에러가 발생하였습니다. 죄송합니다.'});
			};
			
			conn.increase_ready_level(data.room_id, callback1, callback2, callback3)*/
			//conn.increase_ready_level(data.room_id, increase_callback);
		});

		socket.on('getCard', function(data, callback) {
			var get_card_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {
					if(rows[0]) {
						var card = rows[0].card;					
					    var isSuccess = true;
					    
					} else {
						var card = null;
						var isSuccess = false;
					}	
					callback(card, isSuccess);				
				}
			};
			
			conn.get_card(joinedRoom, get_card_callback);
		});
		
		socket.on('betting_next_turn', function(data, callback) {			
			socket.broadcast.to(joinedRoom).emit('show_chip');						
			socket.broadcast.to(joinedRoom).emit('betting_next', data);
			callback();
		});
		
		socket.on('show_betting_state', function(data) {
			socket.broadcast.to(joinedRoom).emit('decrease_other_chip', data);
		});
		
		socket.on('open_card', function() {
			socket.emit('open_all_card');
			socket.broadcast.to(joinedRoom).emit('open_all_card');
		});
		
		socket.on('do_die', function(data) {
			socket.emit('die', data);			
			socket.broadcast.to(joinedRoom).emit('die', data);
		});
		
		socket.on('win_or_lose', function(data) {
			var winOrLose = data.winOrLose;
			var nick = data.nick;
			
			conn.increase_win_or_lose(nick, winOrLose);
		});
		
		function leave_callback(err, rows) {
			if(err) {
				throw err;
			} else {	
				if(rows[0]) {
					if(rows[0].mem_number == 0) {
					    conn.delete_room(joinedRoom);					    
				    } else {
					    socket.broadcast.to(joinedRoom).emit('leaved');					
				    }		
				}								
			    socket.leave(joinedRoom);
			}
		}
		
		socket.on('forced_leave', function(data) {
			var nick = data.nick;
			
			var forced_leave_callback = function(err, rows) {
				if(err) {
					throw err;
				} else {
					if(rows[0]) {
						var num = rows[0].mem_number;
					    if(num == 2) {
						    conn.increase_win_or_lose(nick, 'lose');
						    socket.broadcast.to(joinedRoom).emit('you_win');						
					    }
					    conn.subtract_mem_number(joinedRoom, leave_callback);
					}										
				}
			}
			conn.is_empty_room(joinedRoom, forced_leave_callback);
		});
		
		

		socket.on('leave', function(data) {
			if(data.user_id) {
				var user_id = data.user_id;
				if(joinedRoom) {	
					if(joinedRoom in room_ready) {
						if(user_id in room_ready[joinedRoom]) {
							room_ready[joinedRoom]['ready']--;
							delete room_ready[joinedRoom][user_id];
							
							socket.broadcast.to(joinedRoom).emit('ready_cancel');
						} 
					}
										
					conn.subtract_mem_number(joinedRoom, leave_callback);				
				}
			} else {
				if(joinedRoom) {
					conn.subtract_mem_number(joinedRoom, leave_callback);
				}				
				socket.emit('error', {desc: '데이터를 읽는 과정 중 에러가 발생했습니다.'});
			}			
		});
	});
}





























