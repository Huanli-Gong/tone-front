import React,{ useEffect, useState } from 'react';
import { Layout } from 'antd';
import DevelopmentIcon from '@/assets/svg/development_bg.svg';
export default () => {
    const [layoutHeight, setLayoutHeight] = useState(innerHeight)

    const windowHeight = () => setLayoutHeight(innerHeight)

    useEffect(() => {
        window.addEventListener('resize', windowHeight)
        return () => {
            window.removeEventListener('resize', windowHeight)
        }
    }, [])
    return (
        <Layout style={{ padding: 20, height: layoutHeight - 50, minHeight: 0, overflow: 'auto' }}>
            <Layout.Content style={{ background: '#fff' }}>
                <div style={{ textAlign: 'center',position:'relative',top:'50%',transform:'translateY(-50%)' }}>
                    <img alt="icon" src={DevelopmentIcon}></img>
                    <span style={{ color: '#000', fontSize: 18, fontWeight: 'bold', display:'block' }}>功能开发中...</span>
                </div>
            </Layout.Content>
        </Layout>
    )
}