/** Tests for Companies Routes */
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
	test('It should respond with array of companies', async function () {
		const response = await request(app).get('/companies');
		expect(response.body).toEqual({
			companies: [
				{ code: 'apple', name: 'Apple' },
				{ code: 'ibm', name: 'IBM' },
			],
		});
	});
});

describe('GET /:code', function () {
	test('It return company info, including industries', async function () {
		const response = await request(app).get('/companies/apple');
		expect(response.body).toEqual({
			company: {
				code: 'apple',
				name: 'Apple',
				description: 'Maker of OSX.',
				invoices: [1, 2],
				industries: ['Technology'],
			},
		});
	});

	test('It should return 404 for no-such-company', async function () {
		const response = await request(app).get('/companies/nonexistent');
		expect(response.status).toEqual(404);
	});
});

describe('POST /', function () {
	test('It should add company with a generated unique code', async function () {
		const response = await request(app)
			.post('/companies')
			.send({ name: 'Spirit', description: 'Ahhh' });

		// Checks that the code is generated with slugify and includes a timestamp
		expect(response.body.company.code).toMatch(/^spirit-\d+$/);
		expect(response.body).toEqual({
			company: {
				code: expect.stringMatching(/^spirit-\d+$/),
				name: 'Spirit',
				description: 'Ahhh',
			},
		});

		// Ensure the new company exists in the database
		const result = await db.query(
			`SELECT * FROM companies WHERE name = 'Spirit'`
		);
		expect(result.rows.length).toEqual(1);
		expect(result.rows[0]).toEqual(
			expect.objectContaining({
				code: expect.stringMatching(/^spirit-\d+$/),
				name: 'Spirit',
				description: 'Ahhh',
			})
		);
	});

	test('It should return 500 for conflict (duplicate name)', async function () {
		const response = await request(app)
			.post('/companies')
			.send({ name: 'Apple', description: 'Duplicate test' });

		expect(response.status).toEqual(500);
	});
});

describe('PUT /:code', function () {
	test('It should update company', async function () {
		const response = await request(app)
			.put('/companies/apple')
			.send({ name: 'AppleSauce', description: 'Liquid' });

		expect(response.body).toEqual({
			company: {
				code: 'apple',
				name: 'AppleSauce',
				description: 'Liquid',
			},
		});

		const result = await db.query(
			`SELECT * FROM companies WHERE code = 'apple'`
		);
		expect(result.rows[0]).toEqual({
			code: 'apple',
			name: 'AppleSauce',
			description: 'Liquid',
		});
	});

	test('It should return 404 for no-such-company', async function () {
		const response = await request(app)
			.put('/companies/nonexistent')
			.send({ name: 'Nonexistent', description: 'Does not exist' });

		expect(response.status).toEqual(404);
		expect(response.body.error.message).toEqual(
			"Company with code 'nonexistent' cannot be found"
		);
	});

	test('It should return 500 for missing data', async function () {
		const response = await request(app).put('/companies/apple').send({});

		expect(response.status).toEqual(500);
	});
});

describe('DELETE /:code', function () {
	test('It should delete company', async function () {
		const response = await request(app).delete('/companies/apple');
		expect(response.body).toEqual({ status: 'deleted' });

		const result = await db.query(
			`SELECT * FROM companies WHERE code = 'apple'`
		);
		expect(result.rows.length).toEqual(0);
	});

	test('It should return 404 for no-such-company', async function () {
		const response = await request(app).delete('/companies/nonexistent');

		expect(response.status).toEqual(404);
		expect(response.body.error.message).toEqual(
			"Company with code 'nonexistent' cannot be found"
		);
	});
});
