import React from 'react';
import ReactDataGrid from 'react-data-grid';
import FileSizeFormatter from './formatter/FileSize';
import PuidFormatter from './formatter/Puid';
//주어진 파일 목록에 따라 표를 생성하며, showPath 및 showUuid 프로퍼티에 따라 표시할 열을 동적으로 조정할 수 있습니다.
//react-data-grid 패키지를 사용하여 강력한 데이터 그리드를 생성하므로 파일 목록을 시각적으로 표현하는 데 유용

//파일 목록을 표시하고 그 파일들의 속성을 표 형태로 표현하는 컴포넌트
//files: 표시할 파일 목록을 나타내는 배열,
//showPath: 파일 경로를 표시할지 여부를 나타내는 불리언 값,
//showUuid: 파일 UUID를 표시할지 여부를 나타내는 불리언 값
//파일 목록이 없거나 피어 있으면 null을 반환하여 아무것도 표시하지 않는다
function FileList({files, showPath, showUuid}) {
  if (!files || !files.length)
    return null;

//컬럼 설정 - 파일유형/puid/파일크기/최종수정일/해시
  const columns = [
    { key: 'type', name: 'Type', resizable: true },
    { key: 'puid', name: 'PUID', resizable: true, formatter: PuidFormatter },
    { key: 'size', name: 'Size', resizable: true, formatter: FileSizeFormatter },
    { key: 'last_modified', name: 'Last Modified', resizable: true },
    { key: 'sha256_hash', name: 'Hash', resizable: true }
  ];

  //true면, 파일 경로와 이름이 columns 배열의 가장 앞에 추가됨
  if (showPath) {
    columns.unshift(
      { key: 'path', name: 'Path', resizable: true },
      { key: 'name', name: 'File name', resizable: true },
    )
  }
  //uuid가 true면,파일 uuid열이 columns 배열의 가장 뒤에 추가됨
  if (showUuid) {
    columns.push(
      { key: 'uuid', name: 'File UUID', resizable: true },
    )
  }
 //파일이 5개 이상이면, 표 높이를 500 아니면 200으로 설정
  const size = files.length > 5 ? 500 : 200;

  return (
    <ReactDataGrid
      columns={columns} //열 구성
      rowGetter={i => files[i]} //rowGetter: 각 행의 데이터 제공
      rowsCount={files.length} //파일 목록의 길이를 설정
      minHeight={size} /> //표의 최소 높이 설정
  );
} // FileList

export default FileList;
