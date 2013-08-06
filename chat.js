var huk = require('huk-browserify');

var colors = ["#FFFFFF","#ffb1d8","#EAB0B5","#A9BB9A","#81C8F1","#F9C258","#A9CC70","#D4B86E","#F6D93E","#FCEB3E"];

function utf8(s){
	return unescape(encodeURIComponent(s));
}

function Chat (ws, el, menu) {
	var self = this;
	self.view = el;
	self.ws = ws;
	self.menu = menu;

	ws.message(function (data) {
		data.map(function (message) {
			console.log(message);
			if (!message) return;
			
			message += '\n';
			var match = message.match(/^([\+-pmn]):(.+)\n$/i);
			var cmd = match[1];
			var content = match[2].replace(/</ig,'&lt;').replace(/>/ig,'&gt;');
			console.log(cmd, content);

			if (cmd === 'm') self.newMessage(content);
		});
	});

	document.sendMsg.addEventListener('submit', function (event) {
		event.preventDefault();
		self.sendMessage();
	});

	document.sendMsg.msg.addEventListener('focus', function (event) {
		self.menu.offscreen.hide();
	});	

	return this;
}

Chat.prototype.newMessage = function(content) {
	var self = this;
	var elems = content.split(/^([0-9]?)\[([&lt;&gt;<a-zA-Z0-9]+)\]/);
	var color = colors[elems[1]];
	var name = elems[2];
	var msg = elems[3];
	var date = new Date();
	var feed = $('.feed').element;
	var hours = date.getHours();
	if (hours < 10) hours = '0' + hours;
	var minutes = date.getMinutes();
	if (minutes < 10) minutes = '0' + minutes;

	var contents = huk()
		.div({ 'class': 'time' }, hours + ':' + minutes)
		.div({ 'class': 'name', style: 'color:' + color + ';' }, name)
		.div({ 'class': 'msg' }, msg);
	feed.appendChild(huk.li(contents));
	feed.scrollTop = feed.scrollHeight;

	return this;
};

Chat.prototype.sendMessage = function () {
	var self = this;
	var text = document.sendMsg.msg.value;
	if (!self.menu.user || !text) return;

	self.ws.send_string('m:' + utf8(text) + '\n');
	self.newMessage(self.menu.user.color + '[' + self.menu.user.name + ']' + text);
	document.sendMsg.msg.value = '';

	return this;
};

module.exports = Chat;