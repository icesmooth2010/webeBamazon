
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    // Your password
    password: "Spero2000!",
    database: "bamazon_DB"
});
//connect to the mysql server and sql database
connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});
function start() {
    connection.query("SELECT * FROM bamazon_db.products", function (err, results) {
        // console.log(results);

        var i;
        for (i = 0; i < results.length; i++) {
            console.log("item_id: " + results[i].item_id + " product_name: " + results[i].product_name + " dept_name: " + results[i].dept_name + " price: " + results[i].price + " stock_quantity: " + results[i].stock_quantity);
        }
        questions();
    })
}
// validateInput makes sure that the user is supplying only positive integers for their inputs
function validateInput(value) {
	var integer = Number.isInteger(parseFloat(value));
	var sign = Math.sign(value);

	if (integer && (sign === 1)) {
		return true;
	} else {
		return 'Please enter a whole non-zero number.';
	}
}
function questions() {
    // console.log("hello Jess")
    inquirer
        .prompt([
            {
                name: "choice",
                type: "input",
                message: "What is the item ID that you would like to buy?"

            },
            {
                name: "stock_quantity",
                type: "input",
                message: "How many would you like?"
            }
        ])
        //  .then(function (answer) {
            // get the information of the chosen item
            // var chosenItem;
            // for (var i = 0; i < results.length; i++) {
            //   if (results[i].item_name === answer.choice) {
            //     chosenItem = results[i];
            //   }
            // }
            .then(function(input) {
                console.log('Customer has selected: \n    item_id = '  + input.choice + '\n    quantity = ' + input.stock_quantity);
            
                var item = input.choice;
                var quantity = input.stock_quantity;
            
                // Query db to confirm that the given item ID exists in the desired quantity
                var queryStr = 'SELECT * FROM products WHERE ?';
            
                connection.query(queryStr, {item_id: item}, function(err, data) {
                    if (err) throw err;
            
                    // If the user has selected an invalid item ID, data array will be empty
                    // console.log('data = ' + JSON.stringify(data));
            
                    if (data.length === 0) {
                        console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                        displayInventory();
            
                    } else {
                        var productData = data[0];
            
                        // console.log('productData = ' + JSON.stringify(productData));
                        // console.log('productData.stock_quantity = ' + productData.stock_quantity);
            
                        // If the quantity requested by the user is in stock
                        if (quantity <= productData.stock_quantity) {
                            console.log('Congratulations, the product you requested is in stock! Placing order!');
            
                            // Construct the updating query string
                            var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
                            // console.log('updateQueryStr = ' + updateQueryStr);
            
                            // Update the inventory
                            connection.query(updateQueryStr, function(err, data) {
                                if (err) throw err;
            
                                console.log('Your order has been placed! Your total is $' + productData.price * quantity);
                                console.log('Thank you for shopping with us!');
                                console.log("\n---------------------------------------------------------------------\n");
            
                                // End the database connection
                                connection.end();
                            })
                        } else {
                            console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
                            console.log('Please modify your order.');
                            console.log("\n---------------------------------------------------------------------\n");
            
                            displayInventory();
                        }
                    }
                })
            })
        }


// displayInventory will retrieve the current inventory from the database and output it to the console
function displayInventory() {
// console.log('___ENTER displayInventory___');

// Construct the db query string
queryStr = 'SELECT * FROM products';

// Make the db query
connection.query(queryStr, function(err, data) {
    if (err) throw err;

    console.log('Existing Inventory: ');
    console.log('...................\n');

    var strOut = '';
    for (var i = 0; i < data.length; i++) {
        strOut = '';
        strOut += 'Item ID: ' + data[i].item_id + '  //  ';
        strOut += 'Product Name: ' + data[i].product_name + '  //  ';
        strOut += 'Department: ' + data[i].dept_name + '  //  ';
        strOut += 'Price: $' + data[i].price + '\n';

        console.log(strOut);
    }

      console.log("---------------------------------------------------------------------\n");

      //Prompt the user for item/quantity they would like to purchase
    //  questions();
})
}
// runBamazon will execute the main application logic
function runBamazon() {
	// console.log('___ENTER runBamazon___');

	// Display the available inventory
	displayInventory();
}

// Run the application logic
runBamazon();