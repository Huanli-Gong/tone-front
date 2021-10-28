import React, { useState, useEffect, useRef } from 'react';
import { history } from 'umi'
import { Spin,Input, Tabs, Space, Badge, BackTop } from 'antd';
import { SearchOutlined, UpOutlined } from '@ant-design/icons';
import DefaultPageList from './component/DefaultPageTable';
import { queryTotalNum } from '../../service';
import styles from './index.less';
import { writeDocumentTitle } from '@/utils/hooks';

const { Search } = Input;
/**
 * test suite搜索
 * @param props
 */
const TestSuiteSearch: React.FC<any> = (props) => {
  writeDocumentTitle(`Workspace.${ props.route.name }`)
  const { pathname } = new URL(window.location.href)
  const path = pathname && pathname.substring(0, pathname.lastIndexOf('/'))
	const { ws_id } = props.match.params
  // 滚动区域可视高度
  const [height, setHeight] = useState(400);
  // 总数
  const [itemSelected, setItemSelected] = useState('performance');
  const [totalNum, setTotalNum] = useState<any>({performance_num: 0, functional_num: 0 })
  // 页面滚动到顶部
  const [listScrollTop, setListScrollTop] = useState(0)
  const testSuiteSearch_wrapper = useRef<any>(null)

  // 1.获取数量
  const getTotalNum = async() => {
    const res = await queryTotalNum() || {}
    if (res.code === 200 && res.data) {
      const { functional_num, performance_num } = res.data || {}
      setTotalNum({ functional_num, performance_num})
    }
  }

  useEffect(() => {
    getTotalNum()
  }, [ ws_id ])

  // 获取页面伸缩变化后尺寸
  function handleResize() {
    const innerHeight = window.innerHeight;
    setHeight(innerHeight);
  }
  useEffect(() => {
    // case1. 添加页面尺寸伸缩变化监听
    handleResize();
  }, []);
  useEffect(() => {
    // case1. 添加页面尺寸伸缩变化监听
    window.addEventListener('resize', handleResize);
    return () => {
      // case2. 删除监听
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  // 搜索
  const onSearch = (value: string) => {
    if (value) {
      history.push({
        pathname: `${path}/suite_search/key/${ value }`,
      });
    }
  }

  // 发起回调
  const handleClick = (params: string) => {
    return () => {
      setItemSelected(params)
    }
  };

  const handleScroll = (e: any) => {
    const top = testSuiteSearch_wrapper.current.scrollTop
    setListScrollTop(top)
  }
  const onScrollBackTop = () => {
    // console.log('scrollTop:');
    testSuiteSearch_wrapper.current.scrollTo(0,0);
  }

	return (
      <div className={styles.TestSuiteDefault_wrapper} style={{ height: (height - 50) }}
        onScroll={handleScroll} ref={testSuiteSearch_wrapper}
      >
        <div className={styles.content} style={{minHeight: (height - 270) }}>
            <Search className={styles.content_search}
              prefix={<SearchOutlined style={{ color: '#bfbfbf', marginTop: 4, marginRight: 8 }}/>}
              placeholder="请输入Test Suite、领域名称相关的检索内容"
              allowClear
              enterButton="检索"
              onSearch={onSearch}
            />
                <div className={styles.initialPage}>
                  <Space>
                      <div className={styles.headerInfo}>
                        <span onClick={handleClick('performance')}
                          style={{ color: itemSelected === 'performance' ? '#1890FF' : 'rgba(0, 0, 0, 0.65)', cursor: 'pointer' }}
                        >
                          性能测试({totalNum.performance_num})
                        </span>
                      </div>
                      <div className={styles.headerInfo}>
                        <span onClick={handleClick('functional')}
                          style={{ color: itemSelected === 'functional' ? '#1890FF' : 'rgba(0, 0, 0, 0.65)', cursor: 'pointer' }}
                        >
                          功能测试({totalNum.functional_num})
                        </span>
                      </div>
                  </Space>
                  <div>
                    <DefaultPageList type={itemSelected} ws_id={ws_id} />
                  </div>
                </div>
        </div>
        <div className={styles.define_backTop} onClick={onScrollBackTop}
          style={{ display: listScrollTop > 200 ? 'block': 'none', paddingTop: 7 }}>
          <UpOutlined className={styles.backTop_icon}/>
        </div>
      </div>
	);
};

export default TestSuiteSearch;
