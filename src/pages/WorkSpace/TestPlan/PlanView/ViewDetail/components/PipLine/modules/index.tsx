import { ReactComponent as Minus } from '@/assets/svg/TestPlan/PlanView/minus.svg'
import { ReactComponent as Complete } from '@/assets/svg/TestPlan/PlanView/complete.svg'
import { ReactComponent as Fail } from '@/assets/svg/TestPlan/PlanView/fail.svg'
import { ReactComponent as Pending } from '@/assets/svg/TestPlan/PlanView/pending.svg'
import { ReactComponent as Running } from '@/assets/svg/TestPlan/PlanView/running.svg'
import styles from './index.less'

const IconByState = ({ params = '' }) => {
  /** pipLine图标：根据状态匹配 */
  if (params === 'pending') return <Pending style={{ color: '#CECECE', fontSize: 26 }} />
  if (params === 'running') return <Running style={{ color: '#CECECE', fontSize: 26 }} />
  if (params === 'success') return <Complete style={{ color: '#81BF84', fontSize: 26 }} />
  if (params === 'fail') return <Fail style={{ color: '#C84C5A', fontSize: 26 }} />
  if (params === 'stop') return <Minus style={{ color: '#CECECE', fontSize: 26 }} />
  return <Minus style={{ color: '#CECECE', fontSize: 26 }} />
};

/** pipLine箭头颜色 */
const ArrowSolid = ({ borderColor = '#CECECE' }) => {
  return <div className={styles[`${borderColor === '#1890FF' ? 'ArrowSolidBlue' : 'ArrowSolidGrey'}`]} />
};

// 每列
const TemplateItem = (props: any) => {
  const { borderColor = '#CECECE' } = props
  return (
    <div className={styles[`${borderColor === '#1890FF' ? 'TemplateItemBlue' : 'TemplateItemGrey'}`]}>
      {props.children}
    </div>
  )
};

export default IconByState;
export {
  IconByState,
  ArrowSolid,
  TemplateItem,
};