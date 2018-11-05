
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
  //console.log(`connected as id ${connection.threadId}`);
});

function viewProducts() {
  connection.query(`SELECT * FROM products`, (err, res) => {
    if (err) throw (err);
    console.log(`${res.length} items in inventory`);
    res.forEach((e) => {
      data.push([e.item_id, e.product_name, e.department_name, e.price, e.stock_quantity]);
    });
    output = table(data);
    console.log(output);
    data = [
      ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
    ];
    manager();
  })
}

function lowProducts() {
  connection.query(`SELECT * FROM products WHERE stock_quantity <= 5`, (err, res) => {
    if (err) throw (err);
    res.forEach((e) => {
      data.push([e.item_id, e.product_name, e.department_name, e.price, e.stock_quantity]);
    });
    output = table(data);
    console.log(`====================LOW QUANTITY PRODUCTS====================
${output}`);
    data = [
      ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
    ];
    manager();
  });
}

function addInventory() {
  connection.query('SELECT * FROM products', (err, res) => {
    if (err) throw (err);
    const items = [];
    const itemQuantities = [];
    res.forEach((e) => {
      data.push([e.item_id, e.product_name, e.department_name, e.price, e.stock_quantity]);
      let itemData = {
        'name': e.product_name,
        'value': e.item_id
      }
      items.push(itemData);
      itemQuantities.push(e.stock_quantity);
      departments.push(e.department_name);
    });
    output = table(data);
    console.log(output);
    inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What item would you like to restock?',
        choices: items
      },
      {
        type: 'input',
        name: 'quantity',
        message: 'How many would you like to restock?',
      },
    ]).then((res) => {
      connection.query('UPDATE products SET ? WHERE ?', 
      [
        {
          stock_quantity: itemQuantities[res.choice - 1] + parseInt(res.quantity)
        },
        {
          item_id: res.choice
        },
      ], (err, res) => {
        if (err) throw (err);
      });
      console.log(`${res.quantity} of item ${res.choice} restocked!`);
      data = [
        ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
      ];
      manager();
    });
  });
}

function addProduct(){
  const departments = [];
  connection.query('SELECT * FROM products', (err, res) => {
    if (err) throw(err);
    res.forEach((e) => {
      if (departments.indexOf(e.department_name) === -1){
        departments.push(e.department_name);
      }
    });
  });
  inquirer.prompt([
    {
      type: 'input',
      name:'productName',
      message: 'What is the name of the product?'
    },
    {
      type: 'list',
      name: 'department',
      message:'What department does the product belong in?',
      choices : departments,
    },
    {
      type: 'input',
      name: 'price',
      message: 'What is the price of the product?',
    },
    {
      type: 'input',
      name: 'stock',
      message: 'What is the initial stock of the product?',
    },
  ]).then((answers) => {
    connection.query(`INSERT INTO products SET ?`, 
    {
      product_name: answers.productName,
      department_name: answers.department,
      price: answers.price,
      stock_quantity: answers.stock
    }, (err, res) => {
      if (err) throw(err);
    });
    console.log(`==========${answers.stock} ${answers.productName}s added to the ${answers.department} department at $${answers.price} each!==========`);
    data = [
      ['ID', 'Product', 'Department', 'Price(USD)', 'Stock'],
    ];
    manager();
  });
}
function manager() {
  const choices = [
    {
      'name': 'View Products for Sale',
      'value': 'view'
    },
    {
      'name': 'View Low Inventory',
      'value': 'low'
    },
    {
      'name': 'Add to Inventory',
      'value': 'addInventory'
    },
    {
      'name': 'Add New Product',
      'value': 'addProduct'
    },
  ]
  inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: 'MANAGER MENU',
      choices: choices
    }
  ]).then((res) => {
    const action = res.choice;
    switch (action) {
      case 'view':
        viewProducts();
        break;
      case 'low':
        lowProducts();
        break;
      case 'addInventory':
        addInventory();
        break;
      case 'addProduct':
        addProduct();
        break;
      default:
        manager();
    }
  });
}
manager();