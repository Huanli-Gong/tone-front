import React, { useState, useRef } from 'react';
import { FormattedMessage, useIntl, useAccess, Access, useModel } from 'umi';
import { message, Button, Spin } from 'antd';
import NotLoggedIn from '@/components/Public/NotLoggedIn'
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

  const { initialState, setInitialState } = useModel('@@initialState')
  const { authList } = initialState;

  const access = useAccess()

  // 1.获取数量(该接口废弃)
  const getItemTotal = async () => {
    try {
      const res = await querySummary({}) || {}
      if (res.code === 200) {
        setItemTotal(res.data || 0)
      } else {
        message.error(res.msg || formatMessage({id: 'request.failed'}) )
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

  const itemTotalStyle = (key: any) => {
    const selectedStyle = { backgroundColor: '#E6F7FF', color: '#1890FF', marginTop: -3 }
    const othersStyle = { backgroundColor: '#0000000a', color: '#000', marginTop: -3 }
    return tab === key ? selectedStyle : othersStyle
  }

  const operations = (
    <Access accessible={access.IsWsSetting()}>
        <Button type="primary" onClick={uploadClick}><FormattedMessage id={"TestUpload.tab.tabBarExtraContent.upload"} /></Button>
    </Access>
  )

  return (
    <div className={styles.TestUpload_root}>
      {/** 用户未登录提示 */}
      {(!spinning && !authList?.user_id) ?
        <div className={styles.not_logged_in}><NotLoggedIn /></div> : null}

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
