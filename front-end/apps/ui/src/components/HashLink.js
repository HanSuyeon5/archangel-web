import React from "react";
//해시 값 표시하고 클릭하면 검색 기능을 트리거하는 재사용 가능한 버튼 나타냄
//hash: 버튼에 표시될 해시 값
//searchFn: 버튼을 클릭하면 트리거되는 검색 기능. 제공된 해시 값 기반으로 검색 수행
function HashLink({ hash, searchFn }) {
  return (
    <button
      onClick={() => searchFn(hash)}
      className="btn btn-link"
      role="link"
      type="submit"
    >
      {hash}
    </button>
  );
}

export default HashLink;
