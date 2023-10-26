//LZString 라이브러리 및 Archangel.json 스마트 계약을 가져옴
import LZString from "lz-string";
const ArchangelContract = require("./ethereum/Archangel.json");
//ethereum과 관련된 애플리케이션과 상호작용하는 archangelEthereumDriver라는 클래스를 정의

//이 코드는 이더리움 스마트 계약과 상호 작용하고 데이터를 저장, 검색, 권한 관리하는 애플리케이션을 개발하는 데 사용될 수 있을 것으로 보인다

//ethereum 네트워크 구성정보를 담고 있는 Network 객체를 정의
const Network = {
  4: {
    id: 4,
    name: "Rinkeby",
    fromBlock: 2898300,
    gasLimit: 7000000,
    gasPrice: 10 * 1e9,
  },
  3151: {
    id: 3151,
    name: "Archangel-Dev",
    fromBlock: 80380,
    gasLimit: 75000000,
    gasPrice: undefined,
  },
  53419: {
    id: 53419,
    name: "Archangel User Study",
    fromBlock: 1,
    gasLimit: 83886080,
    gasPrice: 10 * 1e9,
  },
};

const NullId =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

//이더리움 블록체인에서 archangel 스마트 계약과 상호작용하는데 사용됨
class ArchangelEthereumDriver {
  get resetEvent() {
    return "RESET";
  }
  static get name() {
    return "Ethereum";
  }

  //Static Methods:
  //페이로드 문자열을 구문 분석하려 시도하는 메서드
  static unwrapPayload(payload) {
    try {
      //먼저 페이로드를 JSON으로 구문 분석 시도
      return JSON.parse(payload);
    } catch (e) {}

    try {
      //실패하면 LZString을 사용하여 페이로드의 압축을풀고 구문 분석 시도
      const expanded = LZString.decompressFromUTF16(payload);
      return JSON.parse(expanded);
    } catch (e) {}

    throw new Error(`Bad payload : ${payload}`);
  }

  //주어진 web3 인스턴스로 드라이버를 초기화함
  //이더리움 네트워크 정보를 포함하여 드라이버의 속성을 설정하고, 계약 로드, 계약에서 발생하는 이벤트 감시
  constructor(web3) {

    this.ready = this.setup(web3);

    this.eventCallbacks_ = [(event) => console.log(event)];
  } // constructor

  //////////////////////////////////////////

   //ethereum 네트워크 설정 및 스마트 계약 로드
  //이더리움 네트워크를 설정하고 계약 로드하며 이벤트 감시
  async setup(web3) {
    this.web3_ = web3;

    this.grants = {};
    this.network = await ArchangelEthereumDriver.findNetwork(web3);
    console.log(`Using ${this.network.name} network`);

    this.loadContract(this.network.id);

    this.startWatching();
    this.watchRegistrations();
    this.watchGrantPermissions();
  } // setup

  static findNetwork(web3) {
    return new Promise((resolve, reject) => {
      web3.version.getNetwork((err, netId) => {
        if (err) return reject(err);
        const network = Network[netId];
        resolve(network);
      });
    });
  } // findNetwork

  get networkName() {
    return this.nework ? this.network.name : "undetermined";
  }
  get fromBlock() {
    return this.network.fromBlock;
  }
  get gasLimitt() {
    return this.network.gasLimit;
  }
  get gasPrice() {
    return this.network.gasPrice;
  }

  loadContract(networkId) {
    const contractClass = this.web3_.eth.contract(ArchangelContract.abi);
    this.contract_ = contractClass.at(
      ArchangelContract.networks[networkId].address
    );
  } // loadContract

  //스마트 계약 이벤트 감시를 위한 콜백 함수 등록
  watchEvents(callback) {
    console.log("watchEvents");

    this.eventCallbacks_.push(callback);
  } // watchEvents

  //스마트 계약에서 발생하는 모든 이벤트를 감시하기 시작
  startWatching() {
    this.watcher_ = this.contract_.allEvents(
      { fromBlock: this.fromBlock },
      // eslint-disable-next-line
      (err, event) => this.eventCallbacks_.forEach((fn) => fn(event))
    );
  } // startWatching

  //스마트 계약 이벤트 감시 관련 메서드
  //등록 이벤트와 관련된 이전 이벤트 감시자를 중지하고 등록 및 업데이트 이벤트에 대한 새로운 감시자를 시작
  watchRegistrations() {
    stopWatching(this.registrations, "Registration");
    stopWatching(this.updates, "Updates");

    this.registrations = this.contract_.Registration(
      {},
      { fromBlock: this.fromBlock },
      () => {}
    );
    this.updates = this.contract_.Update(
      {},
      { fromBlock: this.fromBlock },
      () => {}
    );
  } // watchRegistrations

