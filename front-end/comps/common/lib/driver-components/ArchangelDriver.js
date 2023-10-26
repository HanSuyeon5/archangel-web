//ArchangelEthereumDriver 모듈은 Ethereum 프로바이더 설정에 사용됨
import ArchangelEthereumDriver from '../driver/ArchangelEthereumDriver';
import Web3 from 'web3';

//프로바이더(metamask, mist) 존재 여부 확인
const hasMetaMask = (typeof window.web3 !== 'undefined') &&
  ((window.web3.currentProvider.constructor.name.startsWith('Metamask') ||
    (window.web3.currentProvider.constructor.toString().indexOf('MetaMask') !== -1)));
const hasMist = (typeof window.web3 !== 'undefined') &&
  (window.web3.currentProvider.constructor.name.startsWith('EthereumProvider'));

//현재 URL에서 경로를 추출하고 "/index.html"이 있다면 제거하여 계산됩니다. Ethereum 공급자의 URL을 구성하는 데 사용됨
const pathPrefix = (() => {
  let path = window.location.pathname.replace('/index.html', '')
  path = path.substring(0, path.lastIndexOf('/'))
  return path.length === 1 ? path : `${path}/`
})()
//현재 프로토콜, 호스트 이름, 포트 및 "geth"가 추가된 pathPrefix와 함께 구성된 URL
const hosted = `${window.location.protocol}//${window.location.hostname}:${window.location.port}${pathPrefix}geth`

//이 함수는 metamask, mist 및 로컬 프로바이더(공급자)의 사용 가능성을 기반으로 ethereum 공급자 배열을 생성함
//이름과 Web3 공급자 인스턴스가 있는 공급자 객체 배열을 반환
function providers() {
  const p = []
   //각 프로바이더가 사용 가능하면 해당 프로바이더(공급자)와 함께 배열에 추가됨
  if (hasMetaMask)
    p.push({name: 'MetaMask', provider: window.web3.currentProvider});
  if (hasMist)
    p.push({name: 'Mist', provider: window.web3.currentProvider});
  p.push({name: 'Localhost', provider: new Web3.providers.HttpProvider('http://localhost:8545')});
  p.push({name: hosted, provider: new Web3.providers.HttpProvider(hosted)});

  return p;
} // providers

//ArchangelEthereumDriver를 상속하고 다양한 Ethereum 공급자와 상호 작용하기 위한 공통 인터페이스를 제공하는 것으로 보임
class ArchangelProvider extends ArchangelEthereumDriver {
  //생성자에서는 providers() 배열에서 첫 번째 항목의 공급자를 사용하여 Web3의 새 인스턴스를 생성하여 클래스를 초기화
  constructor() {
    super(new Web3(providers()[0].provider));
  } // constructor
  //주어진 key를 기반으로 활성 Ethereum 공급자를 변경하는 데 사용됨
  //공급자 목록에서 제공된 key에 연결된 공급자를 검색하고 현재 공급자를 업데이트한다
  onProviderChange(key) {
    const provider = providers().filter(p => p.name === key)[0].provider;
    return this.setup(new Web3(provider))
  } // onProviderChange

  //getter 메서드는 MetaMask, Mist 및 사용 가능한 공급자 목록에 대한 정보를 제공
  get metaMaskAvailable() { return hasMetaMask }
  get mistAvailable() { return hasMist }
  get providers() { return providers() }
  //Ethereum 거래를 처리하는 데 관련되어 있는 것으로 보임
  unwrapPayload(payload) {
    return ArchangelEthereumDriver.unwrapPayload(payload);
  }
} // class ArchangelProvider
//ArchangelProvider의 인스턴스를 반환함. 이를 통해 ethereum 공급자를 설정할 수 있다
function ArchangelDriver() {
  return new ArchangelProvider();
} // ArchangelDriver

export default ArchangelDriver
