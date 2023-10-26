import React, { Component } from "react";
import { Field } from '@archangeldlt/web-common';
//SearchBox 컴포넌트
class SearchBox extends Component {
  constructor(props) {
    super(props);
    //검색어 저장하기 위한 searchTerm 상태를 초기화
    this.state = {
      searchTerm: "",
    };
  } // constructor

  //검색어 업데이트하는 데 사용됨
  //Field컴포넌트의 onValue콜백함수에서 호출되며, 사용자가 입력한 값을 searchTerm 상태에 설정
  updateSearchTerm(value) {
    this.setState({ searchTerm: value });
  } // handleChange

    //검색 수행-검색어가 비어 있지 않으면 onSearch 함수 호출. 이 함수는 부모 컴포넌트에서 전달된 것으로 가정
  doSearch() {
    if (this.state.searchTerm) this.props.onSearch(this.state.searchTerm);
  } // handleSubmit

  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <Field
            className="col-md-12"
            placeholder="Search Archangel - text search or file hash"
            onValue={(v) => this.updateSearchTerm(v)}
            onEnter={() => this.doSearch()}
          />
        </div>
        <div className="row">
          <button
            onClick={() => this.doSearch()}
            className="btn btn-success offset-md-10 col-md-2"
            disabled={!this.state.searchTerm} //빈 값이면 버튼 비활성화
          >
            Search
          </button>
        </div>
      </div>
    );
  } // react
} // SearchBox

export default SearchBox;
