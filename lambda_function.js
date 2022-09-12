const { uuid, date_past } = require('./utils');
const AWS = require('aws-sdk');
const sns = new AWS.SNS({ region: 'us-east-2' });

exports.handler = async (event, context) => {
	const request = JSON.parse(event.body);
	const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });
	let response;
	if (request.type === 'verify') {
		await search_code(dynamodb, request.uuid)
			.then((data) => {
				console.log(data, data.length);
				console.log(data.Item.record_code);
				if (data.length > 1 || data) {
					//have to use utils
					const date = date_past(data.Item.date_modified);
					//have to be true

					if (!date) {
						response = {
							statusCode: 221,
							body: JSON.stringify({
								uuid: request.uuid,
								confirmation_code: data.Item.record_code,
								statusCode: '221',
							}),
							headers: {
								'Access-Control-Allow-Origin': '*',
							},
						};
					} else {
						response = {
							statusCode: 234,
							body: JSON.stringify({
								message: 'Not Found',
								statusCode: '234',
							}),
							headers: {
								'Access-Control-Allow-Origin': '*',
							},
						};
					}
				} else {
					response = {
						statusCode: 400,
						body: JSON.stringify({
							message: 'Not Found',
							statusCode: '400',
						}),
						headers: {
							'Access-Control-Allow-Origin': '*',
						},
					};
				}
			})
			.catch((err) => {
				response = {
					statusCode: 520,
					body: JSON.stringify({
						message: 'Not Found',
						statusCode: 520,
					}),
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				};
			});
		return response;
	} else if (request.type === 'add_data') {
		//need to get the data out of it
		const {
			occurance,
			happen_self,
			hate,
			time_day,
			crowd,
			crowd_sight,
			uuid,
			confirmation_code,
			address,
		} = request.data;
		//first search out the uuid and confirmation code
		let success = false;
		let confirm_code;
		await search_code(dynamodb, uuid).then((data) => {
			///heeeereererer
			if (data.length > 1 || data) {
				confirm_code = data.Item.record_code;
				success = confirm_code === confirmation_code;
			}
		});
		if (success) {
			await add_data(dynamodb, {
				uuid: confirm_code,
				occurance,
				happen_self,
				hate,
				time_day,
				crowd,
				crowd_sight,
				address,
			})
				.then((data) => {})
				.catch((err) => {
					console.log('LINE 117', err);
					let errors = {
						statusCode: 455,
						body: JSON.stringify({ err }),
						headers: {
							'Access-Control-Allow-Origin': '*',
						},
					};
					return errors;
				});

			let close_code_response;
			try {
				close_code_response = await close_code(dynamodb, uuid);
			} catch (error) {
				console.log(error);
				let errors = {
					statusCode: 425,
					body: JSON.stringify({ error }),
					headers: {
						'Access-Control-Allow-Origin': '*',
					},
				};
				return errors;
			}

			response = {
				statusCode: 224,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify({ message: 'Sent' }),
			};
			return response;
		} else {
			response = {
				statusCode: 424,
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
				body: JSON.stringify({ message: 'Code not found' }),
			};
			return response;
		}
	} else if (!request.phone_number) {
		response = {
			statusCode: 200,
			body: JSON.stringify({
				message: 'Error missing phone number',
				statusCode: 200,
			}),
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
		};
		return response;
	}

	const confirmation_code = uuid(6);
	const record_code = uuid(10);
	const params = {
		Message: 'Verification code is ' + confirmation_code,
		PhoneNumber: request.phone_number,
	};
	await sns.publish(params, (err, data) => {
		if (err) {
			let errors = {
				statusCode: 400,
				body: JSON.stringify({ err }),
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
			};

			return errors;
		} else {
			console.log('LINE 35', data);
			//continue block
		}
	});

	await set_approved_code(dynamodb, {
		uuid: confirmation_code,
		record_code,
		used: false,
		date_modified: new Date().toString(),
	})
		.then((data) => {
			console.log(data);
		})
		.catch((err) => {
			console.log(err);
			let errors = {
				statusCode: 400,
				body: JSON.stringify({ err }),
				headers: {
					'Access-Control-Allow-Origin': '*',
				},
			};
			return errors;
		});
	try {
		response = {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': '*',
			},
			body: JSON.stringify({ message: 'Sent' }),
		};
	} catch (error) {
		console.error(error);
		return error;
	}
	return response;
};

const set_approved_code = (dynamodb, body) => {
	const post_items = {
		TableName: 'codes',
		Item: { ...body },
	};
	return dynamodb.put(post_items).promise();
};

const search_code = (dynamodb, uuid) => {
	const search_items = {
		TableName: 'codes',
		Key: { uuid },
	};
	return dynamodb.get(search_items).promise();
};

const close_code = (dynamodb, uuid) => {
	const delete_item = {
		TableName: 'codes',
		Key: { uuid },
	};
	return dynamodb.delete(delete_item).promise();
};

const add_data = (dynamodb, body) => {
	const post_items = {
		TableName: 'data-dev',
		Item: { ...body },
	};
	return dynamodb.put(post_items).promise();
};
