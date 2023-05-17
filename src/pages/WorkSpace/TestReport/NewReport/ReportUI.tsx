import styled from 'styled-components'
import { Row, Breadcrumb, Tooltip } from 'antd';
import { CaretRightOutlined, CloseOutlined } from '@ant-design/icons';
interface ReportTamplateProps {
    height: number;
}

export const ReportTemplate = styled.div<ReportTamplateProps>`
    width: 100%;
    height: ${({ height }) => height}px;
    position: relative;
    display: flex;
    background: #f5f5f5;
    //padding-bottom: 56px;
`

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
export const ReportWarpper = styled(Row)`
    width:1200px;
    margin:0 auto !important;
    height:600px;
`
// 目录
export const CatalogBody = styled.div`
    height:100%;
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
    #left-catalog-wrapper .spaceWarpper .ant-space-item .toc-selected {
        color: #1890FF;
    }
`

export const CatalogExpand = styled.span`
    position: absolute;
    cursor: pointer;
    top: 10px; 
    right: -8px;
    width: 12px;
    height: 70px;
    z-index:999;
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
export const CatalogLine = styled.div`
    width:1px;
    background:#e5e5e5;
    margin-right:13px;
`
interface CountProp {
    count: any;
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
export const CatalogDrageSpace = styled.div`
    //margin-top:8px;
    padding-left:20px;
`

export const PackTooltip = styled(Tooltip)`
    max-width: 540px !important;
    .ant-tooltip-inner {
        max-width: 540px;
        max-height: 360px;
        overflow-y: scroll;
    }
`
export const ReportBread = styled(Breadcrumb)`
    height:22px;
    margin:14px 0;
    position:relative;
`
export const BreadDetailL = styled.span`
    cursor:pointer;
`
export const BreadDetailR = styled(BreadDetailL)`
    display:inline-block;
    max-width:940px;    
    position:absolute;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
`
interface BtnWarpper {
    btnState: boolean;
}
export const Btn = styled.span<BtnWarpper>`
    position:absolute;
    right:0px;
    top:${({ btnState }) => btnState ? '-5px' : 0};

`
const setGroupWdith = (l: number) => {
    if (l == 1) {
        return '50%'
    } else {
        return '110px'
    }
}
const setDataWdith = (l: number) => {
    if (l == 1) {
        return '50%'
    } else {
        return (`calc( (100% - 110px) / ${l})`)
    }
}

const GroupPulic = `
    line-height:48px; 
    float:left;
    padding-left:16px;
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: #000000;
    border-bottom:1px solid rgba(0,0,0,0.10);
    border-right:1px solid rgba(0,0,0,0.10);
`
const TitlePulic = `
    line-height:76px; 
    float:left;
    padding-left:16px;
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: #000000;
`
const StatisticalPulic = `
    min-height:40px; 
    height:40px; 
    line-height:20px;
    border-right:1px solid rgba(0,0,0,0.10);
    //text-align:center;
    text-align:left;
    padding:0 9px; 
    .logo{
        font-style:normal;
        color:rgba(0,0,0,0.65);
        font-size:12px;
    }
    .all{
        font-size:20px;
        color:#649FF6;
    }
    .up{
        font-size:20px;
        color:#81BF84;
    }
    .down{
        font-size:20px;
        color:#C84C5A;
    }
`

interface GroupRowProps {
    gLen: number   /* group数量 */
    btnState?: any,
}
export const GroupTitle = styled.div<GroupRowProps>`
    ${GroupPulic}
    width : ${({ gLen }) => setGroupWdith(gLen)};
    border-right:1px solid rgba(0,0,0,0.10);
`
export const GroupData = styled.div<GroupRowProps>`
    ${GroupPulic} 
    display:flex;     
    width : ${({ gLen }) => setDataWdith(gLen)};
    &:last-child {
        border-right:none;
    }
`
export const Group = styled.div`
    height:48px;
    display:flex;
