import React from 'react';
import { Space, Typography } from 'antd';
import AvatarCover from '@/components/AvatarCover'
import EllipsisPulic from '@/components/Public/EllipsisPulic';
const LogoEllipsis: React.FC<{ props: any, size: string }> = ({ props, size }) => {
    return (
        <Space >
            <AvatarCover {...props} size={size} />
            <Typography.Text style={{ cursor: 'pointer', wordBreak: 'break-all' }}>
                <EllipsisPulic title={props.show_name} width={150}>{props.show_name}</EllipsisPulic>
            </Typography.Text>
        </Space>
    )
}

export default LogoEllipsis