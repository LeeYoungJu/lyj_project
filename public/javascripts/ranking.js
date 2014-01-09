var Rank = function() {	
	this.no = 0;	
	this.list_num = 20;
	
	this.page_no = 0;
	this.page_num = 7;
	
	this.type = 'total_score';
	
	this.$user_rank_box = $('#user_rank_box');
}

Rank.prototype = {	
	init: function(user_id, nick) {		
		this.user_id = user_id;
		this.nick = nick;
						
		this.total = 100;
		this.total_page_num = Math.ceil(this.total / this.list_num);		
		this.load_rank();
	}
	
	/*, load_total: function() {
		input_loading_div(this.$user_rank_box);		
		$.get('/load_user_total', bindEvent(this, this.done_load_total));*/
		
	
	
	/*, done_load_total: function(data) {
		this.total = data.total;
		this.total_page_num = Math.ceil(this.total / this.list_num);		
		this.load_rank();
	}*/
	
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
	
	, load_rank: function() {		
		var start = this.no * this.list_num;
		$.post('/load_rank', {start: start, list_num: this.list_num, type: this.type}, bindEvent(this, this.append_rank_list));
	}
	
	, append_rank_list: function(data) {		
		var start = this.no * this.list_num + 1;
		this.$user_rank_box.empty();
		this.$user_rank_box.append(this.make_page_num_button());		
		this.$user_rank_box.append(this.make_rank_title());		
		for(var i=0; i<data.length; i++) {				
			this.$user_rank_box.append(this.make_rank_list(data[i], start+i));				
		}
		
		$('.page_num_button').on('click', bindEvent(this, this.go_other_page));
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
		this.load_rank();		
	}
	
	, make_rank_list: function(rank, i) {		
		var div = document.createElement('div');
		div.info = rank;
		div.id = 'rank_' + rank.id;
		if(rank.id == this.user_id) {
			div.className = 'rank_list my_rank';
		} else {
			div.className = 'rank_list';
		}
					
		
		var html = '';
		
		html += '<div class="in_rank_list rank_num left">' + i + '</div>' +
		        '<div class="in_rank_list nick_in_rank left">' + rank.nick + '</div>' +		        
		        '<div class="in_rank_list rate_in_rank right">' + rank.win_rate + '%</div>' +
			    '<div class="in_rank_list score_in_rank right">' + rank.total_score + '</div>' +
			    '<div class="in_rank_list win_lose_in_rank right">' + rank.win + '/' + rank.lose + '</div><div class="clear"></div>';
		       
		div.innerHTML = html;
		return div;       
	}	
	
	, make_rank_title: function() {		
		var div = document.createElement('div');				
		div.className = 'rank_top';			
		
		var html = '';
		html += '<div class="in_rank_top rank_num left">순위</div>' +
		        '<div class="in_rank_top nick_in_rank left">플레이어</div>' +		        
		        '<div class="in_rank_top rate_in_rank right">승률</div>' +
			    '<div class="in_rank_top score_in_rank right">점수</div>' +
			    '<div class="in_rank_top win_lose_in_rank right">승/패</div><div class="clear"></div>';	    
		       
		div.innerHTML = html;
		return div;       
	}	
};
