import React from 'react'
import { Layout } from 'antd'
import Icon from '@/assets/img/loss.png';
import { resizeDocumentHeightHook } from '@/utils/hooks';
import { BreadcrumbItem } from './index'

export default () => {
    const layoutHeight = resizeDocumentHeightHook()

    return (
        <Layout style={{ padding: 20, height: layoutHeight - 50, minHeight: 0, overflowX: 'scroll', background: '#f5f5f5' }}>
            <BreadcrumbItem bottomHeight={20} />
            <Layout.Content style={{ background: '#fff' }}>
                <div style={{ backgroundColor: '#fff', height: layoutHeight - 140 }}>
                    <div style={{ textAlign: 'center', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
                        <div>
                            <div style={{ display: 'inline-block' }}>
                                <img alt="icon" src={Icon}></img>
                            </div>
                            <div style={{ textAlign: 'left', display: 'inline-block', marginLeft: 80 }}>
                                <div style={{ color: '#000', fontSize: 48, opacity: 0.85, fontWeight: 'bold' }}>抱歉，页面无法访问…</div>
                                <div style={{ color: '#000', fontSize: 16, opacity: 0.45, marginTop: 20 }}>页面链接可能已失效或被删除</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout.Content>
        </Layout>
    )
}