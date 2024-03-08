import { Menu } from 'antd'
import React from 'react'
import styled from 'styled-components'
import type { MenuProps } from 'antd';

const ContentCls = styled.div`
    display: flex;

    .slider {
        width: 212px;
    }

    .right-content {
        width: calc(100% - 212px);
    }
`

const BootSetting: React.FC = () => {
    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
    };

    return (
        <ContentCls>
            <div className='slider'>
                <Menu
                    onClick={onClick}
                    style={{ width: 256 }}
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
                    mode="inline"
                    items={[
                        {
                            label: '分类配置',
                            key: 'cls',
                        },
                        {
                            label: '属性配置',
                            key: 'attr',
                        },
                    ]}
                />
            </div>
            <div className='right-content'>

            </div>
        </ContentCls>
    )
}

export default BootSetting