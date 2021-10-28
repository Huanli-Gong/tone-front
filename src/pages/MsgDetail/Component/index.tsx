import React from 'react';
import { Empty } from 'antd';
const MsgEmpty: React.FC<any> = ({ }) => {
    return (
        <div style={{ marginTop: 300 }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无通知" />
        </div>
    )
}
export default MsgEmpty;