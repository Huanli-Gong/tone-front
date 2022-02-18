import { Layout } from 'antd';
import React from 'react';
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
                        <div style={{ color: '#000', fontSize: 48, opacity: 0.85, fontWeight: 'bold' }}>抱歉，页面无法访问…</div>
                        <div style={{ color: '#000', fontSize: 16, opacity: 0.45, marginTop: 20 }}>页面链接可能已失效或被删除</div>
                    </div>
                </div>
          </div>
      </Layout.Content>
    </Layout>
  )
}


export default NoFoundPage;
