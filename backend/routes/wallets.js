import express from 'express';
import {
    generateWallet,
    saveWallet,
    getWalletByUser,
    getBalance,
    transferToken,
    getTransferFee,
    getTx,
    getTxHistoryAll,
    getTxHistory,
} from '../controllers/walletController.js';

const router = express.Router();

router.post('/generate', generateWallet);
router.post('/save', saveWallet);
router.get('/me', getWalletByUser);
router.get('/balance/:address/tokens', getBalance);
router.post('/transfer', transferToken);
router.get('/fee/:symbol/:amount/:address', getTransferFee);
router.get('/transactions/:txid', getTx);
router.get('/transactions', getTxHistoryAll);
router.get('/:address/tokens/:symbol/history', getTxHistory);

export default router;
