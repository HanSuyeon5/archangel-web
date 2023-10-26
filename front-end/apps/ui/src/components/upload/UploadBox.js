import React, { Component } from "react";
import Dropzone from "react-dropzone";
import superagent from "superagent"; //http 요청 라이브러리
import { FileList } from "@archangeldlt/web-common";
import { toast } from "react-toastify";


//파일 업로드를 처리하고 DROID를 사용하여 파일 특성화를 수행한 다음 결과를 화면에 표시하는 역할
//파일 업로드와 파일 정보 관리 기능을 제공하는 컴포넌트
class UploadBox extends Component {

  constructor(props) {
    super(props); //props를 받아 부모 클래스의 생성자를 호출하고 초기 상태를 설정함
    this.state = {
      includeFilenames: true,
      disableUpload: false,
      payload: [],
    };
  } // constructor

  //이 컴포넌트의 부모 컴포넌트로부터 데이터와 이벤트 처리기를 가져올 수 있는 getter메서드
  get onIncludeFilenames() {
    return this.props.onIncludeFilenames;
  }
  get onFiles() {
    return this.props.onFiles;
  }
  get files() {
    return this.state.payload;
  }

  //제공된 파일로 페이로드 상태를 설정하고 파일을 외부에서 가져온 것으로 설정하는 메서드
  //external을 통해 외부에서 가져온것인지 추적
  setFiles(files) {
    this.setState({
      payload: files,
      external: true,
    });
  }
  //파일 드롭 이벤트를 처리하는 비동기 메서드
  //파일마다 DROID에 파일 특성화(characterization)를 요청하고 해당 결과를 알림 메시지로 표시
  //파일 특성화가 성공하면 fileCharacterised 메서드를 호출하여 파일 정보를 업데이트
  async handleFileDrop(files) {
    this.onFiles(null);
    this.disableUpload(); //파일 업로드 중에는 업로드 비활성화된다

    let c = 0;
    for (const file of files) {
      const prefix = `File ${++c} of ${files.length}: `;
      const toastId = toast(
        `${prefix}Sending '${file.name}' to DROID for characterization ...`,
        { autoClose: 12000 }
      );

      //진행 상황 알리는 토스트 메시지 표시
      try {
        const response = await superagent
          .post("upload")
          .field("lastModified", file.lastModified)
          .attach("candidate", file);

        toast.update(toastId, {
          render: `${prefix}${file.name} characterized`,
          autoClose: 5000,
        });

        this.fileCharacterised(response.body);
      } catch (err) {
        toast.dismiss(toastId);
        //파일 특성화 실패하면 오류메시지 표시
        toast.error(
          `${prefix}Could not characterize ${file.name} : ${err.message}`
        );
      }
    } // for ...

    this.onFiles(this.state.payload);
    this.onIncludeFilenames(this.state.includeFilenames);
    this.enableUpload();
  } // handleFileDrop

  //업로드 버튼 활성화/비활성화
  disableUpload() {
    this.setState({ disableUpload: true });
  }
  enableUpload() {
    this.setState({ disableUpload: false });
  }

  //DROID에서 반환된 파일 정보를 가공하고 JSON형식으로 변환하고 payload 상태를 업데이트하는 메서드
  fileCharacterised(droidInfo) {
    const json = droidInfo.map((info) => {
      const j = {
        path: info.PATH,
        name: info.NAME,
        puid: info.PUID,
        sha256_hash: info.SHA256_HASH,
        size: info.SIZE,
        type: info.TYPE,
        uuid: info.UUID,
      };

      if (info.LAST_MODIFIED) j.last_modified = info.LAST_MODIFIED;
      if (info.PARENT_ID) j.parent_sha256_hash = info.PARENT_SHA256_HASH;

      return j;
    });

    const payload = this.state.payload;
    payload.push(...json);
    this.setState({
      payload: payload,
    });
  } // fileCharacterised

  //"Include filenames" 체크박스의 활성화 여부를 업데이트하는 메서드
  toggleIncludeFilenames(enabled) {
    this.setState({
      includeFilenames: enabled,
    });
  } // toggleIncludeFilenames

//파일 업로드 영역, "Include filenames" 체크박스, 파일 목록을 표시
  render() {
    return (
      <div className="container-fluid">
        <div
          className={
            "row " +
            (this.props.readonly || this.state.external ? "d-none" : "")
          }
        >
            //파일 업로드 처리하고, 업로드 중인 경우 비활성화된다
          <Dropzone
            onDrop={(files) => this.handleFileDrop(files)}
            disabled={this.state.disableUpload}
            disabledClassName="disabled"
            className="form-control btn btn-secondary col-md-2"
          >
            Add Files
          </Dropzone>
        </div>
        {/* checkbox를 사용하여 특성화하는 동안 파일 이름을 포함 여부 선택
        */}
        <div className="offset-md-10 col-md-2">
          <input
            name="includeFilenames"
            type="checkbox"
            enabled={(!this.props.readonly).toString()}
            checked={this.state.includeFilenames}
            onChange={(evt) => this.toggleIncludeFilenames(evt.checked)}
          />
          <label>&nbsp;&nbsp;Include filenames</label>
        </div>
        <div className="row">
          {/* 특성화된 파일은 showPath 및 showUuid prop을 기반으로 하는 추가 옵션과 함께 FileList구성 요소에 표시됨 */}
          <FileList
            files={this.state.payload}
            showPath={!this.props.readonly || this.state.includeFilenames}
            showUuid={true}
          />
        </div>
      </div>
    );
  } // render
} // class UploadBox

export default UploadBox;
