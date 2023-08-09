/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import { Spin, Input, Tabs, Space, Badge } from 'antd';
import { SearchOutlined, UpOutlined } from '@ant-design/icons';
import { useIntl, FormattedMessage, useParams, history } from 'umi'
import DefaultPageList from './List/DefaultPageList/component/DefaultPageTable';
import SearchPageList from './List/SearchPageList/SearchPageTable';
import { queryTotalNum, querySearchListQuantity } from './service';
import styles from './index.less';

import { useClientSize, writeDocumentTitle } from '@/utils/hooks'

const { Search } = Input;
const { TabPane } = Tabs;
/**
 * test suite搜索
 * @param props
 */
const TestSuiteSearch: React.FC<any> = (props) => {
  const { formatMessage } = useIntl()
  writeDocumentTitle(`Workspace.${props.route.name}`)
  const { ws_id } = useParams() as any
  // 滚动区域可视高度
  // 总数
  const [itemSelected, setItemSelected] = useState('performance');
  const [totalNum, setTotalNum] = useState<any>({ performance_num: 0, functional_num: 0 })
  const [initialStyle, setInitialStyle] = useState<any>({ marginTop: 200, width: 700, show: false });
  const [showInitialList, setShowInitialList] = useState(true);
  // 搜索栏
  const [loading, setLoading] = useState(false)
  const [refresh, setRefresh] = useState<any>(new Date().getTime())
  const [tabKey, setTabKey] = useState('all');
  const [itemTotal, setItemTotal] = useState<any>({
    "total_num": 0,
    "suite_num": 0,
    "conf_num": 0,
    "domain_num": 0,
  })
  const [listScrollTop, setListScrollTop] = useState(0)
  const testSuiteSearch_wrapper = useRef<any>(null)

  // 1.获取数量
  const getTotalNum = async () => {
    const res = await queryTotalNum({ ws_id, total_num: true }) || {}
    if (res.code === 200 && res.data) {
      const { functional_num, performance_num } = res.data || {}
      setTotalNum({ functional_num, performance_num })
    }
  }

  // 2.获取搜索结果数量
  const getSearchListQuantity = async (query: any) => {
    const res = await querySearchListQuantity(query) || {}
    if (res.code === 200 && res.data && Object.keys(res.data).length) {
      setItemTotal({ ...res.data })
    }
  }

  useEffect(() => {
    getTotalNum()
  }, [ws_id])

  // 获取页面伸缩变化后尺寸
  const { height } = useClientSize()

  // 搜索
  const onSearch = (value: string) => {
    if (value) {
      if (!initialStyle.show) {
        setInitialStyle({ marginTop: 20, minWidth: 800, width: '70%', show: true });
        setShowInitialList(false);
      }
      getSearchListQuantity({ search_key: value, ws_id })
      setRefresh(new Date().getTime())
      history.push({
        pathname: `/ws/${ws_id}/suite_search/key`,
        query: {
          keyword: value,
        }
      });
    }
  }

  const onTabsChange = ($key: string) => {
    setTabKey($key)
  }

  // 发起回调
  const handleClick = (params: string) => {
    return () => {
      setItemSelected(params)
    }
  };

  const handleScroll = () => {
    const top = testSuiteSearch_wrapper.current.scrollTop
    setListScrollTop(top)
  }
  const onScrollBackTop = () => {
    // console.log('scrollTop:');
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
    <div className={styles.TestSuiteSearch_wrapper} style={{ minHeight: (height - 50) }}
      onScroll={handleScroll} ref={testSuiteSearch_wrapper}
    >
      <div className={styles.header} style={{ display: initialStyle.show ? 'block' : 'none' }} />
      <div className={styles.content} style={{ minHeight: (height - 270), ...initialStyle }}>
        <Search className={styles.content_search}
          prefix={<SearchOutlined style={{ color: '#bfbfbf', marginTop: 4, marginRight: 8 }} />}
          placeholder={formatMessage({ id: 'test.suite.search.placeholder' })}
          allowClear
          enterButton={formatMessage({ id: 'test.suite.search' })}
          onSearch={onSearch}
        />
        {showInitialList ? (
          <div className={styles.initialPage}>
            <Space>
              <div className={styles.headerInfo}>
                <span onClick={handleClick('performance')}
                  style={{ color: itemSelected === 'performance' ? '#1890FF' : 'rgba(0, 0, 0, 0.65)', cursor: 'pointer' }}
                >
                  <FormattedMessage id="performance.test" />({totalNum.performance_num})
                </span>
              </div>
              <div className={styles.headerInfo}>
                <span onClick={handleClick('functional')}
                  style={{ color: itemSelected === 'functional' ? '#1890FF' : 'rgba(0, 0, 0, 0.65)', cursor: 'pointer' }}
                >
                  <FormattedMessage id="functional.test" />({totalNum.functional_num})
                </span>
              </div>
            </Space>
            <div>
              <DefaultPageList type={itemSelected} ws_id={ws_id} />
            </div>
          </div>
        ) : (
          <div>
            <Tabs defaultActiveKey="all" onChange={onTabsChange}>
              {tabList.map((item) => (
                <TabPane key={item.key} tab={
                  <span>{item.name} <Badge count={itemTotal[item.fieldName]} overflowCount={999} showZero
                    style={tabKey === item.key ? selectedStyle : othersStyle} />
                  </span>
                } disabled={loading} />
              ))}
            </Tabs>
            <Spin spinning={loading}>
              <SearchPageList tabKey={tabKey} ws_id={ws_id} refresh={refresh} loadingCallback={setLoading} />
            </Spin>
          </div>
        )
        }
      </div>
      <div className={styles.define_backTop} onClick={onScrollBackTop}
        style={{ display: listScrollTop > 200 ? 'block' : 'none', paddingTop: 7 }}>
        <UpOutlined className={styles.backTop_icon} />
      </div>
    </div>
  );
};

export default TestSuiteSearch;
