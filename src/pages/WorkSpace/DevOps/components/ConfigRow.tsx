import React, { memo } from 'react'
import { Row, Col } from 'antd'
import styled from 'styled-components'

const RowWrapper = styled(Row)`
    margin-top:16px;
    &:first-child {
        margin-top:0px;
    }
`
const ColTitle = styled(Col)`
    text-align:right;
    &::after {
        content: '：';
    }
`

type IProps = {
    title: string;
    children: React.ReactNode | string
}

const ConfigRow = (props: IProps) => {
    const { title, children } = props

    return (
        <RowWrapper gutter={20}>
            <ColTitle span={4}>
                {title}
            </ColTitle>
            <Col span={20}>
                {children}
            </Col>
        </RowWrapper>
    )
}

export default memo(ConfigRow)