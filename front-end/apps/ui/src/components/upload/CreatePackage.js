import React, { Component, Fragment } from "react";
import { DateTime } from "luxon";
import { toast } from "react-toastify";

// 패키지 생성 및 업로드 작업 하는데 필요한 기능 포함하며 상태 변화에 따라 관련 버튼과 폼을 표시

//패키지 생성 프로세스에 대한 버튼을 렌더링하여 다양한 유형의 패키지를 생성하기 위한 재사용 가능한 기반을 제공
class CreatePackage extends Component {

  //생성자: 단계(패키지 생성의 현재 단계를 나타냄), 파일 목록(선택) 및 패키지(선택)와 관련된 데이터를 포함한 초기 상태를 설정함
  constructor(props, files = null, data = null) {
    super(props); // props를 받아 부모 클래스의 생성자를 호출하고 초기 상태를 설정

    this.state = {
      step: "creating",
      files: files,
      data: data,
      count: 0,
    };
  } // constructor

  //AIP 생성을 재설정하고 초기 상태로 돌아가는 메서드
  reset() {
    this.setState({ count: this.count + 1 }); //count 상태를 증가시켜 AIP 생성을 리셋
    this.updateCanCreate(null, null); // AIP 생성 가능 여부를 초기화함
  } // reset
  //AIP 생성 횟수를 반환
  get count() {
    return this.state.count;
  }
  //onData, onFiles: 데이터 및 파일 업데이트 이벤트를 처리하는 메서드. 데이터 또는 파일이 업데이트될 때 호출된다
  onData(data) {
    this.updateCanCreate(data, this.state.files); //이 함수를 호출하여 생성 가능 여부를 업데이트 한다
  }
  onFiles(files) {
    this.updateCanCreate(this.state.data, files);
  }
  updateCanCreate(data, files) {
    const ready = data !== null && files !== null;
    this.setState({
      data,
      files,
      step: ready ? "canCreate" : "creating",
    });
  } // updateCanCreate

  //onCreate, onBack, onConfirm: 패키지 생성 및 업로드 작업 단계를 처리하는 메서드

  //생성 버튼을 눌렀을 때 호출되어 'canConfirm' 상태로 전환
  onCreate() {
    this.setState({ step: "canConfirm" });
  }
  //뒤로 가기 버튼을 눌렀을 때 호출되어 'canCreate' 상태로 전환
  onBack() {
    this.setState({ step: "canCreate" });
  }
  //업로드 버튼을 눌렀을 때 호출되어 'uploading' 상태로 전환하고 업로드 작업을 수행
  onConfirm() {
    this.setState({ step: "uploading" });
    this.upload();
  } // onConfirm

  //실제 업로드 작업을 처리하는 메서드
  upload() {
    const timestamp = DateTime.utc().toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");
    const { data, files } = this.state;
    //preparePayload를 사용하여 업로드할 페이로드를 준비하고, 이를 드라이버를 통해 저장하고 트랜잭션을 수행합니다. 업로드 상태를 나타내는 메시지가 토스트 알림으로 표시
    const payload = this.preparePayload(timestamp, data, files);

    //props.driver.store()를 사용하여 패키지 데이터를 저장하고 트랜잭션의 성공 또는 실패에 따라 토스트 메시지를 표시함
    this.props.driver
      .store(data.key, payload)
      .transaction(() => {
        toast(`${this.type} submitted`);
        this.reset();
      })
      .then(() => toast.success(`${this.type} written to blockchain`))
      .catch((err) => {
        toast.error(`${err}`);
        if (this.isConfirming) this.setState({ step: "canConfirm" });
      });
  } // upload

  //현재 패키지 생성 및 업로드 작업 상태를 나타내는 게터 메서드. step 상태를 기반으로 상태를 화 ㄱ인함
  get isCreating() {
    return this.state.step === "canCreate" || this.state.step === "creating";
  }
  get canCreate() {
    return this.state.step === "canCreate";
  }
  get isConfirming() {
    return this.state.step === "canConfirm" || this.state.step === "uploading";
  }
  get canConfirm() {
    return this.state.step === "canConfirm";
  }

  //패키지 생성 양식을 렌더링
  //패키지 생성 프로세스의 현재 단계를 기반으로 '패키지 생성'버튼과 '업로드 확인'버튼을 조건부로 표시함
  //특정 양식 콘텐츠는 createPackage를 확장하는 자식 구성 요소에서 구현되어야 하는 renderForm메서드를 호출하여 렌더링됨
  render() {
    return (
      <Fragment>
        <div className="container-fluid">
          <CreateBtn
            disabled={!this.canCreate}
            visible={this.isCreating}
            onClick={() => this.onCreate()}
          >
            Create {this.type}
          </CreateBtn>
          <ConfirmBtn
            disabled={!this.canConfirm}
            visible={this.isConfirming}
            onClick={() => this.onConfirm()}
            onBack={() => this.onBack()}
          >
            Upload {this.type}
          </ConfirmBtn>

          {this.renderForm()}
        </div>
      </Fragment>
    );
  } // render
} // class CreatePackage

//만들기 버튼 렌더링하는 기능적 구성 요소로 조건에 따라 출력
function CreateBtn({ disabled, visible, onClick, children }) {
  return (
    <div className={"container-fluid " + (!visible ? "d-none" : "")}>
      <div className="row">
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-primary offset-md-10 col-md-2"
          onClick={onClick}
        >
          {children} &raquo;&raquo;
        </button>
      </div>
    </div>
  );
} // CreateBtn

//확인 버튼 렌더링하는 기능적 구성 요소로 조건에 따라 출력
function ConfirmBtn({ disabled, visible, onClick, onBack, children }) {
  return (
    <div className={"container-fluid " + (!visible ? "d-none" : "")}>
      <div className="row">
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-secondary col-md-2"
          onClick={onBack}
        >
          &laquo;&laquo; Back
        </button>
        <button
          type="submit"
          disabled={disabled}
          className="btn btn-success offset-md-8 col-md-2"
          onClick={onClick}
        >
          {children}
        </button>
      </div>
    </div>
  );
} // CreateBtn

export default CreatePackage;
