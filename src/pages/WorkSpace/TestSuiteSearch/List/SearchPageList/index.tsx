import React, { useState, useEffect, useRef } from 'react';
import { Spin, Input, Tabs, Badge } from 'antd';
import { SearchOutlined, UpOutlined } from '@ant-design/icons';
import SearchPageList from './SearchPageTable';
import { querySearchListQuantity } from '../../service';
import styles from './index.less';
import { useIntl, history, useParams, useLocation } from 'umi'
import { useClientSize } from '@/utils/hooks';
import { getQuery } from '@/utils/utils';

const { Search } = Input;
const { TabPane } = Tabs;
/**
 * test suite搜索
 * @param props
 */
const TestSuiteSearch: React.FC<any> = () => {
  const { formatMessage } = useIntl()
  const { query: { keyword } }: any = useLocation()
  const { ws_id } = useParams() as any
  // 滚动区域可视高度
  // 搜索栏
  const [loading, setLoading] = useState(false)
  const [tabKey, setTabKey] = useState('all');
  const [itemTotal, setItemTotal] = useState<any>({
    "total_num": 0,
    "suite_num": 0,
    "conf_num": 0,
    "domain_num": 0,
  })
  const [listScrollTop, setListScrollTop] = useState(0)
  const testSuiteSearch_wrapper = useRef<any>(null)

  // 2.获取搜索结果数量
  const getSearchListQuantity = async (query: any) => {
    const res = await querySearchListQuantity(query) || {}
    if (res.code === 200 && res.data && Object.keys(res.data).length) {
      setItemTotal({ ...res.data })
    }
  }

  useEffect(() => {
    window.document.title = '搜索结果'
    return () => {
      window.document.title = 'T-One'
    }
  }, [])

  // 获取页面伸缩变化后尺寸
  const { height } = useClientSize()

  useEffect(() => {
    if (keyword) {
      getSearchListQuantity({ search_key: keyword })
    }
  }, [keyword]);

  // 搜索
  const onSearch = (value: string) => {
    if (value) {
      // case1.仅修改url地址，但不刷新页面
      keyword && window.history.pushState({}, 0, window.location.origin + window.location.pathname);
      // case2.搜索
      getSearchListQuantity({ search_key: value })
      history.push({
        pathname: `/ws/${ws_id}/suite_search/key`,
        query: {
          keyword: value
        }
      })
    }
  }

  const onTabsChange = (key: string) => {
    setTabKey(key)
  }

  // 页面滚动
  const handleScroll = (e: any) => {
    const top = testSuiteSearch_wrapper.current.scrollTop
    setListScrollTop(top)
  }
  // 返回顶部
  const onScrollBackTop = () => {
    testSuiteSearch_wrapper.current.scrollTo(0, 0);
  }

  const tabList = [
    { name: formatMessage({ id: 'test.suite.all' }), key: 'all', fieldName: 'total_num' },
    { name: 'Suite', key: 'suite', fieldName: 'suite_num' },
    { name: 'Conf', key: 'conf', fieldName: 'conf_num' },
    { name: formatMessage({ id: 'test.suite.domain' }), key: 'domain', fieldName: 'domain_num' },
  ]
  const selectedStyle = { backgroundColor: '#E6F7FF', color: '#1890FF', marginTop: -3 }
  const othersStyle = { backgroundColor: '#0000000a', color: '#000', marginTop: -3 }

  return (
    <div className={styles.TestSuiteSearch_wrapper} style={{ minHeight: (height - 50), }}
      onScroll={handleScroll} ref={testSuiteSearch_wrapper}
    >
      <div className={styles.header} style={{ display: 'block' }} />
      <div className={styles.content} style={{ minHeight: (height - 270) }}>
        <Search className={styles.content_search}
          defaultValue={keyword}
          prefix={<SearchOutlined style={{ color: '#bfbfbf', marginTop: 4, marginRight: 8 }} />}
          placeholder={formatMessage({ id: 'test.suite.search.placeholder' })}
          allowClear
          enterButton={formatMessage({ id: 'test.suite.search' })}
          onSearch={onSearch}
        />
        <div>
          <Tabs defaultActiveKey="all" onChange={onTabsChange}>
            {tabList.map((item, i) => (
              <TabPane key={item.key} tab={
                <span>{item.name} <Badge count={itemTotal[item.fieldName]} overflowCount={999} showZero
                  style={tabKey === item.key ? selectedStyle : othersStyle} />
                </span>
              } disabled={loading} />
            ))}
          </Tabs>
          <Spin spinning={loading}>
            <SearchPageList searchKey={keyword} tabKey={tabKey} loadingCallback={setLoading} />
          </Spin>
        </div>
      </div>
      <div className={styles.define_backTop} onClick={onScrollBackTop}
        style={{ display: listScrollTop > 200 ? 'block' : 'none', paddingTop: 7 }}>
        <UpOutlined className={styles.backTop_icon} />
      </div>
    </div>
  );
};

export default TestSuiteSearch;
