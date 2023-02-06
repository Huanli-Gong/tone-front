import styled from 'styled-components';
import { Row, Typography } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

export const BASIC_TITLE_WIDTH = 360;

export const MyLoading = styled.div`
    position:fixed;
    left:50%;
    top:50%;
    z-index:999;
    transform: translate(-50%,-50%);
    cursor:pointer;
    font-size:14px;
    .my-loading-span {
        position: relative;
        display: inline-block;
        font-size: 32px;
        width: 1em;
        height: 1em;
        transform: rotateZ(45deg);
        transition: transform .3s cubic-bezier(.78, .14, .15, .86);
        animation: Rotate45 1.2s infinite linear;
    }
    .my-loading-span > i {
        height: 14px;
        width: 14px;
        background-color: #1890ff;
        display: block;
        position: absolute;
        border-radius: 100%;
        transform: scale(.75);
        transform-origin: 50% 50%;
        opacity: .3;
        animation: myAnimationMove 1s infinite linear alternate;
    }
    .my-loading-span:nth-child(1) {
        top: 0;
        left: 0;
    }
    .my-loading-span :nth-child(2) {
        top: 0;
        right: 0;
        animation-delay: .4s;
    }
    .my-loading-span :nth-child(3) {
        bottom: 0;
        right: 0;
        animation-delay: .8s;
    }
    .my-loading-span :nth-child(4) {
        left: 0;
        bottom: 0;
        animation-delay: 1.2s;
    }
    @keyframes Rotate45 {
        to {
        transform: rotate(405deg);
        }
    };
    @keyframes myAnimationMove {
        to {
            opacity: 1;
        }
    }
`
export const AnalysisWarpper = styled(Row)`
    margin:0 auto !important;
    height:100%;   
    padding:0 20px;
`
export const ResultTitle = styled.div`
    height:74px;
    line-height:74px;
    .btn{
        display:inline-block;
        float:right;
    }
`
// 右侧功能
export const TestItemFunc = styled.span`
    float: right;
    padding-top: 12px;
`
export const TypographyText = styled(Typography.Text)`
    font-size:32px;
    font-family: PingFangSC-Semibold;
    color:rgba(0,0,0,0.85);
`
export const ResultContent = styled.div`
    overflow-x:scroll;
`
export const ModuleWrapper = styled.div`
    background:#fff;
    padding:16px 20px;
    margin-bottom:16px;
`
export const Summary = styled.div`
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
interface GroupRowProps {
    gLen: number,   /* group数量 */
    enLocale?: boolean,
}
interface EnvGroupLProps {
    enLocale?: boolean,
}

const setEnvGroupWdith = (l: number, enLocale: boolean) => {
    if (l == 1) return (`calc( 100% - ${110}px )`)
    return (`calc((100% - ${110}px) / ${l})`)
}

export const EnvGroupL = styled.div<EnvGroupLProps>`
    width: ${110}px;
    float:left;
    padding-left:16px;
    border-right:1px solid rgba(0,0,0,0.10);
`
export const EnvGroupR = styled.div<GroupRowProps>`
    width: ${({ gLen, enLocale }: any) => setEnvGroupWdith(gLen, enLocale)};
    display:flex;
    padding-left:13px;
    border-right:1px solid rgba(0,0,0,0.10);
`

// 功能测试数据
export const TestDataTitle = styled.div`
    height: 24px;
    width: 64px;
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: rgba(0,0,0,0.85);
    line-height: 24px;
    margin:16px 0;
`
export const TestWrapper = styled.div`
    border:1px solid rgba(0,0,0,0.1);
    border-radius:4px;
`
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
// 测试数据对比组信息
const ConfTextPuilc = `
    float:left;
    font-size:14px;
    padding-left:16px;
    color:rgba(0,0,0,0.85);
    font-family: PingFangSC-Medium;
