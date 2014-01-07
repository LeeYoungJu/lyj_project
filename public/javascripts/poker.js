$(document).ready(function() {	
    var room = io.connect('/room'); 
        
    
    var my_state_button = $('#my_state');    
    var your_state_button = $('#your_state');
    
    var $leave_button = $('#leave');        
     
    var $my_win_lose_box = $('#my_win_lose_box');
    var $your_win_lose_box = $('#your_win_lose_box');
        
    var $my_nick_box = $('#my_nick');
    var $your_nick_box = $('#your_nick');
    
    var card_obj = new Card();
    var chip_obj = new Chip();
    var chat_obj = new Chat();
    
    card_obj.set_sockek_obj(room);
    chip_obj.set_sockek_obj(room);
    chat_obj.set_sockek_obj(room);
    
    card_obj.set_chip_obj(chip_obj);
    chip_obj.set_card_obj(card_obj);
    
    card_obj.set_chat_obj(chat_obj);
    chip_obj.set_chat_obj(chat_obj);
        
    room.on('connect', function() {        	
        $my_nick_box.text(chat_obj.nick);
   		$my_nick_box.slideDown('normal');   				
	    room.emit('join', {roomName:$('#roomName').text(), nick:chat_obj.nick, room_id: chat_obj.room_id, user_id: chat_obj.user_id});
	    room.emit('get_win_lose', {user_id:chat_obj.user_id});
    });
    
    room.on('here_win_lose', function(data) {
    	var html = data.win + '승 ' + data.lose + '패';
    	if(data.user_id == chat_obj.user_id) {
    		$my_win_lose_box.html(html);
    	} else {    		
    		$your_win_lose_box.html(html);    		
    		room.emit('send_win_lose_one_more', {win_lose: $my_win_lose_box.html()});
    	}
    });
    
    room.on('here_master_win_lose', function(data) {
    	$your_win_lose_box.html(data.win_lose);
    });
    
    room.on('joined', function(data) {
	    if(data.isSuccess) {	    	
   			chat_obj.showMessage(data.nick + '님이 입장하셨습니다.');  
   			if(data.isReady) {
   				$('#your_state').text('준비완료');
   			}   			
   			room.emit('send_my_nick', {nick:chat_obj.nick});
   			
   			$('.state').slideDown('fast');
   			my_state_button.unbind('click');
   			my_state_button.click(function(e) {
   				var e = e || window.event;
   				var self = e.target;   				   				
    			$(self).unbind('click');
		    	
		    	room.emit('ready', {room_id:chat_obj.room_id, user_id: chat_obj.user_id}, function() {    		
    				$(self).text('준비완료');    			
    			});    	  	
    		});
    	} else {
    		alert('인원이 초과되었습니다.');
    		window.location.href = '/enter';
    	}
    });
    
    room.on('go_one_more_game', function() {
    	room.emit('get_win_lose', {user_id:chat_obj.user_id});
    	
    	$('.emptybox').slideDown('fast');
    	$('.state').slideDown('fast');
    	
    	$('.chip_box').fadeOut('slow');
    	$('.card_box').fadeOut('slow');
    	
    	$('.betting_box').css('margin', '0 0 0 300px');
    	$('.chat_box').css('margin', '0 0 0 300px');
    	//$('#chat_form').css('margin', '0 0 0 300px');    	
    	    	
    	
    	$leave_button.unbind('click');
    	$leave_button.click(function(e) {    	    
    	    chat_obj.when_exit_room();
        });
    	
    	$(window).unbind('beforeunload');
    	$(window).on('beforeunload', function() {
            chat_obj.when_exit_room();
        });
        
        
    	
    	my_state_button.click(function(e) {
   			var e = e || window.event;
   			var self = e.target;   				   				
    		$(self).unbind('click');
		    
		    room.emit('ready', {room_id:chat_obj.room_id, user_id: chat_obj.user_id}, function() {    		
    			$(self).text('준비완료');    			
    		});    	  	
    	});
    });
    
    
    room.on('here_my_nick', function(data) {
    	var nick = data.nick
    	if(nick) {
    		$your_nick_box.text(nick);
   		    $your_nick_box.slideDown('normal');
    	}
    });
            
    
    room.on('message', function(data) {    	
    	chat_obj.showMessage(data.nick + ' : ' + data.msg, data.color);
    });
    
    
    
    $leave_button.click(function(e) {
    	chat_obj.when_exit_room();    	
    });
        
    room.on('others_ready', function() {
    	your_state_button.text('준비완료');
    });
    
    room.on('ready_cancel', function() {
    	your_state_button.text('. . .');
    });
    
    room.on('start', function() {
    	chip_obj.init_chip();
    	card_obj.init_card();    	
    	
    	my_state_button.text('Ready');
    	your_state_button.text('. . .');
    	
    	$('.state').slideUp('fast');
    	$('.emptybox').slideUp('fast');
    	$('.betting_box').css('margin', 0);
    	$('.chat_box').css('margin', 0);
    	//$('#chat_form').css('margin', '0 0 0 300px');
    	
    	$('.chip_box').fadeIn('slow');
    	$('.card_box').fadeIn('slow');    	
    	
    	$leave_button.unbind('click');
    	$leave_button.click(function(e) {    	    
    	    chat_obj.when_forced_exit_room();
        });
    	
    	$(window).unbind('beforeunload');
    	$(window).on('beforeunload', function() {
            chat_obj.when_forced_exit_room();
        });
    	
    	room.emit('getCard', {}, bindEvent(card_obj, card_obj.set_card));
    });
    
    

    
    room.on('show_chip', function() {	
    	chip_obj.show_betted_chip();
    });
    
    room.on('decrease_other_chip', function(data) {
    	chip_obj.your_chip -= data.chip_gap;
    	chip_obj.your_betted_chip += data.chip_gap;
    	
    	chip_obj.show_betted_chip();
    });
    
    
    room.on('betting_next', function(data) {    	 
    	$('.betting_or_die_box').css('display', 'block');   
    	
    	var your_betting_chip = data.betting_chip;
    	
    	chip_obj.your_chip -= your_betting_chip;
    	chip_obj.your_betted_chip += your_betting_chip;
    	
    	chip_obj.show_betted_chip(); 	
    });
    
    room.on('you_win', function() {
    	chip_obj.when_win_or_lose_game('win');
    	alert('상대방이 나가서 승리하셨습니다.');    	
    	chat_obj.when_exit_room();
    });
    
    room.on('error', function(data) {
    	alert(data.desc);
    	window.location.href = '/enter';
    });
   
    room.on('leaved', function(data) {    
    	card_obj.makeMeMaster();	
    	chat_obj.showMessage('상대방이 나갔습니다.');
    });
    
    $(window).on('beforeunload', function() {
        chat_obj.when_exit_room();
    });
})  




























  