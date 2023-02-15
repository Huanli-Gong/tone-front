import React from 'react';
import _ from 'lodash';
import { Tag, Tooltip, } from 'antd';
import { useIntl, FormattedMessage, getLocale } from 'umi';
import { ReactComponent as BaseIcon } from '@/assets/svg/BaseIcon.svg';
import styles from './index.less';
export const transformFn = (arr: any) => {
    return arr.map((item: any, index: number) => {
        item.product_version = item.product_version || item.name
        if (_.isArray(item.members) && item.members[0]) {
            const defaultVersion = item.members[0].product_version || item.members[0].version
            if (defaultVersion) item.product_version = defaultVersion
        }
        item.id = +new Date() + index
        return item
    })
}

export const transformIdFn = (selectedJob: any) => {
    const arr = selectedJob.filter((obj: any) => obj && _.isArray(obj.members)).map((value: any, index: number) => {
        const members = value.members.filter((val: any) => val).map((item: any, k: number) => {
            if (!item.job_id) return { ...item, id: `${index}-${item.id}-${k}`, job_id: item.id }
            return { ...item, id: `${index}-${item.id}-${k}` }
        })
        return {
            ...value,
            id: `group-${index}`,
            members
        }
    })
    return arr
}

export const transformNoGroupIdFn = (selectedJob: any) => {
    const arr = selectedJob.filter((val: any) => val).map((item: any, k: number) => {
        if (!item.job_id) return { ...item, id: `${item.id}-${k}`, job_id: item.id }
        return { ...item, id: `${item.id}-${k}` }
    })
    return arr
}

export const EllipsisRect = (props: any) => {
    const { formatMessage } = useIntl()
    const local = getLocale() === 'en-US'

    const { text, flag, isBaseGroup } = props
    let tempText = text
    // 以“对比组”开始，以数字结尾的。
    if (text?.match(/^对比组[0-9]+$/)) {
        tempText = formatMessage({ id: 'analysis.comparison.group' }) + text.slice(3)
    }
    const nameStyle = local ? styles.workspace_name_en : styles.workspace_name
    const dom = (
        <span className={isBaseGroup ? `${nameStyle} ${styles.base_workspace_name}` : `${nameStyle}`}>
            {flag ? <Tag color='#0089FF' className={styles.baselineColorFn}><FormattedMessage id="analysis.base" /></Tag> : ''}
            {tempText}
        </span>
    )
    return (
        <>
            {isBaseGroup &&
                <span title={formatMessage({ id: 'analysis.benchmark.group' })} style={{ paddingRight: 4, transform: 'translateY(-12px)', width: 16, display: 'inline-block' }}>
                    <BaseIcon title={formatMessage({ id: 'analysis.benchmark.group' })} />
                </span>}
            <Tooltip title={tempText} overlayStyle={{ wordBreak: 'break-all' }}>
                {dom}
            </Tooltip >
        </>
    )
}

export const getListStyle = (draggableStyle: any) => ({
    // background: isDraggingOver ? 'lightblue' : 'lightgrey',
    display: 'flex',
    alignItems: 'flex-start',
    // overflow: 'auto',
    overflowY: 'hidden',
    userSelect: 'none',
    outline: 'none',
    ...draggableStyle
});

export const getItemStyle = (draggableStyle: any) => ({
    userSelect: 'none',
    outline: 'none',
    marginRight: 16,
    ...draggableStyle,
});

export const getJobItemStyle = (draggableStyle: any) => ({
    userSelect: 'none',
    outline: 'none',
    ...draggableStyle
});