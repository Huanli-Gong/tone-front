
import styled from "styled-components"
import { Card } from "antd"

export const Title = styled.div`
    width: 100%;
    font-size: 16px;
    font-weight: 500;
    color:  rgba(0,0,0,0.85);
    line-height: 43px;
    height: 43px;
    border-bottom: 1px solid #E9E9E9;
    text-indent: 1em;
`

export const CardWrapper = styled(Card)`
    /* height: 360px; */
    /* margin-top: 10px; */
    width: 100%;
    .ant-card-body {
        padding: 0 20px;
        border: none;
    }
`

export const ChartWrapper = styled.div`
    width: 100%;
    height: ${360 - 48}px;
`