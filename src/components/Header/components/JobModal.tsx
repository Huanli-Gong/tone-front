import React, { useEffect, useState } from 'react'
import { Layout, Row, Input, Tooltip, message, Spin, Tag } from 'antd'
import { switchServerType, switchChineseType } from '@/utils/utils'
import { history, useModel } from 'umi'
import styles from './jobModel.less'
import { SearchOutlined, FrownOutlined } from '@ant-design/icons'

import { queryTestTemplateList } from '@/pages/WorkSpace/TestTemplateManage/service'

export default (props: any) => {
    const ws_id = props.ws_id

    const defaultParams = { ws_id, name: '', enable: 'True', page_num: 1, page_size: 100 }
    const { initialState } = useModel('@@initialState')

    const [pageParams, setPageParams] = useState(defaultParams)
    const [dataSource, setDatasource] = useState([])
    const [loading, setLoading] = useState(false)

    const [over, setOver] = useState(false)

    const queryTemplate = async (params: any) => {
        setLoading(true)
        const { code, data, total_page } = await queryTestTemplateList(params)
        if (code === 200) {
            setDatasource(dataSource.concat(data))
            if (data.length === params.page_size) {
                const num = params.page_num
                setPageParams({ ...params, page_num: total_page > num ? num : total_page })
            }
            else setOver(true)
        }
        setLoading(false)
    }

    const initTemplate = async (params = defaultParams) => {
        setLoading(true)
        const { code, data } = await queryTestTemplateList(params)
        if (code === 200) {
            setDatasource(data)
        }
        setLoading(false)
    }

    const handleChangeTemplateName = ({ target }: any) => {
        setPageParams({ ...defaultParams, name: target.value })
        initTemplate({ ...defaultParams, name: target.value })
    }

    useEffect(() => {
        initTemplate()
    }, [initialState?.refreshMenu, ws_id])
    useEffect(() => {
        if(pageParams.name) {
            initTemplate()
            setPageParams({ ...defaultParams })
        }
    }, [props.testType])

    const handleScroll = ({ target }: any) => {
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight && !over) {
            queryTemplate({ ...pageParams, page_num: pageParams.page_num + 1 })
        }
    }
    const TootipOver : React.FC<any> = (props:any) => {
        let content = props.children
        if(content.length > 23){
            return <Tooltip title={content}>
                {content}
            </Tooltip>
        }
            return content
    }
    const dataSourceCopy = props.getData(dataSource)
    return (
        <Layout.Content style={{ minWidth : 468 , maxWidth: 912 }} key={props.testType}>
            <Row style={{ paddingLeft: 20, paddingRight: 19, marginBottom: 16 }}>
                <Input
                    autoComplete="off"
                    prefix={<SearchOutlined />}
                    className={styles.job_search_inp}
                    placeholder="搜索模板"
                    onChange={handleChangeTemplateName}
                />
            </Row>
            <Spin spinning={loading}>
                {
                    dataSourceCopy.length > 0 &&
                    <div className={styles.job_type}>
                            {
                                dataSourceCopy.map(
                                    (item: any, index: number) => (
                                        <div
                                            key={index}
                                            className={styles.type_modal_item}
                                            style={{ margin: dataSourceCopy.length > 12 ? '0 7px 16px 7px' : '0 8px 16px 8px' }}
                                            onClick={() => {
                                                if (!item.job_type) message.error('问题模板，请及时删除')
                                                else {
                                                    props.onOk()
                                                    history.push(`/ws/${ws_id}/test_job/${item.job_type_id}?template_id=${item.id}`)
                                                }
                                            }}
                                        >
                                            <div className={styles.type_modal_title}>
                                                <TootipOver>{item.name}</TootipOver>
                                            </div>
                                            <div style={{ paddingLeft: 16 }}>
                                                <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchServerType(item.server_provider)}</Tag>
                                                <Tag color="#F2F4F6" style={{ color: '#515B6A' }}>{switchChineseType(item.test_type)}</Tag>
                                            </div>
                                        </div>
                                    )
                                )
                            }
                    </div>
                }
                {
                    dataSourceCopy.length === 0 &&
                    <div style={{ height:80, lineHeight:'80px', textAlign: 'center', color: 'rgba(0,0,0,.35)' }}>
                        <FrownOutlined style={{ marginRight:8 }}/>暂无模板
                    </div>
                }
            </Spin>
        </Layout.Content>
    )
}