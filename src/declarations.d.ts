declare module '@safecoin/safe-wallet-adapter' {
  import EventEmitter from 'eventemitter3';
  import { PublicKey, Transaction } from '@safecoin/web3.js';

  export default class Wallet extends EventEmitter {
    constructor(providerUrl: string, network: string);
    publicKey: PublicKey;
    connected: boolean;
    autoApprove: boolean;
    connect: () => Promise<void>;
    disconnect: () => void;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
    signAllTransactions: (
      transactions: Transaction[],
    ) => Promise<Transaction[]>;
  }
}
