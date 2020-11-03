const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeesRouter = express.Router();

employeesRouter
  .get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
      (err, employees) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ employees });
        }
      });
  });

module.exports = employeesRouter;
