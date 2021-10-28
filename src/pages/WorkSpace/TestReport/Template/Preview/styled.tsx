import styled from 'styled-components'
import { Row } from 'antd'

export const PreviewTableTr = styled(Row)`
    align-items:center;
`
export const FullRow = styled(Row)`
    width : 100%;
    border-left:1px solid rgba(0,0,0,0.10);
    background: #FDFEFF;

    & ${PreviewTableTr} { 
        width:calc( (100% - 90px) / 3 );
        height:40px;
        border-top:1px solid rgba(0,0,0,0.10);
        border-right:1px solid rgba(0,0,0,0.10);
        padding:0 16px;
    }
    & ${PreviewTableTr}:first-child {
        width :90px;
    }
`

export const CustomRow = styled.div`
    background: #fff;
    margin-bottom:16px;
    padding:16px 20px;
    border: 1px solid #E5E5E5;
    border-radius: 4px;
    .line { 
        width:2px;
        height:16px;
        background:#1890FF;
        margin: 3px 8px 4px -10px;
        float:left;
    }
    ${FullRow} {
        &:last-child {
            border-bottom:1px solid rgba(0,0,0,0.10);
        }
    }
`