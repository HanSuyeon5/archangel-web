import React, { Component, Fragment } from "react";

//계약에 대한 권한 관리

//특정 주소에 대한 계약 쓰기 권한을 부여하는 역할
class Granter extends Component {
  //드라이버 및 계약 소유자 주소를 각각 나타내는 드라이버 및 소유자 props를 받음
  constructor(props) {
    super(props);
    this.driver = props.driver;
    this.contractOwner = props.owner;
    this.state = {};
  } // constructor

  //계약 소유자가 변경될 때마 구성 요소가 업데이트되도록 함
  shouldComponentUpdate(nextProps) {
    if (nextProps.owner === this.contractOwner) return false;

    this.contractOwner = nextProps.owner;
    return true;
  } // shouldComponentUpdate

  render() {
    //사용자의 계정이 계약 소유자가 아닌 경우 빈 div반환
    if (this.driver.account() !== this.contractOwner) return <div />;
    //그렇지 않으면 이름, 주소에 대한 입력 필드와 허용 버튼이 있는 폼 렌더링
    return (
      <div className="border border-primary row p-2">
        <div className="row col-12">
          <strong>Grant Contract Write Permission</strong>
        </div>
        <div className="row col-12">
          <div className="col-2">Name</div>
          <input
            name="name"
            className="form-control col"
            hint="Name"
            type="text"
            onChange={(e) => this.setState({ name: e.target.value })}
          />
        </div>
        <div className="row col-12">
          <div className="col-2">Address</div>
          <input
            name="address"
            className="form-control col"
            hint="Address to unlock"
            type="text"
            onChange={(e) => this.setState({ address: e.target.value })}
          />
        </div>
        {/* Grant버튼 클릭 시 드라이버에서 eth_grant메서드를 호출함 */}
        <div className="row col-12 justify-content-end">
          <button
            className="col-2 form-control btn-info"
            onClick={() =>
              this.driver.eth_grant(this.state.address, this.state.name)
            }
          >
            Grant
          </button>
        </div>
      </div>
    );
  }
} // Granter

//특정 주소에서 계약 쓰기 권한 제거
class Degranter extends Component {
  //드라이버를 나타내는 드라이버, 주소 및 소유자 prop, degrant할 주소 및 계약 소유자 주소를 각각 받음
  constructor(props) {
    super(props);
    this.driver = props.driver;
    this.address = props.address;
    this.contractOwner = props.owner;
  } // constructor

  //계약 소유자가 변경될 때만 구성 요소가 업데이트되도록 함
  shouldComponentUpdate(nextProps) {
    if (nextProps.owner === this.contractOwner) return false;

    this.contractOwner = nextProps.owner;
    return true;
  } // shouldComponentUpdate

  render() {
    //현자 사용자의 계정이 계약 소유자가아니거나 address prop이 계약 소유자와 일치하는 경우 빈 <div> 반환
    if (this.driver.account() !== this.contractOwner) return <div />;
    if (this.address === this.contractOwner) return <div />;

    //그렇지 않으면 '제거'버튼 렌더링 -> 클릭시 '제거'버튼이 지정된 주소로 드라이버에서 eth_remove메서드를 호출함
    return (
      <button
        className="col-1 form-control btn-sm btn-danger"
        onClick={() => this.driver.eth_remove(this.address)}
      >
        X
      </button>
    );
  }
}
//계약  쓰기 권한이 부여된 주소 목록 표시
class GrantedList extends Component {
  render() {
    return (
      <div className="border border-primary row p-2">
        <div className="col-12">
          <strong>With Contract Write Permission</strong>
        </div>
        {/* 권한이 부여된 주소와 해당 이름, 드라이버 및 계약 소유자 주소를
            각각 나타내는 권한 부여, 드라이버 및 소유자 props를 받는다
        */}
        <div className="row col-12">
          {/* Object.entries()를 사용하여 grant 객체를 반복하고
              각 권한이 부여된 주소에 대한 Degranter 구성 요소 목록을 렌더링 */}
          {Object.entries(this.props.grants).map(([address, name]) => {
            return (
              <Fragment key={address}>
                <div className="col-11">{name}</div>
                <Degranter
                  driver={this.props.driver}
                  owner={this.props.owner}
                  address={address}
                />
              </Fragment>
            );
          })}
        </div>
      </div>
    );
  } // render
} // GrantedList

//계약 권한을 관리
class Permissions extends Component {
  constructor(props) {
    super(props);

    this.state = { grants: {} };
  } // constructor

  //드라이버를 나타내는 드라이버 prop을 받는다
  get driver() {
    return this.props.driver;
  }

  //권한 관련 이벤트를 처리하기 위해 드라이버의 watchEvents 메서드를 사용하여 이벤트 수신기를 설정
  componentDidMount() {
    this.driver.watchEvents((evt) => this.event(evt));
  } // componentDidMount

  //이벤트 메서드는 PermissionGranted 및 PermissionRemoved 이벤트를처리하고
  //그에 따라 권한 부여 및 contractOwner 상태를 업데이트한다
  event(evt) {
    if (evt === this.driver.resetEvent)
      this.setState({
        grants: {},
        contractOwner: null,
      });

    const eventName = evt.event;
    if (eventName === "PermissionGranted")
      return this.granted(evt.args._addr, evt.args._name);
    if (eventName === "PermissionRemoved") return this.removed(evt.args._addr);
  } // event

  //부여된 주소와 해당 이름을 추적하기 위해 grant 상태를 관리하고
  //계약 소유자 주소를 저장하기 위해 contractOwner 상태를 관리한다
  granted(addr, name) {
    if (name === "contract") this.setState({ contractOwner: addr });

    const grants = this.state.grants;
    grants[addr] = name;
    this.setState({
      grants: grants,
    });
  } // granted

  removed(addr) {
    const grants = this.state.grants;
    delete grants[addr];
    this.setState({
      grants: grants,
    });
  } // removed

  render() {
    return (
      <div className="row">
        <div className="col-6">
          {/* 부여된 주소 목록을 표시 */}
          <GrantedList
            grants={this.state.grants}
            driver={this.driver}
            owner={this.state.contractOwner}
          />
        </div>
        <div className="col-6">
          {/* 계약 소유자가 새 주소에 쓰기 권한을 부여할 수 있도록 함 */}
          <Granter driver={this.driver} owner={this.state.contractOwner} />
        </div>
      </div>
    );
  } // render
} // class Permissions

export default Permissions;