`
const setTestConfWdith = (l: number) => {
    if (l == 1) {
        return '50%'
    } else {
        return `${BASIC_TITLE_WIDTH}px`
    }
}
const setTestNumWdith = (l: number,) => {
    if (l == 1) {
        return '50%'
    } else {
        return (`calc((100% - ${BASIC_TITLE_WIDTH}px) / ${l})`)
    }
}
export const Group = styled.div`
    height:48px;
    display:flex;
    //border:1px solid rgba(0,0,0,0.10);
`
export const PerfGroupTitle = styled.div <GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
    border-right:1px solid rgba(0,0,0,0.10);
    border-bottom:none;
    line-height:48px; 
    float:left;
    padding-left:16px;
    font-family: PingFangSC-Medium;
    font-size: 14px;
    color: #000000;
`
export const PerfGroupData = styled.div <GroupRowProps>`
    width : ${({ gLen }) => setTestNumWdith(gLen)};
    display:flex;
    border-bottom:none;
    ${ConfTextPuilc}
    &:last-child {
        border-right:none;
    }
    line-height:48px; 
    font-family: PingFangSC-Medium;
    border-right:1px solid rgba(0,0,0,0.10);
`
export const TestSuite = styled.div`
    height:auto;
    background:rgba(0,0,0,0.03);
    // margin:0 16px 18px 16px;
    padding-bottom: 18px;
`
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
export const TestConfWarpper = styled.div`
    margin: 0px 15px 0px 17px;
`
export const TestConf = styled.div`
    margin: 10px 0px 3px 0px;
    height:22px;
    padding-left:16px;
`
export const ConfTitle = styled.div<GroupRowProps>`
    float:left;
    font-size:12px;
    color: rgba(0,0,0,0.45);
    width : ${({ gLen }) => setTestConfWdith(gLen)};
`
export const ConfData = styled.div<GroupRowProps>`
    float:left;
    font-size:12px;
    color: rgba(0,0,0,0.45);
    width : ${({ gLen }) => setTestNumWdith(gLen)};
    //overflow: hidden;
    white-space: nowrap;
    //text-overflow: ellipsis;
    &:last-child {
        border-right:none;
    }
`
export const RightResult = styled.span`
    //display:inline-block;
    float:right;
    padding-right:9px;

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
export const PrefData = styled.div`
    height:38px;
    line-height:38px;
    background:rgba(0,0,0,0.02);
`
export const PrefDataTitle = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
    ${ConfTextPuilc}
`
export const PrefDataText = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestNumWdith(gLen)};
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
`
export const MetricTitle = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestConfWdith(gLen)};
    padding-left:36px;
    white-space: nowrap;
    border-right: 1px solid rgba(0,0,0,0.10);
    ${MetricTextPuilc}
`
export const MetricText = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestNumWdith(gLen)};
    padding-left:16px;
    ${MetricTextPuilc}
    white-space: nowrap;
    border-right: 1px solid rgba(0,0,0,0.10);
    &:last-child{
        border-right:none;
    }
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
    &:first-child {
        border-top:1px solid rgba(0,0,0,0.10);
    }
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
export const SubCaseTitle = styled(CaseTitle)`
    padding-left:36px;
    height:38px;
    line-height:38px;
    font-family: PingFangSC-Regular;
    color:rgba(0,0,0,0.65);
`
export const TestSubCase = styled.div`
    height:38px;
    background:#fff;
    border: 1px solid rgba(0,0,0,0.10);
    border-top:none;
    border-right:none;
`
export const CaseText = styled.div<GroupRowProps>`
    width : ${({ gLen }) => setTestNumWdith(gLen)};
    height:40px;
    line-height:40px;
    padding-left:16px;
    border-right: 1px solid rgba(0,0,0,0.10);
    ${CaseTextPulic}
`
export const SubCaseText = styled(CaseText)`
    height:38px;
    line-height:38px;
`
// 自定义功能展开图标
export const ExpandIcon = styled(CaretRightOutlined)`
    cursor:pointer;
    padding:13px 0px 13px 8px;

`