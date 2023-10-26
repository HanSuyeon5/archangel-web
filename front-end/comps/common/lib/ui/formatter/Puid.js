import React from 'react';
//https://www.nationalarchives.gov.uk/aboutapps/pronom/puid.htm

//PUID(PRONOM Unique Identifier) 값에 대한 하이퍼링크를 생성하는 React 컴포넌트
//PUID는 PRONOM(기록 관리자 및 기록 관리자 도구를 위한 파일 형식 레지스트리)에서 사용되는 파일 형식의 고유 식별자

//프로퍼티로 받은 value로 url 동적 생성한다
//value는 실제 PUID 값을 보여주는 하이퍼링크의 내용이다
//링크 클릭하면 웹사이트에서 해당 PUID에 대한 자세한 정보를 볼 수 있다
function Puid({value}) {
  return (
    <a href={`http://www.nationalarchives.gov.uk/pronom/${value}`} target="_blank">{value}</a>
  )
}

export default Puid;