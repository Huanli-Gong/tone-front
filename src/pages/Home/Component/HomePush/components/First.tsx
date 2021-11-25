import React from 'react';
import { Avatar } from 'antd'
import logoPng from '@/assets/img/logo.png'
import { ReactComponent as Introduce } from '@/assets/svg/home/first_introduce.svg';
import styles from './First.less';

export default ({ style={}, }) => {
  
  return (
    <div className={styles['first-root']} style={style}>
        <h1 className={styles['first-header']}>T-One系统介绍</h1>
        <div className={styles['first-content']}>
            <div className={styles.left}>
              <div className={styles.title}>
                <Avatar shape="square" src={logoPng} size={64} style={{ marginRight: 9 }} />
                <span>T-One</span>
              </div>
              <div className={styles.text}>一站式的自动化质量服务平台；打通了从测试准备、测试执行、测试分析、测试计划、测试报告、覆盖率检测、智能Bisect，环境服务等流程的闭环，为社区研发提供一站式质量服务。</div>
            </div>
            <div className={styles.right}>
              <Introduce />
            </div>
        </div>
    </div>
  )

}