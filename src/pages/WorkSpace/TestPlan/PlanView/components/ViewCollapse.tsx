/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react'
import { Collapse, Space, Row, Empty, Spin } from 'antd'
import { RenderDataRow } from './'
import { CaretRightOutlined } from '@ant-design/icons'
import ViewTable from './ViewTable'
import { queryPlanViewList } from '../services'
import styles from './ViewCollapse.less'
import { requestCodeMessage } from '@/utils/utils'

const ViewCollapse = (props: any) => {
    const { ws_id } = props

    const [expandRow, setExpandRow] = useState<any>([])
    const [dataSource, setDataSource] = useState({ data: [], total: 1 })
    // const [pageParam, setPageParam] = useState({ ws_id }) //, page_num : 1 , page_size : 10 

    const [loading, setLoading] = useState(true)

    const queryPlanViewListData = async (param: any = { ws_id, page_num: 1, page_size: 500 }) => {
        setLoading(true)
        const { data, total, code, msg } = await queryPlanViewList(param)
        if (code === 200)
            setDataSource({ data, total })
        else
            requestCodeMessage(code, msg)
        setLoading(false)
    }

    useEffect(() => {
        queryPlanViewListData()
    }, [])

    return (
        <Spin spinning={loading}>
            <Space direction="vertical" style={{ width: '100%', paddingLeft: 20, paddingRight: 20 }}>
                {
                    dataSource.data.length > 0 ?
                        dataSource.data.map((i: any) => (
                            <Collapse
                                className={styles.CollapseContainer}
                                key={i.id}
                                expandIcon={
                                    ({ isActive }) => {
                                        if (isActive && expandRow.indexOf(i.id) < 0) {
                                            const temp = expandRow.concat([i.id])
                                            setExpandRow(temp)
                                        } else if (!isActive && expandRow.indexOf(i.id) >= 0) {
                                            const temp = expandRow.filter((item: any) => item !== i.id)
                                            setExpandRow(temp)
                                        }
                                        return <CaretRightOutlined rotate={isActive ? 90 : 0} />
                                    }
                                }
                                // hover、展开后背景显示出来。
                                style={{
                                    background: (expandRow.indexOf(i.id) > -1 ? '#fafafa' : '#fff'),
                                }}
                            >
                                <Collapse.Panel style={{ borderBottom: 'none' }}
                                    header={
                                        <Row justify="space-between" >
                                            <b >{i.name}</b>
                                            <RenderDataRow {...i} />
                                        </Row>
                                    }
                                    key={i.id}
                                >
                                    <ViewTable ws_id={ws_id} plan_id={i.id} callBackViewTotal={queryPlanViewListData} />
                                </Collapse.Panel>
                            </Collapse>
                        )) :
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
            </Space>
        </Spin>
    )
}

export default ViewCollapse