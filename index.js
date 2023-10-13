var express = require("express");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var mysql = require("mysql");
var session = require("express-session");

var app = express(); //initializing express
app.set("view engine", "ejs"); // to access the public folder
app.use(express.static("public")); // it is use to tell express to use ejs template
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: "secret" }));

// var result=[

// ]

// creating connection to mysql server

mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodeproject",
});

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "nodeproject",
});
//setting up local server
app.get("/", function (req, res) {
  //two parameter path and function

  con.query("SELECT * FROM products", (err, result) => {
    res.render("pages/index", { result: result });
  });
});

app.listen(8080);




function isProductInCart(cart, id) {
  for (let i = 0; i < cart.length; i++) {
    if (cart[i].id == id) {
      return true;
    }
  }
  return false;
}

function calculateTotal(cart, req) {
  total = 0;
  for (let i = 0; i < cart.length; i++) {
    //if we are offering a discounted price

    if (cart[i].sale_price) {
      total = toal + cart[i].sale_price * cart[i].quantity;
    } else {
      total = total + cart[i].price * cart[i].quantity;
    }
  }
  req.session.total = total;
  return total;
}

// cart inputs
app.post("/add_to_cart", function (req, res) {
  var id = req.body.id;
  var name = req.body.name;
  var price = req.body.price;
  var sale_price = req.body.sale_price;
  var quantity = req.body.quantity;
  var image = req.body.image;
  var product = {
    id: id,
    name: name,
    price: price,
    sale_price: sale_price,
    quantity: quantity,
    image: image,
  };

  if (req.session.cart) {
    var cart = req.session.cart;
    if (!isProductInCart(cart, id)) {
      cart.push(product);
    }
  } else {
    req.session.cart = [product];
    var cart = req.session.cart;
  }

  // calculate total amount
  calculateTotal(cart, req);
  //return to cart page
  res.redirect("/cart");
});

app.post("/edit_product_quantity", function (req, res) {
  var id = req.body.id;
  var quantity = req.body.quantity;
  var increase_btn = req.body.increase_product_quantity;
  var decrease_btn = req.body.decrease_product_quantity;

  var cart = req.session.cart;

  if (increase_btn) {
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        if (cart[i].quantity > 0) {
          cart[i].quantity = parseInt(cart[i].quantity) + 1;
        }
      }
    }
  }

  if (decrease_btn) {
    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id == id) {
        if (cart[i].quantity > 1) {
          cart[i].quantity = parseInt(cart[i].quantity) - 1;
        }
      }
    }
  }

  calculateTotal(cart, req);
  res.redirect("/cart");
});

//res.redirect('/cart') url creation
app.get("/cart", function (req, res) {
  var cart = req.session.cart;
  var total = req.session.total;

  res.render("pages/cart", { cart: cart, total: total });
});

app.get("/checkout", function (req, res) {
  var total = req.session.total;
  res.render("pages/checkout", { total: total });
});
app.post("/place_order", function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var city = req.body.city;
  var address = req.body.address;
  var cost = req.session.total;
  var status = "not paid";
  var date = new Date();

  var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "nodeproject",
  });

  //orders table configuration

  con.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      var query =
        "INSERT INTO orders(cost,name,email,status,city,address,phone,date,products_ids) VALUES ?";
      var values = [
        [cost, name, email, status, city, address, phone, date, products_ids],
      ];

      con.query(query, [values], (err, result) => {
       
       
        // order items table

        for (let i = 0; i < cart.length; i++) {
          var query =
            "INSERT INTO order_items (order_id,product_id,product_name,product_price,product_image,product_quantity,order_date)";
          var values = [
            [
              id,
              cart[i].id,
              cart[i].name,
              cart[i].price,
              cart[i].image,
              cart[i].quantity,
              new Date(),
            ],
          ];
          con.query(query[values], (err, result) => {});
        }

        res.redirect("/payment");
      });
    }
  });
});
app.get("/payment", function (req, res) {
  var total=req.session.total
  res.render("pages/payment",{total:total});
});
