import React , { useCallback , useRef } from 'react'
import { Breadcrumb , Row , Typography , Space, Button, Dropdown, Menu, Tooltip } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import { getColorByState, getStepColorByState, isUrl} from '@/utils/utils'
import { IconByState, ArrowSolid, TemplateItem }from '../modules'
import {
    StepWrapper,
    StepTitle,
    StepTitleInput , StepOptionRight, StepEmptyCircle, ArrowSingle,
    TemplatesChildrenWrapper,
    TemplateContent, TemplateName,
} from './styled'
import styles from './index.less'

/**
 *  build阶段
 */
const Index = ( props : any ) => {
  const { formatMessage } = useIntl()
    const { data, mainStatus } = props
    const { state } = data || {}
    // 根据阶段状态
    // case1. 判断Input框的颜色
    const resultColor = getColorByState(state, null)
    // case2. 判断Step横向箭头的颜色
    const stepColor = getStepColorByState(state)
    // case3.1 (优先判断)主流程线颜色
    const mainStepColor = mainStatus ? '#1890FF' : stepColor
    // case3.2 判断状态图标
    const mainIconStatus = (mainStatus && state === 'pending' ) ? 'stop' : state
    // console.log('mainStepColor:', mainIconStatus, state);

    // case4. 判断内容区样式
    const contentStyle = ((params) => {
      if (params === 'pending') return { display: 'none' }
      if (params === 'running' || params === 'success') return {}
      if (params === 'fail') return { background: 'rgba(245,34,45,0.05)', border: '1px solid rgba(245,34,45,0.45)' }
      return {}
    })(state)

    const ItemRow = ({label, text, type }: any) => {
      return (
        <div className={styles.ItemRow}>
          <div className={styles.label}>{label}</div>
          <div className={`${styles.text} ${styles[type]}`}>
            {isUrl(text) ? (<a target="__blank" href={text}>{text}</a>) : text}
          </div>
        </div>
      )
    }
    
    return (
      <>
        {data && Object.keys(data).length ?
          <StepWrapper>
              <StepTitle>
                  <StepTitleInput style={{ border: `2px solid ${resultColor}` }}>
                    {/** 判断图标 */}
                    <IconByState params={mainIconStatus} />

                    <TemplateName>
                      <FormattedMessage id="plan.build.stage"/>
                    </TemplateName>
                  </StepTitleInput>
                  {/** 判断主横颜色 */}
                  <StepOptionRight style={{ background: mainStepColor }}>
                    <StepEmptyCircle style={{ background: stepColor, border: `1px solid ${stepColor}` }}/>
                    {/** 判断箭头颜色 */}
                    <ArrowSingle style={{ borderLeft: `5px solid ${mainStepColor}` }}/>
                  </StepOptionRight>
              </StepTitle>

              <TemplatesChildrenWrapper>
                <TemplateContent style={contentStyle}>
                  {state !== 'fail' ? (
                    <>
                      {!!data.build_url && <ItemRow label={formatMessage({ id: 'plan.build.detail'}) } text={data.build_url} />}
                      {data.rpm_list?.map((item: string, index: number)=> {
                        const label = [
                          formatMessage({ id: 'plan.kernel.pkg'}), 
                          formatMessage({ id: 'plan.devel'}), 
                          formatMessage({ id: 'plan.headers'})][index]
                        return <ItemRow label={label} text={item} key={index}/>
                      })}
                    </>
                  ) : (
                    data.build_log
                  )}

                  {!!data.code_repo && (
                    <ItemRow label={formatMessage({ id: 'plan.code_repo'}) } text={data.code_repo} />
                  )}
                </TemplateContent>
              </TemplatesChildrenWrapper>
          </StepWrapper>
          : null
        }
      </>
    )
}

export default Index