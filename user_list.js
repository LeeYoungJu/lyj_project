module.exports = {
	user_list: {
		
	}
	
	, add_user: function(id, nick, win, lose) {	
		if(id in this.user_list) {
			
		} else {
			this.user_list[id] = [];
			this.user_list[id][0] = nick;
			this.user_list[id][1] = win;
			this.user_list[id][2] = lose;
		}			
	}
	
	 
	
	, remove_user: function(id) {
		if(id in this.user_list) {
			delete this.user_list[id];			
		}
	}
	
	, get_user_list: function() {
		return this.user_list;
	}
}