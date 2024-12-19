const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

/** GET /invoices: Returns info on invoices */
router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(
			'SELECT id, comp_code FROM invoices ORDER BY id'
		);
		return res.json({ invoices: results.rows });
	} catch (e) {
		return next(e);
	}
});

/** 
  GET /invoices/[id]: Returns object on given invoice.
  If invoice cannot be found, returns 404.  
*/
router.get('/:id', async (req, res, next) => {
	try {
		let { id } = req.params;
		const results = await db.query(
			`SELECT i.id, 
              i.amt, 
              i.paid, 
              i.add_date, 
              i.paid_date, 
							c.code AS company_code, 
              c.name,
              c.description
       FROM invoices AS i
        INNER JOIN companies AS c ON (i.comp_code = c.code)
       WHERE i.id=$1`,
			[id]
		);

		if (results.rows.length === 0) {
			throw new ExpressError(`Invoice with id '${id}' cannot be found`, 404);
		}

		const data = results.rows[0];
		const invoice = {
			id: data.id,
			amt: data.amt,
			paid: data.paid,
			add_date: data.add_date,
			paid_date: data.paid_date,
			company: {
				code: data.company_code,
				name: data.name,
				description: data.description,
			},
		};
		return res.json({ invoice });
	} catch (e) {
		return next(e);
	}
});

/** POST /invoices: Adds an invoice */
router.post('/', async (req, res, next) => {
	try {
		const { comp_code, amt } = req.body;
		const results = await db.query(
			`INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[comp_code, amt]
		);
		return res.status(201).json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

/**
  PUT /invoices/[id]: Updates an invoice.
  Returns 404 if invoice cannot be found.
*/
router.put('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;
		const { amt, paid } = req.body;

		const invoiceCheck = await db.query(
			`SELECT paid FROM invoices WHERE id=$1`,
			[id]
		);

		if (invoiceCheck.rows.length === 0) {
			throw new ExpressError(`Invoice with id '${id}' cannot be found`, 404);
		}

		let paidDate = null;
		if (paid === true && invoiceCheck.rows[0].paid === false) {
			paidDate = new Date();
		} else if (paid === false && invoiceCheck.rows[0].paid === true) {
			paidDate = null;
		} else {
			paidDate = invoiceCheck.rows[0].paid_date;
		}

		const results = await db.query(
			`UPDATE invoices 
      SET amt=$1,  paid=$2, paid_date=$3 
      WHERE id=$4
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
			[amt, paid, paidDate, id]
		);

		return res.json({ invoice: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});

/**
  DELETE /invoices/[id]: Deletes an invoice.
  Returns 404 if invoice cannot be found.
*/
router.delete('/:id', async (req, res, next) => {
	try {
		const { id } = req.params;

		const results = await db.query(
			'DELETE FROM invoices WHERE id=$1 RETURNING id',
			[id]
		);
		if (results.rows.length === 0) {
			throw new ExpressError(`Invoice with id '${id}' cannot be found`, 404);
		}
		return res.json({ status: 'deleted' });
	} catch (e) {
		return next(e);
	}
});

module.exports = router;
