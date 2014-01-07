var make_card = module.exports = function() {
	var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
	var card = '';
    var max_length = arr.length;
    for(var i=0; i<max_length; i++) {		    					    			
   	    var ran_index = Math.round(Math.random() * (arr.length-1));		    			
    	card += arr.splice(ran_index, 1) + '.';
    }	
    card = card.substr(0, card.length-1);
    return card;
}