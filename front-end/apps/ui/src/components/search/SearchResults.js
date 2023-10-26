import React, { Component, Fragment } from 'react';
import Collapsible from 'react-collapsible';
import { PackageInfo, FileList } from '@archangeldlt/web-common';

function SearchResult({ record }) {
  const noOfFiles = record.files ? record.files.length : 0

  return (
    <Fragment>
      <PackageInfo initialData={record.data}/>
      <FileList files={record.files} showPath={record.hasFilenames} showUuid={record.hasUuid}/>
      <div className='container-fluid'>
        <div className='row'>
          <div className='col-6 offset-2'>Contains {noOfFiles} file{noOfFiles > 1 ? 's' : '' }.</div>
          <div className="col-4">Uploaded by <strong>{record.uploader}</strong> at {record.timestamp} </div>
        </div>
      </div>
      <hr/>
    </Fragment>
  );
} // SearchResult

//SearchResults 클래스 컴포넌트- 검색 결과의 목록을 관리하고 표시함
class SearchResults extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: null
    }
  } // constructor

  //검색 결과와 오류를 초기화하는 함수
  clear() {
    this.setSearchResults(null, null);
    this.setErrors(null);
  } // clear

  setSearchResults(searchTerm, results, searchFn) {
    this.setState({
      searchTerm: searchTerm,
      searchResults: results,Field
      searchFn: searchFn
    });
  } // setSearchResults

  setErrors(errors) {
    this.setState({
      errors: errors
    });
  } // setErrors

  render() {
    const {searchTerm, searchResults, errors} = this.state;

    if (!searchResults && !errors)
      return (<div/>)

    if (errors)
      return this.renderErrors(errors);

    return this.renderResults(searchTerm, searchResults);
  } // render

  //검색 실패시 오류 메시지를 표시함
  renderErrors(errors) {
    return (
      <div>
        <div className='row'>
          <div className='col-md-12'><strong>Search failed</strong></div>
        </div>
        <div className='row'>
          <div className='col-md-12'>{ errors.message || errors.error }</div>
          <div className='col-md-12'>{ JSON.stringify(errors) }</div>
        </div>
      </div>
    )
  } // renderErrors
  //개별 검색 결과를 표시하고, "history"를 클릭하여 결과를 확장할 수 있도록 collapsible를 사용함
  renderResult(result) {
    const record = result[0];
    const prev = result.slice(1);

    return (
      <div className='SearchResult' key={record.data.key}>
        <SearchResult
          record={record}
          canWrite={this.props.canWrite}
          onCreateAIP={this.props.onCreateAIP}
        />
        {
          (prev.length !== 0) && <Collapsible trigger='History'><small>
            { prev.map( (r, i) => (<SearchResult record={r} key={i} />)) }
          </small></Collapsible>
        }
      </div>
    )
  };

  //전체 검색 결과를 표시함
  renderResults(searchTerm, searchResults) {
    searchResults = searchResults || [];
    searchResults.reverse();

    const found = searchResults.length;
    return (
      <div>
        <div className='row'>
          <div className='col-md-12'>
            <h3>Searched for <strong>{searchTerm}</strong></h3>
            {found ?
              `${found} package${found>1 ? 's' : ''} found` :
              'No packages found'
            }
          </div>
        </div>
        <div className='row'>
          <br className='col-md-12'/>
        </div>
        {
          searchResults.map(r => this.renderResult(r))
        }
        <div className='row'>
          <hr className='col-md-12'/>
        </div>
      </div>
    )
  } // renderResults
} // SearchResults

export default SearchResults;
