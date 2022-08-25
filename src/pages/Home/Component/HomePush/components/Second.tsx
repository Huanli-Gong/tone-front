import React from 'react';
import { useIntl, FormattedMessage } from 'umi'
import EllipsisPulic from '@/components/Public/EllipsisPulic'
import styles from './Second.less';

export default ({ style={}, }) => {
  const { formatMessage } = useIntl()
  const ArrowUp = () => (
    <div className={styles['arrow_content']}>
      <span className={styles['arrow_up']}></span>
      <span className={styles['arrow_up']}></span>
    </div>
  )
  
  return (
    <div className={styles['second_root']} style={style}>
        <h1 className={styles['second_header']}>
          {/* 平台架构 */}
          <FormattedMessage id="pages.home.push.platform" />
        </h1>
        <div className={styles['second_content']}>
          {/** 第一行 */}
          <div className={styles.row}>
            <div className={styles.left}>
              <div className={styles.project} style={{height: 68}}>
                <div>TestFarm</div>
              </div>
              <div className={styles.bridge}>
                <div className={styles.globule}></div>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.menu_item}>Dashboard</div>
              <div className={styles.menu_item}><FormattedMessage id="pages.home.push.project" /></div>
              <div className={styles.menu_item}><FormattedMessage id="pages.home.push.analysis" /></div>
              <div className={styles.menu_item}><FormattedMessage id="pages.home.push.offline" /></div>
              <div className={styles.menu_item}><FormattedMessage id="pages.home.push.authentication" /></div>
            </div>
          </div>
          {/** 第二行 */}
          <div className={styles.row}>
            <div className={styles.left}>
              <div className={styles.project} style={{height: 112,position: 'relative'}}>
                <div>T-One</div>
                <div><FormattedMessage id="pages.home.push.manage" /></div>
                <ArrowUp />
              </div>
              <div className={styles.bridge}>
                <div className={styles.globule}></div>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.menu}>
                <div className={styles.menu_content}>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.test.execution" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.test.plan" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.test.analysis" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.test.report" /></div>
                </div>
                <div className={styles.menu_content} style={{marginTop: 10,}}>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.case.certification" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.test.manage" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.ws.manage" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.master.push" /></div>
                </div>
              </div>
              <div>
                <div className={styles.menu_item}>
                  <p>API</p>
                  <p><FormattedMessage id="pages.home.push.notice" /></p>
                  <p><FormattedMessage id="pages.home.push.authority" /></p>
                </div>
              </div>
            </div>
          </div>

          {/** 第三行 */}
          <div className={styles.row}>
            <div className={styles.left}>
              <div className={styles.project} style={{height: 112}}>
                <div>T-One Runner</div>
                <div><FormattedMessage id="pages.home.push.distributed.tasks.engine" /></div>
              </div>
              <div className={styles.bridge}>
                <div className={styles.globule}></div>
                <div className={styles.line}></div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={styles.menu}>
                <div className={styles.menu_content}>
                  <div className={styles.menu_item}><EllipsisPulic title={formatMessage({ id: "pages.home.push.func.and.perf" })} style={{ width: 140, padding: '0 15px'}}/></div>
                  <div className={styles.menu_item}><EllipsisPulic title={formatMessage({ id: "pages.home.push.single.and.multi" })} style={{ width: 140, padding: '0 15px'}}/></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.application.cluster" /></div>
                  <div className={styles.menu_item}><FormattedMessage id="pages.home.push.cloud" /></div>
                </div>
                <div className={styles.menu_content} style={{marginTop: 10}}>
                  <div className={styles.menu_item}><EllipsisPulic title={formatMessage({ id: "pages.home.push.tasks.scheduling" })} style={{ width: 140, padding: '0 15px'}}/></div>
                  <div className={styles.menu_item}><EllipsisPulic title={formatMessage({ id: "pages.home.push.process.engine" })} style={{ width: 140, padding: '0 15px'}}/></div>
                  <div className={styles.menu_item}>Tone wrapper</div>
                  <div className={styles.menu_item}><EllipsisPulic title={formatMessage({ id: "pages.home.push.machine.scheduling" })} style={{ width: 140, padding: '0 15px'}}/></div>
                </div>
              </div>
              <div>
                <div className={styles.menu_item}>
                  <p><FormattedMessage id="pages.home.push.message" /></p>
                  <p>&emsp;</p>
                  <p><FormattedMessage id="pages.home.push.event" /></p>
                </div>
              </div>
            </div>
          </div>

          {/** 第四行 */}
          <div className={styles.row4}>
            <div className={styles.row4_flex}>
              <div className={styles.menu_item} style={{width: 535}}>tone-agent<span><FormattedMessage id="pages.home.push.active.mode" /></span></div>
              <div className={styles.menu_item} style={{width: 535}}>tone-agent<span><FormattedMessage id="pages.home.push.passive.mode" /></span></div>
            </div>
            <div className={styles.menu_item} style={{width: '100%'}}>
              <div><FormattedMessage id="pages.home.push.test.framework" /></div>
              <p><FormattedMessage id="pages.home.push.support.env" /></p>
            </div>
          </div>

        </div>
    </div>
  )

}