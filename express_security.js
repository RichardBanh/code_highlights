const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const { QldbDriver } = require('amazon-qldb-driver-nodejs');
const { uuid, date_past } = require('./utils');

const { insert_document } = require('./create_entry');
// const { update_document, update_document_password } = require('./update')

const { update_document } = require('./update');
// const { get_single_entry_one, req_document_id } = require('./single_entry')

const { get_single_entry_one } = require('./single_entry');
const { get_list_user } = require('./get_list_user');
const { search_error } = require('./search_error');

const app = express();

const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
const { write_password_hash, determine_match } = require('./password');

const { loop_object_load } = require('./loop_object_load');
const { revision_history } = require('./revision_history');

// const {remove_password} = require("./remove_password")

// const {getCustomUserAttributes, parseUserPoolId, parse_username} = require("./get_userinfo_func")
// const bcrypt = require('bcryptjs')

const { verifier_jwt } = require('./jwt');
const { credit_check, remove_credit } = require('credit_check');

const dynamodb = new AWS.DynamoDB.DocumentClient();

app.use(helmet());

app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	next();
});

app.post(
	'/records',
	body('document_pixel_values').notEmpty().isString().trim(),
	body('document_coordinates').notEmpty().isString().trim(),
	body('type').notEmpty().isString().trim().escape(),
	body('password').notEmpty().isString().trim(),
	body('width').trim().escape(),
	body('height').trim().escape(),
	body('filename').isString().trim().escape(),
	body('username').isString().trim().escape(),
	body('aspect_ratio').isString().trim().escape(),
	body('original_width').isString().trim().escape(),
	body('original_height').isString().trim().escape(),
	body('original_aspect').isString().trim().escape(),
	body('artname').isString().trim().escape(),
	body('original_aspect').isString().trim().escape(),
	body('filesize').isNumeric().trim().escape(),
	async (req, res) => {
		// error results

		const errors = validationResult(req).array();
		const response_search_errors = search_error(errors);

		// error results

		const type = req.body.type;
		const identity_object = req.apiGateway.event.requestContext.identity;

		try {
			let username = identity_object.cognitoIdentityId;
			let account_id = identity_object.accountId;
			let cognito_authentication_type =
				identity_object.cognitoAuthenticationType;
			if (username || account_id || cognito_authentication_type) {
			} else {
				res.statusCode = 401;
				res.json({ error: 'Not authorized' });
				return;
			}
		} catch (err) {
			res.statusCode = 501;
			res.json({ error: 'server error' });
			return;
		}
	}
);

const search_error = (err_object) => {
	let errors = {
		document_id: false,
		document_pixel_coordinates: false,
		type: false,
		document_pixel_values: false,
		password: false,
	};
	for (let index = 0; index < err_object.length; index++) {
		if (err_object[index].param === 'document_id') {
			errors = { ...errors, document_id: true };
		} else if (err_object[index].param === 'document_pixel_values') {
			errors = { ...errors, document_pixel_values: true };
		} else if (err_object[index].param === 'document_coordinates') {
			errors = { ...errors, document_coordinates: true };
		} else if (err_object[index].param === 'type') {
			errors = { ...errors, type: true };
		} else if (err_object[index].param === 'password') {
			errors = { ...errors, password: true };
		}
	}

	return errors;
};

module.exports = { search_error };
