var $ = require('sioux-global'); window.$ = $;
var Menu = require('./menu.js');
var Chat = require('./chat.js');

function getMessage(socket){
	return decodeURIComponent(escape(socket.rQshiftStr(socket.rQlen())));
}

function utf8(s){
	return unescape(encodeURIComponent(s));
}

window.onload = function () {
	var ws = new Websock(); window.ws = ws;
	ws.open('ws://brenca.ath.cx:11112');
	ws.messagehandlers = [];
	ws.message = function (fn) { ws.messagehandlers.push(fn); };
	ws.on('message', function () {
		var data = getMessage(ws).split('\n');
		ws.messagehandlers.map(function (handler) { handler(data); });
	});
	ws.addopenhandlers = [];
	ws.addopen = function (fn) { ws.addopenhandlers.push(fn); };
	ws.on('open', function () {
		ws.addopenhandlers.map(function (handler) { handler(); });
	});
	ws.opened = false;

	var menu = new Menu(ws, $('.offscreen').element);
	window.menu = menu;
	menu.login();
	menu.offscreen.show();

	var chat = new Chat(ws, $('.onscreen').element, menu);

	ws.message(function (data) {
		console.log('message');
	});

	ws.addopen(function () {
		console.log('opened');
		ws.opened = true;
	});

	ws.on('close', function () {
		console.log('closed');
	});
};