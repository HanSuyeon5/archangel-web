import React, {Fragment, PureComponent} from 'react';
import Field from './Field';
import uuid from 'uuid/v1';
import cloneDeep from 'lodash.clonedeep';


// React 애플리케이션에서 사용되는 패키지 정보를 입력 및 패키지 종류에 따라 필드 동적으로 표시하기 위한 컴포넌트를 정의하는 코드

//상수 정의
const key = 'key';
const pack = 'pack';
const collection = 'collection';
const citation = 'citation';
const localRef = 'ref';
const supplier = 'supplier';
const creator = 'creator';
const rights = 'rights';
const held = 'held';

//패키지 정보를 입력 및 관리하는 클래스
class PackageFields extends PureComponent {
  constructor(props, fields) {
    super(props);
    this.fields = cloneDeep(fields);

    //초기 데이터를 받아 패키지 정보 필드의 초기값을 설정함
    if (this.props.initialData)
      this.fieldNames.forEach(name => this[name] = this.props.initialData[name]);
    //특정 조건에 따라 패키지 정보 필드를 표시
    if (this.props.display) {
      const c = this.fields.findIndex(f => f.field === collection)
      if (c !== -1) {
        const condition = () => !!this.props.initialData[collection]
        this.fields[c].condition = condition
        if (this.fields[c + 1].title === '--')
          this.fields[c + 1].condition = condition
      }
    }
  }

  get onData() { return this.props.onData; }

  get fieldNames() { return this.fields.filter(f => !!f.field).map(f => f.field) }
  //모든 필수 필드에 값이 있는지 확인하는 메서드로, fieldNames 배열을 사용
  get dataReady() {
    return this.fieldNames.reduce((acc, name) => acc && !!this[name], true)
  } // get
  //패키지 정보를 객체로 반환
  get data() {
    const d = {
      [key]: this[key],
      [pack]: this[pack],
    }

    this.fieldNames.forEach(name => d[name] = this[name]);

    return d;
  } // data
  //패키지 정보를 설정
  setData(data) {
    for (const n of this.fieldNames) {
      if (data[n]) {
        this[`${n}-field`].setValue(data[n])
      }
    }
    this.key = data.key
  }
  //정보가 변경될 때 호추로디어 상위 컴포넌트에 데이터를 전달함
  update(field, value) {
    this[field] = value

    this.onData(this.dataReady ? this.data : null);
  } // update

  renderFields() {
    return this.fields.map((field, i) => {
      if (field.condition && !field.condition())
        return (<span key={i}/>)

      if (field.title === '--')
        return (<br key={i}/>)

      const value = this.props.initialData ? this.props.initialData[field.field] : null

      return (
      //텍스트 입력 필드 나타내며, 사용자가 값을 입력할 수 있음
      //컴포넌트 프로퍼티로 초기값(initialValue)과 입력 값 변경 이벤트(onValue)를 받는다
        <Field
          key={i}
          title={field.title}
          size={field.length}
          onValue={v => this.update(field.field, v)}
          ref={f => this[`${field.field}-field`] = f}
          disabled={this.props.readonly}
          initialValue={value}/>
      )
    });
  } // renderFields

  render() {
    return (<Fragment>
      { this.renderFields() }
    </Fragment>)
  }
} // Class SipInfo

const sipFields = [
  { title: 'Title/Collection', field: collection },
  { title: 'Local Reference', field: localRef },
  { title: '--'},
  { title: 'Supplier', field: supplier },
  { title: 'Creator', field: creator },
  { title: '--' },
  { title: 'Rights Statement', field: rights },
  { title: 'Held By', field: held }
];

const aipFields = [
  { title: 'Catalogue Reference', field: citation, length: 'small' },
  { title: '--' },
  ...sipFields
]
//SipInfo, AipInfo, OtherPack 클래스는 PackageFields 클래스를 확장하여 특정 종류의 패키지 정보를 입력 및 관리함
//sipFields와 aipFields 배열에 각 패키지 종류에 따른 필드 정보가 정의되어 있다
class SipInfo extends PackageFields {
  constructor(props) {
    super(props, sipFields);
    this[key] = uuid();
    this[pack] = 'sip';
  }
}

class AipInfo extends PackageFields {
  constructor(props) {
    super(props, aipFields);
    this[key] = this.props.initialData[key]
    this[pack] = 'aip';
  }
}

const otherFields = [
  { title: 'Title', field: 'title' },
  { title: 'Type', field: 'pack' },
]

class OtherPack extends PackageFields {
  constructor(props) {
    super(props, otherFields)
    this[key] = this.props.initialData[key]
    this[pack] = 'other';
  }
}
//해당 함수 컴포넌트는 패키지 정보의 종류에 따라 컴포넌트를 선택적으로 표시함
//초기 데이터를 기반으로 해당 패키지 정보 표시함
function PackageInfo({ initialData }) {
  if (initialData.pack === 'aip')
    return (<AipInfo initialData={initialData} readonly={true} display={true}/>)
  if (initialData.pack === 'sip')
    return (<SipInfo initialData={initialData} readonly={true} display={true}/>)
  return (<OtherPack initialData={initialData} readonly={true} display={true}/>)
}

export { SipInfo, AipInfo, PackageInfo };
