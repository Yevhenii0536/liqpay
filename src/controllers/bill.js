const request = require('request');
const crypto = require('crypto');
const buffer = require('buffer');
const { Bill } = require('../models/bill');
const { PUBLIC_KEY, PRIVATE_KEY } = require('../utils/keys');
const { v4: uuidv4 } = require('uuid');
const { STATUS_LINK } = require('../utils/statusLink');
const LiqPay = require('../utils/liqPay');

const liqPay = new LiqPay(PUBLIC_KEY, PRIVATE_KEY);

const checkStatus = async (req, res) => {
  try {
    const order_id = req.params.order_id;

    const formData = {
      version: '3',
      public_key: PUBLIC_KEY,
      action: 'status',
    };

    const data = buffer.Buffer.from(JSON.stringify(formData)).toString(
      'base64',
    );
    const signature = crypto
      .createHmac('sha1', PRIVATE_KEY)
      .update(data)
      .digest('base64');

    const requestOptions = {
      url: STATUS_LINK,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        data: data,
        signature: signature,
      },
    };

    request(requestOptions, async function (error, response, body) {
      if (error) {
        console.error(error);
        return res.status(500).send('Помилка сервера');
      }

      const result = JSON.parse(body);

      if (result.status !== 'error') {
        await Bill.updateOne(
          { _id: order_id },
          { paymentStatus: result.status, isPaid: true },
        );
      }

      res.json(result);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Помилка сервера');
  }
};

const createPayment = async (req, res) => {
  try {
    const formData = {
      version: '3',
      public_key: PUBLIC_KEY,
      private_key: PRIVATE_KEY,
      action: 'pay',
      amount: '1',
      currency: 'UAH',
      description: 'Payment for order',
      order_id: uuidv4(),
      sandbox: '1',
      server_url: 'https://4f99-87-244-141-33.eu.ngrok.io/bill/payment-result',
    };

    const bill = await Bill.create({
      clientID: req.body.clientID,
      totalPrice: req.body.totalPrice,
    });

    const form = liqPay.cnb_form(formData);

    res.send(form);
  } catch (error) {
    console.error(error);
    res.status(500).send('Помилка сервера');
  }
};

const handlePaymentResult = async (req, res) => {
  try {
    const encodedData = req.body.data;

    console.log(encodedData);

    let decodedData = JSON.parse(Buffer.from(encodedData, 'base64').toString());

    console.log(decodedData);

    liqPay.api(
      'request',
      {
        action: 'status',
        version: '3',
        order_id: decodedData.order_id,
      },
      async function (json) {
        if (json.status === 'success') {
          await Bill.findByIdAndUpdate(
            decodedData.order_id,
            { isPaid: true },
            { new: true },
          );
        } else {
          console.log('Test');
        }

        res.json(json);
      },
    );
  } catch (error) {
    console.error(error);
    res.status(500).send('Помилка сервера');
  }
};

module.exports = {
  checkStatus,
  createPayment,
  handlePaymentResult,
};
