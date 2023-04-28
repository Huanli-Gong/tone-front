import styled from 'styled-components'
import { Row } from 'antd'
import { PlusCircleFilled, PlusOutlined, CloseOutlined } from '@ant-design/icons'

import { ReactComponent as DeleteIcon } from '@/assets/svg/TestPlan/delete.svg'
import { ReactComponent as GaryDeleteIcon } from '@/assets/svg/TestPlan/delete_icon.svg'
import { useState } from 'react'

export const PiplineContainer = styled(Row)`
    width : 100% ;
    height : 100% ;
    // padding-left : 180px ;
    overflow : auto ;
    // padding-right:160px;
    // white-space:nowrap;    
    flex-direction: column;
`

export const StepTips = styled(Row)`
    height:40px;
    line-height:40px;
    color : rgba(0,0,0,.65);
    text-align:left;
`

export const StepTitle = styled.div`
    height:40px;
    width:366px;
    position:relative;
`

export const StepTitleInput = styled.input`
    height: 40px;
    width: 366px;
    background: #FFFFFF;
    border: 2px solid rgba(24,144,255,0.45);
    border-radius: 20px;
    outline:none;
    padding-left : 1em;
    padding-right:1em;
    font-size:16px;
    color : rgba(0,0,0,.65);
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
`

export const LineStyle = `
    height:2px;
    position:absolute;
    top:50%;
    background:#CECECE;
`
export const StepOptionLeft = styled.div`
    ${LineStyle};
    width:20px;
    left:-20px;
`

export const StepOptionRight = styled.div`
    ${LineStyle};
    width:32px;
    right : -32px;
`

export const addBtnStyle = `
    position:absolute;
    color:#1890FF;
    cursor:pointer;
    background:#fff;
    border-radius:50%;
`

export const StepPreAddBtn = styled(PlusCircleFilled)`
    ${addBtnStyle}
    top : 50%;
    left : -5px;
    transform:translate(-50% , -7px);
`

export const StepNextAddBtn = styled(PlusCircleFilled)`
    ${addBtnStyle}
    top : 50%;
    right : -20px;
    transform:translate(-50% , -7px);
`

const IconWrapper = styled.span`
    display:flex;
    justify-content:center;
    align-items : center;
    width: 14.3px;
    cursor:pointer;
    height:15.4px;
`

const DeleteIconRed = styled(DeleteIcon)`
    visibility:hidden;
`

const DeleteIconGary = styled(GaryDeleteIcon)`
    visibility:hidden;
`

export const StepDeleteIcon = (props: any) => {
    const [hover, setHover] = useState(false)

    const handleOver = () => {
        setHover(true)
    }
    const handleOut = () => {
        setHover(false)
    }

    return (
        <IconWrapper {...props} onMouseEnter={handleOver} onMouseLeave={handleOut}>
            {
                hover ?
                    <DeleteIconRed /> :
                    <DeleteIconGary />
            }
        </IconWrapper>
    )
}


export const StartPiplineWrapper = styled.div`
    width:166px;
    height:100%;
    // background:#CECECE;
    text-align:center;
    display:inline-block;
    position:relative;
`

export const StartStepCircle = styled.div`
    height: 12px;
    width: 12px;
    background: #CECECE;
    border-radius: 24px;
    margin : 55px auto 16px;
`

export const StepStartWord = styled.div`
    font-size: 16px;
    color:rgba(0,0,0,.65);
`

export const StartLine = styled.div`
    width: 75px;
    height: 2px;
    background: #CECECE;
    position: absolute;
    left: 50%;
    top: 60px;
`

export const StepEmptyCircle = styled.div`
    height: 12px;
    width: 12px;
    background: #FFFFFF;
    border: 1px solid #649FF6;
    border-radius: 24px;
    margin-top:-5px;
`

export const StepUnEmptyCircle = styled(StepEmptyCircle)`
    background:#1890FF;
`

export const PlusMnueIcon = styled(PlusOutlined)`
    color : #1890FF;
`

export const ChildrenStepWrapper = styled.div`
    width : 100%;
    padding-top:13px;
    overflow:hidden;
`

export const AddTemplateItem = styled.div`
    height: 46px;
    width: 316px;
    background: rgba(0,0,0,0.04);
    border-radius: 4px;
    display:flex;
    align-items:center;
    cursor:pointer;
    padding-left: 20px;
    flex-wrap:no-wrap;
`

export const ChildAddItem = styled.div`
    width : 100%;
    height : 64px;
    padding-left:40px;
    position:relative;
    padding-top: 18px;
    visibility:hidden;
`

export const ChildAddIcon = styled(PlusCircleFilled)`
    ${addBtnStyle}
    position: relative;
    margin-right:8px;
    margin-left:14px;
`

