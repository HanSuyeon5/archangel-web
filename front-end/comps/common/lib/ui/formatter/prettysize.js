/*
Derived code copyright (c) 2013, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://yuilibrary.com/license/
*/

//파일 크기를 표시할 때 사용되는 단위들이 순서대로 포함되어 있다
const sizes = [
    'Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'
];

/**
Pretty print a size from bytes
@method pretty
@param {Number} size The number to pretty print
@param {Boolean} [nospace=false] Don't print a space
@param {Boolean} [one=false] Only print one character
@param {Number} [places=1] Number of decimal places to return
*/

//파일 크기를 가독성 있게 출력하는 함수
//size: 가독성을 표시할 숫자(파일크기)
//nospace (선택 사항): 불리언 값, 기본값은 false. 공백을 출력하지 않도록 지정할 수 있습니다.
//one (선택 사항): 불리언 값, 기본값은 false. 한 문자만 출력하도록 지정할 수 있습니다.
//places (선택 사항): 소수점 이하 자릿수를 지정할 수 있으며 기본값은 1입니다.

//코드 내부 작동
//코드는 sizes 배열을 반복하여 적절한 단위를 찾아가며 파일 크기를 계산함
//unit변수에는 현재 단위가 저장되고, s 변수에는 해당 단위의 바이트 수가 저장된다

//해당 함수 반환
//size에 따라 가장 적절한 크기와 단위를 가독성 있게 조합하여 문자열로 반환함
//  ex) size가 1024일 경우 "1 KB"를 반환
//      "nospace" 매개변수가 true로 설정된 경우, 크기와 단위 사이에 공백을 포함하지x

const prettysize = (size, nospace, one, places) => {
    if (typeof nospace === 'object') {
        const opts = nospace;
        nospace = opts.nospace;
        one = opts.one;
        places = opts.places || 1;
    } else {
        places = places || 1;
    }

    let mysize;

    sizes.forEach((unit, id) => {
        if (one) {
            unit = unit.slice(0, 1);
        }
        const s = Math.pow(1024, id);
        let fixed;
        //size가 s보다 큰 경우, 파일 크기를 해당 단위로 변환하고, 소수점 아래 자릿수를 제한한다
        //파일 크기와 단위가 조합되어 반환됨
        if (size >= s) {
            fixed = String((size / s).toFixed(places));
            if (fixed.indexOf('.0') === fixed.length - 2) {
                fixed = fixed.slice(0, -2);
            }
            mysize = fixed + (nospace ? '' : ' ') + unit;
        }
    });

    // zero handling
    // always prints in Bytes
    if (!mysize) {
        let unit = (one ? sizes[0].slice(0, 1) : sizes[0]);
        mysize = '0' + (nospace ? '' : ' ') + unit;
    }

    return mysize;
};

export default prettysize;