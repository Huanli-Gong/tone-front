import React from 'react';
import { Space, Typography } from 'antd';
import AvatarCover from '@/components/AvatarCover'

const LogoEllipsis: React.FC<{ props : any, size : string }> = ({ props,size }) => {
    return (
        <Space >
            <AvatarCover { ...props } size={ size } />
            <Typography.Text style={{ cursor:'pointer', wordBreak:'break-all' }}>{props.show_name}</Typography.Text>
        </Space>
    )
}

export default LogoEllipsis