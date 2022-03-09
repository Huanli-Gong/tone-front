import { message } from 'antd';
import React from 'react';
import { useModel, Access, AccessProps } from 'umi';

export const AccessForbid: React.FC<AccessProps> = ({ accessible, children }) => {
    const onClick = () => message.error('没有权限操作')
    return (
        <Access
            accessible={accessible}
            fallback={
                React.Children.map(
                    React.Children.toArray(children),
                    (child) => React.cloneElement(child as any, { onClick })
                )
            }
        >
            {children}
        </Access>
    )
}