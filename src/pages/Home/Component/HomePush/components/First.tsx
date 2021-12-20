import React from 'react';
import { Avatar } from 'antd'
import logoPng from '@/assets/img/logo.png'
import { ReactComponent as CheckOutlined } from '@/assets/svg/home/CheckOutlined.svg';
import { ReactComponent as Introduce } from '@/assets/svg/home/first_introduce.svg';
import styles from './First.less';

export default ({ style={}, }) => {
  const datalist = [
    {text: '支持多CPU混合架构（x86、arm、loogarch、risc-v）'},
    {text: '支持多操作系统类型（龙蜥OS、centos、debian等）'},
    {text: '支持复杂环境测试（企业内网、独立隔离、弹性云虚拟机/容器、应用集群及多种混合环境）'},
  ]
  
  return (
    <div className={styles['first_root']} style={style}>
        <h1 className={styles['first_header']}>T-One系统介绍</h1>
        <div className={styles['first_content']}>
            <div className={styles.left}>
              <div className={styles.title}>
                <Avatar shape="square" src={logoPng} size={64} style={{ marginRight: 9 }} />
                <span>T-One</span>
              </div>
              <div className={styles.text}>一站式的自动化质量服务平台；打通了从测试准备、测试执行、测试分析、测试计划、测试报告、覆盖率检测、智能Bisect，环境服务等流程的闭环，为社区研发提供“一站式质量协作服务”。</div>
              <ul className={styles['first_ul']}>
                {datalist.map((item) =>
                  <li>
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