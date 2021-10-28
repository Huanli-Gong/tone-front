import styled from 'styled-components'
import { Row } from 'antd'


// 每个纵列容器
export const StepWrapper = styled.div`
    width: 398px;
    min-height: 100%;
    padding-right: 4px;
    display: inline-block;
    position: relative;
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
    padding-top: 0px;
    padding-right: 35px;
`

export const TemplateName = styled.div`
    line-height: 22px;
    margin-left: 7px;
`

export const TemplateContent = styled.div`
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 4px;
  padding: 12px;
  width: 100%;
  margin-top: 12px;
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