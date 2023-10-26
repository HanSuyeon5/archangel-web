import React, { PureComponent } from "react";
import SearchBox from "./search/SearchBox";
import SearchResults from "./search/SearchResults";
//검색 인터페이스 제공(사용자  입력용 & 검색 결과 표시용)
class Search extends PureComponent {
  //driver의 props를 검색
  get driver() {
    return this.props.driver;
  }

  //검색 결과를 지우고 제공된 검색어로 driver.search메서드를 호출하여 검색
  onSearch(searchTerm) {
    this.resultsBox.clear();
    this.driver
      .search(searchTerm)
      //검색이 성공하면 상태 업데이트
      .then((results) =>
        this.resultsBox.setSearchResults(searchTerm, results, this.onSearch)
      )
      //오류 발생하면 error로 SearchResults 구성요소 업데이트
      .catch((error) => this.resultsBox.setErrors(error));
  } // onSearch

  render() {
    return (
      <div>
        <SearchBox onSearch={(searchTerm) => this.onSearch(searchTerm)} />
        {/* 검색 결과 표시하는 데 사용되며 관련 검색 결과를 사용할 수 있을 때 AIP(아카이브 정보 패키지)를 생성하는 버튼을 포함할 수 있다 */}
        <SearchResults
          ref={(resultsBox) => (this.resultsBox = resultsBox)}
          canWrite={this.props.canWrite}
          onCreateAIP={(sip) => this.props.onCreateAIP(sip)}
        />
      </div>
    );
  } // render
} // Search

export default Search;
