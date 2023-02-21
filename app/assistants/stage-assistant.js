function StageAssistant () {
}

StageAssistant.prototype.setup = function() {
	var params = new Object();
	this.controller.pushScene('home','page_splash',params);
}


