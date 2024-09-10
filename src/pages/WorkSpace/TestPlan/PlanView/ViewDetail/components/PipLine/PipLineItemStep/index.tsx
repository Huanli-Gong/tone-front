import { useState } from 'react'
import { history } from 'umi';
import { Popover } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons';
import { getColorByState, getStepColorByState } from '@/utils/utils'
import { IconByState, ArrowSolid, TemplateItem } from '../modules'
import {
  StepWrapper,
  StepTitle,
  StepTitleInput, StepOptionRight, StepEmptyCircle, ArrowSingle,
  TemplatesChildrenWrapper,
  TemplateTop, ItemResult, TemplateBottom, TemplateName,
} from './styled'

/**
 *  测试阶段
 */
const PipLineItemGrey = (props: any) => {
  const { ws_id, data, mainStatus } = props
  const [mouseEnter, setMouseEnter] = useState({ rowId: '' })

  // 测试准备结果
  const { name = '', stage_state, impact_next, template_result = [] } = data || {}
  // 根据测试阶段的状态
  // case1. 判断Input框的颜色
  const resultColor = getColorByState(stage_state, null)
  // case2. 判断Step横向箭头的颜色
  const stepColor = getStepColorByState(stage_state)
  // case3. (优先判断)主流程线颜色
  const mainStepColor = mainStatus ? '#1890FF' : stepColor;
  // console.log('mainStepColor:', mainStepColor);

  // 跳转
  const handleClick = (item: any) => {
    if (item.job_id) {
      history.push(`/ws/${ws_id}/test_result/${item.job_id}`)
    }
  }

  const colorStyle = (itemId: any, mouseEnterId: any) => {
    return itemId === mouseEnterId ? { color: '#1890FF', opacity: 1, cursor: 'pointer' } : { color: '#000', opacity: 0.45, cursor: 'none' }
  }
  return (
    <>
      <StepWrapper>
        <StepTitle>
          {/** 判断边框颜色 */}
          <StepTitleInput style={{ border: `2px solid ${resultColor}` }}>
            {/** 判断图标 */}
            <IconByState params={stage_state} />
            <TemplateName>{name}</TemplateName>
          </StepTitleInput>
          {/** 判断主横线颜色 */}
          <StepOptionRight style={{ background: mainStepColor }}>
            <StepEmptyCircle style={{ background: impact_next ? '#fff' : stepColor, border: `1px solid ${stepColor}` }} />
            {/** 判断箭头颜色 */}
            <ArrowSingle style={{ borderLeft: `5px solid ${mainStepColor}` }} />
          </StepOptionRight>
        </StepTitle>

        <TemplatesChildrenWrapper>
          {template_result.map((item: any, index: any) => {
            // 判断颜色
            const itemColor = getColorByState(item.job_state, stage_state)
            const itemIcon = stage_state === 'stop' ? 'stop' : item.job_state
            const { total, pass, fail } = JSON.parse(item.job_result) || {}
            return (
              <TemplateItem key={item.tmpl_id} borderColor={stepColor}>
                <TemplateTop>
                  {/** 判断箭头颜色 */}
                  <ArrowSolid borderColor={stepColor} />
                  {/** 判断边框颜色 */}
                  <ItemResult style={{ border: `1px solid ${itemColor}` }}>
                    <div style={{ marginLeft: -1, height: 24 }}>
                      {/** 判断图标 */}
                      <IconByState params={itemIcon} />
                    </div>
                    <div style={{ padding: '0 4px' }}>
                      <span style={{ color: '#649FF6', padding: '0 8px' }}>{total || '-'}</span>
                      <span style={{ color: '#39C15B', padding: '0 8px' }}>{pass || '-'}</span>
                      <span style={{ color: '#C84C5A', padding: '0 8px' }}>{fail || '-'}</span>
                    </div>
                  </ItemResult>
                  {item.job_state_desc ?
                    <Popover
                      placement="top"
                      content={item.job_state_desc}
                      arrowPointAtCenter
                      overlayStyle={{ wordBreak: 'break-all', maxWidth: '400px' }}
                      >
                      <QuestionCircleOutlined style={{ color:'rgba(0, 0, 0, 0.6)', marginLeft:'5px',paddingTop:'2px' }} />
                    </Popover>
                    : null
                  }
                </TemplateTop>
                <TemplateBottom>
                  <TemplateName>
                    {item.job_name ?
                      <span
                        style={colorStyle(index, mouseEnter.rowId)}
                        onMouseEnter={() => setMouseEnter({ rowId: index })}
                        onMouseLeave={() => setMouseEnter({ rowId: '' })}
                        onClick={() => handleClick(item)} >{item.job_name}</span>
                      :
                      <span style={{ opacity: 0.45 }}>{item.tmpl_name}</span>}
                  </TemplateName>
                </TemplateBottom>
              </TemplateItem>
            )
          }
          )}
        </TemplatesChildrenWrapper>
      </StepWrapper>
    </>
  )
}

export default PipLineItemGrey