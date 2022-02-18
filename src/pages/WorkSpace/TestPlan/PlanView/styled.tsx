import styled from 'styled-components'
import { Tabs } from 'antd'

interface LayoutProps {
    width : string | number
    height : string | number
}

export const ViewLayout = styled.div<LayoutProps>`
    width:${ props => props.width }px;
    min-height:${ props => props.height }px;
    // padding: 12px 20px 0;
    overflow:auto;
`

export const ViewContent = styled.div`
    width:100%;
    min-height:100%;
    background:#fff;
    padding-bottom:20px;
`

export const TabContainer = styled( Tabs )`
    .ant-tabs-nav::before{
        border-bottom: 1px solid #f0f0f0;
    }
`
