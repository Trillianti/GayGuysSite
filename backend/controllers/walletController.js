import { generateMnemonic, mnemonicToSeedSync } from 'bip39';
import hdkey from 'hdkey';
import db from '../db.js';
import { keccak256 } from 'ethereumjs-util';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = 'fsdfsdgjhg1j2hbv3jh21gerjenklvmalhf71234=$%';


// 📦 Генерация кошелька
export async function generateWallet(req, res) {
	try {
		const mnemonic = generateMnemonic();
		const seed = mnemonicToSeedSync(mnemonic);
		const root = hdkey.fromMasterSeed(seed);
		const addrNode = root.derive("m/44'/60'/0'/0/0");
		const pubKey = addrNode.publicKey;
		const address = '0x' + keccak256(pubKey).slice(-20).toString('hex');

		res.json({ mnemonic, address });
	} catch (err) {
		console.error('Ошибка генерации кошелька:', err);
		res.status(500).json({ error: 'Ошибка генерации кошелька' });
	}
}

// 💾 Сохранение кошелька
export async function saveWallet(req, res) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(401).json({ error: 'Требуется авторизация' });

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, JWT_SECRET);
		const userId = decoded.id;

		const { mnemonic, address } = req.body;

		if (!mnemonic || !address) {
			return res.status(400).json({ error: 'Необходимо указать mnemonic и address' });
		}

		console.log(userId, mnemonic, address, address, mnemonic)

		const [result] = await db.execute(
			'INSERT INTO wallets (user_id, mnemonic, address) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE address = ?, mnemonic = ?',
			[userId, mnemonic, address, address, mnemonic]
		);

		const [wallet] = await db.execute(
			'SELECT * FROM wallets WHERE id = ?',
			[result.insertId]
		);

		res.status(200).json({ wallet: wallet[0] });
	} catch (err) {
		console.error('Ошибка сохранения кошелька:', err);
		res.status(500).json({ error: 'Ошибка сервера при сохранении' });
	}
}

// 📤 Получение кошелька по userId
export async function getWalletByUser(req, res) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader) return res.status(401).json({ error: 'Требуется авторизация' });

		const token = authHeader.split(' ')[1];
		const decoded = jwt.verify(token, JWT_SECRET);
		const userId = decoded.id;

		const [rows] = await db.execute('SELECT * FROM wallets WHERE user_id = ?', [userId]);

		if (rows.length === 0) {
			return res.status(404).json({ error: 'Кошелёк не найден' });
		}

		res.json(rows[0]);
	} catch (error) {
		console.error('Ошибка получения кошелька:', error);
		res.status(500).json({ error: 'Ошибка получения кошелька' });
	}
}

// Получение баланса
export const getBalance = async (req, res) => {
	const { address } = req.params;

	try {
		const [rows] = await db.execute(
			`SELECT 
				t.symbol,
				t.name,
				t.contract_address,
				t.decimals,
				t.price_usd,
				t.last_updated,
				b.amount
			FROM balances b
			JOIN tokens t ON b.token_symbol = t.symbol
			WHERE b.address = ?`,
			[address]
		);

		const tokens = rows.map(row => ({
			symbol: row.symbol,
			name: row.name,
			contractAddress: row.contract_address,
			decimals: row.decimals,
			priceUsd: parseFloat(row.price_usd),
			lastUpdated: row.last_updated,
			balanceRaw: row.amount,
			balanceFormatted: Number(row.amount) / Math.pow(10, row.decimals),
			valueUsd: (row.amount / Math.pow(10, row.decimals)) * parseFloat(row.price_usd),
		}));

		res.json({ address, tokens });
	} catch (err) {
		console.error('Ошибка при получении токенов:', err);
		res.status(500).json({ error: 'Ошибка сервера' });
	}
};