`

export const PerfResultTitle = styled.div<GroupRowProps>`
    ${TitlePulic}
    width : ${({ gLen }) => setGroupWdith(gLen)};
    border-right:1px solid rgba(0,0,0,0.10);
    border-bottom:1px solid rgba(0,0,0,0.10);
`
export const PerfResultData = styled.div<GroupRowProps>`
    ${TitlePulic}
    width : ${({ gLen }) => setDataWdith(gLen)};
    border-right:1px solid rgba(0,0,0,0.10);
    border-bottom:1px solid rgba(0,0,0,0.10);
    &:last-child{
        border-right:none;
    }
`
//width: ${({ strNum }) => (strNum * 20) + 'px' }

export const Statistical = styled.span`
    ${StatisticalPulic}
    &:last-child{
        border-right:none;
    }
`
export const FuncResultTitle = styled(PerfResultTitle)`
    border-bottom:none;
`
export const FuncResultData = styled(PerfResultData)`
    border-bottom:none;
`
export const Result = styled.div`
    height:76px;
`

export const Summary = styled.div`
    border: 1px solid rgba(0,0,0,0.10);
    background:#fff;
`

export const ModuleWrapper = styled.div`
    height:auto;
    background:#fff;
    padding:16px 20px;
    margin-bottom:16px;
`
export const EditTitle = styled.div`
    color:rgba(0,0,0,0.85);
    font-size:14px;
    margin-bottom:8px;
    font-family:PingFangSC-Medium;
`
// 项总标题
export const SubTitle = styled.div`
    font-size:16px;
    font-weight:bold;
    color:rgba(0,0,0,0.85); 
    margin-bottom: 16px;
    .line{
        width:2px;
        height:16px;
        background:#1890FF;
        margin: 4px 8px 4px -10px;
        float:left;
    }
`
const setEnvGroupWdith = (l: number) => {
    if (l == 1) return (`calc( 100% - 110px )`)
    return (`calc( (100% - 110px) / ${l})`)
}
export const EnvGroupL = styled.div`
    width:110px;
    float:left;
    padding-left:16px;
    border-right:1px solid rgba(0,0,0,0.10);
`
export const EnvGroupR = styled.div<GroupRowProps>`
    width: ${({ gLen }) => setEnvGroupWdith(gLen)};
    display:flex;
    padding-left:13px;
    border-right:1px solid rgba(0,0,0,0.10);
`
export const EnvGroup = styled.div`
    border: 1px solid rgba(0,0,0,0.10);
    height:48px;
    line-height:48px;
    color:#000;
    font-weight:500;
    margin-bottom:13px;
    border-right:none;
    display:flex;
`
// 性能测试数据style
export const FuncItem = styled.div`
    height:57px;
    line-height:57px;
    padding-left:5px;
`
export const Configuration = styled.div`
    //border:1px solid rgba(0,0,0,0.1);
    background-color: #FDFEFF;
    margin-top: 11px;
    border-bottom:none;
`
export const SigleWrapper = styled(Row)`
    min-height:40px;
    border:1px solid rgba(0,0,0,0.1);
    border-bottom:none;
    &:last-child{
        border-bottom:1px solid rgba(0,0,0,0.1);
    }
`
export const TestTitle = styled.div`
    width:75px;
    padding-top:8px;
    text-align:center;
    color:rgba(0,0,0,0.85);
    font-family:PingFangSC-Medium;
    vertical-align: top;
`
export const TestContent = styled.div`
    width:calc(100% - 75px);
    border-left:1px solid rgba(0,0,0,0.1);
    & > div {
        width:100%;
        padding:8px 20px 8px 24px;
        max-height: 300px;
        overflow-y: auto;
    }
`
const ConfTextPuilc = `
    float:left;
    font-size:14px;
    padding-left:16px;
    color:rgba(0,0,0,0.85);
    font-family: PingFangSC-Medium;
    overflow: hidden;
    //text-overflow: ellipsis;
    white-space: nowrap;
