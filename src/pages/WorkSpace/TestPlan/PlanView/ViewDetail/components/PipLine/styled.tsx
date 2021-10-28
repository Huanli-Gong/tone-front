import styled from 'styled-components'
import { CheckCircleOutlined } from '@ant-design/icons'

export const StepTitle = styled.div`
    height: 38px;
    width: 100%;
    display: flex;
    position: relative;
`

export const StepCircle = styled.div`
    height: 12px;
    width: 12px;
    background: #1890FF; //#CECECE;
    border-radius: 24px;
    margin-top: -5px;
`

// 小球：Blue
export const StepEmptyCircleBlue = styled.div`
    height: 12px;
    width: 12px;
    background: #1890FF;
    border: 1px solid #1890FF;
    border-radius: 24px;
    margin-top: -5px;
`
// 小球：Grey
export const StepEmptyCircle = styled.div`
    height: 12px;
    width: 12px;
    background: #CECECE;
    border: 1px solid #CECECE;
    border-radius: 24px;
    margin-top: -5px;
`

// 独立小箭头：Blue
export const ArrowSingleBlue = styled.div`
  width: 0px;
  height: 0px;
  display: inline-block;
  border-left: 5px solid #1890FF;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-right: 5px solid transparent;
  margin-top: -4px;
  margin-right: -8px;
`

// 开始纵列容器
export const PipLineStart = styled.div`
  padding-left: 67px;
  padding-right: 4px;
  height: 100%;
`
// Border弹性容器
export const  StartStepBorder = styled.div`
  margin-top: 20px;
  width: 77px;
  height: 2px;
  background: #1890FF;
  display: flex;
  justify-content: space-between;
`

// 开始文本
export const  StartStepWord = styled.div`
    font-size: 16px;
    color: rgba(0,0,0,.65);
    margin-top: 16px;
    margin-left: -12px;
`


// 结束
export const PipLineEnd = styled.div`
  padding-right: 67px;
`
// 结束小对号
export const PipLineEndCircle = styled(CheckCircleOutlined)`
  color:#1890FF;
  cursor:pointer;
  background:#fff;
  border-radius:50%;
  font-size: 12px;
  //
  position:absolute;
  top : 50%;
  left : 6px;
  transform:translate(-50% , -4px);
`

export const EndStepWord = styled.div`
  width: 50px;
  margin-left: -6px;
  opacity: 0.65;
  font-family: PingFangSC-Medium;
  font-size: 16px;
`

interface LeftLineProp {
    index : number
}

export const WrapperLeftLine = styled.div<LeftLineProp>`
    width:2px;
    height:${ props => props.index * 30 }px;
`