import React, { useState } from 'react';
import { ReactComponent as FourthLocation } from '@/assets/svg/home/fourth_local.svg';
import styles from './Fourth.less';

export default ({ style={}, }) => {
  const [selectedKey, setSelectedKey] = useState(0);

  const contextList = [
    { 
      text: 'OS发布测试，每次AnolisOS的发布，社区测试团队会根据发布测试策略进行大规模测试，保障产品发布质量，外部用户可以在Testfarm查看发布测试数据。',
      img: <FourthLocation />
    },
    { 
      text: '开源软件包CI，社区开发者可以将软件包注册到平台，平台会自动监控软件包的变更，一旦发生变更会立即进行测试并推送测试结果。',
      img: '',
    },
    { 
      text: '自定义测试，社区开发者根据自己的需求可以在T-One平台进行在线测试，或者使用命令行测试。',
      img: '',
    },
    { 
      text: '离线测试，对于网络不可达的测试环境，用户可以使用离线测试模式测试并上传数据。',
      img: '',
    },
    { 
      text: '独立部署，外部用户也可以在自己环境下独立部署平台，测试并上传数据到Testfarm。',
      img: '',
    },
    { 
      text: '登陆测试环境，社区开发者可以根据需要reserve测试环境登陆进行测试及debug。',
      img: '',
    },
    { 
      text: '缺陷定位诊断，一旦测试出缺陷，平台会自动诊断缺陷引入的commit。',
      img: '',
    },
  ]
   
  return (
    <div className={styles['fourth-root']} style={style}>
        <h1 className={styles['fourth-header']}>应用场景</h1>
        <div className={styles['fourth-content']}>
          {['OS发布测试', '开源软件包CI', '自定义测试', '离线测试', '独立部署', '登陆测试环境', '缺陷定位诊断'].map((item, index)=>
            <div className={selectedKey === index ? `${styles.menuItem} ${styles.selectedMenu}` : styles.menuItem} key={index} 
              onClick={()=> { setSelectedKey(index) }}>
              {item}
            </div>
          )}
        </div>
        <div className={styles.content_description}>
            <div className={styles.text}>{contextList[selectedKey].text}</div>
            <div className={styles.img}>{contextList[selectedKey].img}</div>
        </div>
    </div>
  )

}