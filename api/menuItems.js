const express = require('express');
const sqlite3 = require('sqlite3');

const menuItemsRouter = express.Router();

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter
  .get('/', (req, res, next) => {
    res.send('received menuItems get req');
  });

module.exports = menuItemsRouter;
