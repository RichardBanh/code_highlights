const insert_document = async (driver, document_object) => {
	let result = {};
	let result_meta = {};
	let success = false;
	await driver.executeLambda(async (TransactionExecutor) => {
		let statement = `INSERT INTO document ?`;
		let statement_2 = `UPDATE document SET metadata_id = ? WHERE document_id = ?`;
		result = await TransactionExecutor.execute(statement, document_object);
		result_meta = await TransactionExecutor.execute(
			statement_2,
			result._resultList[0].documentId,
			document_object.document_id
		);
		success = true;
	});

	if (success) {
		return { result, result_meta };
	} else {
		throw 'Writing to block failed';
	}
};

module.exports = {
	insert_document,
};


const credit_check = async (dynamodb, username) => {
	let data_credit = '';
	const credit_search = {
		TableName: 'userinfo-dev',
		Key: {
			username,
		},
	};

	return dynamodb.get(credit_search).promise();
};

const remove_credit = (dynamodb, username) => {
	const credit_removal = {
		TableName: 'userinfo-dev',
		Key: { username },
		AttributeUpdates: {
			credits: {
				Action: 'ADD',
				Value: -1,
			},
		},
	};

	return dynamodb.update(credit_removal).promise();
};

module.exports = {
	credit_check,
	remove_credit,
};


