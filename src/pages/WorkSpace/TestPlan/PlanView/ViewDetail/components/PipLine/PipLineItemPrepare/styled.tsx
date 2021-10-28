import styled from 'styled-components'
import { Row } from 'antd'
import { PlusCircleFilled , PlusOutlined } from '@ant-design/icons'
import { ReactComponent as DeleteIcon } from '@/assets/svg/TestPlan/delete.svg'


// 每个纵列容器
export const StepWrapper = styled.div`
    width: 398px;
    min-height: 100%;
    padding-right: 4px;
    display: inline-block;
    position: relative;
    // &:hover {
    //     background: #FAFAFA;
    // }
`


export const StepTitle = styled.div`
    height: 40px;
    width: 100%;
    position: relative;
    display: flex;
`

export const StepTitleInput = styled.div`
    height: 40px;
    width: 130px;
    background: #FFFFFF;
    border: 2px solid #1890FF;
    border-radius: 20px;
    outline:none;
    padding: 0 4px;
    font-size:16px;
    color: rgba(0,0,0,.65);
    //
    display: flex;
    align-items: center;
`

export const LineStyle = `
    height:2px;
    position:absolute;
    top:50%;
    background:#CECECE;
`
export const StepOptionLeft = styled.div`
    ${ LineStyle }
    width:20px;
    left:-20px
`

export const StepOptionRight = styled.div`
    flex: 1;
    height: 2px;
    margin-top: 20px;
    background: #CECECE;
    display: flex;
    justify-content: space-between;
`
// 小球
export const StepEmptyCircle = styled.div`
    height: 12px;
    width: 12px;
    background: #CECECE;
    border: 1px solid #CECECE;
    border-radius: 24px;
    margin-top: -5px;
`
// 独立小箭头
export const ArrowSingle = styled.div`
  width: 0px;
  height: 0px;
  display: inline-block;
  border-left: 5px solid #CECECE;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid transparent;
  margin-top: -4px;
  margin-right: -8px;
`

// 
export const TemplatesChildrenWrapper = styled.div`
    width: 100%;
    padding-left: 24px;
    padding-top: 0px;
`

export const TemplateTop = styled.div`
   display: flex;
   margin-left: -2px;
`
export const TemplateName = styled.div`
    line-height: 22px;
    margin-left: 7px;
`
export const TemplateCodeBtn = styled.div`
    width: 14px;
    height: 14px;
    margin-left: 4px;
    margin-top: -4px;
    cursor: pointer;
`

export const TemplateBottom = styled.div`
   width: 264px;
   margin-left: 35px;
   margin-top: 5px;
   opacity: 0.45;
   font-family: PingFangSC-Regular;
   font-size: 14px;
   color: #000;
   line-height: 22px;
   // 多行文本省略
   overflow: hidden; 
   text-overflow: ellipsis; 
   display: -webkit-box;
   -webkit-line-clamp: 2;
   -webkit-box-orient: vertical;
`

interface LeftLineProp {
    index : number
}

export const WrapperLeftLine = styled.div<LeftLineProp>`
    width:2px;
    height:${ props => props.index * 30 }px;
`