export const ArrowDashedBlue = styled.div`
    width : 28px;
    height: 73px;
    border-left : 2px dashed #1890FF;
    border-bottom:2px dashed #1890FF;
    border-top : transparent;
    border-right:transparent;
    border-radius: 0 15px;
    display: inline-block;
    position:absolute;
    left: 25px;
    top: -31px;
    z-index:0;
    &::after {
        content:'';
        width: 0px;
        height: 0px;
        display: inline-block;
        border-left: 5px solid #1890FF;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 5px solid transparent;
        position:absolute;
        right:-10px;
        bottom:-6px;
    }
`

interface ArrowProps {
    type?: any
}

export const ArrowSolidGery = styled.div<ArrowProps>`
    width: 30px;
    height: ${({ type }) => type === 'env' ? '98px' : '109px'};
    border-left: 2px solid #CECECE;
    border-bottom: 2px solid #CECECE;
    border-top: transparent;
    border-right: transparent;
    border-radius: 0 15px;
    display: inline-block;
    position: absolute;
    left: 25px;
    top: ${({ type }) => type === 'env' ? '-81px' : '-84px'}; 
    &::after {
        content:'';
        width: 0px;
        height: 0px;
        display: inline-block;
        border-left: 5px solid #CECECE;
        border-top: 5px solid transparent;
        border-bottom: 5px solid transparent;
        border-right: 5px solid transparent;
        position:absolute;
        right:-10px;bottom:-6px;
    }
`

export const TemplateItem = styled.div`
    width : 100%;
    height : 46px;
    line-height:46px;
    text-align:left;
    display:flex;
    // margin-top: 13px;
    padding-left:12px;
    position:relative;
    cursor:pointer;
`

export const DeleteTemplateIcon = styled(CloseOutlined)`
    width:16px;
    height:16px;
    position:absolute;
    right: 15px;
    top: 16px;
    visibility:hidden;
`
export const TemplatesChildrenWrapper = styled.div`
    width:100%;
    position:relative;
    padding-left : 49px;
    // transform: translate(0px, -5px);
    // padding-top:13px;
    :hover {
        ${TemplateItem} {
            background: rgba(0,0,0,0.04);
            border-radius: 4px;
            color: #1890FF;
        }
        ${DeleteTemplateIcon} {
            visibility:visible;
        }
    }
`

export const TemplateIndex = styled.div`
    width:20px;
    height:20px;
    border-radius:50%;
    background:rgb(24,144,255 , .1);
    color:rgb(24,144,255);
    text-align:center;
    line-height:20px;
    margin-top:13px;
    // margin-top:6px;
    margin-right:10px;
`

export const TemplateName = styled.div`
    width:calc(100% - 30px);
`

interface LeftLineProp {
    index: number
}

export const WrapperLeftLine = styled.div<LeftLineProp>`
    width:2px;
    height:${props => props.index * 30}px;
`

export const StepWrapper = styled.div`
    width : 398px;
    min-height : 100%;
    padding : 0 10px;
    text-align:center;
    margin-right: 31px;
    display:inline-block;
    position:relative;
    &:hover {
        background: #FAFAFA;
        ${DeleteIconRed} , 
        ${ChildAddItem} ,
        ${DeleteIconGary} {
            visibility:visible;
        }
    }
    &:last-child{
        margin-right:160px
    }
`

export const ServerTitle = styled.div`
    color:rgba(0,0,0,.85);
    font-weight:600;
`

export const ServerScript = styled.div`
    color:rgba(0,0,0,.65);
    word-break: break-all;
    width:100%;
    max-height:45px;
    overflow: scroll;
`

export const ServerIndex = styled.div`
    position:absolute;
    left : 10px;
    top : 7px ;
    width:20px;
    height:20px;
    border-radius:50%;
    background:rgb(24,144,255 , .1);
    color:rgb(24,144,255);
    text-align:center;
`

export const ServerDeleteIcon = styled(CloseOutlined)`
    position : absolute;
    right:10px;
    top:10px;
    cursor:pointer;
    visibility:hidden;
`
export const ServerItem = styled.div`
    width: 310px;
    position: relative;
    text-align: left;
    padding-left: 40px;
    padding-top:8px;
    padding-right:35px;
    padding-bottom:8px;
    &:hover {
        background: rgba(0,0,0,0.04);
        border-radius: 4px;
        ${ServerTitle} , 
        ${ServerScript} { color: #1890FF; }
        ${ServerDeleteIcon} { visibility: visible; }
    }
`

export const ScriptChildrenWrapper = styled.div`
    width: 100%;
    padding-left: 55px;
    cursor:pointer;
    // padding-top: 18px;
    position: relative;
`

export const ServerChildAddItem = styled(ChildAddItem)`
    padding-left: 50px;
    cursor:pointer;
    ${ArrowDashedBlue} {
        width: 28px;
        height: 126px;
        border-left: 2px dashed #1890FF;
        border-bottom: 2px dashed #1890FF;
        border-top: transparent;
        border-right: transparent;
        border-radius: 0 15px;
        display: inline-block;
        position: absolute;
        left: 25px;
        top: -84px;
        z-index: 0;
    }
    ${AddTemplateItem} { padding-left : 0 ;}
`