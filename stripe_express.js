const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
// const stripe_secret = require('./stripe_secret');
const stripe = require('stripe')('xxxxxxxxxxxxxxxxxxxxxxxx');

const strukt_app_site_domain = 'https://strukt.ca';
// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	next();
});

app.post('/stripesess', async (req, res) => {
	if (req.body.type === 'generate_checkout') {
		let line_item_temp = {};
		let price = '';
		let description = '';
		let mode_temp = '';
		let submit_type_temp = '';
		let delete_submit_type = false;
		if (req.body.product_type === '1') {
			price = 'skjdjaosidjfoia';
			description = '1 digital credit for minting a single digital asset';
			line_item_temp.adjustable_quantity = {
				enabled: true,
				minimum: '1',
				maximum: '100',
			};
			line_item_temp.quantity = '1';
			mode_temp = 'payment';
			submit_type_temp = 'pay';
		} else if (req.body.product_type === '2') {
			price = 'skjdjaosidjfoia';
			description = '5 document minting credits';
			line_item_temp.adjustable_quantity = {
				enabled: true,
				minimum: '1',
				maximum: '100',
			};
			line_item_temp.quantity = '1';
			mode_temp = 'payment';
			submit_type_temp = 'pay';
		} else if (req.body.product_type === '3') {
			price = 'skjdjaosidjfoia';
			description = 'Unlimited digital asset minting';
			mode_temp = 'subscription';
			line_item_temp.quantity = '1';
			delete_submit_type = true;
		} else {
			res.status(400).json({ error: 'Something went really wrong' });
			return;
		}

		line_item_temp = { ...line_item_temp, price, description };

		const send_object = {
			line_items: [line_item_temp],
			billing_address_collection: 'auto',
			mode: mode_temp,
			submit_type: submit_type_temp,
			automatic_tax: { enabled: true },
			success_url: strukt_app_site_domain + '/success_purchase',
			cancel_url: strukt_app_site_domain + '/purchase_back',
		};

		if (delete_submit_type) {
			delete send_object.submit_type;
		}
		try {
			const session = await stripe.checkout.sessions.create(send_object);
			return res.status(243).json({ session });
		} catch (err) {
			console.log('ERRROOORRRRROOORRR', err);
			return res.status(423);
		}
	}
});

app.listen(3000, function () {
	console.log('App started');
});
