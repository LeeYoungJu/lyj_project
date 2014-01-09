var Board = function() {
	this.no = 0;	
	this.list_num = 10;
	
	this.page_no = 0;
	this.page_num = 7;
	
	this.$board_list_box = $('#board_list_box'); 
    this.$write_form_box = $('#write_form_box');
    
    this.$write_form = $('#write_form');
    this.$write_button = $('#write_button');
    
    this.$write_button.unbind('click');
    this.$write_button.on('click', bindEvent(this, this.click_write_button));
}

Board.prototype = {	
	init: function(user_id, nick) {
		this.user_id = user_id;
		this.nick = nick;
						
		this.load_total();
	}
	
	, load_total: function() {
		input_loading_div(this.$board_list_box);		
		$.get('/load_total', bindEvent(this, this.done_load_total));
	}
	
	, done_load_total: function(data) {		
		this.total = data.total;
		this.total_page_num = Math.ceil(this.total / this.list_num);		
		this.load_list();
	}
	
	, make_page_num_button: function() {
		var div = document.createElement('div');
		div.className = 'page_num_box';
		
		var start = this.page_no * this.page_num;
		
		if(this.total_page_num > start + this.page_num) {
			var end = this.page_no*this.page_num + this.page_num; 
		} else {
			var end = this.total_page_num;
		}
		
		var html = '';
		
		html += '<span class="page_num_button">맨처음</span>';
		
		if(this.page_no > 0) {
			html += '<span class="page_num_button">이전</span>';
		}
		
		
		for(var i=start; i<end; i++) {
			if((this.no) == i) {
				html += '<span class="page_num_button selected_page_num_button">' + (i+1) + '</span>';
			} else {
				html += '<span class="page_num_button">' + (i+1) + '</span>';
			}			
		}		
		
		if((this.page_no*this.page_num) + this.page_num < this.total_page_num) {
			html += '<span class="page_num_button">다음</span>';
		}
		html += '<span class="page_num_button">맨끝</span>';
		       
		div.innerHTML = html;
		return div;
	}
	
	, load_list: function() {		
		var start = this.no * this.list_num;
		$.post('/load_board', {start: start, list_num: this.list_num}, bindEvent(this, this.append_board_list));
	}
	
	, append_board_list: function(data) {		
		this.$board_list_box.empty();
		this.$board_list_box.append(this.make_page_num_button());
		for(var i=0; i<data.length; i++) {				
			this.$board_list_box.append(this.make_board_list(data[i]));				
		}
		
		$('.button_delete').on('click', bindEvent(this, this.click_delete_buttons));
		$('.page_num_button').on('click', bindEvent(this, this.go_other_page));
	}
	
	, click_delete_buttons: function(e) {
		var e = e || window.event;
		var self = e.target;
		
		list_id = self.parentNode.info.list_id;
		
		if(confirm('삭제하시겠습니까?')) {
			var obj = this;
			$.post('/delete_write', {list_id: list_id}, function(data) {
				obj.load_total();
				//$('#list_' + data.list_id).remove();				
			});
		}
	}
	
	, go_other_page: function(e) {
		var e = e || window.event;
		var self = e.target;		
		var text = $(self).text();
		
		if(text == '이전') {
			this.page_no--;
			this.no = this.page_no * this.page_num;
		} else if(text == '다음') {
			this.page_no++;
			this.no = this.page_no * this.page_num;
		} else if(text == '맨처음') {
			this.no = 0;
			this.page_no = 0;
		} else if(text == '맨끝') {
			this.page_no = Math.floor(this.total_page_num / this.page_num);
			this.no = this.total_page_num - 1;
		} else {
			this.no = $(self).text() - 1;    
		}
		this.load_total();		
	}
	
	, make_board_list: function(list) {		
		var div = document.createElement('div');
		div.info = list;
		div.id = 'list_' + list.list_id;
		div.className = 'board_list';
		
		html = '<div class="nick_in_board left">' + list.nick + '</div>';
		
		if(list.nick == this.nick) {
			html += '<div class="button_delete buttons_in_board right">삭제</div>';
			        //'<div class="button_edit buttons_in_board right">수정</div>';
		}
		
		html += '<div class="clear"></div><div class="msg_in_board word_break">' + list.msg + '</div>';
		       
		div.innerHTML = html;
		return div;       
	}
	
	, click_write_button: function(e) {		
		var msg = this.$write_form.val();
		msg = changeResultMessage(msg);
		var param = {msg: msg, nick: this.nick};
		$.post('/write', param, bindEvent(this, this.done_write));
	}
	
	, done_write: function(data) {
		this.$write_form.val('');
		this.no = 0;
		this.page_no = 0;
		
		this.load_total();
	}
};
