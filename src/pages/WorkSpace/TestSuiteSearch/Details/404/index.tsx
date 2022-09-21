import { Layout } from 'antd';
import React from 'react';
import { useIntl, FormattedMessage } from 'umi';
import Icon from '@/assets/img/loss.png';
import styles from './style.less';

const NoFoundPage: React.FC<{}> = () => {
  return (
    <Layout style={{ padding: 20,  minHeight: 0, background: '#f5f5f5' }}>
      <Layout.Content style={{ background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff' }}>
                <div className={styles.NoFoundPage_content}>
                    <div style={{ display: 'inline-block' }}>
                        <img alt="icon" src={Icon}></img>
                    </div>
                    <div style={{ textAlign: 'left', display: 'inline-block', marginLeft: 80 }}>
                        <div style={{ color: '#000', fontSize: 48, opacity: 0.85, fontWeight: 'bold' }}><FormattedMessage id="sorry, the page cannot be accessed"/></div>
                        <div style={{ color: '#000', fontSize: 16, opacity: 0.45, marginTop: 20 }}><FormattedMessage id="page links may have expired or been deleted"/></div>
                    </div>
                </div>
          </div>
      </Layout.Content>
    </Layout>
  )
}


export default NoFoundPage;
