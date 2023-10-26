import React, { Fragment } from "react";
import { AipInfo, FileList } from "@archangeldlt/web-common";
import CreatePackage from "./upload/CreatePackage";
//CreatePackage를 확장하며 AIP(Archival Information Package)을 생성하는 데 사용됨
// AIP를 생성하고 관련 정보를 입력하며, 파일 목록을 표시하는 데 사용

class CreateAIP extends CreatePackage {
  constructor(props) {
    super(props, props.sip.files, props.sip.data); //부모클래스의 생성자 호출 및 AIP 생성을 위한 초기 설정을 수행
    // SIP(Submission Information Package)에서 파일 이름과 UUID(UUID 형식)를 가지고 있는지 여부를 나타냄
    this.hasFilenames = props.sip.hasFilenames;
    this.hasUuid = props.sip.hasUuid;
  } // constructor

  //AIP의 유형을 반환하는 게터 메서드
  get type() {
    return "AIP";
  }

  //부모 클래스의 reset메서드를 호출하여 상태 재설정하고 canCreate상태를 업데이트한다
  //props.onSubmint함수가 있으면 호출된다

  //AIP 생성을 재설정하고 초기 상태로 돌아가는 메서드
  reset() {
    this.setState({ count: this.count + 1 }); //count 상태 증가시켜 AIP 생성을 리셋함
    this.updateCanCreate(null, null); //AIP 생성 가능 여부 초기화
    if (this.props.onSubmit) this.props.onSubmit();//제출 함수 호출
  } // reset

  //AIP 생성 횟수를 반환
  get count() {
    return this.state.count;
  }

  //AIP에 대한 페이로드를 준비하는 메서드
  //데이터,파일리스트,타임스탬프를 받아 페이로드 객체 생성하고 반환함
  preparePayload(timestamp, data, files) {
    const payload = {
      data,
      files,
      timestamp,
    };

    return payload;
  } // preparePayload

  //AIP를 생성하기 위한 Form을 렌더링(AipInfo, FileList 컴포넌트)
  renderForm() {
    return (
      <Fragment>
        {/*  AIP 정보를 입력하는 데 사용되며, this.state.data를 초기 데이터로 설정함 */}
        <AipInfo
          initialData={this.state.data}
          readonly={this.isConfirming}
          onData={(data) => this.onData(data)}
        />
        {/* AIP에 포함될 파일 목록을 표시 */}
        <FileList
          files={this.state.files}
          showPath={this.hasFilenames}
          showUuid={this.hasUuid}
        />
      </Fragment>
    );
  } // renderForm
} // class CreateAIP

export default CreateAIP;
