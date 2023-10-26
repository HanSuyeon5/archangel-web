import React, { Component } from 'react';
//메시지를 표시하기 위한 컴포넌트로, 상태를 업데이트하고 이 메시지를 렌더링함
//이 컴포넌트는 주로 다른 컴포넌트에서 업로드나 처리의 진행 상태 또는 에러 메시지를 표시하는 데 사용된다

//메시지를 저장하고 필요에 따라 화면에 표시하는 기능을 제공합니다.
//메시지는 일반적으로 업로드나 처리 과정 중 발생한 이벤트를 사용자에게 알리는 데 사용될 수 있습니다. 현재는 주석 처리되어 화면에 메시지를 표시하지 않고 있으므로,
//필요한 경우 주석 처리를 제거하여 활성화할 수 있습니다
class UploadResults extends Component {

  constructor(props) {
    super(props);// props를 받아 부모 클래스의 생성자를 호출하고 초기 상태를 설정
    this.state = {messages: []} //메세지 배열을 빈 배열로 초기화
  } // constructor


//messages 배열을 비우는 메서드입니다. 현재 저장된 메시지를 모두 삭제
  clear() {
    this.setState({
      messages: []
    })
  } // clear

//새 메시지를 messages 배열에 추가하는 메서드
//현재 저장된 메시지가 5개를 넘어가면 가장 오래된 메시지를 삭제하고 새 메시지를 추가
  message(msg) {
    let messages = this.state.messages;
    while (messages.length >= 5)
      messages.shift();

    messages.push(msg);
    this.setState({
      messages: messages
    });
  } // uploadComplete
  //에러 메시지를 message 메서드를 통해 추가하는 간단한 래핑 메서드
  error(msg) {
    this.message(`${msg}`);
  } // error

  render() {
    return null;
    /*
    const {messages} = this.state;

    if (messages.length === 0)
      return (<div/>)

    return UploadResults.renderResults(messages);
    */
  } // render

//messages 배열에 있는 메시지들을 렌더링하는 정적 메서드
//messages 배열을 반복하며 각 메시지를 화면에 표시하는 React 요소를 생성
  static renderResults(messages) {
    return (
      <div className='container-fluid'>
        {
          messages.map((msg, i) => (
            <div className='row' key={i}>
              <div className='col-md-12'>{msg}</div>
            </div>
          ))
        }
      </div>
    )
  } // renderResults
} // UploadResults

export default UploadResults;