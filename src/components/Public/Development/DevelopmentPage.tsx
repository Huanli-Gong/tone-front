import { Layout } from 'antd';
import DevelopmentIcon from '@/assets/svg/development_bg.svg';
import { useClientSize } from '@/utils/hooks';

export default () => {
    const { height: layoutHeight } = useClientSize()

    return (
        <Layout style={{ padding: 20, height: layoutHeight - 50, minHeight: 0, overflow: 'auto' }}>
            <Layout.Content style={{ background: '#fff' }}>
                <div style={{ textAlign: 'center', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
                    <img alt="icon" src={DevelopmentIcon} />
                    <span style={{ color: '#000', fontSize: 18, fontWeight: 'bold', display: 'block' }}>功能开发中...</span>
                </div>
            </Layout.Content>
        </Layout>
    )
}