/** Tests for Industries Routes */
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

describe('GET /industries', function () {
	test('It should respond with a list of industries and associated companies', async function () {
		const response = await request(app).get('/industries');
		expect(response.body).toEqual({
			industries: [
				{
					code: 'tech',
					industry: 'Technology',
					companies: ['apple', 'ibm'],
				},
				{
					code: 'finance',
					industry: 'Finance',
					companies: ['ibm'],
				},
			],
		});
	});
});

describe('POST /industries', function () {
	test('It should add a new industry', async function () {
		const response = await request(app)
			.post('/industries')
			.send({ code: 'health', industry: 'Healthcare' });

		expect(response.body).toEqual({
			industry: {
				code: 'health',
				industry: 'Healthcare',
			},
		});

		// Verify the industry exists in the database
		const result = await db.query(
			`SELECT * FROM industries WHERE code = 'health'`
		);
		expect(result.rows.length).toEqual(1);
		expect(result.rows[0]).toEqual({
			code: 'health',
			industry: 'Healthcare',
		});
	});
});

describe('POST /industries/:code/companies', function () {
	test('It should associate an industry with a company', async function () {
		const response = await request(app)
			.post('/industries/finance/companies')
			.send({ company_code: 'apple' });

		expect(response.body).toEqual({ status: 'added' });

		// Verify the relationship exists in the database
		const result = await db.query(
			`SELECT * FROM company_industries WHERE industry_code = 'finance' AND company_code = 'apple'`
		);
		expect(result.rows.length).toEqual(1);
	});

	test('It should return 500 for invalid company or industry', async function () {
		const response = await request(app)
			.post('/industries/unknown/companies')
			.send({ company_code: 'unknown' });

		expect(response.status).toEqual(500);
	});
});
