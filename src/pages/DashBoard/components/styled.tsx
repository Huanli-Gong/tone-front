import { Row, Typography } from 'antd'
import styled from 'styled-components'

export const Container = styled.div`
    width:100%;
    height:100%;
    overflow:hidden;    
`

export const Title = styled.div`
    height:25px;
    margin-bottom:8px;
    padding-left:20px;
    font-size: 18px;
    color: #000000;
`

interface RankIndexProp {
    index: number
}

const indexSwitchColor = (index: number) => {
    switch (index) {
        case 0: return 'background: #EB4B31;'
        case 1: return 'background: #F2C700;'
        case 2: return 'background: #5D86F9;'
        default: return ''
    }
}

export const RankRow = styled(Row)`
    padding-left: 20px;
    padding-right:20px;
    margin-bottom:12px;
`

export const RankIndexDefault = styled.span`
    height: 20px;
    line-height:20px;
    text-align:center;
    width: 20px;
    margin-right: 20px;
`
export const RankIndex = styled(RankIndexDefault) <RankIndexProp>`
    color:#fff;
    font-size:14px;
    border-radius: 50%;
    ${({ index }) => indexSwitchColor(index)}
`
export const RankUserName = styled(Typography.Text)`
    width:100px;
`

export const RankDesc = styled(Typography.Text)`
    width:calc(100% - 150px - 100px);
    // text-align:center;
`

export const RankCount = styled(Typography.Text)`
    text-align:center;
    width:100px;
`