`
export const RightResult = styled.span`
    padding:0 9px;
    .normal{
        color: rgba(0,0,0,1);
        font-size: 14px;
   }
   .invalid{
        color: rgba(0,0,0,0.25);
        font-size: 14px;
   }
   .increase{
        font-size: 14px;
        color: #81BF84;
    }
    .decline{
        font-size: 14px;
        color: #C84C5A;
    }
`
export const CloseBtn = styled(CloseOutlined)`
    display:inline-block;
    position:absolute;
    right:20px;
    top:16px;
`
/* 
    测试数据  性能测试、功能测试公用title
*/
export const TestDataTitle = styled.div`
    height: 24px;
    width: 64px;
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: rgba(0,0,0,0.85);
    line-height: 24px;
    margin:16px 0;
`
/* 
    测试数据  性能测试、功能测试公用边框 wrapper
*/
export const TestWrapper = styled.div`
    border:1px solid rgba(0,0,0,0.1);
    border-radius:4px;
    border-top:2px solid #1890FF;
    //padding-bottom: 24px;
`
// 测试组 + 测试项
export const TestGroup = styled.div`
    height:47px;
    line-height:47px;
    padding-left:5px;
    background: rgba(0,0,0,0.02);
    position:relative;
`
interface IsGroup {
    isGroup: boolean
}
export const TestGroupItem = styled.div<IsGroup>`
    height: ${({ isGroup }) => isGroup ? '57px' : '47px'};
    line-height:${({ isGroup }) => isGroup ? '57px' : '47px'};
    padding-left:5px;
    background: ${({ isGroup }) => isGroup ? '#fff' : 'rgba(0,0,0,0.02)'};
    margin-bottom:${({ isGroup }) => isGroup ? '0px' : '17px'};
    position:relative;
`
/* 
    测试数据  性能测试、功能测试  single测试项
*/
export const TestItem = styled(TestGroup)`
    margin-bottom:17px;
`
export const TestItemText = styled.span`
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: rgba(0,0,0,0.85);
    margin-left:5px;
`
// 右侧功能
export const TestItemFunc = styled.span`
    display:inline-block;
    position:absolute;
    right:16px;
`

// suite wrapper
export const TestSuite = styled.div`
    height:auto;
    background:rgba(0,0,0,0.03);
    margin:0 16px 18px 16px;
    padding-bottom: 18px;
`
// suite title
export const SuiteName = styled.div`
    height:41px;
    line-height:41px;
    padding-left:16px;
    font-size:14px;
    font-family: PingFangSC-Medium;
    color:rgba(0,0,0,0.85);
    background:rgba(0,0,0,0.04);
    position:relative;
`
// suite conf
export const TestConf = styled.div`
    margin: 10px 0px 3px 0px;
    height:22px;
    padding: 0px 15px 0px 17px;
    display:flex;
`
const setTestConfWdith = (l: number) => {
    if (l == 1) {
        return '50%'
    } else {
        return '360px'
    }
}
const setTestNumWdith = (l: number, t: boolean) => {
    if (l == 1) {
        if (t) return 'calc( 50% - 39px )'
        else return '50%'
    } else {
        if (t) {
            return (`calc( (100% - 399px) / ${l})`)
        }
        return (`calc( (100% - 360px) / ${l})`)
    }
}

export const ConfTitle = styled.div<GroupRowProps>`
    //float:left;
    font-size:12px;
    color: rgba(0,0,0,0.45);
    width : ${({ gLen }) => setTestConfWdith(gLen)};
`
export const ConfData = styled.div<GroupRowProps>`
    //float:left;
    font-size:12px;
    color: rgba(0,0,0,0.45);
    width : ${({ gLen, btnState }) => setTestNumWdith(gLen, btnState)};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    &:last-child {
        border-right:none;
    }
