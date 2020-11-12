const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router({ mergeParams: true });

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter
  .param('menuItemId', (req, res, next, id) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${id}`,
      (err, menuItem) => {
        if (err) {
          next(err);
        } else if (menuItem) {
          req.menuItem = menuItem;
          next();
        } else {
          res.sendStatus(404);
        }
      });
  })
  .get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId};`,
      (err, menuItems) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ menuItems });
        }
      });
  })
  .get('/:menuItemId', (req, res, next) => {
    res.status(200).json({ menuItem: req.menuItem });
  })
  .post('/', (req, res, next) => {
    const { name } = req.body.menuItem;
    const { description } = req.body.menuItem;
    const { inventory } = req.body.menuItem;
    const { price } = req.body.menuItem;
    const { menuId } = req.params;
    const menuSql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const menuValues = { $menuId: menuId };
    db.get(menuSql, menuValues, (err, menu) => {
      if (err) {
        next(err);
      } else {
        if (!name || !inventory || !price || !menu) {
          return res.sendStatus(400);
        }
        db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $desc, $inv, $price, $menuId)',
          {
            $name: name,
            $desc: description,
            $inv: inventory,
            $price: price,
            $menuId: menuId,
          },
          function(err) {
            if (err) {
              next(err);
            } else {
              db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID};`,
                (err, menuItem) => {
                  if (err) {
                    next(err);
                  } else {
                    res.status(201).json({ menuItem });
                  }
                });
            }
          });
      }
    });
  })
  .put('/:menuItemId', (req, res, next) => {
    const { name } = req.body.menuItem;
    const { description } = req.body.menuItem;
    const { inventory } = req.body.menuItem;
    const { price } = req.body.menuItem;
    const { menuId } = req.params;
    if (!name || !inventory || !price || !req.menu) {
      return res.sendStatus(400);
    }
    const sql = 'UPDATE MenuItem SET name = $name, description = $desc, inventory = $inv, price = $price, menu_id = $menuId WHERE id = $menuItemId';
    const values = {
      $name: name,
      $desc: description,
      $inv: inventory,
      $price: price,
      $menuId: menuId,
      $menuItemId: req.params.menuItemId,
    };
    db.run(sql, values,
      (err) => {
        if (err) {
          next(err);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId};`,
            (err, menuItem) => {
              if (err) {
                next(err);
              } else {
                res.status(200).json({ menuItem });
              }
            });
        }
      });
  })
  .delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.menuItem.id};`,
      (err) => {
        if (err) {
          next(err);
        } else {
          res.sendStatus(204);
        }
      });
  });

module.exports = menuItemsRouter;
