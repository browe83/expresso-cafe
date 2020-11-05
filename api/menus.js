const express = require('express');
const sqlite3 = require('sqlite3');

const menusRouter = express.Router();

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter
  .param('menuId', (req, res, next, id) => {
    db.get(`SELECT * FROM Menu WHERE id = ${id};`,
      (err, menu) => {
        if (err) {
          next(err);
        } else if (menu) {
          req.menu = menu;
          next();
        } else {
          res.sendStatus(404);
        }
      });
  })
  .get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu;',
      (err, menus) => {
        if (err) {
          next(err);
        } else {
          res.status(200).send({ menus });
        }
      });
  })
  .get('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM Menu WHERE id = ${req.menu.id}`,
      (err, menu) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ menu });
        }
      });
  })
  .post('/', (req, res, next) => {
    const { title } = req.body.menu;
    if (!title) {
      return res.sendStatus(400);
    }
    db.run('INSERT INTO Menu (title) VALUES ($title)', 
      {
        $title: title,
      },
      function(err) {
        if (err) {
          next(err);
        }
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID};`,
          (err, menu) => {
            if (err) {
              next(err);
            } else {
              res.status(201).send({ menu });
            }
          });
      });
  });

module.exports = menusRouter;
