import React, { Component } from 'react';
// 현재 Ethereum 블록 번호를 가져와서 표시하는 컴포넌트
class Blocknumber extends Component {
  constructor(props) {
    super(props);

    this.state = { blockNumber: 'Unknown' }; //초기 상태로 blockNumber를 'Unknown'으로 설정
  } // constructor

  get driver() { return this.props.driver; } //부모 컴포넌트에서 전달된 driver 속성을 통해 Ethereum 블록 번호를 가져옵니다

  componentDidMount() {
    this.blockNumber();
  } // componentDidMount

//Ethereum 블록 번호를 비동기적으로 가져오는 메서드입니다.
//this.driver.currentBlockNumber()를 호출하여 현재 블록 번호를 가져온 다음, 상태를 업데이트하고 5초마다 업데이트를 반복
  async blockNumber() {
    const blockNo = await this.driver.currentBlockNumber()
    this.setState({ blockNumber: blockNo });
    setTimeout(() => this.blockNumber(), 5000);
  } // blockNumber

  render() {
    return (
      <strong>Current Block: { this.state.blockNumber }</strong>
    )
  } // render
} // class Blocknumber

export default Blocknumber;
