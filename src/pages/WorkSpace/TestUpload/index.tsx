import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormattedMessage, useIntl, useAccess } from 'umi';
import { Layout, message, Tabs, Badge, Row, Input, Divider, Form, Col, Select, DatePicker, Button, Modal, Spin } from 'antd';
import { resizeDocumentHeightHook, writeDocumentTitle } from '@/utils/hooks'
import UploadTable from './components/OfflineUploadTable';
import { querySummary } from './services';
import styles from './index.less'

/**
 * 离线上传
 */
export default (props: any) => {
  const { formatMessage } = useIntl();
  const { ws_id } = props.match.params;
  const [spinning, setSpinning] = useState(true);
  const [tab, setTab] = useState('record');
  const [itemTotal, setItemTotal] = useState(0);
  const uploadTable: any = useRef(null)

  const access = useAccess()

  // 1.获取数量(该接口废弃)
  const getItemTotal = async () => {
    try {
      const res = await querySummary({}) || {}
      if (res.code === 200) {
        setItemTotal(res.data || 0)
      } else {
        message.error(res.msg || '请求数据失败')
      }
    } catch (e) {
      console.log(e)
    }
  }

  // tab
  const onTabsChange = (key: string) => {
    setTab(key)
  }
  // loading
  const loadingCallback = (info: any) => {
    const { loading } = info
    setSpinning(loading)
  }
  // 刷新Total
  const refreshTotalCallback = (num: any) => {
    // getItemTotal()
    if (num !== itemTotal) {
      setItemTotal(num)
    }
  }
  // 上传按钮
  const uploadClick = () => {
    uploadTable.current?.showModal()
  }

  const tabList = [
    { name: formatMessage({ id: 'TestUpload.tab.record' }), key: 'record' },
  ]
  const layoutHeight = resizeDocumentHeightHook()
  
  const itemTotalStyle = (key: any) => {
    const selectedStyle = { backgroundColor: '#E6F7FF', color: '#1890FF', marginTop: -3 }
    const othersStyle = { backgroundColor: '#0000000a', color: '#000', marginTop: -3 }
    return tab === key ? selectedStyle : othersStyle
  }

  const operations = (
      <Button type="primary" onClick={uploadClick}><FormattedMessage id={"TestUpload.tab.tabBarExtraContent.upload"} /></Button>
  )

  return (
    <div className={styles.TestUpload_root} style={{ height: layoutHeight - 50 }}>
      {/* 
        <Tabs className={styles.content_tabs} defaultActiveKey={tab} onChange={onTabsChange} tabBarExtraContent={operations}>
          {tabList.map((item: any) =>
            <Tabs.TabPane key={item.key} tab={
              <span>{item.name} <Badge count={itemTotal} overflowCount={999} showZero style={itemTotalStyle(item.key)} /> 
              </span>
            } disabled={spinning} />
          )}
        </Tabs>
      */}
      <div className={styles.content_header}>
        <div className={styles.item1}>{tabList[0].name}</div>
        {operations}
      </div>
      <Spin spinning={spinning}>
        <div className={styles.content_table}>
          <UploadTable ref={uploadTable} ws_id={ws_id} loadingCallback={loadingCallback} refreshCallback={refreshTotalCallback} />
        </div>
      </Spin>

    </div>
  )
}

