$(document).ready(function() {
	var socket = io.connect('/room_page');
	
	var other_user_nick = null; 
	
	
	var room_page = {
		no: 0
		, list_num: 10	
		, is_there_password: 'all'
		, game_type: 'all'	
	};
	
	var ask = {
		game_type: 'until_turn'
	}
	
	
	
	var user_id = $('#user_id').val();
	var nick = $('.user_nick').text().trim();
	
	var $select_game_type_when_ask = $('#select_game_type_when_ask');
		
	var $user_list_box = $('#user_list_box');
	
	var $menu_button = $('.menu_button');
	
	socket.on('here_user_list', function(data) {				
		$user_list_box.empty();
		$user_list_box.append(make_reload_user_list_button());
		var user_list = data.user_list;
		for(user in user_list) {			
			$user_list_box.append(make_user_list_div(user_list[user], user));
		}
		
		$('.ask_fight_button').click(function(e) {	
					
			if(!other_user_nick) {
				var e = e || window.event;
				var self = e.target;
				e.stopPropagation();
				
				$(self).parent().find('#select_game_type_when_ask').remove();
				$(self).parent().append($select_game_type_when_ask);
				$select_game_type_when_ask.slideToggle('fast');
				
				$('.game_type_when_ask').on('change', function() {
		            ask.game_type = $(this).val();			
	            });
				
				$('#go_fight_button').unbind('click');
				$('#go_fight_button').click(function() {
					other_user_nick = $(self).parent().find('.user_nick').text().trim();
					
					var req_user_id = user_id
					var res_user_id = self.id.substr(4);
								
					socket.emit('ask_fight', {req_user_id: req_user_id, res_user_id: res_user_id, nick: nick}, function(isSuccess) {
						if(isSuccess) {
							alert('대결신청을 완료하였습니다.');
						} else {
							alert('상대방이 없습니다.');
						}				
					});					
				});
			} else {
				alert('대결신청이 진행중입니다.');
			}	 		
		});
		
		$('.reload_user_list_button').click(function() {
			input_loading_div($user_list_box);
			socket.emit('get_users');
		});
	});
	
	socket.on('asked_fight', function(data) {
		if(confirm(data.nick + '님이 대결을 신청하였습니다. 받아들이시겠습니까?')) {
			var ok_sign = true;			
		} else {
			var ok_sign = false;
		}
		socket.emit('reponse_fight', {ok_sign: ok_sign, req_user_id: data.req_user_id, res_user_id: data.res_user_id});
	});
	
	socket.on('reponse_result', function(data) {		
		if(data.sign) {			
			var title = nick + ' VS ' + other_user_nick
			socket.emit('make_room', {title: title, res_user_id: data.res_user_id, game_type: ask.game_type});
		} else {
			alert('거절당했습니다.');
			other_user_nick = null;
		}
	});
	
	socket.on('go_game_room', function(data) {		
		var title = data.title;
		var room_id = data.room_id;
		var game_type = data.game_type
		var isMaster = data.isMaster;
		
		window.location.href = '/join/' + title + '/' + room_id + '/' + game_type + '/' + isMaster;
	});
	
	function make_reload_user_list_button() {
		var div = document.createElement('div');
		div.className = 'reload_user_list_button';
		
		html = '대기실 유저 새로 갱신'
		
		div.innerHTML = html;
		return div;
	}
	
	function make_user_list_div(user, data_user_id) {			
		var nick = user[0];
		var win = user[1];
		var lose = user[2];
		
		if(user_id !== data_user_id) {
		
		var div = document.createElement('div');
		div.className = 'user_list';
		
		html = '<div class="user_common user_nick left">' + nick + '</div>' +
		       '<div class="user_common user_win_lose left">' + win + ' 승</div>' +
		       '<div class="user_common user_win_lose left">' + lose + ' 패</div>' +
		       '<div id="ask_' + data_user_id + '" class="user_common ask_fight_button left">대결신청</div>';
		       
		div.innerHTML = html;
		
		return div;
		       
		}
	}
	
	
		
	
	
	socket.emit('get_win_lose', {user_id: user_id});	
	
	
	socket.on('here_total', function(data) {		
		room_page.total = Math.ceil(data.total/room_page.list_num);
		show_page_indicator(room_page.no+1, room_page.total);
	});
	
	var $room_list_box = $('#room_list_box');
	input_loading_div($room_list_box);
	
	var $win_lose_box = $('#win_lose_box');	
	socket.on('here_win_lose', function(data) {	
		socket.emit('add_me', {user_id:user_id, nick:nick, win: data.win, lose: data.lose});	
		var html = data.win + '승 ' + data.lose + '패';		
		$win_lose_box.html(html);
	});
	
	var $make_room_form = $('#make_room_form');
	$make_room_form.on('submit', function(e) {
		var e = e || window.event;
		var title = $('#roomname').val();		
		
		if(navigator.appName == 'Microsoft Internet Explorer') {
   		    alert('인터넷 익스플로어로는 사용 불가합니다. 죄송합니다.');
   		    e.preventDefault();
   		    return;   			
   	    }  
   	    
   	    if(title.trim() == '' || !title) {
			alert('제목을 입력하세요.');
			$('#roomname').focus();
			e.preventDefault();
			return;
		}
	});
		
	var $page_indicator_box = $('.page_indicator_box');
	
	var $logout_button = $('#logout_button');
	var $reload_button = $('.reload_button');
	
	var $left_button = $('#left_button');
	var $right_button = $('#right_button');
	
	var $password_checkbox = $('#password_checkbox');
	var $room_password = $('#room_password');
	$room_password.on('keyup', function(e) {
		var e = e || window.event;
		var self = e.target;
		
		var value = $(self).val();
		if(value.length > 15) {
			alert("최대 15자까지 가능합니다.");
			var value = value.substr(0, value.length-1);
			$(self).val(value);
		}
	});
	
	$password_checkbox.on('change', function() {
		toggle_password_checkbox($(this));
	});
	
	
	
	function toggle_password_checkbox(password_checkbox) {
		if(password_checkbox.attr('is_password') == 'yes') {
			password_checkbox.attr('is_password', 'no');
			$room_password.css('display', 'none');
			$room_password.val('');
		} else {
			password_checkbox.attr('is_password', 'yes');
			$room_password.css('display', 'inline');
			$room_password.focus();
		}
	}
	
	var $password_room_filter = $('.password_room_filter');
	$password_room_filter.on('change', function() {
		input_loading_div($room_list_box);
		room_page.is_there_password =  $(this).val();
		
		get_rooms();
	});
	
	
	var $game_type_button = $('.game_type_button');
	$game_type_button.on('change', function() {
		input_loading_div($room_list_box);
		room_page.game_type =  $(this).val();
		
		get_rooms();
	});
	
	function get_rooms() {
		get_total();
		
		room_page.no = 0;
		var start = room_page.no * room_page.list_num;
		
		go_other_page(start);
	}
	
	function go_other_page(start) {
		socket.emit('go_other_page', {start: start, list_num: room_page.list_num, is_there_password: room_page.is_there_password, game_type: room_page.game_type});
	}
	
	function get_total() {		
		socket.emit('get_total', {is_there_password: room_page.is_there_password, game_type: room_page.game_type})
	}
	
	var $rule_video_button = $('#rule_video_button');
	$rule_video_button.on('click', function() {
		window.open('http://www.youtube.com/watch?v=_ecOIxPWMmU');
	});
	
	$left_button.on('click', function() {		
		if(room_page.no>0) {
			input_loading_div($room_list_box);
			room_page.no--;
			var start = room_page.no * room_page.list_num;
		
		    go_other_page(start);
		}		
	});
	
	$right_button.on('click', function() {						
		if(!room_page.total) {
			alert('방이 없거나 로딩중입니다. 잠시만 기다려 주세요...');
			return;
		}
		if((room_page.no+1) < room_page.total) {
			input_loading_div($room_list_box);						
			room_page.no++;
		    var start = room_page.no * room_page.list_num;
		    
		    go_other_page(start);
		}	
	});
	
	$('.enter_button').click(click_enter_button);
	
	socket.on('here_room_list', function(data) {					
		var rooms = data.rooms;
		$room_list_box.empty();
		
		for(var i=0; i<rooms.length; i++) {
			$room_list_box.append(make_room_list(rooms[i]));
		}
		show_page_indicator(room_page.no+1, room_page.total);
		
		$('.enter_button').click(click_enter_button);
	});
	
	function click_enter_button(e) {
		if(navigator.appName == 'Microsoft Internet Explorer') {
   		    alert('인터넷 익스플로어로는 사용 불가합니다. 죄송합니다.');   		   
   		    return;   			
   	    }  
		var e = e || window.event;
		var self = e.target;
		var room = self.parentNode.parentNode.info;
		var password_box = $(self).parent().next().find('.room_password_text');
			
		var room_title = room.room_title;		
		var room_id = room.room_id;
		var game_type = room.game_type;
		if(room.password) {
			var origin_room_password = room.password;
			var input_room_password = password_box.val();
			if(input_room_password == '' || (origin_room_password != input_room_password)) {
				alert('비밀번호가 일치하지 않습니다.');
				password_box.focus();
				return;
			}
		}
		
		window.location.href= '/join/' + room_title + '/' + room_id + '/' + game_type + '/guest';
	}
	
	function make_room_list(room) {
		var div = document.createElement('div');
		div.className = 'room_list';
		div.info = room;
		var html = '<div class="room_title_and_enter_button"><div class="room_title left">' + room.room_title + '</div>' +
		           '<div class="enter_button left">입장</div></div>';
		
		if(room.game_type == 'until_turn') {
			html += '<div class="token_turn_or_chip token_turn">턴</div>';
		} else if(room.game_type == 'until_chip') {
			html += '<div class="token_turn_or_chip token_chip">칩</div>'
		}
		           
		if(room.password) {
			html += '<div class="input_room_password">방 비밀번호 입력 : <input type="text" class="room_password_text"></div>'
			
		}           
		
		div.innerHTML = html;           
		return div;
	}
	
	function show_page_indicator(current, total) {
		$page_indicator_box.empty();
		$page_indicator_box.append(current + ' / ' + total);
	}
	
	$logout_button.on('click', function() {
		window.location.href = '/logout';
	});
	
	$reload_button.on('click', function() {
		input_loading_div($room_list_box);
		var is_there_password =  'all'
		
		get_total();
		
		room_page.no = 0;
		var start = room_page.no * room_page.list_num;
		
		go_other_page(start);
	});
	
	$menu_button.on('click', function(e) {
		var e = e || window.event;
		var self = e.target;
		var button_type = self.id.substr(7);
		
		$('.menu_box').css('display', 'none');	
		
		if(button_type == 'user_board') {
			init_board();			
		}					
		
		$('#' + button_type + '_box').fadeIn('fast');
	});
	
	function init_board() {
		var board = new Board()
		board.init(user_id, nick);
	}
	
	$(window).on('beforeunload', function() {
        socket.emit('remove_me', {user_id: user_id});
    });
});











