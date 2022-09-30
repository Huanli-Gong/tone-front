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
    width: 260px;
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
            <ColTitle>
                {title}
            </ColTitle>
            <Col>
                {children}
            </Col>
        </RowWrapper>
    )
}

export default memo(ConfigRow)