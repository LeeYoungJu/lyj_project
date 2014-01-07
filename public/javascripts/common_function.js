function bindEvent(obj, func) {
	return function() {
		func.apply(obj, arguments);
	};
}