  //스마트 계약 이벤트 감시 관련 메서드
  // 권한 부여와 관련된 이전 이벤트 감시자를 중지하고 PermissionGranted 이벤트에 대한 새 감시자를 시작
  watchGrantPermissions() {
    stopWatching(this.grantsWatcher, "GrantPermission");
    stopWatching(this.revokeWatcher, "RevokePermission");

    this.grantsWatcher = this.contract_.PermissionGranted(
      {},
      { fromBlock: this.fromBlock },
      // eslint-disable-next-line
      (err, evt) => {
        if (evt) this.grants[evt.args._addr] = evt.args._name;
      }
    );
  } // watchGrantPermissions

  ////////////////////////////////////////////
  addressName(addr) {
    const name = this.grants[addr];
    return name ? name : "unknown";
  } // addressName

  ////////////////////////////////////////////
  account() {
    const accounts = this.web3_.eth.accounts;
    return accounts.length !== 0 ? accounts[0].toLowerCase() : null;
  } // addressName

  ////////////////////////////////////////////
  //데이터를 Ethereum 스마트 계약에 저장
  store(key, payload) {
    return this.eth_store(key, payload);
  } // store
  //Ethereum 스마트 계약에서 id로 데이터를 검색
  async fetch(id) {
    let [payload, prev] = await this.eth_fetch(id);
    if (!payload) return [];

    const results = [ArchangelEthereumDriver.unwrapPayload(payload)];

    while (prev !== NullId) {
      [payload, prev] = await this.eth_fetchPrevious(prev);
      results.push(ArchangelEthereumDriver.unwrapPayload(payload));
    }

    return results;
  } // fetch
  //지정된 검색어로 데이터를 검색 -> 결과는 json데이터로 반환됨
  async search(phrase) {
    const exact_match = (field, search) =>
      field && field.toLowerCase() === search;
    const matches = (field, search) =>
      field && field.toLowerCase().indexOf(search) !== -1;
    const file_hash_match = (files, search) =>
      files &&
      !!files.find(
        (f) => f.sha256_hash && f.sha256_hash.toLowerCase() === search
      );
    const file_uuid_match = (files, search) =>
      files && !!files.find((f) => f.uuid && f.uuid.toLowerCase() === search);
    const file_name_match = (files, search) =>
      files &&
      !!files.find(
        (f) => f.path && f.path.toLowerCase().indexOf(search) !== -1
      );
    const file_match = (files, search) =>
      file_hash_match(files, search) ||
      file_uuid_match(files, search) ||
      file_name_match(files, search);

    const search = phrase.toLowerCase();
    const registrations = await this.registrationLog();

    const results = registrations
      .filter((r) => r.data)
      .filter(
        (r) =>
          exact_match(r.data.key, search) ||
          matches(r.data.collection, search) ||
          matches(r.data.citation, search) ||
          matches(r.data.ref, search) ||
          matches(r.data.supplier, search) ||
          matches(r.data.creator, search) ||
          matches(r.data.rights, search) ||
          matches(r.data.held, search) ||
          file_match(r.files, search)
      )
      .reduce((acc, r) => {
        if (acc.has(r.key)) acc.get(r.key).unshift(r);
        else acc.set(r.key, [r]);
        return acc;
      }, new Map());

    const userAddress = this.account();
    const records = Array.from(results.values());
    for (const record of records) {
      for (const r of record) {
        const files = r.files;
        r.owned = userAddress === r.addr;
        r.hasFilenames = !!(files && files.find((f) => f.path || f.name));
        r.hasUuid = !!(files && files.find((f) => f.uuid));
      }
    }
    return records;
  } // search

  ////////////////////////////////////////////
  recordLog(watcher) {
    return new Promise((resolve, reject) => {
      watcher.get((error, logs) => {
        if (error) return reject(error);

        const payloads = logs
          .map((l) => {
            l.uploader = this.addressName(l.args._addr);
            return l;
          })
          .map((l) => {
            const p = ArchangelEthereumDriver.unwrapPayload(l.args._payload);
            p.key = l.args._key;
            p.addr = l.args._addr;
            p.uploader = l.uploader;
            return p;
          });

        return resolve(payloads);
      });
    });
  } // watcher

