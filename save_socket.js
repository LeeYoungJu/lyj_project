module.exports = {
	socket_list: {
		
	}
	
	, add_socket: function(id, socket) {	
		if(id in this.socket_list) {
			
		} else {
			this.socket_list[id] = socket;						
		}			
	}
	
	, get_socket: function(id) {
		if(id in this.socket_list) {
			return this.socket_list[id];
		} else {
			return false;
		}
	}	 
	
	, remove_socket: function(id) {
		if(id in this.socket_list) {
			delete this.socket_list[id];			
		}
	}	
}