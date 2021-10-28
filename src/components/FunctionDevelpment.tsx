import React from 'react'
import codeLibrary from '@/assets/svg/code_library.svg';
import { Popover , Space } from 'antd'

const FunctionPopver : React.FC<any> = ({ children }) => {
    return (
        <Popover 
            content={
                <Space>
                    <img 
                        alt="codeLibrary" 
                        src={codeLibrary} 
                    />
                    <span>功能开发中...</span>
                </Space>
            } 
            trigger="hover" 
        >
            { children }
        </Popover>
    )
}

export default FunctionPopver