  async registrationLog() {
    const registrations = await this.recordLog(this.registrations);
    const updates = await this.recordLog(this.updates);

    registrations.push(...updates);

    return registrations;
  } // registrationLog

  ////////////////////////

   //이더리움 스마트 계약에 데이터를 저장하는 메서드로, 데이터를 JSON 문자열로 직렬화하고 이더리움 트랜잭션을 통해 저장함
   //또한 권한과 관련된 이벤트를 감시하고 트랜잭션 처리를 확인함
  eth_store(id, slug) {
    //페이로드를 JSON으로 변환
    const slugStr = JSON.stringify(slug);

    return new StorePromise(async (submitted, pResolve, pReject) => {
      const accounts = this.web3_.eth.accounts;
      if (accounts.length === 0)
        return pReject(
          new Error(
            "No Ethereum account available.  Have you unlocked MetaMask?"
          )
        );
      const account = accounts[0].toLowerCase();

      let stopped = false;
      let txHash = null;
      const startBlock = await this.currentBlockNumber();
      const blockOut = 6;
      const noPermissionEvent = this.contract_.NoWritePermission({
        fromBlock: startBlock - 1,
      });
      const registration = this.contract_.Registration(
        {},
        { fromBlock: startBlock - 1 }
      );
      const update = this.contract_.Update({}, { fromBlock: startBlock - 1 });

      const completed = (fn, param) => {
        noPermissionEvent.stopWatching();
        registration.stopWatching();
        update.stopWatching();
        fn(param);
      };
      const resolve = (results) => completed(pResolve, results);
      const reject = (err) => completed(pReject, err);

      noPermissionEvent.watch((error, result) => {
        console.log(result);
        if (!error && result && result.transactionHash === txHash) {
          stopped = true;
          reject(
            new Error(
              `Sorry, account ${account} does not have permission to write to Archangel`
            )
          );
        }
      });

      const txWritten = (error, result) => {
        console.log(result);
        if (!error && result && result.transactionHash === txHash) {
          stopped = true;
          resolve(`${slug.name} written to Ethereum`);
        }
      }; // txWritten

      registration.watch(txWritten);
      update.watch(txWritten);

      const onCommitted = () => {
        this.web3_.eth.getTransactionReceipt(txHash, async (err, result) => {
          if (stopped) return;

          if (result) {
            console.log(`Transaction for ${slug.name} complete`);
            stopped = true;
            return resolve(
              `Transaction for ${slug.name} complete, but could not determine outcome.`
            );
          } // if ...

          if (err && err.message !== "unknown transaction") return reject(err);

          const block = await this.currentBlockNumber();
          if (block >= startBlock + blockOut)
            return reject(
              new Error(
                `Transaction for ${slug.name} wasn't processed within ${blockOut} blocks`
              )
            );

          setTimeout(onCommitted, 5000);
        });
      }; // onCommitted

      this.contract_.store.estimateGas(
        id,
        slugStr,
        {
          from: account,
          gas: this.gasLimit,
          gasPrice: this.gasPrice,
        },
        (err, gas) => {
          if (err) return console.log("Could not estimate gas", err);
          console.log(`Gas estimate ${gas}`);
        }
      );

      this.contract_.store(
        id,
        slugStr,
        {
          from: account,
          gas: this.gasLimit,
          gasPrice: this.gasPrice,
        },
        (err, tx) => {
          if (err) return reject(err);
          txHash = tx;
          submitted(tx);
          console.log(`${id} submitted in transaction ${tx}`);
          onCommitted();
        }
      );
    });
  } // eth_store

  //ethereum 스마트 계약에서 데이터를 검색하는 메서드로, 트랜잭션을 호출하여 데이터를 검색한다
  eth_fetch(id) {
    return this.eth_call_fetch("fetch", id);
  } // eth_fetch

  //ethereum 스마트 계약에서 데이터를 검색하는 메서드로, 트랜잭션을 호출하여 데이터를 검색한다
  //컨트랙트에서 주어진 해시 키와 관련된 페이로드 및 이전 버전을 가져온다
  eth_fetchPrevious(id) {
    return this.eth_call_fetch("fetchPrevious", id);
  } // eth_fetch

