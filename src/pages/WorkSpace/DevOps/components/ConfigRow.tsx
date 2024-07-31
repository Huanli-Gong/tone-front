import React, { memo } from 'react'
import { Row, Col } from 'antd'
import { getLocale } from 'umi'
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
    locale: string;
}

const ColTitle = styled(Col) <TitleColProps>`
    text-align:right;
    width: ${({ locale }) => locale === 'en-US' ? '350' : '260'}px;
    ${({ hasTitle }) => hasTitle ? titleAfterCls : ''}
`

type IProps = {
    title?: any;
    children: React.ReactNode | string
}

const ConfigRow: React.FC<IProps> = (props) => {
    const { title, ...other } = props
    const locale = getLocale();
    return (
        <RowWrapper gutter={20} >
            <ColTitle hasTitle={!!title} locale={locale}>
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