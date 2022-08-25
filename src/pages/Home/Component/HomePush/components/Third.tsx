import React from 'react';
import { getLocale, useIntl, FormattedMessage } from 'umi'
import EllipsisHeightPulic from '@/components/Public/EllipsisHeightPulic'
import { ReactComponent as Sec1 } from '@/assets/svg/home/sec_1.svg';
import { ReactComponent as Sec2 } from '@/assets/svg/home/sec_2.svg';
import { ReactComponent as Sec3 } from '@/assets/svg/home/sec_3.svg';
import { ReactComponent as Sec4 } from '@/assets/svg/home/sec_ci_package.svg';
import { ReactComponent as Sec5 } from '@/assets/svg/home/sec_5.svg';
import { ReactComponent as Sec6 } from '@/assets/svg/home/sec_6.svg';
import styles from './Third.less';

export default ({ style={}, }) => {
  const { formatMessage } = useIntl()
  const locale_zn = getLocale() === 'zh-CN'
  
  return (
    <div className={styles['third_root']} style={style}>
        <h1 className={styles['third_header']}><FormattedMessage id="pages.home.push.product.features" /></h1>

        {locale_zn ?
          <div className={styles['third_content']}>
              <div className={styles.row_item}>
                <div><Sec1 /></div>
                <p><FormattedMessage id="pages.home.push.quality.platform" /></p>
                <div>
                  <FormattedMessage id="pages.home.push.quality.platform.info" />
                </div>
              </div>

              <div className={styles.row_item}>
                <div><Sec2 /></div>
                <p>
                  <EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.quality.collaboration" })} />
                </p>
                <div>
                  <FormattedMessage id="pages.home.push.quality.collaboration.info" />
                </div>
              </div>

              <div className={styles.row_item}>
                <div><Sec3 /></div>
                <p><FormattedMessage id="pages.home.push.data.analysis" /></p>
                <div>
                  <FormattedMessage id="pages.home.push.data.analysis.info" />
                </div>
              </div>

              <div className={styles.row_item} style={{ width:192}}>
                <div><Sec4 /></div>
                <p><FormattedMessage id="pages.home.push.ci.services" /></p>
                <div>
                  <FormattedMessage id="pages.home.push.ci.services.info" />
                </div>
              </div>

              <div className={styles.row_item}>
                <div><Sec5 /></div>
                <p><FormattedMessage id="pages.home.push.env.login.debugger" /></p>
                <div>
                  <FormattedMessage id="pages.home.push.env.login.debugger.info" />
                </div>
              </div>

              <div className={styles.row_item}>
                <div><Sec6 /></div>
                <p><FormattedMessage id="pages.home.push.defect.location" /></p>
                <div>
                  <FormattedMessage id="pages.home.push.defect.location.info" />
                </div>
              </div>
          </div>
          : 
          <div className={styles['third_content']}>
            <div className={styles.row_item}>
              <div><Sec1 /></div>
              <p><FormattedMessage id="pages.home.push.quality.platform" /></p>
              <EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.quality.platform.info" })} height={151} lineClamp={7}/>
            </div>

            <div className={styles.row_item}>
              <div><Sec2 /></div>
              <p>
                <EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.quality.collaboration" })} height={56.5} />
              </p>
              <div>
                <FormattedMessage id="pages.home.push.quality.collaboration.info" />
              </div>
            </div>

            <div className={styles.row_item}>
              <div><Sec3 /></div>
              <p><FormattedMessage id="pages.home.push.data.analysis" /></p>
              <EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.data.analysis.info" })} height={151} lineClamp={7}/>
            </div>

            <div className={styles.row_item} style={{ width:192}}>
              <div><Sec4 /></div>
              <p><EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.ci.services" })} height={56.5} /></p>
              <EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.ci.services.info" })} height={151} lineClamp={7}/>
            </div>

            <div className={styles.row_item}>
              <div><Sec5 /></div>
              <p><EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.env.login.debugger" })} height={56.5} /></p>
              <div>
                <FormattedMessage id="pages.home.push.env.login.debugger.info" />
              </div>
            </div>

            <div className={styles.row_item}>
              <div><Sec6 /></div>
              <p><EllipsisHeightPulic title={formatMessage({ id: "pages.home.push.defect.location" })} height={56.5} /></p>
              <div>
                <FormattedMessage id="pages.home.push.defect.location.info" />
              </div>
            </div>
          </div>
        }
    </div>
  )

}