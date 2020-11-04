const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeesRouter = express.Router();

employeesRouter
  .param('employeeId', (req, res, next, id) => {
    db.get(`SELECT * FROM Employee WHERE id = ${id}`,
      (err, employee) => {
        if (err) {
          next(err);
        } else if (employee) {
          req.employee = employee;
          next();
        } else {
          res.sendStatus(400);
        }
      });
  })
  .get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
      (err, employees) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ employees });
        }
      });
  })
  .get('/:employeeId', (req, res, _next) => {
    res.status(200).send({ employee: req.employee });
  })
  .post('/', (req, res, next) => {
    const { name } = req.body.employee;
    const { position } = req.body.employee;
    const { wage } = req.body.employee;
    // const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage) {
      return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Employee (name, position, wage) VALUES ($name, $position, $wage);';
    const values = {
      $name: name,
      $position: position,
      $wage: wage,
    //   $isCurEmp: isCurrentEmployee,
    };
    db.run(sql, values, function (err) {
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID};`,
          function (err, employee) {
            if (err) {
              next(err);
            } else {
              res.status(201).json({ employee });
            }
          });
      }
    });
  })
  .put('/:employeeId', (req, res, next) => {
    const { name } = req.body.employee;
    const { position } = req.body.employee;
    const { wage } = req.body.employee;
    if (!name || !position || !wage) {
      return res.sendStatus(400);
    }
    db.run(`UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = ${req.employee.id};`, 
      {
        $name: name,
        $wage: wage,
        $position: position,
      },
      (err) => {
        if (err) {
          next(err);
        } else {
          db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id};`,
            (error, employee) => {
              if (error) {
                next(error);
              }
              res.status(200).json({ employee });
            });
        }
      });
  })
  .delete('/:employeeId', (req, res, next) => {
    db.run('UPDATE Employee SET is_current_employee = 0',
      (err) => {
        db.get(`SELECT * FROM Employee WHERE id = ${req.employee.id};`,
          (err, employee) => {
            if (err) {
              next(err);
            } else {
              res.status(200).json({ employee });
            }
          });
      });
  });

module.exports = employeesRouter;
