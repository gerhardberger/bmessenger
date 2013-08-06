var Offscreen = require('sioux-offscreen');
var huk = require('huk-browserify');

var colors = ["#FFFFFF","#ffb1d8","#EAB0B5","#A9BB9A","#81C8F1","#F9C258","#A9CC70","#D4B86E","#F6D93E","#FCEB3E"];


function utf8(s){
	return unescape(encodeURIComponent(s));
}

function Menu (ws, el) {
	var self = this;
	self.view = el;
	self.ws = ws;
	self.offscreen = new Offscreen($('.offscreen'), $('.onscreen'));
	self.users = [];
	self.user = {};
	self.user.color = 0;

	ws.message(function (data) {
		data.map(function (message) {
			console.log(message);
			if (!message) return;
			if (message === 'o') {
				self.offscreen.hide();
				window.localStorage.setItem('user', JSON.stringify(self.user));
				var login = $('.login', self.view).element;
				login.innerHTML = '';
				huk()
					.div({ 'class': 'user' }, self.user.name)
					.a({ href: '#' }, 'Log out')
				.appendTo(login);
				self.ws.send_string(utf8('c:' + self.user.color) + '\n');
				console.log(self.user.color);
				$('.user', self.view).element.style.color = self.user.color ? colors[self.user.color] : colors[0];
				$('a', login).on('tap', function () {
					self.logout();
				});
				return;
			}
			message += '\n';
			var match = message.match(/^([\+-pmn]):(.+)\n$/i);
			var cmd = match[1];
			var content = match[2].replace(/</ig,'&lt;').replace(/>/ig,'&gt;');
			console.log(cmd, content);
			if (cmd === '+') self.addUser(content);
			if (cmd === '-') self.removeUser(content);
		});
	});
	
	$('.submit', el).on('tap', function () {
		self.login();
	});
	document.loginForm.addEventListener('submit', function (event) {
		event.preventDefault();
		self.login();
	});

	var colorList = $('.colors', el).element;
	colorList.innerHTML = '';
	colors.forEach(function (color, ix) {
		var li = huk.li({ 'class': 'touch', 'data-code': color, style: 'background:' + color + ';' });
		li.addEventListener('tap', function () {
			self.user.color = ix;
			window.localStorage.setItem('user', JSON.stringify(self.user));
			$('.user', self.view).element.style.color = color;
			self.ws.send_string(utf8('c:' + ix) + '\n');
		});
		colorList.appendChild(li);
	});

	return this;
}

Menu.prototype.login = function() {
	var self = this;
	var name = $('.name', self.view).element.value;
	var pass = $('.password', self.view).element.value;
	var s = window.localStorage.getItem('user');
	var user = s ? JSON.parse(s) : undefined;
	if (!(name && pass) && user) {
		name = user.name;
		pass = user.password;
		if (user.color) self.user.color = user.color;
	}
	if (!(name && pass)) return;

	self.user.name = name;
	self.user.password = pass;

	var handler = function () {
		self.ws.send_string('l:' + utf8(name + ':' + pass) + '\n');
	};
	if (self.ws.opened) handler();
	else self.ws.addopen(handler);

	return this;
};

Menu.prototype.logout = function() {
	var self = this;
	var login = $('.login', self.view).element;
	login.innerHTML = '';
	login.appendChild(huk.form({ name: 'loginForm' }, huk()
		.input({ type: 'text', 'class': 'name', placeholder: 'Name' })
		.input({ type: 'password', 'class': 'password', placeholder: 'Password' })
		.input({ type: 'submit', 'class': 'submit', value: 'Log in' })));

	document.loginForm.addEventListener('submit', function (event) {
		event.preventDefault();
		self.login();
	});

	self.ws.send_string('q');
	window.localStorage.setItem('user', '');

	return this;
};

Menu.prototype.addUser = function(name) {
	var self = this;
	if (self.users.indexOf(name) > -1) return this;
	self.users.push(name);
	self.users.sort();
	var list = $('.users', self.view).element;
	list.innerHTML = self.users.map(function (name) {
		return huk.li(name).outerHTML;
	}).join('');

	return this;
};

Menu.prototype.removeUser = function(name) {
	var self = this;
	var ix = self.users.indexOf(name);
	if (ix === -1) return this;
	self.users.splice(ix, 1);
	$('.users', self.view).element.removeChild($('.users li', self.view).element[ix]);


	return this;
};

module.exports = Menu;