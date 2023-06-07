var express = require('express');
var router = express.Router();
const { handleError, verifyAuth, getProduct } = require('../utils');
var { users, products } = require('../db');
const nodemailer = require('nodemailer');
const sgmail = require('@sendgrid/mail');
const sendgrid =
  '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';
const sendg =
  'SG.eSGqF06FTM-mwTgq0299zg.vLyFph_Ymm9FAW8jVPVcPbaOPVmyz3q0G7vWVkGvGVk';
sgmail.setApiKey(sendgrid);

const createHtmltemp = async (usr, total) => {
  let temp = `<!DOCTYPE html>
<html>
<head>
    <title>Order Confirmation</title>
    <style>
        body {
            background-color: #f8f8f8;
            font-family: Arial, sans-serif;
        }

        .container {
            width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        h1 {
            color: #ff7f50;
            text-align: center;
        }

        p {
            color: #333333;
            margin-bottom: 20px;
        }

        .order-details {
            background-color: #f1f1f1;
            padding: 10px;
            border-radius: 5px;
        }

        .order-details table {
            width: 100%;
        }

        .order-details th, .order-details td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #dddddd;
        }

        .order-details th {
            background-color: #e6e6e6;
        }

        .thank-you {
            text-align: center;
            margin-top: 30px;
        }

        .thank-you img {
            width: 100px;
            height: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Order Confirmation</h1>

        <p>Dear ${usr.username},</p>

        <p>Thank you for placing an order with us. We are happy to confirm that your order has been successfully processed.</p>

        <div class="order-details">
            <table>
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                </tr>`;
  for (var i = 0; i < usr.cart.length; i++) {
    const prod = await getProduct(usr.cart[i].productId);
    console.log(prod);
    temp =
      temp +
      `<tr>
                    <td>${prod.name}</td>
                    <td>${usr.cart[i].qty}</td>
                    <td>$${prod.cost}</td>
                </tr>`;
  }

  temp =
    temp +
    `
            </table>
        </div>

        <p>Your total amount payable is: <strong>$${total}</strong>.</p>

        <p>Please allow 3-5 business days for your order to be delivered. If you have any questions or concerns, please feel free to contact our customer support.</p>

        <div class="thank-you">
            <img src="https://example.com/thank-you-image.png" alt="Thank You">
            <p>Thank you for choosing our services!</p>
        </div>
    </div>
</body>
</html>
`;
  return temp;
};

// Cart Controller
router.get('/', verifyAuth, (req, res) => {
  console.log(`GET request to "/cart" received`);

  return res.status(200).json(req.user.cart);
});

router.post('/', verifyAuth, async (req, res) => {
  console.log(`POST request to "/cart" received`);

  products.findOne({ _id: req.body.productId }, async (err, product) => {
    if (err) {
      return handleError(res, err);
    }
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product doesn't exist" });
    }

    const index = await req.user.cart.findIndex(
      (element) => element.productId === req.body.productId
    );

    if (index === -1) {
      req.user.cart.push({
        productId: req.body.productId,
        qty: req.body.qty
      });
    } else if (req.body.qty === 0) {
      // delete
      req.user.cart.splice(index, 1);
    } else {
      //modify
      req.user.cart[index].qty = req.body.qty;
    }
    users.update(
      { _id: req.user._id },
      { $set: { cart: req.user.cart } },
      {},
      (err) => {
        if (err) {
          handleError(res, err);
        }

        console.log(
          `User ${req.user.username}'s cart updated to`,
          req.user.cart
        );

        return res.status(200).json(req.user.cart);
      }
    );
  });
});

router.post('/checkout', verifyAuth, async (req, res) => {
  console.log(
    `POST request received to "/cart/checkout": ${req.user.username}`
  );
  console.log(req.user);
  let total = 0;
  for (let element of req.user.cart) {
    try {
      const product = await getProduct(element.productId);
      if (product == null) {
        throw new Error('Invalid product in cart. ');
      }
      total = total + element.qty * product.cost;
    } catch (error) {
      handleError(res, error);
    }
  }
  if (total === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }
  if (req.user.balance < total) {
    return res.status(400).json({
      success: false,
      message: 'Wallet balance not sufficient to place order'
    });
  }
  if (!req.body.addressId) {
    return res.status(400).json({
      success: false,
      message: 'Address not set'
    });
  }
  const addressIndex = await req.user.addresses.findIndex(
    (element) => element._id === req.body.addressId
  );
  if (addressIndex === -1) {
    return res
      .status(404)
      .json({ success: false, message: 'Bad address specified' });
  }
  req.user.balance -= total;
  console.log('Mock order placed');
  console.log('Cart', req.user.cart);
  console.log('Total cost', total);
  console.log('Address', req.user.addresses[addressIndex]);
  const msg = {
    to: 'snehabalachander21@gmail.com',
    from: 'qkart40008@gmail.com',
    subject: 'order confirmation',
    text: 'test text',
    html: await createHtmltemp(req.user, total)
  };
  sgmail
    .send(msg)
    .then(() => console.log('hello'))
    .catch((err) => console.log(err.message));
  // Now clear cart
  req.user.cart = [];
  users.update({ _id: req.user._id }, req.user, {}, (err) => {
    if (err) {
      handleError(res, err);
    }
    return res.status(200).json({
      success: true
    });
  });
});

module.exports = router;
