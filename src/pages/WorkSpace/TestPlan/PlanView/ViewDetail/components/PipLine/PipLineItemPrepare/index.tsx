import { getColorByState, getStepColorByState } from '@/utils/utils'
import { ReactComponent as ConsoleIcon } from '@/assets/svg/TestPlan/PlanView/consoleIcon.svg'
import { IconByState, ArrowSolid, TemplateItem } from '../modules'
import {
  StepWrapper,
  StepTitle,
  StepTitleInput, StepOptionRight, StepEmptyCircle, ArrowSingle,
  TemplatesChildrenWrapper,
  TemplateTop, TemplateBottom, TemplateName, TemplateCodeBtn,
} from './styled'
import PopoverEllipsis from './PopoverEllipsis'

/**
 *  准备阶段组件
 */
const Index = (props: any) => {
  const { data, mainStatus, } = props
  const { name = '', stage_state, machine_info = [] } = data || {}
  // 根据准备阶段的状态
  // case1. 判断Input框的颜色
  const resultColor = getColorByState(stage_state, null)
  // case2. 判断Step横向箭头的颜色
  const stepColor = getStepColorByState(stage_state)
  // case3. (优先判断)主流程线颜色
  const mainStepColor = mainStatus ? '#1890FF' : stepColor
  // case3.2 判断状态图标
  const mainIconStatus = (state: any) => {
    return (mainStatus && state === 'pending') ? 'stop' : state
  }
  const templateCodeBtnClick = (result: any) => {
    if (typeof result === 'string') {
      props.callback({ data: result })
    }
  }

  return (
    <>
      <StepWrapper>
        <StepTitle>
          <StepTitleInput style={{ border: `2px solid ${resultColor}` }}>
            {/** 判断图标 */}
            <IconByState params={mainIconStatus(stage_state)} />
            <TemplateName>{name}</TemplateName>
          </StepTitleInput>
          {/** 判断主横线颜色 */}
          <StepOptionRight style={{ background: mainStepColor }}>
            <StepEmptyCircle style={{ background: stepColor, border: `1px solid ${stepColor}` }} />
            {/** 判断箭头颜色 */}
            <ArrowSingle style={{ borderLeft: `5px solid ${mainStepColor}` }} />
          </StepOptionRight>
        </StepTitle>

        <TemplatesChildrenWrapper>
          {machine_info.map((item: any, i: any) => (
            <TemplateItem key={item.tmpl_id || i} borderColor={stepColor}>
              <TemplateTop>
                {/** 判断颜色 */}
                <ArrowSolid borderColor={stepColor} />
                <div style={{ display: 'flex', alignItems: 'center', margin: '-2px 0 0 8px' }}>
                  {/** 判断图标 */}
                  <IconByState params={mainIconStatus(item.state)} />
                  <TemplateName>{item.machine}</TemplateName>
                  {!!(item.result && typeof item.result === 'string') && (
                    <TemplateCodeBtn onClick={() => templateCodeBtnClick(item.result)}>
                      <ConsoleIcon />
                    </TemplateCodeBtn>
                  )}
                </div>
              </TemplateTop>

              <TemplateBottom>
                <PopoverEllipsis title={item.script} />
              </TemplateBottom>
            </TemplateItem>
          ))}
        </TemplatesChildrenWrapper>
      </StepWrapper>
    </>
  )
}

export default Index