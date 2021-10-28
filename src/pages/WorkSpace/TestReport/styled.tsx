import styled from 'styled-components'

interface BodyProps {
    width : string | number
    height : string | number
}

export const ReportBody = styled.div<BodyProps>`
    width:${ ({ width }) => width }px;
    height:${ ({ height }) => height }px;
    overflow-y:scrollY;
    background:#fff;
    width:100%;
    .ant-tabs {
        background: #fff;
        .ant-tabs-content-holder{
                padding-left: 20px;
                padding-right: 20px;
            }
        }
        button{
            margin-right: 20px;
        }
    }
`