/** Tests for Invoices Routes */
const request = require('supertest');
const app = require('../app');
const { createData } = require('../_test-common');
const db = require('../db');

// Before each test, reset the database
beforeEach(async () => {
	await createData();
});

// Close the database connection after all tests
afterAll(async () => {
	await db.end();
});

describe('GET /', function () {
	test('It should respond with array of invoices', async function () {
		const response = await request(app).get('/invoices');
		expect(response.body).toEqual({
			invoices: [
				{ id: 1, comp_code: 'apple' },
				{ id: 2, comp_code: 'apple' },
				{ id: 3, comp_code: 'ibm' },
			],
		});
	});
});

describe('GET /:id', function () {
	test('It should return invoice info', async function () {
		const response = await request(app).get('/invoices/1');
		expect(response.body).toEqual({
			invoice: {
				id: 1,
				amt: 100,
				paid: false,
				add_date: expect.any(String),
				paid_date: null,
				company: {
					code: 'apple',
					name: 'Apple',
					description: 'Maker of OSX.',
				},
			},
		});
	});

	test('It should return 404 for non-existent invoice', async function () {
		const response = await request(app).get('/invoices/999');
		expect(response.status).toEqual(404);
	});
});

describe('POST /', function () {
	test('It should add an invoice', async function () {
		const response = await request(app)
			.post('/invoices')
			.send({ amt: 400, comp_code: 'ibm' });

		expect(response.body).toEqual({
			invoice: {
				id: expect.any(Number),
				comp_code: 'ibm',
				amt: 400,
				add_date: expect.any(String),
				paid: false,
				paid_date: null,
			},
		});
	});
});

describe('PUT /:id', function () {
	test('It should update an invoice', async function () {
		const response = await request(app)
			.put('/invoices/1')
			.send({ amt: 1000, paid: true });

		expect(response.body).toEqual({
			invoice: {
				id: 1,
				comp_code: 'apple',
				paid: true,
				amt: 1000,
				add_date: expect.any(String),
				paid_date: expect.any(String),
			},
		});
	});

	test('It should return 404 for non-existent invoice', async function () {
		const response = await request(app)
			.put('/invoices/9999')
			.send({ amt: 1000 });

		expect(response.status).toEqual(404);
	});

	test('It should return 500 for missing data', async function () {
		const response = await request(app).put('/invoices/1').send({});

		expect(response.status).toEqual(500);
	});
});

describe('DELETE /', function () {
	test('It should delete an invoice', async function () {
		const response = await request(app).delete('/invoices/1');
		expect(response.body).toEqual({ status: 'deleted' });

		const result = await db.query('SELECT * FROM invoices WHERE id = 1');
		expect(result.rows.length).toEqual(0);
	});

	test('It should return 404 for non-existent invoice', async function () {
		const response = await request(app).delete('/invoices/999');

		expect(response.status).toEqual(404);
	});
});
