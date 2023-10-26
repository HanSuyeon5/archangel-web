import React, { Component, Fragment } from "react";
import { PuidFormatter, FileSizeFormatter, PackageInfo } from '@archangeldlt/web-common';

//formatEvent, formatNoWrite, formatRegistration, formatPackage, formatOldRecord, formatPermissionGranted, formatPermissionRemoved:
//다양한 이벤트 유형을 서식화하기 위한 보조 메서드로, 이벤트의 이름과 인수에 따라 서식화된 정보를 반환합니다.
const maxEvents = 20;

//Ethereum 스마트 컨트랙트의 이벤트 로그를 모니터링하고 이벤트에 따라 사용자에게 정보를 제공(화면에 표시)하는 컴포넌트
class Eventlog extends Component {
  //초기 상태로 groupedEvents를 빈 Map으로 설정
  constructor(props) {
    super(props);

    this.state = { groupedEvents: new Map() };
  } // constructor

  // 부모 컴포넌트에서 전달된 driver 속성을 통해 Ethereum 스마트 컨트랙트 이벤트를 모니터링합니다.
  get driver() {
    return this.props.driver;
  }

  //컴포넌트가 마운트된 후에 호출되는 라이프사이클 메서드로, watchEvents 메서드를 호출하여 이벤트 모니터링을 시작
  componentDidMount() {
    this.driver.watchEvents((evt) => this.event(evt));
  } // componentDidMount

  //Ethereum 스마트 컨트랙트의 이벤트를 처리하는 메서드로, 새로운 이벤트를 groupedEvents에 그룹화하여 추가하고,
  //이벤트 수가 maxEvents를 초과하는 경우 가장 오래된(처음 저장된) 이벤트를 삭제합니다.
  event(evt) {
    if (evt === this.driver.resetEvent) {
      this.setState({
        groupedEvents: new Map(),
      });
      return;
    }

    const groupedEvents = this.state.groupedEvents;

    if (groupedEvents.size > maxEvents)
      groupedEvents.delete(groupedEvents.keys().next().value);

    const key = this.groupKey(evt);
    const eventList = groupedEvents.get(key) || [];
    eventList.push(evt);
    groupedEvents.delete(key);
    groupedEvents.set(key, eventList);

    this.setState({
      groupedEvents: groupedEvents,
    });
  } // event
  //이벤트를 그룹화하는 메서드로, 이벤트에서 args 속성을 추출하여 그룹 키를 반환합니다.
  groupKey(evt) {
    if (!evt.args) return evt;
    if (evt.args._key) return evt.args._key;
    if (evt.args._addr) return evt.args._addr;
    return evt;
  } // groupKey
  //이벤트를 서식화하는 메서드로, 이벤트의 이름과 인수를 기반으로 서식화를 선택
  formatEvent(name, args) {
    switch (name) {
      case "Registration":
      case "Update":
        return this.formatRegistration(args);
      case "NoWritePermission":
        return this.formatNoWrite(args);
      case "PermissionGranted":
        return this.formatPermissionGranted(args);
      case "PermissionRemoved":
        return this.formatPermissionRemoved(args);
      default:
        return JSON.stringify(args);
    }
  } // formatEvent

  formatNoWrite(args) {
    return <div className="col-12">From {args._addr}</div>;
  } // formatNoWrite

  formatRegistration(args) {
    const record = this.driver.unwrapPayload(args._payload);

    if (record.name) return this.formatOldRecord(record, args._addr);

    return this.formatPackage(record, args._addr);
  } // formatRegistration

  formatPackage({ data, files, timestamp }, addr) {
    return (
      <Fragment>
        <PackageInfo initialData={data} />
        <div className="container-fluid">
          <div className="row">
            <div className="col-6 offset-2">
              Contains {files ? files.length : "no"} file
              {files ? (files.length > 1 ? "s" : "") : "s"}.
            </div>
            <div className="col-4">
              Uploaded by <strong>{this.driver.addressName(addr)}</strong> at{" "}
              {timestamp}{" "}
            </div>
          </div>
        </div>
      </Fragment>
    );
  } // formatPackage

  formatOldRecord(record, addr) {
    return (
      <div className="col-12 row">
        <div className="row col-12">
          <div className="col-8">
            <strong>{record.name}</strong>
          </div>
          <div className="col-2">
            <PuidFormatter value={record.puid} />
          </div>
          <div className="col-2">
            <FileSizeFormatter value={record.size} />
          </div>
        </div>
        <div className="row col-12">
          <div className="col-8">{record.sha256_hash}</div>
          <div className="col-4">Last Modified: {record.last_modified}</div>
        </div>
        <div className="row col-12">
          <div className="col-8">{record.comment}</div>
          <div className="col-4">
            Uploaded by <strong>{this.driver.addressName(addr)}</strong> at{" "}
            {record.timestamp}{" "}
          </div>
        </div>
        {record.parent_sha256_hash && (
          <div className="col-12">
            Parent: <i>{record.parent_sha256_hash}</i>
          </div>
        )}
      </div>
    );
  } // formatOldRecord

  formatPermissionGranted(args) {
    if (args._name === "contract") this.contractOwner = args._addr;
    return (
      <div className="col-12">
        To <strong>{args._name}</strong>, {args._addr}
      </div>
    );
  } // formatPermissionGranted

  formatPermissionRemoved(args) {
    return (
      <div className="col-12">
        From <strong>{args._name}</strong>, {args._addr}
      </div>
    );
  } // formatPermissionGranted
  //그룹화된 이벤트를 렌더링하는 메서드로, 이벤트를 시간 순서대로 표시
  renderEvents(first, rest = []) {
    return (
      <Fragment key={first.transactionHash}>
        <div className="row col-12">
          <div className="col-2">Block {first.blockNumber}</div>
          <div className="col-10">
            <strong>{first.event}</strong>
          </div>
        </div>
        <div className="row col-12">
          {this.formatEvent(first.event, first.args)}
        </div>
        <div className="row offset-1 col-10">
          {rest.map((e) => this.renderEvents(e))}
        </div>
      </Fragment>
    );
  } // renderEvents
  //이벤트 그룹을 렌더링하는 메서드로, 그룹에 속한 이벤트를 표시하고 구분선을 추가
  renderEventGroup(eventGroup) {
    const lastIndex = eventGroup.length - 1;
    const evt = eventGroup[eventGroup.length - 1];
    const otherEvts = eventGroup.slice(0, lastIndex).reverse();

    return (
      <div>
        {this.renderEvents(evt, otherEvts)}
        <hr />
      </div>
    );
  } // renderEventGroup

  render() {
    const events = this.state.groupedEvents;

    const renderedEvents = [];

    for (const group of events.values()) {
      const renderedGroup = this.renderEventGroup(group);
      renderedEvents.unshift(renderedGroup);
    } // for ...

    return renderedEvents;
  } // render
} // class Eventlog

export default Eventlog;
