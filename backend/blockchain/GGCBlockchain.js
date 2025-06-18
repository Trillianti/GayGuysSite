import crypto from 'crypto';

class Block {
    constructor(index, timestamp, transactions, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    calculateHash() {
        return crypto
            .createHash('sha256')
            .update(
                this.index +
                    this.timestamp +
                    JSON.stringify(this.transactions) +
                    this.previousHash,
            )
            .digest('hex');
    }
}

class GGCBlockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.pendingTransactions = [];
        this.miningReward = 100;
    }

    createGenesisBlock() {
        return new Block(0, Date.now().toString(), [], '0');
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    createTransaction(tx) {
        this.pendingTransactions.push(tx);
    }

    minePendingTransactions(minerAddress) {
        const block = new Block(
            this.chain.length,
            Date.now().toString(),
            this.pendingTransactions,
            this.getLatestBlock().hash,
        );

        this.chain.push(block);
        this.pendingTransactions = [
            { from: null, to: minerAddress, amount: this.miningReward },
        ];
        return block;
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const tx of block.transactions) {
                if (tx.from === address) balance -= tx.amount;
                if (tx.to === address) balance += tx.amount;
            }
        }

        return balance;
    }
}

export const GGC = new GGCBlockchain();
