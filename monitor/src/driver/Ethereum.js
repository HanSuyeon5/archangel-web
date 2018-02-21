import ArchangelABI from './ethereum/Archangel';

const ArchangelAddress = '0x3507dCef171f6B7F36c56e35013d0785B150584F'.toLowerCase();
const FromBlock = 1378500;

class Ethereum {
  get resetEvent() { return "RESET"; }
  static get name() { return "Ethereum"; }

  constructor(web3) {
    this.setup(web3);
  } // constructor

  ////////////////////////////////////////////
  setup(web3) {
    this.web3_ = web3;
    this.loadContract();
    if (this.eventCallback_)
      this.watchEvents(this.eventCallback_);
  } // setup

  loadContract() {
    const contractClass = this.web3_.eth.contract(ArchangelABI);
    this.contract_ = contractClass.at(ArchangelAddress);
  } // loadContract

  watchEvents(callback) {
    if (!this.watcher_)
      return this.startWatching(callback);

    this.watcher_.stopWatching(() => this.startWatching(callback));
  } // watchEvents

  startWatching(callback) {
    this.eventCallback_ = callback;

    this.eventCallback_(this.resetEvent);
    this.watcher_ = this.contract_.allEvents(
      { fromBlock: FromBlock },
      (err, event) => { this.eventCallback_(event) }
    );
  } // startWatching

  currentBlockNumber() {
    return new Promise((resolve, reject) => {
      this.web3_.eth.getBlockNumber((err, result) => {
        if(err)
          return reject(err);
        resolve(result);
      })
    })
  } // currentBlockNumber
} // class Ethereum

export default Ethereum;