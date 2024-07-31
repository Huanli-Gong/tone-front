import { Col, Layout, Row, Spin, Statistic } from 'antd'
import moment from 'moment'
import type { Moment } from 'moment'
import React,{ useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRequest, FormattedMessage } from 'umi'
import { queryWorkspaceProductData } from './services'

import { ReactComponent as Icondroduct } from '@/assets/svg/dashboard/icon_droduct.svg'
import { ReactComponent as Iconip } from '@/assets/svg/dashboard/icon_ip.svg'
import { ReactComponent as Iconjob } from '@/assets/svg/dashboard/icon_Job.svg'
import { ReactComponent as IconTestconf } from '@/assets/svg/dashboard/icon_Testconf.svg'

import ProductList from './components/ProductList'
import produce from 'immer'
import { useClientSize } from '@/utils/hooks'
interface ContainerProps {
    height?: number;
}

const Container = styled(Layout) <ContainerProps>`
    padding: 20px;
    min-height: ${({ height }) => height }px;
`

const WhiteBlock = styled(Row) <ContainerProps>`
    background: #FFFFFF;
    box-shadow: 0 0 10px 0 rgba(0,0,0,0.06);
    border-radius: 4px;
    width:100%;
    ${({ height }) => height ? `height:${height}px;` : ''}

    svg {
        margin-right:24px;
    }
`
const CommonStatic = styled(Statistic)`
    line-height:1.2!important;
    .ant-statistic-content,
    .ant-statistic-content-suffix{font-size:30px;}
`

const getField = (name: string) => new Map([
    ['24h', 'hours_24_ago'],
    ['48h', 'hours_48_ago'],
    ['oneWeek', 'seven_day_ago'],
]).get(name)

const WorkpsaceDashboard = (props: any) => {
    const { ws_id } = props.match.params
    const [time, setTime] = React.useState<Moment | string | undefined>('24h')
    const [ loading, setLoading ] = useState<boolean>(true)
    
    const { data, run } = useRequest(() => queryWorkspaceProductData(
        produce({ ws_id }, (draft: any) => {
            if (moment.isMoment(time)) {
                draft.date = moment(time).format('YYYY-MM-DD')
            }
            else {
                if (!time) return
                const field = getField(time)
                if (!field) return
                draft[field] = true
            }
        })
    ), {
        pollingInterval: 300000, // 5分钟轮询
        manual:true,
        onSuccess:()=>{
            setLoading(false)
        }
    })

    useEffect(() => {
        run()
    }, [time])

    useEffect(()=>{
        let obj:any = document.querySelector('html') 
        obj.scrollTop = 0
    },[])
    
    const { height } = useClientSize()

    return (
        <Container height={height - 50}>
            <Spin spinning={ loading }>
                <Row gutter={16}>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <Icondroduct />
                            <CommonStatic groupSeparator="" title={<FormattedMessage id="ws.dashboard.total_product" />} 
                                value={data?.total_product} suffix={`/ ${data?.total_project || 0}`} />
                        </WhiteBlock>
                    </Col>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <Iconjob />
                            <CommonStatic groupSeparator="" title={<FormattedMessage id="ws.dashboard.total_job" />}
                                value={data?.total_job} />
                        </WhiteBlock>
                    </Col>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <IconTestconf />
                            <CommonStatic groupSeparator="" title={<FormattedMessage id="ws.dashboard.total_conf" />}
                                value={data?.total_conf} />
                        </WhiteBlock>
                    </Col>
                    <Col span={6}>
                        <WhiteBlock height={96} justify="center" align="middle">
                            <Iconip />
                            <CommonStatic groupSeparator="" title={<FormattedMessage id="ws.dashboard.server_use_num" />}
                                value={data?.server_use_num} />
                        </WhiteBlock>
                    </Col>
                </Row>
                <ProductList
                    product_list={data?.product_list.filter((cur: any) => cur.project_list.length !== 0)}
                    setTime={setTime}
                    time={time}
                />
            </Spin>
        </Container>
    )
}

export default WorkpsaceDashboard