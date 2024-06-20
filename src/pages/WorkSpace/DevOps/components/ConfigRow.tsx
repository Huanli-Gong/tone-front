import React, { memo } from 'react'
import { Row, Col } from 'antd'
import styled from 'styled-components'

const RowWrapper = styled(Row)`
    margin-top:16px;
    &:first-child {
        margin-top:0px;
    }
`
const titleAfterCls = `
    &::after {
        content: '：';
    }
`

type TitleColProps = {
    hasTitle: boolean;
}

const ColTitle = styled(Col) <TitleColProps>`
    text-align:right;
    width: 260px;
    ${({ hasTitle }) => hasTitle ? titleAfterCls : ''}
`

type IProps = {
    title?: any;
    children: React.ReactNode | string
}

const ConfigRow: React.FC<IProps> = (props) => {
    const { title, ...other } = props

    return (
        <RowWrapper gutter={20} >
            <ColTitle hasTitle={!!title}>
                {title}
            </ColTitle>
            <Col>
                {
                    React.createElement('div', other)
                }
            </Col>
        </RowWrapper>
    )
}

export default memo(ConfigRow)