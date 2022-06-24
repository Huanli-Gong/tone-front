import React from 'react';
import { Avatar } from 'antd'
import logoPng from '@/assets/img/logo.png'
import { ReactComponent as CheckOutlined } from '@/assets/svg/home/CheckOutlined.svg';
import { ReactComponent as Introduce } from '@/assets/svg/home/first_introduce.svg';
import styles from './First.less';

const datalist = [
  { text: '支持多CPU混合架构（x86、arm、loogarch、risc-v）' },
  { text: '支持多操作系统类型（龙蜥OS、centos、debian、ubuntu、统信、麒麟）' },
  { text: '支持复杂环境测试（企业内网、网络隔离环境、弹性云虚拟机/容器、应用集群及多种混合环境）' },
]

export default ({ style = {}, }) => {

  return (
    <div className={styles['first_root']} style={style}>
      <h1 className={styles['first_header']}>T-One系统介绍</h1>
      <div className={styles['first_content']}>
        <div className={styles.left}>
          <div className={styles.title}>
            <Avatar shape="square" src={logoPng} size={64} style={{ marginRight: 9 }} />
            <span>T-One</span>
          </div>
          <div className={styles.text}>测试类型众多，测试环境异常复杂，怎么能轻松自动化起来？业内首个一站式、全场景质量协作平台 T-One 能满足你的一切自动化测试需求：</div>
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