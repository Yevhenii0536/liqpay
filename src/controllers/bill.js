const request = require('request');
const crypto = require('crypto');
const buffer = require('buffer');
const { Bill } = require('../models/bill');
const { PUBLIC_KEY, PRIVATE_KEY } = require('../utils/keys');
const { v4: uuidv4 } = require('uuid');
const { STATUS_LINK } = require('../utils/statusLink');
const LiqPay = require('../utils/liqPay');

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
          { paymentStatus: result.status },
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
    const liqpay = new LiqPay(PUBLIC_KEY, PRIVATE_KEY);

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
    };

    const bill = await Bill.create({
      clientID: req.body.clientID,
      totalPrice: req.body.totalPrice,
    });

    const form = liqpay.cnb_form(formData);

    res.send(form);
  } catch (error) {
    console.error(error);
    res.status(500).send('Помилка сервера');
  }
};

const handlePaymentResult = async (req, res) => {
  try {
    const order_id = req.body.order_id;
    const paymentID = req.body.payment_id;

    const formData = {
      version: '3',
      public_key: PUBLIC_KEY,
      action: 'status',
      order_id: order_id,
      payment_id: paymentID,
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
        await Bill.findByIdAndUpdate(
          order_id,
          { paymentStatus: result.status, isPaid: true },
          { new: true },
        );
      }

      if (result.status === 'success') {
        return res.send('Платіж успішно оброблено');
      } else {
        return res.send('Платіж не було успішно оброблено');
      }
    });
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
