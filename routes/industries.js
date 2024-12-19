const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

/** GET /industries: REturns list of industries with associated companies */
router.get('/', async (req, res, next) => {
	try {
		const results = await db.query(
			`SELECT i.code, i.industry,
      (SELECT json_agg(c.company_code)
      FROM company_industries AS c 
      WHERE c.industry_code = i.code) AS companies
      FROM industries AS i`
		);
		return res.json({ industries: results.rows });
	} catch (e) {
		return next(e);
	}
});

/** POST /industries: Adds a new industry */
router.post('/', async (req, res, next) => {
	try {
		const { code, industry } = req.body;
		const results = await db.query(
			`INSERT INTO industries (code, industry)
      VALUES ($1, $2)
      RETURNING code, industry`,
			[code, industry]
		);
		return res.status(201).json({ industry: results.rows[0] });
	} catch (e) {
		return next(e);
	}
});


/** POST /industries/:code/companies: Associates an industry with a company */
router.post('/:code/companies', async (req, res, next) => {
  try {
    const {code } = req.params;
    const { company_code } = req.body;
    await db.query(
      `INSERT INTO company_industries (industry_code, company_code)
      VALUES ($1, $2)`,
      [code, company_code]
    );
    return res.status(201).json({ status: 'added' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
