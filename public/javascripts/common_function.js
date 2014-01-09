function bindEvent(obj, func) {
	return function() {
		func.apply(obj, arguments);
	};
}

function changeResultMessage(message) {
	message = message.replace(/</g, '&lt;');
	message = message.replace(/>/g, '&gt;');
	message = message.replace(/\n/g, '<br>');
	message = message.replace(/ /g, '&nbsp;');
	
	return message;
}

function input_loading_div(box) {
	box.empty();
	var loading = '<div class="loading">loading . . . </div>';
	box.append(loading);
}