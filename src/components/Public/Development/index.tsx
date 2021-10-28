import React from 'react';
import { Popover } from 'antd';
import codeLibrary from '@/assets/svg/code_library.svg';

const Development : React.FC<any> = ({ title = "" }) => {
    const content = (
        <div>
          <img alt="codeLibrary" src={codeLibrary} style={{ marginRight:5 }}/><span >功能开发中...</span>
        </div>
    );
    return(
        <Popover content={content} trigger="hover" >
            <u style={{ color : '#fff' }}>{title}</u>
        </Popover>
    )

}
export default Development;