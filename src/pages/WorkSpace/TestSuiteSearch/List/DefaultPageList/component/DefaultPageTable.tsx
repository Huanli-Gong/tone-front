import React , { useState , useRef, useEffect } from 'react'
import { Table, message } from 'antd'
import { CaretRightFilled, CaretDownFilled, DownOutlined } from '@ant-design/icons';
import { ReactComponent as IconSafetyCertificate } from '@/assets/svg/icon_SafetyCertificate.svg';
import { matchType } from '@/utils/utils';
import ChildTable from './ChildTable';
import { queryTestSuiteList  } from '../../../service'
import styles from './index.less'

// 默认列表
const DefaultPageTable: React.FC<any> = (props: any) => {
  const { pathname } = new URL(window.location.href)
  const { type, ws_id } = props

    const [loading, setLoading] = useState(false)
    const [dataSource, setDataSource] = useState<any>([])
    const [openAllRows , setOpenAllRows ] = useState( false )
    const [expandedRowKeys , setExpandedRowKeys ] = useState<Array<any>>([]) 
    const [expandAll, setExpandAll] = useState(false)


    // 1.请求数据
    const getListData = async (query: any) => {
      try {
        setLoading(true)
        const res = await queryTestSuiteList(query) || {}
        const { data } = res 
        if (res.code === 200 && Array.isArray(data)) {
          setDataSource(data)
        } else if (res.code !== 200) {
          setDataSource([])
          message.error(res.msg || '请求失败！')
        }
        setLoading(false)
      } catch(e) {
        setLoading(false)
      }
    }

    useEffect(() => {
      if (type) {
        getListData({ test_type: type,  ws_id })
        setExpandedRowKeys([])
        setExpandAll(false)
      }
    }, [type])

    const handleOnExpand = ( expanded : boolean , record : any ) => {
      if (expanded) {
        setExpandedRowKeys( expandedRowKeys.concat([ record.id ]))
      } else {
        setExpandedRowKeys( expandedRowKeys.filter(( i : number) => i !== record.id ) )
      }
    }

    const rowClick = (record: any) => {
      const a = document.createElement('a');
        a.target="_blank";
        a.rel="noopener noreferrer"
        a.href = `${pathname}/suite_Details?suite_id=${record.id}&suite_name=${encodeURIComponent(record.name)}`;
        a.click();
    }

    // 展开全部
    const expandAllClick = () =>{
      setExpandAll(true)
    }

    const columns: any = [
      {
        dataIndex: 'name',
        render: (text: any, record: any) => (
          <span className={styles['click-a-text']} onClick={() => rowClick(record)}>{text}</span>
          )
      }, {
        dataIndex: 'certificated',
        width: 70,
        render: (text: any) => (
          <span>
            {text ? (
              <span className={styles.safety}>
                <IconSafetyCertificate style={{ marginRight: 4 }}/>认证</span>) : null}
          </span>)
      }, {
        dataIndex: 'add_state',
        width: 80,
        render: (text: any) => (<span className={styles.ellipsis}>{matchType(text)}</span>)
      }, {
        align: 'right',
        dataIndex: 'case_count',
        width : 50,
        render: (text: any) => (<span className={styles.ellipsis}>{text}</span>)
      },
    ]
    
    return (
        <div className={styles.DefaultPageList_root}>
            <Table showHeader={false}
              size="small"
              columns={columns}
              rowKey="id"
              dataSource={expandAll ? dataSource : dataSource.slice(0, 20)}
              pagination={ false }
              loading={ loading }
              expandable={{
                  defaultExpandAllRows : openAllRows,
                  expandedRowKeys : expandedRowKeys,
                  onExpand: handleOnExpand ,
                  expandedRowRender: (record, i) => (
                    <ChildTable
                      ws_id={ws_id}
                      key={i}
                      test_type={type}
                      {...record}
                    />
                  ),
                  expandIcon: ({ expanded, onExpand, record }:any) => (
                    expanded ? 
                        (<CaretDownFilled onClick={e => onExpand(record, e)} />) :
                        (<CaretRightFilled onClick={e => onExpand(record, e)} />)
                  )
              }}
            />

            {(!expandAll && dataSource.length > 20) && (<div className={styles.expand_all_btn} onClick={expandAllClick}>全部展开 <DownOutlined /></div>)}
        </div>
    )
}

export default DefaultPageTable;