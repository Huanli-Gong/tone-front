import React from 'react'
import { Row, Space, Typography, DatePicker, Radio, Empty, Button } from 'antd'
import moment from 'moment'
import type { Moment } from 'moment'
import { useParams, history, useIntl, FormattedMessage, getLocale } from 'umi'
import TabCardItem from './TabCard'
import { ReactComponent as ProductIcon } from '@/assets/img/icon_shell.svg'
import styled from 'styled-components'

const SpaceRow = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-direction: row;
`

type DateType = Moment | string | undefined | null

const group = (arr: any[], subGroupLength: number) => {
    let index = 0;
    let newArray = [];
    while (index < arr.length) {
        newArray.push(arr.slice(index, index += subGroupLength));
    }
    return newArray;
}

type TabCardProps = {
    project_list?: any[];
    time: string;
    product_id?: string;
}

const tabCard = ({ project_list = [], time, product_id }: TabCardProps) => {
    const { ws_id } = useParams() as any

    if (!project_list.length)
        return (
            <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<FormattedMessage id="ws.dashboard.empty.project_list" />}
            >
                <Button
                    onClick={() => history.push(`/ws/${ws_id}/product?current=${product_id}`)}
                    type="primary"
                >
                    <FormattedMessage id="ws.dashboard.product.create" />
                </Button>
            </Empty>
        )
    const dataSet = group(project_list, 4)
    return (
        dataSet.map((l: any, index: number) => (
            <TabCardItem key={index} list={l} time={time} />
        ))
    )
}

type IProps<T> = {
    product_list: any[];
    setTime: any
    time: T
}

const ProductList: React.FC<IProps<DateType>> = ({ product_list = [], setTime, time }) => {
    moment.locale(getLocale())

    const onChange = (time: DateType) => {
        setTime(time as any)
    }

    const handleSizeChange = ({ target }: any) => {
        setTime(target.value)
    }

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginTop: 20 }}>
                <Typography.Text strong><FormattedMessage id="ws.dashboard.product_list" />({product_list.length})</Typography.Text>
                <Space>
                    <Radio.Group value={time} onChange={handleSizeChange}>
                        <Radio.Button value="24h"><FormattedMessage id="ws.dashboard.24h" /></Radio.Button>
                        <Radio.Button value="48h"><FormattedMessage id="ws.dashboard.48h" /></Radio.Button>
                        <Radio.Button value="oneWeek"><FormattedMessage id="ws.dashboard.oneWeek" /></Radio.Button>
                    </Radio.Group>
                    <DatePicker allowClear={false} value={moment.isMoment(time) ? time : undefined} onChange={onChange} />
                </Space>
            </Row>
            {
                product_list.length === 0 &&
                (
                    <Row style={{ background: "#fff", height: innerHeight - (50 + 96 + 32 + 20 * 4.5), marginTop: 20 }} align="middle" justify="center">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Row>
                )
            }
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>
                {
                    product_list.map((l: any) => (
                        <div key={l.product_id} style={{ background: '#fff', minHeight: 211, padding: 20, boxShadow: '0 0 10px 0 rgba(0,0,0,0.06)' }}>
                            <Row justify="space-between">
                                <SpaceRow>
                                    <ProductIcon />
                                    <Typography.Text strong>{l.product_name}</Typography.Text>
                                </SpaceRow>
                                <Typography.Text style={{ color: 'rgba(0,0,0,0.25)' }}><FormattedMessage id="ws.dashboard.product_create.time" />{` ${moment(l.product_create).fromNow()}`}</Typography.Text>
                            </Row>
                            <div style={{ marginTop: 20 }}>
                                {
                                    tabCard({ ...l, time, })
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default ProductList