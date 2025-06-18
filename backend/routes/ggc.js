import express from 'express';
import { GGC } from '../blockchain/GGCBlockchain.js';

const router = express.Router();

// Создание транзакции
router.post('/transaction', (req, res) => {
	const { from, to, amount } = req.body;
	if (!from || !to || typeof amount !== 'number') {
		return res.status(400).json({ error: 'Недопустимые данные' });
	}

	GGC.createTransaction({ from, to, amount });
	res.json({ message: 'Транзакция добавлена' });
});

// Майнинг
router.post('/mine/:address', (req, res) => {
	const miner = req.params.address;
	const block = GGC.minePendingTransactions(miner);
	res.json({ message: 'Блок замайнен', block });
});

// Баланс
router.get('/balance/:address', (req, res) => {
	const balance = GGC.getBalanceOfAddress(req.params.address);
	res.json({ address: req.params.address, balance });
});

export default router;
