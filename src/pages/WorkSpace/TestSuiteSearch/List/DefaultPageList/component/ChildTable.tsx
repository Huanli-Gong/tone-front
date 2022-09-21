import React , { useState , useRef, useEffect } from 'react'
import { Table , message } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { matchType } from '@/utils/utils';
import { ReactComponent as IconArrowOn } from '@/assets/svg/icon_arrow_on.svg'
import { ReactComponent as IconSafetyCertificate } from '@/assets/svg/icon_SafetyCertificate.svg';
import { queryTestSuiteList } from '../../../service'
import styles from './index.less'
// const treeSvg = require('@/assets/svg/tree.svg');
// const background = `url(${treeSvg}) center center / 38.6px 32px `;

// 子列表
export default (props: any) => {
  const { formatMessage } = useIntl()
   const { pathname } = new URL(window.location.href)
    const { ws_id, id, name, test_type } = props
    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState<any>([])

    const getListData = async (query: any) => {
      setLoading(true)
      try {
        const res = await queryTestSuiteList(query)
        const { data } = res || {}
        if (res.code === 200 && Array.isArray(data)) {
          setDataSource(data)
        } else {
          setDataSource([])
          message.error(res.msg || formatMessage({id: 'request.failed'}) )
        }
        setLoading(false)
      } catch(e) {
        setLoading(false)
      }
    }

    useEffect(() => {
      getListData({ test_type, ws_id, suite_id: id  })
    }, [ id ])

    const columns: any = [{
      dataIndex: 'name',
      render: (text: any) => (
        <span className={styles['click-a-text']}>{text}</span>
      ),
    }, {
      dataIndex: 'certificated',
      width: 70,
      render: (text: any) => (
        <span>
          {text ? (
            <span className={styles.safety}>
              <IconSafetyCertificate style={{ marginRight: 4 }}/><FormattedMessage id="test.suite.authentication" />
            </span>) : null}
        </span>)
    }, {
      dataIndex: 'add_state',
      width : 80,
      render: (text: any) => (<span className={styles.ellipsis}>{matchType(text, formatMessage)}</span>),
    }, {
      align: 'right',
      dataIndex: 'case_count',
      width: 50,
      // onCell: () => ({ style: { maxWidth: 100, textAlign: 'center' } }),
      render: (text: any) => (<span className={styles.ellipsis}>{text === '已添加'? <FormattedMessage id="added" />: text}</span>)
    },
  ]

    return (
      <div className={styles.ChildTable_root}>
        <Table showHeader={false}
          size="small"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          onRow={(record) => {
            return {
              onClick: () => {
                const a = document.createElement('a');
                a.target="_blank";
                a.rel="noopener noreferrer"
                a.href = `${pathname}/conf_Details?suite_id=${id}&case_id=${record.id}&suite_name=${encodeURIComponent(name)}&conf_name=${encodeURIComponent(record.name)}`;
                a.click();
              },
            };
          }}
          expandable={{
            expandIcon: () => (
              <IconArrowOn className={styles.enterOutlined} />
            )
        }}
          pagination={ false }
        />
      </div>
    )
}
