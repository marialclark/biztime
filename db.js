const { Client } = require('pg');

// Use the test database when running tests
const DB_URI =
	process.env.NODE_ENV === 'test'
		? 'postgresql:///biztime_test'
		: 'postgresql:///biztime';

const db = new Client({
	connectionString: DB_URI,
});

db.connect();

module.exports = db;
