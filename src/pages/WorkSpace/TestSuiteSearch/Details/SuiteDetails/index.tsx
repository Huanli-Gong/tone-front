import React, { useState, useEffect } from 'react';
import { Col, Row, Table, Spin, Tag, message } from 'antd';
import { history } from 'umi';
import ContentContainer from '@/components/Public/ContentHeader';
import { getQuery, matchType } from '@/utils/utils';
import { ReactComponent as IconArrowOn } from '@/assets/svg/icon_arrow_on.svg'
import { BreadcrumbMatch } from '../components/Breadcrumb';
import NotResult from '../404';
import { queryTestSuiteDetails, queryTestMetricDetails } from '../../service';
import styles from './style.less';
import CodeViewer from '@/components/CodeViewer';

const SuiteDetails: React.FC<any> = (props: any) => {
    const { pathname } = new URL(window.location.href)
    const ws_id = pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
    const path = `/ws/${ws_id}/suite_search`
    //
    const { suite_id, suite_name }: any = getQuery('')

    const [loading, setLoading] = useState(false)
    const [dataSet, setDataSet] = useState<any>({})
    const [dataSource, setDataSource] = useState<any>([])
    const [dataSourceMetric, setDataSourceMetric] = useState<any>([])
    const [paginationMetric, setPaginationMetric] = useState<any>({
        pageNum: 1,
        pageSize: 20,
        total: 0,
    })
    const [noPage, setNoPage] = useState(false)

    // 1.suite信息数据
    const getListData = async (query: any) => {
        try {
            setLoading(true)
            const res = await queryTestSuiteDetails(query)
            const { data = [] } = res || {}
            const dataObject = data[0] || {}
            const { test_case_list = [], ...other } = dataObject

            if (res.code === 200 && Array.isArray(test_case_list) && test_case_list.length) {
                setDataSet(other)
                setDataSource(test_case_list)
            } else if (res.code === 404) {
                setNoPage(true)
            } else if (res.code !== 200) {
                message.error(res.msg || '请求失败！')
                setDataSet({})
                setDataSource([])
            }
            setLoading(false)
        } catch (e) {
            setLoading(false)
        }
    }
    // 2.suite信息数据
    const getListDataMetric = async (query: any) => {
        try {
            const res = await queryTestMetricDetails(query) || {}
            const { data = [] } = res
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
        } catch (e) {
            console.log(e)
        }
    }

    const suiteNameClick = (record: any) => {
        history.push({
            pathname: `${path}/conf_Details`,
            query: { suite_id, suite_name, case_id: record.id, conf_name: record.name },
        });
    }

    useEffect(() => {
        window.document.title = suite_name
        const timer = setTimeout(()=> {
            window.document.title = suite_name || 'T-One'
        }, 1000)
        return () => {
            timer && clearTimeout(timer)
        }
    }, [suite_name, window.document.title])


    useEffect(() => {
        if (suite_id) {
            getListData({ suite_id, scope: 'case' })
            getListDataMetric({ suite_id })
        }
    }, [suite_id])

    // 匹配类型
    const TypeTag = ({ type: param }: any) => {
        switch (param) {
            case "performance": return (<Tag color='#F2F4F6' style={{ color: '#515B6A' }}>性能测试</Tag>)
            case "functional": return (<Tag color='#F2F4F6' style={{ color: '#515B6A' }}>功能测试</Tag>)
            default: return <></>
        }
    };

    const paginationMe: any = {
        total: paginationMetric.total,
        pageSize: paginationMetric.pageSize,
        current: paginationMetric.pageNum,
        showSizeChanger: false,
        hideOnSinglePage: true,
        onChange: (page_num: number, page_size: number) => {
            getListDataMetric({ suite_id, page_num, page_size })
        },
        onShowSizeChange: () => { }
    }

    // 判断有分页则有下边线，无分页则有下边线。
    const borderStyle = (pagination: any) => {
        return pagination.total > pagination.pageSize ? 'have-borderBottom' : 'no-borderBottom'
    }

    // 详细信息
    const detailInfo = [
        { name: '创建人', value: dataSet.owner_name },
        { name: '运行模式', value: matchType(dataSet.run_mode) },
        { name: '集成日期', value: dataSet.gmt_created },
    ]

    return (
        <ContentContainer>
            <div className={styles.TestSuiteDetails_wrap}>
                {noPage ? (
                    <NotResult />
                ) : (
                    <div className={styles.content} style={{ width: 1000 }}>
                        <BreadcrumbMatch suiteName={suite_name} />
                        <Spin spinning={loading}>
                            <div style={{ display: 'flex' }}>
                                <div className={styles.content_left}>
                                    <div className={styles['test-card-border']}>
                                        <div style={{ fontSize: 32, marginTop: -12 }}>
                                            {suite_name}
                                        </div>
                                        <div className={styles['details-description-tag']}>
                                            {dataSet.test_type && <TypeTag type={dataSet.test_type} />}
                                            {dataSet.domain_name_list && dataSet.domain_name_list.split(',').map((item: string) =>
                                                <Tag color='#F2F4F6' style={{ color: '#515B6A' }}>{item}</Tag>
                                            )}
                                        </div>
                                        <span>说明：</span>
                                        {dataSet.doc && <CodeViewer code={dataSet.doc} />}
                                        <p>备注：{dataSet.description}</p>
                                    </div>
                                    <div className={styles[`${dataSource.length ? 'no-borderBottom' : 'have-borderBottom'}`]} style={{ marginRight: 20 }}>
                                        <Table size="small"
                                            rowKey={record => record.id}
                                            dataSource={dataSource}
                                            columns={[
                                                {
                                                    title: `Test Conf(${dataSource.length})`,
                                                    dataIndex: 'name',
                                                    render: (text: string, record: any) => {
                                                        return <span className={styles['click-a-text']} onClick={() => suiteNameClick(record)}>{text}</span>
                                                    }
                                                },
                                            ]}
                                            expandable={{
                                                expandIcon: () => (
                                                    <IconArrowOn className={styles.enterOutlined} />
                                                )
                                            }}
                                            pagination={false} />
                                    </div>
                                </div>

                                <div className={styles.content_right}>
                                    <div className={styles.detailInfo_card} style={{ marginBottom: 20 }}>
                                        <div className={styles.card_head}>详细信息</div>
                                        <div className={styles.card_content}>
                                            {detailInfo.map((item, i) =>
                                                <div className={styles.card_row} key={i}>
                                                    <span className={styles['test-columns-label']}>{item.name}</span>
                                                    <span className={styles['test-columns-name']}>{item.value}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {
                                        dataSet.test_type !== 'functional' &&
                                        <div className={styles[`${borderStyle(paginationMetric)}`]}>
                                            <Table
                                                size="small"
                                                rowKey={record => record.id}
                                                dataSource={dataSourceMetric}
                                                columns={[{
                                                    title: `评价指标(${paginationMetric.total})`,
                                                    dataIndex: 'name',
                                                    render: (text: string) => {
                                                        return <span>{text}</span>
                                                    }
                                                }]}
                                                pagination={paginationMe}
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                        </Spin>
                        <div className={styles.footer} />
                    </div>
                )}
            </div>
        </ContentContainer>
    );
};

export default SuiteDetails;
