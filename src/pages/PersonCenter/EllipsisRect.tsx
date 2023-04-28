/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { Tooltip } from 'antd';
import styles from './index.less';

const EllipsisRect = ({ text, ellipsis, children, placement }: any) => {
    const ellipsisRef = useRef<any>(null)
    const [show, setShow] = useState(false)

    useEffect(() => {
        let $show = false
        if (ellipsis && ellipsis.current) {
            const clientWidth = ellipsis.current.clientWidth
            const scrollWidth = ellipsis.current.scrollWidth
            $show = clientWidth < scrollWidth
            setShow($show)
        }
    }, [])
    const renderChildren = () => {
        return (
            children ? React.cloneElement(children) : text || '-'
        )
    }
    if (!ellipsis) {
        // eslint-disable-next-line no-param-reassign
        ellipsis = ellipsisRef
        return (
            <>
                {show ?
                    <Tooltip title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                        <span className={styles.workspace_name} ref={ellipsis}>{text}</span>
                    </Tooltip >
                    :
                    <span className={styles.workspace_name} ref={ellipsis}>{text}</span>
                }
            </>
        )
    }

    return (
        <>
            {show ?
                <Tooltip placement={placement || 'top'} title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                    {renderChildren()}
                </Tooltip >
                :
                renderChildren()
            }
        </>
    )
}

export default EllipsisRect