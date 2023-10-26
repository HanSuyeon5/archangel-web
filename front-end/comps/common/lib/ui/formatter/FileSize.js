//prettysize 함수를 외부 모듈에서 가져온다. 이 함수는 파일 크기를 가독성 있게 포맷하는데 사용됨
import prettysize from './prettysize';
//파일 크기를 가독성 있게 표시하기 위한 용도로 사용

//이 함수는 prettysize(value)를 호출하여 파일 크기를 가독성 있게 형식화함
//value는 파일 크기를 나타내는 숫자이며, 이 크기는 prettysize 함수에 전달된다 -> 형식화된 파일 크기 문자열은 이 함수의 반환 값으로 사용됨
function FileSizeFormatter({value}) {
  return prettysize(value);
} // class FileSizeFormatter

export default FileSizeFormatter;