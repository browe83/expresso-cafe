const express = require('express');
const sqlite3 = require('sqlite3');
const employeesRouter = require('./employees');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = express.Router({ mergeParams: true });

timesheetsRouter
  .get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`,
      (err, timesheets) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ timesheets });
        }
      });
  })
  .post('/', (req, res, next) => {
    const { hours } = req.body.timesheet;
    const { rate } = req.body.timesheet;
    const { date } = req.body.timesheet;
    const { employeeId } = req.params;
    if (!hours || !rate || !date) {
      return res.sendStatus(400);
    }
    db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)',
      {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: employeeId,
      },
      function(err) {
        if (err) {
          next(err);
        }
        db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID};`,
          (err, timesheet) => {
            if (err) {
              next(err);
            }
            res.status(201).json({ timesheet });
          });
      });
  });

module.exports = timesheetsRouter;
