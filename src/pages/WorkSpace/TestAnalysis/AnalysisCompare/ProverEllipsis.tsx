import React, { useState, useEffect, useRef } from 'react';
import { Popover } from 'antd';
import styles from './index.less'
import _ from 'lodash'
import { ReactComponent as Ellipsis } from '@/assets/svg/ellipsis.svg'
export default (props:any) => {

    const [visiblePopover, setVisiblePopover] = useState(false);
    const { current, currentIndex, contentMark, handleEllipsis,currentEditGroupIndex,iconStyles={},typeName } = props

    const fn = () => {
        setVisiblePopover(false)
    }
    useEffect(() => {
        window.addEventListener('click', fn, false)
        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            window.removeEventListener('click', fn, false)
        }
    }, []);
    const handleClick = (e: any) => {
        e.stopPropagation();
        setVisiblePopover(true)
        handleEllipsis(current, currentIndex)
    }

    return (
        <Popover
            trigger="click"
            placement='bottom'
            content={contentMark}
            overlayClassName={`${styles.popover_mark} ${styles[typeName]}`}
            open={visiblePopover && currentEditGroupIndex === currentIndex}
        >
           <Ellipsis className={styles.icon} onClick={handleClick} style={iconStyles}/>
        </Popover>
    )
}