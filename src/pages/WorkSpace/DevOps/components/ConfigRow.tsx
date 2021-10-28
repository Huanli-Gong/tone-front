import React, { memo } from 'react'
import { Row , Col } from 'antd'
import styled from 'styled-components'

const RowWrapper = styled(Row)`
    margin-top:8px;
    .anticon-edit { cursor : pointer ;}
    & div:first-child {
        text-align:right;
    }
`
const ConfigRow = ( props : any ) => {
    const { title , setting } = props

    return (
        <RowWrapper gutter={ 20 }>
            <Col span={ 4 }>
                { title }
            </Col>
            <Col span={ 16 }>
                { setting }
            </Col>
        </RowWrapper>
    )
}

export default memo( ConfigRow )