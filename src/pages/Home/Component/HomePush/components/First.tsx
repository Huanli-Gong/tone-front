import React from 'react';
import { Avatar } from 'antd'
import { useIntl, FormattedMessage } from 'umi'
import logoPng from '@/assets/img/logo.png'
import { ReactComponent as CheckOutlined } from '@/assets/svg/home/CheckOutlined.svg';
import { ReactComponent as Introduce } from '@/assets/svg/home/first_introduce.svg';
import styles from './First.less';

export default ({ style={}, }) => {
  const { formatMessage } = useIntl()
  const datalist = [
    {text: formatMessage({ id: 'pages.home.push.li.use1'}) },
    {text: formatMessage({ id: 'pages.home.push.li.use2'}) },
    {text: formatMessage({ id: 'pages.home.push.li.use3'}) },
  ]
  
  return (
    <div className={styles['first_root']} style={style}>
        <h1 className={styles['first_header']}>
          {/* T-One系统介绍 */}
          <FormattedMessage id="pages.home.push.system.introduction" />
        </h1>
        <div className={styles['first_content']}>
            <div className={styles.left}>
              <div className={styles.title}>
                <Avatar shape="square" src={logoPng} size={64} style={{ marginRight: 9 }} />
                <span>T-One</span>
              </div>
              <div className={styles.text}>
                {/* 一站式的自动化质量服务平台；打通了从测试准备、测试执行、测试分析、测试计划、测试报告、覆盖率检测、智能Bisect，环境服务等流程的闭环，为社区研发提供“一站式质量协作服务”。 */}
                <FormattedMessage id="pages.home.push.brief.introduction" />
              </div>
              <ul className={styles['first_ul']}>
                {datalist.map((item, i) =>
                  <li key={i}>
                    <CheckOutlined />
                    <span>{item.text}</span>
                  </li>
                )}
              </ul>
            </div>
            <div className={styles.right}>
              <Introduce />
            </div>
        </div>
    </div>
  )

}