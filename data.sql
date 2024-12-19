\c biztime_test

-- Drop existing tables
DROP TABLE IF EXISTS company_industries;
DROP TABLE IF EXISTS industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;

-- Create companies table
CREATE TABLE companies (
    code text PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text
);

-- Create invoices table
CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

-- Create industries table
CREATE TABLE industries (
  code text PRIMARY KEY,
  industry text NOT NULL
);

-- Create company_industries table
CREATE TABLE company_industries (
  industry_code text REFERENCES industries(code) ON DELETE CASCADE,
  company_code text REFERENCES companies(code) ON DELETE CASCADE,
  PRIMARY KEY (industry_code, company_code)
);

-- Insert data into companies
INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.');

-- Insert data into invoices
INSERT INTO invoices (comp_Code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

-- Insert data into industries
INSERT INTO industries (code, industry)
  VALUES ('tech', 'Technology'),
         ('finance', 'Finance'),
         ('consulting', 'Consulting');

-- Insert data into company_industries
INSERT INTO company_industries (industry_code, company_code)
  VALUES ('tech', 'apple'),
         ('tech', 'ibm'),
         ('finance', 'ibm'),
         ('consulting', 'ibm');