// Перевод
export const transferToken = async (req, res) => {
  try {
    const { from, to, amount, symbol } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Нет токена' });
    }

    if (!from || !to || !amount || !symbol) {
      return res.json({ error: 'Неверные данные' });
    }

    const token = authHeader.split(' ')[1];
    const userId = jwt.verify(token, JWT_SECRET).id;

    const [wallets] = await db.execute(
      'SELECT address FROM wallets WHERE user_id = ?',
      [userId]
    );
    if (!wallets.length || wallets[0].address !== from) {
      return res.status(403).json({ error: 'Недостаточно прав для перевода' });
    }

    const [[tokenInfo]] = await db.execute(
      'SELECT * FROM tokens WHERE symbol = ?',
      [symbol]
    );
    if (!tokenInfo) {
      return res.status(400).json({ error: 'Токен не найден' });
    }

    const decimals = tokenInfo.decimals;
    const nanoAmount = parseFloat(amount) * Math.pow(10, decimals);

    const [[sender]] = await db.execute(
      'SELECT amount FROM balances WHERE address = ? AND token_symbol = ?',
      [from, symbol]
    );

	const [rows] = await db.execute(
		'SELECT * FROM transactions ORDER BY id DESC LIMIT 1'
	);
	const lastTransaction = rows[0].id;
    const BASE_FEE_NANO = 100_000+lastTransaction;
	const PERCENT_FEE = nanoAmount / 1_000_000_000
	const FEE_NANO = Math.max(BASE_FEE_NANO, PERCENT_FEE);

    const totalRequiredNano = nanoAmount + (symbol === 'GGC' ? FEE_NANO : 500_000+lastTransaction);

    if (!sender || sender.amount < totalRequiredNano) {
      return res.json({ error: 'Недостаточно средств' });
    }

    // Комиссия GGC
    if (symbol === 'GGC') {
      await db.execute(
        'UPDATE balances SET amount = amount - ? WHERE address = ? AND token_symbol = ?',
        [FEE_NANO, from, symbol]
      );

      await db.execute(
        'INSERT INTO balances (address, token_symbol, amount) VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE amount = amount + ?',
        ['0x0000000000000000000000000000000000000000', symbol, FEE_NANO, FEE_NANO]
      );
    }

    // Перевод основного токена
    await db.execute(
      'UPDATE balances SET amount = amount - ? WHERE address = ? AND token_symbol = ?',
      [nanoAmount, from, symbol]
    );

    await db.execute(
      'INSERT INTO balances (address, token_symbol, amount) VALUES (?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE amount = amount + ?',
      [to, symbol, nanoAmount, nanoAmount]
    );

	const txHash = '0x' + crypto.randomBytes(32).toString('hex');

	await db.execute(
	'INSERT INTO transactions (hash, from_address, to_address, token_symbol, amount, fee) VALUES (?, ?, ?, ?, ?, ?)',
	[txHash, from, to, symbol, nanoAmount, symbol === 'GGC' ? FEE_NANO : 500_000 + lastTransaction]
	);

	if (tokenInfo.price_usd) {
		const oldPrice = parseFloat(tokenInfo.price_usd);

		let fluctuation;

		if (symbol === 'USDC') {
			// Для USDC — ±0.01%
			const direction = Math.random() < 0.5 ? -1 : 1;
			const magnitude = Math.random() * 0.01;
			fluctuation = direction * magnitude;
		} else {
			// Для остальных токенов — ±3%
			const direction = Math.random() < 0.5 ? -1 : 1;
			const magnitude = Math.random() * 3;
			fluctuation = direction * magnitude;
		}

		const newPrice = +(oldPrice * (1 + fluctuation / 100)).toFixed(6);

		await db.execute(
			'UPDATE tokens SET price_usd = ?, last_updated = NOW() WHERE symbol = ?',
			[newPrice, symbol]
		);

	}

	const [tokenRows] = await db.execute(
		`SELECT 
			t.symbol,
			t.name,
			t.contract_address,
			t.decimals,
			t.price_usd,
			t.last_updated,
			b.amount
		FROM balances b
		JOIN tokens t ON b.token_symbol = t.symbol
		WHERE b.address = ?`,
		[from]
	);

	const tokens = tokenRows.map(row => ({
		symbol: row.symbol,
		name: row.name,
		contractAddress: row.contract_address,
		decimals: row.decimals,
		priceUsd: parseFloat(row.price_usd),
		lastUpdated: row.last_updated,
		balanceRaw: row.amount,
		balanceFormatted: Number(row.amount) / Math.pow(10, row.decimals),
		valueUsd: (row.amount / Math.pow(10, row.decimals)) * parseFloat(row.price_usd),
	}));

    res.json({ message: 'Перевод завершен', tokens: tokens });
  } catch (err) {
    console.error('Ошибка перевода токена:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Получение комиссии за перевод
export const getTransferFee = async (req, res) => {
  try {
    const { symbol, amount, address } = req.params;

    if (!symbol || !amount || !address) {
      return res.status(400).json({ error: 'Неверные данные' });
    }

	const [addressRows] = await db.execute(
	  'SELECT address FROM wallets WHERE address = ?',
	  [address]
	);

	if (!addressRows.length) {
	  return res.json({ error: 'Неверный адрес кошелька' });
	}

    const [[tokenInfo]] = await db.execute(
      'SELECT decimals FROM tokens WHERE symbol = ?',
      [symbol]
    );

    if (!tokenInfo) {
      return res.status(400).json({ error: 'Токен не найден' });
    }

    const decimals = tokenInfo.decimals;
    const nanoAmount = parseFloat(amount) * Math.pow(10, decimals);

	const [rows] = await db.execute(
		'SELECT * FROM transactions ORDER BY id DESC LIMIT 1'
	);
	const lastTransaction = rows[0].id;
    const BASE_FEE_NANO = 100_000+lastTransaction;
	const PERCENT_FEE = nanoAmount / 1_000_000_000
	const FEE_NANO = Math.max(BASE_FEE_NANO, PERCENT_FEE);

    res.json({ fee: (symbol != "GGC" ? (500_000+lastTransaction)/1_000_000 : FEE_NANO.toFixed(decimals)/1_000_000) });

  } catch (err) {
    console.error('Ошибка получения комиссии:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const getTx = async (req, res) => {
	try {
		const { txid } = req.params;

		// Сначала основная транзакция
		const [rows] = await db.execute(
			`SELECT 
				hash,
				from_address,
				to_address,
				token_symbol,
				amount,
				fee,
				UNIX_TIMESTAMP(time) AS time
			FROM transactions
			WHERE hash = ?
			LIMIT 1`,
			[txid]
		);

		if (!rows.length) {
			return res.status(404).json({ error: 'Транзакция не найдена' });
		}

		const tx = rows[0];

		// Теперь — предыдущая транзакция по времени
		const [prevRows] = await db.execute(
			`SELECT hash FROM transactions 
			 WHERE from_address = ? AND time < (
				 SELECT time FROM transactions WHERE hash = ?
			 )
			 ORDER BY time DESC
			 LIMIT 1`,
			[tx.from_address, txid]
		);

		// Добавим поле, если нашли
		if (prevRows.length) {
			tx.previous_txid = prevRows[0].hash;
		}

		res.json(tx);
	} catch (err) {
		console.error('Ошибка при получении транзакции:', err);
		res.status(500).json({ error: 'Ошибка сервера' });
	}
};


export const getTxHistory = async (req, res) => {
  const { address, symbol } = req.params;

  try {
    // Получаем decimals для правильного форматирования
    const [[tokenRow]] = await db.execute(
      'SELECT decimals FROM tokens WHERE symbol = ?',
      [symbol]
    );

    if (!tokenRow) {
      return res.status(404).json({ error: 'Токен не найден' });
    }

    const decimals = tokenRow.decimals;

    // Получаем последние 100 транзакций по токену и адресу
    const [rows] = await db.execute(
      `SELECT 
         id, hash, from_address, to_address, amount, UNIX_TIMESTAMP(time) AS time
       FROM transactions
       WHERE token_symbol = ?
         AND (from_address = ? OR to_address = ?)
       ORDER BY time DESC
       LIMIT 100`,
      [symbol, address, address]
    );

    const history = rows.map(tx => {
      const amountFormatted = Number(tx.amount) / Math.pow(10, decimals);
      const type = tx.to_address.toLowerCase() === address.toLowerCase() ? 'IN' : 'OUT';

      return {
        hash: (tx.hash ? tx.hash.toString() : tx.id.toString()),
        time: tx.time,
        type,
        amountFormatted: amountFormatted.toFixed(decimals),
      };
    });

    res.json({ symbol, history });
  } catch (err) {
    console.error('Ошибка при получении истории токена:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}

export const getTxHistoryAll = async (req, res) => {
	const offset = parseInt(req.query.offset || 0);
	const limit = parseInt(req.query.limit || 100);
	const [rows] = await db.execute(
		`SELECT id, hash, from_address, to_address, token_symbol, amount, fee, UNIX_TIMESTAMP(time) AS time 
		 FROM transactions 
		 ORDER BY id DESC 
		 LIMIT ? OFFSET ?`,
		[limit, offset]
	);
	res.json(rows);
}