`
export const TestConfWarpper = styled.div`
    margin: 0px 15px 0px 17px;
    /* border-top:1px solid rgba(0,0,0,0.10); */
`
interface Expand {
    expand: boolean
}

export const TestCase = styled.div<Expand>`
    height:40px;
    background:#fafafa;
    border: 1px solid rgba(0,0,0,0.10);
    border-right:none;
    border-top: none;
    /* &:first-child {
        border-top:1px solid rgba(0,0,0,0.10);
    } */
`
const CaseTextPulic = `
    float:left;
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color:rgba(0,0,0,0.85)
`
export const CaseTitle = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
    height:40px;
    line-height:40px;
    border-right: 1px solid rgba(0,0,0,0.10);
    ${CaseTextPulic}
    
`
export const CaseText = styled.div<GroupRowProps>`
    width : ${({ gLen, btnState }) => setTestNumWdith(gLen, btnState)};
    height:40px;
    line-height:40px;
    padding-left:16px;
    border-right: 1px solid rgba(0,0,0,0.10);
    ${CaseTextPulic}
`
// 自定义功能展开图标
export const ExpandIcon = styled(CaretRightOutlined)`
    cursor:pointer;
    padding:13px 0px 13px 8px;

`
export const TestSubCase = styled.div`
    height:38px;
    background:#fff;
    border: 1px solid rgba(0,0,0,0.10);
    border-top:none;
    border-right:none;
`
export const SubCaseTitle = styled(CaseTitle)`
    padding-left:36px;
    height:38px;
    line-height:38px;
    font-family: PingFangSC-Regular;
    color:rgba(0,0,0,0.65);
`
export const SubCaseText = styled(CaseText)`
    height:38px;
    line-height:38px;
   
`
// 性能
export const PrefData = styled.div`
    height:38px;
    line-height:38px;
    background:rgba(0,0,0,0.02);
`
const iconAlign = `
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`
interface Del {
    empty: boolean;
}
export const PrefDataDel = styled.div<Del>`
    width : 39px;
    float:left;
    border-right: 1px solid rgba(0,0,0,0.10);
    cursor:pointer;
    height: ${({ empty }) => empty ? '38px' : '40px'};
    position: relative;
    .remove{
        display:block;
        ${iconAlign}
    }
    .remove_active {
        display:none;
        ${iconAlign}
    }
    :hover {
        .remove_active {
            display:block;
            ${iconAlign}
        }
        .remove {
            display:none;
            ${iconAlign}
        }
    }
    
`
export const PrefDataTitle = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
    ${ConfTextPuilc}
`
export const PrefDataText = styled.div<GroupRowProps>`
    width : ${({ gLen, btnState }) => setTestNumWdith(gLen, btnState)};
    ${ConfTextPuilc}
`
export const PerfGroupTitle = styled(GroupTitle) <GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
     border-bottom:none;
`
export const PerfGroupData = styled(GroupData) <GroupRowProps>`
    width : ${({ gLen, btnState }) => setTestNumWdith(gLen, btnState)};
    display:flex;
    border-bottom:none;
    ${ConfTextPuilc}
`
export const PrefMetric = styled.div`
    height:38px;
    line-height:38px;
    background:#ffffff;
    border-bottom: 1px solid rgba(0,0,0,0.10);
    &:last-child{
        border-bottom:none;
    }
`
const MetricTextPuilc = `
    float:left;
    font-size:14px;
    color:rgba(0,0,0,0.65);
    font-family:PingFangSC-Regular;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`
export const MetricTitle = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
    padding-left:36px;
    border-right: 1px solid rgba(0,0,0,0.10);
    ${MetricTextPuilc}
`
export const MetricText = styled.div<GroupRowProps>`
    width : ${({ gLen, btnState }) => setTestNumWdith(gLen, btnState)};
    padding-left:16px;
    ${MetricTextPuilc}
    border-right: 1px solid rgba(0,0,0,0.10);
    &:last-child{
        border-right:none;
    }
`
