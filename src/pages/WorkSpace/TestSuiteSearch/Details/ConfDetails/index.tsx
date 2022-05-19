import React, { useState, useEffect } from 'react';
import { Col, Row, Spin, Tag, List, Table, message } from 'antd';
import { history } from 'umi';
import CodeViewer from '@/components/CodeViewer';
import ContentContainer from '@/components/Public/ContentHeader';
import { getQuery, matchType } from '@/utils/utils';
import { ReactComponent as IconArrowOn } from '@/assets/svg/icon_arrow_on.svg'
import { BreadcrumbMatch } from '../components/Breadcrumb';
import NotResult from '../404';
import { queryTestConf, queryTestConfRetrieve, queryTestConfMetric } from '../../service';
import styles from './index.less';

const Index: React.FC<any> = (props: any) => {
  const { pathname } = new URL(window.location.href)
  const ws_id = pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
  const path = `/ws/${ws_id}/suite_search`
  //
  const { suite_id, case_id, suite_name, conf_name }: any = getQuery('')

  const [dataSet, setDataSet] = useState<any>({})
  const [loadingRetrieve, setLoadingRetrieve] = useState(false)
  const [dataSourceRetrieve, setDataSourceRetrieve] = useState<any>([])
  const [paginationRetrieve, setPaginationRetrieve] = useState<any>({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  })
  const [loadingMetric, setLoadingMetric] = useState(false)
  const [dataSourceMetric, setDataSourceMetric] = useState<any>([])
  const [paginationMetric, setPaginationMetric] = useState<any>({
    pageNum: 1,
    pageSize: 20,
    total: 0,
  })
  const [noPage, setNoPage] = useState(false)

  // 1.请求数据
  const getListDataBasic = async (query: any) => {
    const res = await queryTestConf(query) || {}
    if (res.code === 200) {
      const { data = {} } = res
      setDataSet(data)
    } else if (res.code === 404) {
      setNoPage(true)
    } else {
      setDataSet({})
    }
  }
  // 2.同级Test conf信息
  const getListDataRetrieve = async (query: any) => {
    try {
      setLoadingRetrieve(true)
      const res = await queryTestConfRetrieve(query) || {}
      const { data } = res
      if (res.code === 200 && Array.isArray(data) && data.length) {
        setDataSourceRetrieve(data)
        setPaginationRetrieve({
          pageNum: res.page_num,
          pageSize: res.page_size,
          total: res.total,
        })
      } else if (res.code === 404) {
        setNoPage(true)
      } else if (res.code !== 200) {
        setDataSourceRetrieve([])
        setPaginationRetrieve({
          pageNum: 1,
          pageSize: 20,
          total: 0,
        })
        message.error(res.msg || '请求失败！')
      }
      setLoadingRetrieve(false)
    } catch (e) {
      setLoadingRetrieve(false)
    }
  }
  // 3.评价指标
  const getListDataMetric = async (query: any) => {
    try {
      setLoadingMetric(true)
      const res = await queryTestConfMetric(query) || {}
      const { data } = res
      if (res.code === 200 && Array.isArray(data) && data.length) {
        setDataSourceMetric(data)
        setPaginationMetric({
          pageNum: res.page_num,
          pageSize: res.page_size,
          total: res.total,
        })
      } else if (res.code === 404) {
        setNoPage(true)
      } else if (res.code !== 200) {
        setDataSourceMetric([])
        setPaginationMetric({
          pageNum: 1,
          pageSize: 20,
          total: 0,
        })
        message.error(res.msg || '请求失败！')
      }
      setLoadingMetric(false)
    } catch (e) {
      setLoadingMetric(false)
    }
  }

  const suiteNameClick = () => {
    history.push({
      pathname: `${path}/suite_Details`,
      query: { suite_id, suite_name },
    });
  }

  const confNameClick = (record: any) => {
    if (record.name) {
      history.push({
        pathname: `${path}/conf_Details`,
        query: { suite_id, suite_name, case_id: record.id, conf_name: record.name },
      });
    }
  }

  useEffect(() => {
    window.document.title = conf_name
    const timer = setTimeout(() => {
      window.document.title = conf_name || 'T-One'
    }, 1000)
    return () => {
      timer && clearTimeout(timer)
    }
  }, [conf_name, window.document.title])

  useEffect(() => {
    if (case_id) {
      getListDataBasic({ case_id })
      getListDataMetric({ case_id })
    }
    if (suite_id && case_id) {
      getListDataRetrieve({ case_id, suite_id })
    }
  }, [case_id, suite_id])

  // 匹配类型
  const TypeTag = ({ type: param }: any) => {
    switch (param) {
      case 0: return (<Tag color='#F2F4F6' style={{ color: '#515B6A' }}>性能测试</Tag>)
      case 1: return (<Tag color='#F2F4F6' style={{ color: '#515B6A' }}>功能测试</Tag>)
      case 2: return (<Tag color='#F2F4F6' style={{ color: '#515B6A' }}>IO字系统</Tag>)
      default: return <></>
    }
  };

  const handleClick = (obj:any) => {
    const { ws_id, job_id } = obj
      // 跳最近运行的Job
      // const a = document.createElement('a');
      // a.target = "_blank";
      // a.rel = "noopener noreferrer"
      // a.href = `/ws/${ws_id}/test_result/${id}`;
      // a.click();
    const win: any = window.open("");
    setTimeout(function () { win.location.href = `/ws/${ws_id}/test_result/${job_id}` })
  }

  const paginationRe: any = {
    total: paginationRetrieve.total,
    pageSize: paginationRetrieve.pageSize,
    current: paginationRetrieve.pageNum,
    // showSizeChanger,
    hideOnSinglePage: true,
    onChange: (page_num: number, page_size: number) => {
      getListDataRetrieve({ case_id, suite_id, page_num, page_size })
    },
    onShowSizeChange: () => { }
  }

  const paginationMe: any = {
    total: paginationMetric.total,
    pageSize: paginationMetric.pageSize,
    current: paginationMetric.pageNum,
    showSizeChanger: false,
    hideOnSinglePage: true,
    onChange: (page_num: number, page_size: number) => {
      getListDataMetric({ case_id, page_num, page_size })
    },
    onShowSizeChange: () => { }
  }

  // 判断有分页则有下边线，无分页则有下边线。
  const borderStyle = (pagination: any) => {
    return pagination.total > pagination.pageSize ? 'have-borderBottom' : 'no-borderBottom'
  }

  return (
    <ContentContainer>
      <div className={styles.TestSuiteDetails_wrap}>
        {noPage ? (
          <NotResult />
        ) : (
          <div className={styles.content} style={{ width: 1000 }}>
            <BreadcrumbMatch suiteName={suite_name} confName={conf_name} suiteId={suite_id} />
            <span className={styles['details-title']}>
              <IconArrowOn className={styles.conf_name_icon} />{conf_name}
            </span>
            <div className={styles['details-description-tag']}>
              {dataSet.test_type && <TypeTag type={dataSet.test_type} />}
              {dataSet.domain_name_list && dataSet.domain_name_list.split(',').map((item: string) =>
                <Tag color='#F2F4F6' style={{ color: '#515B6A' }} key={item}>{item}</Tag>
              )}
            </div>
            <Row className={styles['details-founder-row']}>
              <Col span={4}>
                <span className={styles['details-description-label']}>创建人</span>
                {dataSet.creator_name}
              </Col>
              <Col span={4}>
                <span className={styles['details-description-label']}>运行模式</span>
                {matchType(dataSet.run_mode)}
              </Col>
              <Col span={4}>
                <span className={styles['details-description-label']}>运行次数</span>
                {dataSet.repeat}
              </Col>
              <Col span={6}>
                <span className={styles['details-description-label']}>TestSuite</span>
                <span className={styles['details-description-click-text']} onClick={suiteNameClick}>
                  {dataSet.suite_name}
                </span>
              </Col>
              <Col span={6}>
                <span className={styles['details-description-label']}>集成日期</span>
                {dataSet.gmt_created}
              </Col>
            </Row>
            <span> 说明：</span>
            {dataSet.doc && <CodeViewer code={dataSet.doc} />}
            <div style={{ display: 'flex' }}>
              <div className={styles.content_left}>
                <div className={styles[`${borderStyle(paginationRetrieve)}`]} style={{ marginRight: 20 }}>
                  <Table size="small"
                    rowKey={row => row.id}
                    dataSource={dataSourceRetrieve}
                    loading={loadingRetrieve}
                    columns={[{
                      title: `同级Test Conf(${paginationRetrieve.total})`,
                      dataIndex: 'name',
                      render: (text: string, record: any) => {
                        return <span className={styles['click-a-text']} onClick={() => confNameClick(record)}>{text}</span>
                      }
                    }]}
                    expandable={{
                      expandIcon: () => (
                        <IconArrowOn className={styles.enterOutlined} />
                      )
                    }}
                    pagination={paginationRe} />
                </div>
              </div>

              <div className={styles.content_right}>
                {dataSet['recently_job'] ? (
                  <div className={styles.detailInfo_card} style={{ marginBottom: 20 }}>
                    <div className={styles.card_head}>最近运行的Job</div>
                    <div className={styles.card_content}>
                      {
                        !!dataSet?.recently_job_list.length && dataSet?.recently_job_list.map((item: any, idx: number) => {
                          return (
                            <span className={styles['columns-Job-name']} key={idx} onClick={()=>handleClick(item)}>#{item.job_id}</span>
                          )
                        })
                      }

                    </div>
                  </div>
                ) : null
                }

                {dataSet.test_type !== 'functional' &&
                  <div className={styles[`${borderStyle(paginationMetric)}`]}>
                    <Table size="small"
                      rowKey={record => record.id}
                      dataSource={dataSourceMetric}
                      loading={loadingMetric}
                      columns={[{
                        title: `评价指标(${paginationMetric.total})`,
                        dataIndex: 'name',
                        render: (text: string) => {
                          return <span style={{ paddingLeft: 10 }}>{text}</span>
                        }
                      }]}
                      pagination={paginationMe} />
                  </div>
                }
              </div>
            </div>
            <div className={styles.footer} />
          </div>
        )}

      </div>
    </ContentContainer>
  );
};

export default Index;
