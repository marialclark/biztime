/** Code common to tests. */
const db = require('./db');

async function createData() {
	// Clear existing data and reset invoice ID sequence
	await db.query('DELETE FROM invoices');
	await db.query('DELETE FROM companies');
	await db.query('DELETE FROM industries');
	await db.query('DELETE FROM company_industries');
	await db.query("SELECT setval('invoices_id_seq', 1, false)");

	// Insert companies
	await db.query(`
    INSERT INTO companies (code, name, description)
    VALUES 
      ('apple', 'Apple', 'Maker of OSX.'),
      ('ibm', 'IBM', 'Big blue.');
  `);

	// Insert invoices
	await db.query(`
    INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
    VALUES 
      ('apple', 100, false, '2018-01-01', null),
      ('apple', 200, true, '2018-02-01', '2018-02-02'), 
      ('ibm', 300, false, '2018-03-01', null);
  `);

	// Insert industries
	await db.query(`
    INSERT INTO industries (code, industry)
    VALUES 
      ('tech', 'Technology'),
      ('finance', 'Finance');
  `);

	// Insert company-industry relationships
	await db.query(`
    INSERT INTO company_industries (industry_code, company_code)
    VALUES 
      ('tech', 'apple'),
      ('tech', 'ibm'),
      ('finance', 'ibm');
  `);
}

module.exports = { createData };
