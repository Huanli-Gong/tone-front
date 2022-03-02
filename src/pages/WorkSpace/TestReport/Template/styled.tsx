import styled from 'styled-components'
import { Row, List, Card, Col } from 'antd'

export const CreateTemplateBody = styled.div`
    width:1000px;
    min-height:100vh;
    background:#fff;
    margin:0 auto;
    padding-bottom:80px;
`

export const CreateHeader = styled.div`
    background:#fff;
    padding:20px;
`

export const GrayLine = styled.div`
    height:10px;
    background:#f5f5f5;
    width:100%;
`

export const ProjectTitle = styled.div`
    display: flex;
    align-items: center;
    font-weight:600;
    font-size: 16px;
    line-height: 26px;
    font-weight: 600;
    color: rgba(0,0,0,0.85);
    &::before {
        content: '';
        width: 2px;
        height: 16px;
        background: #1890FF;
        margin-right:10px;
        border-left: 2px solid #1890FF;
        margin-left: 10px;
    }
    .ant-anchor-link{
        padding:0;
        display:inline-block;
        a:hover{
            color:rgba(0, 0, 0, 0.85);
        }
    }
`

export const ProjectWrapper = styled.div`
    padding:20px 0;
    background:#fff;
    ${ProjectTitle} {
        font-size: 16px;
        color: rgba(0,0,0,0.85);
        margin-bottom:20px;
    }
`

export const PeddingRow = styled(Row)`
padding:0 20px;
`

export const MarginPeddingRow = styled(PeddingRow)`
margin-bottom:10px;
`


export const TestItemRow = styled(Row)`
    height:48px;
    width:100%;
    margin-bottom:10px;
    .ant-typography {
        margin-bottom:0;
    }
    .anticon-minus-circle {
        visibility : hidden;
    }
    &:hover {
        .anticon-minus-circle {
            visibility : visible;
        }
    }
`

export const ShowOptionRow = styled(MarginPeddingRow)`
    margin-bottom:0;
    height:40px;
    width:100%;
    background: #FAFAFA;
`

export const TemplateBar = styled(Row)`
    width:100%;
    height:56px;
    position:fixed;
    bottom:0;
    left:0;
    padding-right:24px;
    background:#fff;
    border-top:1px solid rgba(0,0,0,0.10);
`

export const AddOptionRow = styled(Row)`
    margin-top:10px;
    margin-bottom:10px;
`

export const SuiteTestRow = styled(Row)`
    width:100%; 
`

export const ListContainer = styled(List)`
    background:#FDFEFF;
    li.ant-list-item:hover {
        background: rgb(250, 250, 250);
        .anticon-minus-circle {
            visibility : visible;
        }
    }
    li.ant-list-item {
        .anticon-minus-circle {
            visibility : hidden;
        }
    }
`

export const SuiteCardContainer = styled(Card)`
    .ant-card-head {
        margin-bottom:0;
        padding:0 20px;
        .anticon-minus-circle {
            visibility : hidden;
        }
        &:hover {
            .anticon-minus-circle {
                visibility : visible;
            }
        }
    }
`

/* 最外层 */

interface ReportTamplateProps {
    height: number;
}

export const ReportTemplate = styled.div<ReportTamplateProps>`
    width: 100%;
    height: ${({ height }) => height}px;
    position: relative;
    display: flex;
    padding-bottom: 56px;
    background: #f5f5f5;
`

/* body container */


interface CatalogProp {
    collapsed: boolean
}

export const ReportBodyContainer = styled.div<CatalogProp>`
    width: ${({ collapsed }) => collapsed ? '100%' : 'calc(100% - 200px)'};
    height: 100%;
    padding-left: 20px;
    padding-right: 20px;
    overflow: auto;
    padding-bottom: 20px;
`

export const ReportBody = styled.div`
    max-width:1200px;
    margin : 0 auto;
`

/* 目录部分 */


export const CatalogBody = styled.div`
    max-height:100%;
    width:100%;

    overflow-y:auto;
    overflow-x:hidden;
    .ant-tree .ant-tree-node-content-wrapper.ant-tree-node-selected {
        background-color:#fff;
    }
    .ant-tree .ant-tree-node-content-wrapper:hover {
        background-color:#fff;
    }
    .ant-tree-switcher { width : 0;}

    .ant-tree .ant-tree-treenode {
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }
`

