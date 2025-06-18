import db from '../db.js';
import crypto from 'crypto';

export const createToken = async (req, res) => {
	const {
		symbol,
		name,
		decimals = 18,
		totalSupply = 0,
		price_usd,
		address // кому начислить initial supply
	} = req.body;

	if (!symbol || !name) {
		return res.status(400).json({ error: 'Укажите symbol и name токена' });
	}

	if (totalSupply > 0 && !address) {
		return res.status(400).json({ error: 'Укажите адрес получателя initial supply' });
	}

	try {
		// Генерация псевдоуникального "контрактного" адреса
		const hash = crypto
			.createHash('sha256')
			.update(`${symbol}-${Date.now()}-${Math.random()}`)
			.digest('hex');

		const contract_address = '0x' + hash.slice(0, 40);

		// Добавление токена в базу
		await db.execute(
			`INSERT INTO tokens (symbol, name, decimals, total_supply, price_usd, contract_address)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[symbol, name, decimals, totalSupply, price_usd, contract_address]
		);

		// Начисление initial supply
		if (totalSupply > 0) {
			await db.execute(
				`INSERT INTO balances (address, token_symbol, amount)
				 VALUES (?, ?, ?)
				 ON DUPLICATE KEY UPDATE amount = amount + ?`,
				[address, symbol, totalSupply, totalSupply]
			);
		}

		res.status(201).json({
			message: 'Токен успешно создан',
			contract_address,
		});
	} catch (err) {
		console.error('Ошибка создания токена:', err);
		if (err.code === 'ER_DUP_ENTRY') {
			res.status(409).json({ error: 'Токен с таким символом уже существует' });
		} else {
			res.status(500).json({ error: 'Внутренняя ошибка сервера' });
		}
	}
};

export const getTokens = async (_, res) => {
	const [rows] = await db.execute('SELECT * FROM tokens');
	res.json(rows);
};
