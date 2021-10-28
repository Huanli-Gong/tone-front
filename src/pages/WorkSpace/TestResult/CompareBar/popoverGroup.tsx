import React, { useState, useEffect } from 'react'
import { Checkbox,Popover } from 'antd'
import styles from './index.less'


export default (props: any) => {
    const {disabled,content,title, isChecked, selectedChange, jobInfo} = props
    const [visible, setVisible] = useState(false)
    const fn = () => {
        setVisible(false)
    }
    useEffect(() => {
        window.addEventListener('click', fn, false)
        return () => {
            // 组件销毁时销毁编辑器  注：class写法需要在componentWillUnmount中调用
            window.removeEventListener('click', fn, false)
        }
    }, []);
    const handleClick = (e:any) => {
        e.stopPropagation();
        selectedChange(jobInfo, e.target.checked)
        setVisible(e.target.checked)
    }

    if (disabled) {
        return <Checkbox disabled={disabled} checked={isChecked} />
    }
    return (
        <>
            <Popover
                title={title}
                trigger="click"
                visible={visible}
                placement='rightTop'
                onVisibleChange={visible => setVisible(visible)}
                content={content}
                overlayClassName={styles.popover_group}
            />
            <Checkbox onChange={handleClick} disabled={disabled} checked={isChecked} />
        </>
    )
}