export const Catalog = styled.div<CatalogProp>`
    width: ${({ collapsed }) => collapsed ? 0 : 200}px;
    height: 100%;
    background: #fff;
    position: relative;
    .ant-typography { cursor : pointer; }
    ${CatalogBody} {
        ${({ collapsed }) => !collapsed ? `padding:16px 12px 12px 26px;` : ''}
    }
`

export const CatalogTitle = styled.div`
    margin-bottom: 24px;
`

export const CatalogDrageSpace = styled.div`
    margin-top:8px;
    padding-left:20px;
`

export const CatalogExpand = styled.span`
    position: absolute;
    cursor: pointer;
    top: 10px; 
    right: -8px;
    width: 12px;
    height: 70px;
`
export const CatalogLine = styled.div`
    width:1px;
    background:#e5e5e5;
    margin-right:13px;
`
interface CountProp {
    count:any;
}
const setCount = (c: number) => {
    return c + 3 + 'px'
}
export const CatalogRound = styled.div<CountProp>`
    height:10px;
    width:10px;
    border-radius:50%;
    background:#fff;
    border:1px solid #e5e5e5;
    position:absolute;
    left:-5px;
    top:${({ count }) => setCount(count)};
`
export const LittleRound = styled.div`
    height:4px;
    width:4px;
    border-radius:50%;
    background:#1890FF;
    margin: 25% auto;
`

export const CatalogExpandInnerIcon = styled.span`
    position: absolute;
    left: 79%;
    top: 54%;
    transform: translate(-50%, -50%);
    display: flex;
    font-size: 8px ;
    cursor : pointer;
`

/* body breadcrumb 面包屑 */

export const BodyBreadcrumb = styled.div`
    height : 48px;
    line-height : 48px;
    display: flex;
    align-items:center;
    .ant-breadcrumb { display:flex;}
`

/* template name 名称信息部分 */

export const ReportIssue = styled.div`
    padding : 20px;
    background :#fff;

    .ant-input {
        outline: none;
        border: none;
        box-shadow:none;
    }

    input { 
        font-size: 32px;
    }

    textarea {
        font-size: 14px;
    }
`

/* suite case row icon styles */

export const Suite = styled(Col)`
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,.06);
    margin-top: 10px
`

const MinusCircleAction = `
    .anticon-minus-circle {
        color : rgba(0,0,0,0.45);
    }
    &:hover {
        .anticon-minus-circle {
            color : #F5222D;
        }
    }
`

interface CaseProp {
    len: number,
    idx: number
}

export const Case = styled(Col) <CaseProp>`
    background: #fff;
    height: 38px;
    line-height: 38px;
    padding: 0 16px 0 36px;
    ${({ len, idx }) => idx === len ? '' : 'border-bottom: 1px solid rgba(0,0,0,0.06);'}
    ${MinusCircleAction}
`

export const SuiteTitle = styled(Row)`
    background: rgba(0,0,0,.02);
    min-height: 38px;
    // line-height: 38px;
    padding: 8px 16px;
    position:relative;
    ${MinusCircleAction}
    .anticon-minus-circle {
        position:absolute;
        right:16px;
        top:12px;
    }
`

const CloseActionIcon = `
    .anticon-close {
        cursor:pointer;
    }
`

/* 测试项 */

export const Term = styled(Row)`
    background: rgba(0,0,0,0.02);
    margin-top: 8px;
    width: 100%;
    ${CloseActionIcon}
`

export const TermTitle = styled(Col)`
    background: rgba(0,0,0,0.03);
    min-height: 40px;
    padding: 8px 16px;
    position: relative;
`

/* 测试组  */
export const Group = styled(Row)`
    background: #FFFFFF;
    border: 1px solid rgba(0,0,0,0.10);
    border-radius: 2px;
    width: 100%;
    margin-top: 16px;
    ${CloseActionIcon}
    & ${Term}:first-child {
        margin-top:0;
    }
`

/* 测试组title */

export const GroupTitle = styled(Row)`
    min-height: 40px;
    // line-height: 40px;
    background: rgba(0,0,0,0.03);
    padding: 8px 16px
`
