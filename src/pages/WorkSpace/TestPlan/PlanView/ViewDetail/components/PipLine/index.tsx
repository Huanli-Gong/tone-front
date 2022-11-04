import React , { useCallback , useRef } from 'react'
import { Breadcrumb , Row , Typography , Space, Button, Dropdown, Menu, Tooltip } from 'antd'
import styled from 'styled-components'
import { FormattedMessage } from 'umi'
import { getColorByState } from '@/utils/utils'
import { 
    PipLineStart, StartStepBorder, StepCircle, StartStepWord,
    ArrowSingleBlue,
    PipLineEnd, PipLineEndCircle, EndStepWord, StepTitle, StepEmptyCircle,
} from './styled'
import PipLineItemBuild from './PipLineItemBuild'
import PipLineItemPrepare from './PipLineItemPrepare'
import PipLineItemStep from './PipLineItemStep'

const PipLine = ( props : any ) => {
    const { data, prepareCallback = ()=> {}, ws_id } = props
    const { state, build_pkg_info={}, build_result, prepare_result, test_result= [] } = data
    // 测试准备阶段
    const { name = "" } = prepare_result || {}
    // 主流程状态
    const mainEndFlag = ['success', 'fail'].indexOf(state) > -1
    const mainColor = mainEndFlag ? '#1890FF' : '#CECECE'

    return (
      <>
        {/** 开始 */}
        <PipLineStart>
            <StartStepBorder>
              <StepCircle />
              <ArrowSingleBlue />
            </StartStepBorder>
            <StartStepWord><FormattedMessage id="plan.start" /></StartStepWord>
        </PipLineStart>

        {/** Build阶段 */}
        <PipLineItemBuild data={build_result || build_pkg_info}  mainStatus={mainEndFlag} />

        {/** 准备阶段 */}
        {!!name && ( <PipLineItemPrepare data={prepare_result} callback={prepareCallback}  mainStatus={mainEndFlag}/> )}

        {/** 测试阶段, .... */}
        {test_result?.map((item: any, index: any): any => {
          return <PipLineItemStep key={index} data={item} ws_id={ws_id} mainStatus={mainEndFlag}/>
        })}

        {/** 结束 */}
        <PipLineEnd>
          <StepTitle>
            <div style={{ marginTop: 20}}>
              {mainEndFlag ? (
                  <PipLineEndCircle style={{ color: mainColor }}/>
                ) : (
                  <StepEmptyCircle style={{ background: mainColor, border: `1px solid ${mainColor}`}} /> 
                )
              }
            </div>
          </StepTitle>
          <EndStepWord><FormattedMessage id="plan.end" /></EndStepWord>
        </PipLineEnd>
      </>
    )
}

export default PipLine