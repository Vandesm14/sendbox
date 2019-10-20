const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const jsonstore = require('jsonstore.io');
const bcrypt = require('bcrypt');
const Database = require('./localdb.js');
require('dotenv').config();

const app = express();
// let store = new jsonstore(process.env.TOKEN);
let store = new Database('db.json');
store.open();
const salt = process.env.SALT;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');

/* ----------MIDDLEWARE---------- */
app.use((req, res, next) => {
	console.log(`[${new Date().toISOString()}]: ${req.path}`);
	next();
});

app.use((req, res, next) => {
	if (checkToken(req.cookies.token)) {
		next();
	} else {
		res.redirect('/');
	}
});

/* ----------GET---------- */
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/pages/home.html');
});

app.get('/login', (req, res) => {
	let failure = req.query.failure;
	res.render(__dirname + '/public/pages/login.ejs', {
		failure: failure
	});
});

app.get('/register', (req, res) => {
	let failure = req.query.failure;
	res.render(__dirname + '/public/pages/register.ejs', {
		failure: failure
	});
});

app.get('/inbox', (req, res) => {
	res.render(__dirname + '/public/pages/inbox/inbox.ejs');
});

app.get('/inbox/send', (req, res) => {});

/* ----------POST---------- */
app.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	res.cookie('user', bcrypt.hashSync(username, salt), {
		maxAge: 3600 * 1000 * 24 * 365,
		httpOnly: true
	});
	res.cookie('token', newToken(), {
		maxAge: 3600 * 1000 * 24 * 365,
		httpOnly: true
	});

	if (checkUser(username, password)) {
		res.redirect('/inbox');
	} else {
		res.redirect('/login?failure=true');
	}
});

app.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;

	res.cookie('user', bcrypt.hashSync(username, salt), {
		maxAge: 3600 * 1000 * 24 * 365,
		httpOnly: true
	});
	res.cookie('token', newToken(), {
		maxAge: 3600 * 1000 * 24 * 365,
		httpOnly: true
	});

	if (checkUser(username, password)) {
		res.redirect('/login?failure=true');
	} else {
		res.redirect('/inbox');
	}
});

app.post('/mail/send', (req, res) => {
	let sender = req.data.sender;
	let recipient = req.data.recipient;
	let subject = req.data.subject;
	let content = req.data.content;
});

/* ----------FUNCTIONS---------- */

function newUser(username, password) {
	let token = randID();
	store.write('users/' + username, {
		password: bcrypt.hashSync(password, salt),
		token: token
	});
	return token;
}

function checkUser(username, password) {
	password = bcrypt.compareSync(password, salt);
	store.read('users/' + username).then((data) => {
		if (data && data.password === password) {
			return true;
		} else {
			return false;
		}
	});
}

function getEmails(username) {
	store.read('userdata/' + username).then((data) => {
		return data.emails;
	});
}

function newToken(username) {
	let token = randID();
	store.write('users/' + username, {
		token: token
	});
	return token;
}

function checkToken(token) {
	store.read('tokens/' + token).then((data) => {
		if (data) {
			return true;
		} else {
			return false;
		}
	});
}

function randID() {
	return Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
}

function plusYear() {
	let d = new Date();
	return d.setFullYear(d.getFullYear() + 1);
}

app.listen(3000, () => console.log('server started'));