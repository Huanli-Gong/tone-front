/* eslint-disable react/no-array-index-key */
/* eslint-disable no-var */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react'
import { Space, Pagination, message, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useIntl, FormattedMessage, useParams, useLocation } from 'umi'
import { matchType } from '@/utils/utils'
import { querySearchList } from '../../service'
import styles from './SearchPageTable.less'

// 列表
const SearchPageList: React.FC<any> = (props: any) => {
  const { formatMessage } = useIntl()
  const { ws_id } = useParams() as any
  const { tabKey, loadingCallback = () => { } } = props
  const { query: { keyword } } = useLocation() as any

  // 分页数据
  const [dataSource, setDataSource] = useState<any>([])
  const [pagination, setPagination] = useState<any>({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  })

  // 1.请求列表数据
  const getListData = async (query: any) => {
    try {
      loadingCallback(true)
      const res = await querySearchList({ search_key: keyword, search_type: tabKey, ...query }) || {}
      const { data = {} }: any = res
      if (res.code === 200 && Array.isArray(data.data) && data.data.length && tabKey === 'all') {
        // all的数据结构
        setDataSource(data.data)
        setPagination({
          pageNum: data.page_num,
          pageSize: data.page_size,
          total: data.total,
        })
      } else if (res.code === 200 && Array.isArray(data) && data.length) {
        // 其他的响应结构
        setDataSource(data)
        setPagination({
          pageNum: res.page_num,
          pageSize: res.page_size,
          total: res.total,
        })
      } else {
        setDataSource([])
        setPagination({
          pageNum: 1,
          pageSize: 20,
          total: 0,
        })
        // 过滤掉code为200时响应数据中依然有错误提示内容
        if (res.code !== 200) {
          message.error(res.msg || '请求失败！')
        }
      }
      loadingCallback(false)
    } catch (e) {
      setDataSource([])
      setPagination({
        pageNum: 1,
        pageSize: 20,
        total: 0,
      })
      loadingCallback(false)
    }
  }

  useEffect(() => {
    if (keyword) {
      getListData({ page_num: pagination.pageNum, page_size: pagination.pageSize, ws_id })
    }
  }, [keyword, tabKey, ws_id])

  const handleClick = (item: any) => {
    if (item.id && item.test_suite_id) {
      // 跳conf详情页
      const a = document.createElement('a');
      a.target = "_blank";
      a.rel = "noopener noreferrer"
      a.href = `/ws/${ws_id}/suite_search/conf_Details?suite_id=${item.test_suite_id}&case_id=${item.id}&suite_name=${encodeURIComponent(item.suite_name)}&conf_name=${encodeURIComponent(item.name)}`;
      a.click();
    }
  }

  const onPageChange = (page_num: number, page_size: any) => {
    setPagination({ ...pagination, pageNum: page_num, pageSize: page_size })
    getListData({ page_num, page_size });
  }

  // 让字符串中特定字符红色显示
  const matchTextColor = (params: string) => {
    if (params && keyword) {
      var reg = new RegExp("(" + keyword + ")", "g");
      const newStr: any = params.replace(reg, `<span style='color: #f00;opacity:1'>${keyword}</span>`)
      return <span dangerouslySetInnerHTML={{ __html: newStr }} />
    }
    return params
  }

  const { total, pageSize }: any = pagination
  return (
    <div className={styles.searchList}>
      {dataSource.map((item: any) => (
        <div className={styles.searchList_item} key={item.id}>
          <div className={styles.head}>
            <p className={styles.title} onClick={() => handleClick(item)}>
              {matchTextColor(item.name)}
            </p>
            <div className={styles.author}>{item.creator_name}</div>
          </div>
          <span className={styles.subTitle}>
            {matchTextColor(item.suite_name)}
          </span>
          <div className={styles.content_tag}>
            <span>{matchType(item.run_mode, formatMessage)}</span>
            <Space>
              {item.test_type && <div className={styles.type_tag}>{matchType(item.test_type, formatMessage)}</div>}
              {item.domain_name_list && item.domain_name_list.split(',').map((key: any, i: number) => (
                <div className={styles.type_tag} key={i}>{key}</div>
              ))}
            </Space>
          </div>
          <div className={styles.content}>
            <Typography.Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginBottom: 0 }}>
              <FormattedMessage id="test.suite.explain" />：{matchTextColor(item.doc)}
            </Typography.Paragraph>
          </div>
          <div className={`${styles.content} ${styles.content_remarks}`}>
            <Typography.Paragraph ellipsis={{ rows: 2, expandable: false }} style={{ marginBottom: 0 }}>
              <FormattedMessage id="test.suite.remarks" />：{matchTextColor(item.description)}
            </Typography.Paragraph>
          </div>
        </div>
      ))}

      <Pagination
        total={pagination.total}
        pageSize={pagination.pageSize}
        current={pagination.pageNum}
        showSizeChanger
        hideOnSinglePage={true}
        onChange={onPageChange}
        onShowSizeChange={onPageChange}
      />
      {(total !== 0 && pageSize >= total) && <div className={styles.little_data_tips}><FormattedMessage id="test.suite.it.over" /></div>}
      {total === 0 &&
        <div className={styles.no_data_tips}>
          <SearchOutlined style={{ fontSize: 36, color: '#b3b3b3' }} />
          <p><FormattedMessage id="test.suite.failed.to.find" /></p>
          <div><FormattedMessage id="test.suite.please.try.to.search.content" /></div>
        </div>
      }
      <div className={styles.footer} />
    </div>
  )
}

export default SearchPageList;