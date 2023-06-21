#LiqPay Integration

This project demonstrates how to integrate LiqPay payment gateway into a Node.js application. LiqPay is a popular payment solution that allows businesses to accept online payments securely.

##Prerequisites

To run this project, you'll need:

1. Node.js (version 12 or higher)
2. MongoDB (Make sure MongoDB is installed and running on your machine)

##Getting Started
Clone this repository to your local machine.

Install the dependencies by running the following command:

Copy code
`npm install`
Configure the application by creating a .env file in the project root directory. Use the .env.example file as a reference and provide your LiqPay API keys and other required information.

Start the application using the following command:

sql
Copy code
npm start

This will start the server and connect to the MongoDB database.

Open your web browser and navigate to http://localhost:3000 to access the application.

Usage
The application provides the following endpoints:

`/api/payment/create` - Creates a new payment order and returns a form to submit the payment details to LiqPay.
`/api/payment/callback` - Callback URL for LiqPay to notify the application about the payment status. This endpoint should be configured as the callback URL in your LiqPay account settings.
Contributing
Contributions are welcome! If you find any issues or want to enhance the functionality of this project, feel free to open a pull request.

License
This project is licensed under the MIT License.
