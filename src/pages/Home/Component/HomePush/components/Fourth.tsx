import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'umi'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import fourth1 from '@/assets/svg/home/fourth_1.png'
import fourth2 from '@/assets/svg/home/fourth_2.png'
import fourth3 from '@/assets/svg/home/fourth_3.png'
import fourth4 from '@/assets/svg/home/fourth_4.png'
import fourth5 from '@/assets/svg/home/fourth_5.png'
import fourth6 from '@/assets/svg/home/fourth_6.png'
import styles from './Fourth.less';

export default ({ style={}, }) => {
  const { formatMessage } = useIntl();
  const [selectedKey, setSelectedKey] = useState(0);

  const contextList = [
    { title: formatMessage({id: 'pages.home.push.release.test'}),
      text: formatMessage({id: 'pages.home.push.release.test.info'}),
      img: fourth1,
    },
    { title: <EllipsisPulic title={formatMessage({id: 'pages.home.push.open.source.ci'})} style={{ width: 190, padding: '0 8px'}} />,
      text: formatMessage({id: 'pages.home.push.open.source.ci.info'}),
      img: fourth2,
    },
    { title: formatMessage({id: 'pages.home.push.custom.test'}),
      text: formatMessage({id: 'pages.home.push.custom.test.info'}),
      img: fourth3,
    },
    { title:  formatMessage({id: 'pages.home.push.offline.test'}),
      text: formatMessage({id: 'pages.home.push.offline.test.info'}),
      img: fourth4,
    },
    { title: <EllipsisPulic title={formatMessage({id: 'pages.home.push.independent.deploy'})} style={{ width: 190, padding: '0 8px'}} />,
      text: formatMessage({id: 'pages.home.push.independent.deploy.info'}),
      img: fourth5,
    },
    { title: formatMessage({id: 'pages.home.push.test.plan'}),
      text: formatMessage({id: 'pages.home.push.test.plan.info'}),
      img: fourth6,
    },
  ]
   
  return (
    <div className={styles['fourth_root']} style={style}>
        <h1 className={styles['fourth_header']}>
          <FormattedMessage id="pages.home.push.application.scenarios" />
        </h1>
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