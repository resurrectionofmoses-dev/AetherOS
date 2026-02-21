
import { v4 as uuidv4 } from 'uuid';

/**
 * --- LEDGER AUDIT ENGINE: QUERY 8 ---
 * Protocol: 0x03E2_AUDIT
 * Detects value-generation loops where CPH is artificially inflated.
 * Condition: (A -> B -> C -> A) AND (Ending_CPH > Starting_CPH)
 */

export interface Transaction {
    id: string;
    from: string;
    to: string;
    amount: number;
    timestamp: number;
}

export interface FraudChain {
    nodes: string[];
    startAmount: number;
    endAmount: number;
    leakage: number;
    path: string;
}

class LedgerAuditEngine {
    private transactions: Transaction[] = [];

    public recordTransaction(from: string, to: string, amount: number) {
        this.transactions.push({
            id: uuidv4(),
            from,
            to,
            amount,
            timestamp: Date.now()
        });
        if (this.transactions.length > 1000) this.transactions.shift();
    }

    /**
     * RECURSIVE CHAIN ANALYSIS (Simulating Query 8)
     */
    public detectCircularFraud(): FraudChain[] {
        const detected: FraudChain[] = [];
        const txMap = new Map<string, Transaction[]>();

        this.transactions.forEach(tx => {
            if (!txMap.has(tx.from)) txMap.set(tx.from, []);
            txMap.get(tx.from)!.push(tx);
        });

        const findLoops = (current: string, startNode: string, path: Transaction[], visited: Set<string>) => {
            const nextTxs = txMap.get(current) || [];
            
            for (const tx of nextTxs) {
                if (tx.to === startNode && path.length > 1) {
                    // Loop detected
                    const startAmount = path[0].amount;
                    const endAmount = tx.amount;
                    if (endAmount > startAmount) {
                        detected.push({
                            nodes: [...path.map(p => p.from), tx.from, startNode],
                            startAmount,
                            endAmount,
                            leakage: endAmount - startAmount,
                            path: [...path.map(p => p.from), tx.from, startNode].join(' → ')
                        });
                    }
                    continue;
                }

                if (!visited.has(tx.to)) {
                    visited.add(tx.to);
                    findLoops(tx.to, startNode, [...path, tx], visited);
                    visited.delete(tx.to);
                }
            }
        };

        const accounts = Array.from(new Set(this.transactions.map(t => t.from)));
        accounts.forEach(acc => {
            findLoops(acc, acc, [], new Set([acc]));
        });

        return detected;
    }

    public getRecentTransactions() {
        return [...this.transactions].reverse().slice(0, 50);
    }

    public generateMockFraudData() {
        this.transactions = [];
        // Legitimate chain
        this.recordTransaction('Node_A', 'Node_B', 1000);
        this.recordTransaction('Node_B', 'Node_C', 500);
        
        // Fraud loop (The "Crazy Me" Loop)
        this.recordTransaction('Account_X', 'Account_Y', 1000);
        this.recordTransaction('Account_Y', 'Account_Z', 1100);
        this.recordTransaction('Account_Z', 'Account_X', 1200);
    }
}

export const ledgerAuditEngine = new LedgerAuditEngine();
