import React from 'react';

//컴포넌트 정의 -Ethereum 프로바이더 선택과 관련된 기능을 포함하고 있다
class ArchangelProviderPicker extends React.Component {
  constructor(props) {
    super(props)
    //networkName 상태변수 초기화
    this.state = {
      networkName: '<checking>'
    }
    //this.driver.ready.then(...) 구문 사용하여 this.driver 객체의 'ready'프로미스가 완료될 때까지 기다림
    //그리고 나서 this.setNetworkName(this.driver.networkName)함수 호출하여 networkName 상태 변수 설정함
    this.driver.ready.then(() => this.setNetworkName(this.driver.networkName))
  } // constructor
  //Ethereum 프로바이더를 변경할 때 호출되는 메서드
  onProviderChange(key) {
    this.driver.onProviderChange(key)
      .then(() => this.setNetworkName(this.driver.networkName))
  } // onProviderChange
  //networkName 상태 변수를 업데이트하기 위한 메서드
  setNetworkName(n) { this.setState({networkName: n}) }

  get driver() { return this.props.driver }

  ///////////////////////////////
  //선택할 수 있는 Ethereum 프로바이더 목록은 this.driver.providers 배열에서 가져와서 매핑하여 렌더링한다
  // > 사용자가 프로바이더 변경할 때마다 네트워크 정보 업데이트된다
  render() {
    return (
      <React.Fragment>
        <div className="row col-md-12">
          <label className="col-md-4 form-text">
            <span className="float-right">Ethereum<br/>Provider</span>
          </label>
          <select className="col-md-8 form-control"
                  onChange={event => this.onProviderChange(event.target.value)}>
            {
              this.driver.providers.map(
                p => <option key={p.name} value={p.name}>{p.name}</option>
              )
            }
          </select>
        </div>
        //만약 프로바이더가 사용 가능하지 않은 경우, 사용자에게 해당 플로그인 설치하도록 안내하는 링크 표시
        { (!this.driver.metaMaskAvailable && !this.driver.mistAvailable) &&
        <sup className="col-md-12"><span className="float-right">Install MetaMask plugin for
                <a target='_blank' rel="noopener noreferrer" href='https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/'>Firefox</a> and
                <a target='_blank' rel="noopener noreferrer" href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en'>Chrome</a></span></sup>
        }
        //현재 선택된 네트워크 이름 표시
        <sub className="col-md-12"><span className="float-right">Connected to { this.state.networkName } network</span></sub>
      </React.Fragment>
    );
  } // render
} // class ArchangelProviderPicker

export default ArchangelProviderPicker;
