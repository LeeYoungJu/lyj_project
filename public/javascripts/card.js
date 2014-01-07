var Card = function() {
	this.my_card_box = $('#my_card_box');
    this.your_card_box = $('#your_card_box');
	
	this.my_card = null;
   	this.your_card = null;
   	this.card_arr = new Array();   	
   	
   	this.turn = 0;
   	this.isMaster = $('#isMaster').val();
};

Card.prototype = {	
	set_chip_obj: function(chip) {		
		this.chip = chip;
	}
	
	, init_card: function() {
		this.turn = 0;
	}
	
	, makeMeMaster: function() {
		this.isMaster = 'master';
	}
	
	, set_chat_obj: function(chat) {		
		this.chat = chat;
	}
	
	, set_sockek_obj: function(socket) {
		this.room = socket;
		
		var self = this;
		this.room.on('open_all_card', function() {	
			var explain1 = '당신의 카드가 더 높습니다.!<br />칩 획득!';
			var explain2 = '당신의 카드가 더 낮습니다.<br />배팅한 만큼 칩을 잃었습니다.';
			var explain3 = '카드가 똑같습니다. 그대로 다음 카드로 넘어갑니다.';			
    		self.show_my_card();
    		
			$(self.chip.betting_box).empty();
   			$(self.chip.betting_box).append(self.makeResultView(explain1, explain2, explain3));    	
    		
    		//window.setTimeout(self.calulate_chip, 1500);
    		window.setTimeout(function() {
    			self.chip.calculate_chip();
    		}, 1800);
    	});
    	
    	this.room.on('die', function(data) {
    		self.show_my_card();
    		self.chat.showMessage('딜러 : ' + data.nick + '님이 죽었습니다!');
    		    		
    		if(parseInt(data.card) == 10) {    			
    			if(self.chat.user_id == data.user_id) {
    			    self.chip.my_chip -= 10;
    			    self.chip.my_betted_chip += 10;
    		    } else {
     			    self.chip.your_chip -= 10;
    			    self.chip.your_betted_chip += 10;
     		    }
     		    var explain1 = '상대방이 죽었습니다. 그리고 상대방 카드가 10입니다.<br />칩 10개를 추가 획득하셨습니다!!';
			    var explain2 = '당신의 카드는 10이었습니다.<br />칩 10개를 추가로 잃으셨습니다.';
    		} else {
    			var explain1 = '상대방이 죽었습니다.';
			    var explain2 = '죽었습니다.';
    		} 
    		
    		if(self.chat.user_id == data.user_id) {    			
    		    self.my_card = 1;
    		    self.your_card = 10;
    		} else {
      		    self.my_card = 10;
    		    self.your_card = 1;
     		}     		
     		
     		$(self.chip.betting_box).empty();
   			$(self.chip.betting_box).append(self.makeResultView(explain1, explain2));
     		
     		window.setTimeout(function() {
    			self.chip.calculate_chip();
    		}, 1500);     		 	    		
    	});
	}
	
	
	, make_card: function(card) {
	    var img = '<img src=\'/images/card/' + card + '.png\' />';
	    return img;
	}	

    , set_card: function(getting_card, isSuccess) {
    	if(!isSuccess) {
    		alert('카드 세팅에 문제가있습니다. 죄송합니다.');
    		window.location.href = '/enter';
    	}    	
   		this.card_arr = getting_card.split('.');   
   		
   		this.next_card(); 	    	
   		
   		this.chip.base_betting();
   		   		
   		$(my_chip_box).empty();
   		$(your_chip_box).empty();
   		
   		$(my_chip_box).append('<div id="my_chip_smallbox"></div>').append(this.chip.make_first_betting_or_die()).append(this.chip.make_betting_or_die())
   		.append(this.chip.make_betting_box()).append(this.chip.make_open_or_die()).append(this.chip.make_remained_chip_box('my'));   		  	
   		
   		$(your_chip_box).append('<div id="your_chip_smallbox"></div>').append(this.chip.make_remained_chip_box('your'));
   		
   		this.chip.show_betted_chip();
   		//this.chip.make_chip('#my_chip_smallbox', this.chip.my_chip, 'my');
    	//this.chip.make_chip('#your_chip_smallbox', this.chip.your_chip, 'your');
	   	
   		if(this.isMaster == 'master') {
   			$('.small_betting_box').css('display', 'none');
   			$('.first_betting_or_die_box').css('display', 'block');
	   		$('.betting_or_die_box').css('display', 'none');
   		} else {
   			$('.small_betting_box').css('display', 'none');   			
   		}    	
    	
    	$('#go_betting_button').click(bindEvent(this.chip, this.chip.go_betting));
   		$('.betting_button').click(bindEvent(this.chip, this.chip.do_betting));
   		$('.open_card_button').click(bindEvent(this, this.do_open));
   		$('.die_button').click(bindEvent(this, this.do_die));  
   		
   		this.chat.showMessage('게임이 시작되었습니다!!!', 'red');  	
	}
	
    , next_card: function() {    	
    	if(this.turn == 20) {
    		if(this.chip.my_chip > this.chip.your_chip) {
    			this.chip.when_win_or_lose_game('win');
    			alert('게임을 이기셨습니다. 1승이 올라갑니다.');
    			this.room.emit('one_more_game');    			
    		} else if(this.chip.my_chip < this.chip.your_chip) {
    			this.chip.when_win_or_lose_game('lose');
    			alert('게임을 패하셨습니다.');
    		} else {    			
    			alert('칩수가 똑같습니다. 비기셨습니다.');
    			if(this.isMaster == 'master') {
    				this.room.emit('one_more_game');
    			}
    		}    		
    		return;
    		//this.chat.when_exit_room(); 		
    	}
    	
   		if(this.isMaster == 'master') {
   			this.my_card = parseInt(this.card_arr[this.turn]);
   			this.your_card = parseInt(this.card_arr[this.turn+1]);	
   			this.turn = this.turn + 2;
   		} else {
   			this.my_card = parseInt(this.card_arr[this.turn+1]);
   			this.your_card = parseInt(this.card_arr[this.turn]);    		
   			this.turn = this.turn + 2;
   		}    	
    	
    	$(this.my_card_box).empty();
    	$(this.my_card_box).append(this.make_card(0));
    		
   		$(this.your_card_box).empty();
   		$(this.your_card_box).append(this.make_card(this.your_card));   		
	}
	
    , do_open: function() {
    	$('.small_betting_box').css('display', 'none');    	
    	this.room.emit('open_card');
	}
		
	
    , makeResultView: function(ex1, ex2, ex3) {    	
   		if(this.my_card > this.your_card) {   			
   			var explain = ex1;
   		} else if(this.my_card < this.your_card) {
   			var explain = ex2;
   		} else {
   			var explain = ex3;
   		}
   		var div = document.createElement('div');
   		div.className = 'explain_result';
	   	
   		div.innerHTML = explain;
	   	
   		return div;
	}

    , show_my_card: function() {
   		$(this.my_card_box).empty();
   		$(this.my_card_box).append(this.make_card(this.my_card));
	}
	
	, do_die: function() {
		$('.small_betting_box').css('display', 'none');
    	this.room.emit('do_die', {user_id: this.chat.user_id, nick: this.chat.nick, card: this.my_card});
    }
};








