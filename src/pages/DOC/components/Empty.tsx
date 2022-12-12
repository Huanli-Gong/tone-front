import { Empty } from 'antd'
import React from 'react'
import styled from 'styled-components'

const EmptyContainer = styled.div`
    position: absolute;
    background-color: #fff;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
`

const EmptyWrapper = styled.div`
    width : 100%;
    height:100%;
    display: flex;
    justify-content: center;
    align-items: center;
`

const CustomEmty: React.FC = () => (
    <EmptyContainer>
        <EmptyWrapper >
            <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} />
        </EmptyWrapper>
    </EmptyContainer>
)

export default CustomEmty