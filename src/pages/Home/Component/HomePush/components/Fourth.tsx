import React, { useState } from 'react';
import fourth1 from '@/assets/svg/home/fourth_1.png'
import fourth2 from '@/assets/svg/home/fourth_2.png'
import fourth3 from '@/assets/svg/home/fourth_3.png'
import fourth4 from '@/assets/svg/home/fourth_4.png'
import fourth5 from '@/assets/svg/home/fourth_5.png'
import fourth6 from '@/assets/svg/home/fourth_6.png'
import styles from './Fourth.less';

export default ({ style={}, }) => {
  const [selectedKey, setSelectedKey] = useState(0);

  const contextList = [
    { title: 'Release测试',
      text: '每次AnolisOS的发布，社区测试团队会根据发布测试策略进行大规模测试，保障产品发布质量，外部用户可以在Testfarm查看发布测试数据。',
      img: fourth1,
    },
    { title: '开源软件包CI',
      text: '开源软件包CI，社区开发者可以将软件包注册到平台，平台会自动监控软件包的变更，一旦发生变更会立即进行测试并推送测试结果。',
      img: fourth2,
    },
    { title: '自定义测试',
      text: '自定义测试，社区开发者根据自己的需求可以在T-One平台进行测试，可以通过页面直接提交测试任务，或者使用API提交测试任务。',
      img: fourth3,
    },
    { title: '离线测试',
      text: '离线测试，对于网络不可达的测试环境，用户可以使用离线测试模式测试并上传数据。',
      img: fourth4,
    },
    { title: '独立部署', 
      text: '独立部署，外部用户也可以在自己环境下独立部署平台，测试并上传数据到Testfarm。',
      img: fourth5,
    },
    { title: '测试计划',
      text: '对于周期性的，或者期望按约定计划执行的大批量测试任务，可以使用测试计划功能提前做计划，平台会按给定计划执行测试。',
      img: fourth6,
    },
  ]
   
  return (
    <div className={styles['fourth_root']} style={style}>
        <h1 className={styles['fourth_header']}>应用场景</h1>
        <div className={styles['fourth_content']}>
          {contextList.map((item, index)=>
            <div className={selectedKey === index? `${styles.menu_item} ${styles.selectedMenu}`: styles.menu_item} key={index} 
              onClick={()=> { setSelectedKey(index) }}>
              {item.title}
            </div>
          )}
        </div>

        {contextList.map((item, index)=>
         <div key={index} style={{ display: selectedKey === index? 'block': 'none' }}>
            <div className={styles.content_description}>
              <div className={styles.text}>{item.text}</div>
              <div className={styles.img}><img src={item.img} /></div>
            </div>
          </div>
        )}
    </div>
  )

}