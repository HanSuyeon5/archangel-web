import React, { Fragment } from "react";
import Dropzone from "react-dropzone";
import UploadBox from "./upload/UploadBox";
import { SipInfo } from "@archangeldlt/web-common";
import CreatePackage from "./upload/CreatePackage";
import { toast } from "react-toastify";
import superagent from "superagent";

//SIP 생성 및 관리를 위한 기능을 제공하며, Preservica SIP 가져오기와 관련 정보를 사용자에게 제공합니다.
//이 컴포넌트는 다른 SIP 및 파일 업로드 컴포넌트와 함께 사용된다

//SIP (Simplified Interchange Package)을 생성하고 관리하는 데 사용되며, 파일 업로드 및 SIP 정보 표시를 담당
class CreateSIP extends CreatePackage {

  //부모 클래스의 생성자를 호출하고 초기 상태를 설정
  //초기 상태로 includeFilenames, disableImport, hideImport을 설정합니다.
  //files와 data는 빈 배열과 null로 초기화
  constructor(props) {
    super(props, [], null);
  } // constructor

  //생성되는 패키지 유형을 지정하는데 사용되며 이 경우 'SIP'이다
  get type() {
    return "SIP";
  }

  //페이로드에 파일명을 포함할지 여부를 설정하기 위한 메서드
  onIncludeFilenames(includeFilenames) {
    this.setState({ //상태 업데이트
      includeFilenames: includeFilenames,
    });
  } // onIncludeFilenames

  //업로드할 데이터와 파일들을 포함하는 payload를 준비하는 메서드
  //파일들의 정보를 정리하고, includeFilenames 설정에 따라 파일명과 경로를 포함할지 결정
  preparePayload(timestamp, data, files) {
    //파일 배열을 선택한 속성을 가진 개체의 새 배열에 매핑한다
    const strippedFiles = files.map((file) => {
      return {
        path: file.path,
        name: file.name,
        type: file.type,
        puid: file.puid,
        sha256_hash: file.sha256_hash,
        size: file.size,
        last_modified: file.last_modified,
        uuid: file.uuid,
      };
    });
    //includeFilenames가 false면 각 파일 개체에서 경로 및 이름 속성을 제거한다
    if (!this.state.includeFilenames) {
      strippedFiles.forEach((file) => {
        delete file.path;
        delete file.name;
      });
    }

    //페이로드 개체에는 데이터, 파일 및 타임스탬프가 포함된다
    const payload = {
      data,
      files: strippedFiles,
      timestamp,
    };

    return payload;
  } // preparePayload

  //파일 업로드 시 호출되는 메서드
  onFiles(files) {
  //부모 클래스의 onFiles 메서드를 호출하고 가져오기 섹션을 숨김(hideImport)
    super.onFiles(files);
    this.hideImport();
  }

  //Preservica SIP를 가져오는 메서드
  //SIP 파일을 업로드하고 관련 정보를 가져온다
  async importPreservicaSIP(sipFile) {
    //가져오기 버튼 비활성화하고
    this.disableImport();
    //가져오기가 진행되는 동안 토스트메시지를 표시
    const toastId = toast(`Importing '${sipFile.name}' ...`, {
      autoClose: 12000,
    });

    try {
      //SIP파일이 첨부된 서버의 "import-preservica" 끝점에 superagent를 사용하여 POST요청을 보냄
      const response = await superagent
        .post("import-preservica")
        .field("lastModified", sipFile.lastModified)
        .attach("sip", sipFile);

      //서버는 상태를 업데이트하고 SIP정보를 표시하는 데 사용되는 데이터 및 파일로 응답한다
      const { data, files } = response.body;
      this.sipInfo.setData(data);
      this.uploadBox.setFiles(files);
      toast.update(toastId, {
        render: `${sipFile.name} imported`,
        autoClose: 5000,
      });
      this.hideImport();
    } catch (err) {
      //오류가 있으면 오류 세부 정보와 함께 토스트 메시지 표시
      toast.dismiss(toastId);
      toast.error(`Could not import ${sipFile.name} : ${err.message}`);
      this.enableImport();
    }
  }

  //disableImport, enableImport: Preservica SIP 가져오기 버튼의 활성화 여부를 설정하는 메서드
  disableImport() {
    this.setState({ disableImport: true });
  }
  enableImport() {
    this.setState({ disableImport: false });
  }
  //가져오기 버튼을 숨기기 위한 메서드
  hideImport() {
    this.setState({ hideImport: true });
  }

  //가져오기 버튼을 표시할지 여부를 결정하는 게터 메서드
  get canImport() {
    return !this.state.hideImport;
  }

  //컴포넌트의 렌더링 메서드로, SIP 생성 및 파일 업로드에 관한 정보를 표시링
  renderForm() {
    //showImport 변수에 따라 가져오기 버튼을 표시하며, SipInfo 및 UploadBox 컴포넌트를 렌더링
    //ImportBtn컴포넌트는 Preservica SIP파일을 가져올 수 있다
    const showImport = this.canImport && this.isCreating;
    return (
      <Fragment>
        <div className={`container-fluid`} hidden={showImport}>
          <div className="row">
            <div className="col form-control">
              <strong>SIP</strong> - {this.sipInfo && this.sipInfo.key}
            </div>
          </div>
        </div>
        <p />
        <SipInfo
          key={`sip-${this.count}`}
          onData={(data) => this.onData(data)}
          readonly={this.isConfirming}
          ref={(sipInfo) => (this.sipInfo = sipInfo)}
        />
        <hr />
        <UploadBox
          key={`files-${this.count}`}
          onFiles={(files) => this.onFiles(files)}
          onIncludeFilenames={(includeFilenames) =>
            this.onIncludeFilenames(includeFilenames)
          }
          readonly={this.isConfirming}
          ref={(upload) => (this.uploadBox = upload)}
        />
        {/*가져오기 버튼을 렌더링하는 함수형 컴포넌트입니다.
           visible 상태에 따라 버튼을 표시하고, disabled 상태에 따라 버튼을 비활성화합니다.
           SIP 파일을 가져오기 위해 Dropzone을 사용하며, 버튼 클릭 시 onClick 콜백을 호출합니다.
        */}
        <ImportBtn
          visible={showImport}
          disabled={this.state.disableImport}
          onClick={(file) => this.importPreservicaSIP(file)}
        />
      </Fragment>
    );
  }
} // class CreateSIP

function ImportBtn({ visible, disabled, onClick }) {
  if (!visible) return null;
  return (
    <Dropzone
      onDrop={(files) => onClick(files[0])}
      disabled={disabled}
      disabledClassName="disabled"
      className="form-control btn btn-outline-info col-md-2"
    >
      Import Preservica SIP
    </Dropzone>
  );
} // CreateBtn

export default CreateSIP;
