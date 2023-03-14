// Requiring the modules
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

// Reading the files
const productData = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8")
);

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);

const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);

const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const tempAddPro = fs.readFileSync(
  `${__dirname}/templates/template-addPro.html`,
  "utf-8"
);

const tempRemovePro = fs.readFileSync(
  `${__dirname}/templates/template-removePro.html`,
  "utf-8"
);

let tempConfirm = fs.readFileSync(
  `${__dirname}/templates/template-confirm.html`,
  "utf-8"
);

const tempFailed = fs.readFileSync(
  `${__dirname}/templates/template-failed.html`,
  "utf-8"
);

const tempBuy = fs.readFileSync(
  `${__dirname}/templates/template-buyPro.html`,
  "utf-8"
);

const tempDelivery = fs.readFileSync(
  `${__dirname}/templates/template-delivery.html`,
  "utf-8"
);

// Defining the required functions
const replaceVar = function (temp, product) {
  let output = temp.replace(/{%PRODUCTNAME%}/g, product.productName);
  output = output.replaceAll(/{%IMAGE%}/g, product.image);
  output = output.replace(/{%ID%}/g, product.id);
  output = output.replace(/{%PRICE%}/g, product.price);
  output = output.replace(/{%QUANTITY%}/g, product.quantity);
  output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
  output = output.replace(/{%FROM%}/g, product.from);
  output = output.replace(/{%DESCRIPTION%}/g, product.description);

  if (!product.organic)
    output = output.replace(/{%NOT_ORGANIC%}/g, "not-organic");
  return output;
};

// Declearing the important variables
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port = 3000;
let id;

// Route for overview section
app.get("/overview", (req, res) => {
  const cardHTML = productData
    .map((el) => {
      return replaceVar(tempCard, el);
    })
    .join("");
  const output = tempOverview.replace(/{%PRODUCT_CARDS%}/g, cardHTML);
  res.send(output);
});

// Route for adding the product
app.get("/addProduct", (req, res) => {
  const output = tempAddPro.replace(/{%ID%}/g, productData.length);
  res.send(output);
});

// Route for confirming the addition of the product
app.post("/addProduct", (req, res) => {
  let organicProduct = false;
  if (req.body.product_isOrganic.toLowerCase() === "yes") {
    organicProduct = true;
  }
  const newData = {
    id: productData.length,
    productName: req.body.product_name,
    image: req.body.product_image,
    from: req.body.product_from,
    nutrients: req.body.product_nutrients,
    quantity: req.body.product_quantity,
    price: req.body.product_price,
    organic: organicProduct,
    description: req.body.product_description,
  };

  productData.push(newData);
  fs.writeFile(
    `${__dirname}/dev-data/data.json`,
    JSON.stringify(productData),
    (err) => {
      console.log(err);
    }
  );

  tempConfirm = tempConfirm.replace(/{%OPERATE%}/g, "ADDED");
  res.send(tempConfirm);
});

// Route for removing the product
app.get("/removeProduct", (req, res) => {
  res.send(tempRemovePro);
});

// Route for confirming the removal of product
app.post("/removeProduct", (req, res) => {
  const removeId = req.body.product_id;
  if (removeId > productData.length - 1) return res.send(tempFailed);
  const newArr = [];
  for (let i = 0; i < productData.length; i++) {
    if (i == removeId) {
      continue;
    } else {
      newArr.push(productData[i]);
    }
  }
  for (let i = removeId; i < newArr.length; i++) {
    newArr[i].id--;
  }

  fs.writeFile(
    `${__dirname}/dev-data/data.json`,
    JSON.stringify(newArr),
    (err) => {
      console.log(err);
    }
  );

  tempConfirm = tempConfirm.replace(/{%OPERATE%}/g, "REMOVED");
  res.send(tempConfirm);
});

// Route for product section
app.get("/product", (req, res) => {
  id = req.query.id;
  const output = replaceVar(tempProduct, productData[id]);
  res.send(output);
});

// Route for buying the product
app.get("/buy", (req, res) => {
  const output = tempBuy.replace(
    /{%PRODUCTNAME%}/g,
    productData[id].productName
  );
  res.send(output);
});

app.post("/buy", (req, res) => {
  const address = req.body.address;
  const quantity = Number(req.body.quantity);
  const date = new Date();
  let output = tempDelivery.replace(
    /{%PRODUCTNAME%}/g,
    productData[id].productName
  );
  output = output.replace(/{%ADDRESS%}/g, address);
  output = output.replace(
    /{%AMOUNT%}/g,
    (
      (Number(productData[id].price) / Number(productData[id].quantity)) *
      quantity
    ).toFixed(2)
  );
  output = output.replace(
    /{%DATE%}/g,
    `${date.getDate() + 5}/${date.getMonth() + 1}/${date.getFullYear()}`
  );

  res.send(output);
});

// Starting the server
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
