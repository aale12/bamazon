
require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
const { table } = require('table');
let data,
  output;

data = [
  ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
];


const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'bamazon',
});

connection.connect((err) => {
  if (err) throw err;
  console.log(`connected as id ${connection.threadId}`);
});

function customer() {
  connection.query('SELECT * FROM products', (err, res) => {
    if (err) throw err;
    const items = [];
    const itemQuantities = [];
    console.log(`${res.length} items in inventory`);
    res.forEach((e) => {
      data.push([e.item_id, e.product_name, e.department_name, e.price, e.stock_quantity]);
      let itemData = {
        'name': e.product_name,
        'value': e.item_id
      }
      items.push(itemData);
      itemQuantities.push(e.stock_quantity);
    });
    output = table(data);
    console.log(output);
    inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What item would you like to buy?',
        choices: items
      },
      {
        type: 'input',
        name: 'quantity',
        message: 'How many would you like to buy?',
      },
    ]).then((res) => {
      if (itemQuantities[res.choice - 1] - parseInt(res.quantity) > 0) {
        connection.query('UPDATE products SET ? WHERE ?',
          [
            {
              stock_quantity: itemQuantities[res.choice - 1] - parseInt(res.quantity),
            },
            {
              item_id: res.choice,
            }
          ], (err, res) => {
            if (err) throw (err);
            console.log(`${res.affectedRows} product(s) updated!
        `);
            data = [
              ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
            ];
            customer();
          });
      } else {
        console.log(`There is not enough of that item in stock to purchase!`);
        data = [
          ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
        ];
        customer();
      }
      console.log(res);
    })
  });
}

customer();