  eth_call_fetch(methodName, id) {
    return new Promise((resolve, reject) => {
      this.contract_[methodName].call(id, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    }); // eth_fetch
  } // eth_call_fetch

  //이더리움 스마트 계약에서 사용자에게 사용자 권한을 부여
  eth_grant(addr, name) {
    const account = this.account();
    if (!account)
      throw new Error(
        "No Ethereum account available.  Have you unlocked MetaMask?"
      );

    this.contract_.grantPermission(
      addr,
      name,
      {
        from: account,
        gas: 500000,
      },
      (err, tx) => {
        if (err) return console.log(err);
        console.log(
          `eth_grant(${addr},${name}) submitted in transaction ${tx}`
        );
      }
    );
  } // eth_store

  //클라이언트가 계약의 removePermission 함수를 호출하여 주소에서 쓰기 권한을 제거할 수 있다
  eth_remove(addr) {
    const account = this.account();
    if (!account)
      throw new Error(
        "No Ethereum account available.  Have you unlocked MetaMask?"
      );

    this.contract_.removePermission(
      addr,
      {
        from: account,
        gas: 500000,
      },
      (err, tx) => {
        if (err) return console.log(err);
        console.log(`eth_remove(${addr}) submitted in transaction ${tx}`);
      }
    );
  } // eth_remove

  //현재 Ethereum 블록 번호를 검색하여 반환
  currentBlockNumber() {
    return new Promise((resolve, reject) => {
      this.web3_.eth.getBlockNumber((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  } // currentBlockNumber

  //현재 계정이 Ethereum 스마트 계약에 대한 쓰기 권한을 가지고 있는지 확인하는 메서드
  hasWritePermission() {
    return new Promise((resolve, reject) => {
      this.contract_.hasPermission(this.account(), (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  } // hasPermission
} // class Ethereum


//코드의 나머지 부분은 트랜잭션 이벤트 감시를 위한 관련 유틸리티 및 프로미스 클래스들을 정의
function stopWatching(watcher, label) {
  try {
    if (watcher) watcher.stopWatching();
  } catch (err) {
    console.log(`Problem tearing down ${label} watcher`);
  }
} // stopWatching



/**
이러한 클래스 구조는 프로미스 객체를 확장하고, 특정 작업에 대한 비동기 처리를 단순화하고자 하는 목적으로 사용될 수 있습니다.
ExtendedPromise 클래스는 프로미스를 조작하고 메서드 체이닝을 통해 다양한 작업을 수행할 수 있도록 설계되었으며,
StorePromise 클래스는 특정 유형의 작업 (예: 트랜잭션)을 위한 메서드를 추가로 제공하는 것으로 보

*/

//자바스크립트 프로미스의 기능을 확장
//실제 프로미스 해결 전에 호출할 수 있는 확장 콜백을 설정하는 확장 메서드를 추가함
class ExtendedPromise {
//action이라는 콜백 함수를 받음
  constructor(action) {
    //초기 빈함수 설정
    this.extendedCallback = () => {};
    this.catchCallback = () => {};
    //초기 null로 설정
    this.promise = null;
    this.action = action;

    setTimeout(() => this.startAction(), 100);
  } // constructor
  //promise 객체가 이미 생성된 경우 실행되지 않도록 하는 역할을 함
  startAction() {
    if (this.isThened) return;

    this.action(this.extendedCallback, () => {}, this.catchCallback);
  } // startAction

  //promise 객체의 존재 여부를 판별
  get isThened() {
    return this.promise !== null;
  }
  //extendedCallback 함수를 설정하고 클래스 자체를 반환 함. 이 메서드는 메서드 체이닝을 지원함
  extended(extendedCb) {
    this.extendedCallback = extendedCb;
    return this;
  } // extended

  //새로운 프로미스 객체를 생성하고, action 콜백 함수를 실행하여 비동기 작업을 수행함
  //그리고 해당 프로미스 객체에 thenCb 콜백 함수를 등록한다
  //프로미스를 반환한다
  then(thenCb) {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        this.action((e) => this.extendedCallback(e), resolve, reject);
      }, 10);
    });

    this.promise = promise.then(thenCb);
    return this.promise;
  } // then

  catch(catchCb) {
    this.catchCallback = catchCb;
    return this;
  }
} // ExtendedPromise


//ExtendedPromise 클래스 상속
class StorePromise extends ExtendedPromise {
  //transactionCb 콜백 함수를 extended 메서드를 통해 설정함
  //이 메서드는 ExtendedPromise 클래스의 extended 메서드를 호출하여 콜백 함수를 설정한다
  transaction(transactionCb) {
    return this.extended(transactionCb);
  } // transaction
}

export default ArchangelEthereumDriver;
