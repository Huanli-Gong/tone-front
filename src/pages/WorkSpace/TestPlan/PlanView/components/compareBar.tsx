import React, { useState, useEffect, useRef } from 'react';
import { Tag, Tooltip, Layout, Space, Table, Typography, Popconfirm, message, Tabs, Row, Input, Divider, Form, Col, Select, DatePicker, Button, Breadcrumb, Modal, Checkbox } from 'antd';
import { history, useParams, useIntl, FormattedMessage } from 'umi'
import _ from 'lodash'
import styles from './compareBar.less'
import { Scrollbars } from 'react-custom-scrollbars';
import { CloseOutlined, RightOutlined } from '@ant-design/icons'
import { queryPlanConstraint } from '../services'
import { requestCodeMessage } from '@/utils/utils';

export default (props: any) => {
    const { ws_id: wsId } = useParams() as any
    const { selectedChange, allGroup, selectedRowKeys } = props

    const scrollbarsRef: any = useRef(null)
    const groupItems: any = useRef(null)
    const [padding, setPadding] = useState(false)

    const onResizeWidth = () => {
        const oli = document.querySelector('#job_group li')
        const box: any = document.getElementById('job_group')
        if (oli && box) {
            const liWidth = oli.clientWidth + 1
            const width = box.clientWidth
            if ((allGroup.length + 1) * liWidth > width) setPadding(true)
        }
    }

    useEffect(() => {
        window.addEventListener('resize', onResizeWidth)
        return () => {
            window.removeEventListener('resize', onResizeWidth)
        }
    }, [])
    useEffect(() => {
        onResizeWidth()
    }, [allGroup])
    const handleCancle = () => {
        selectedChange()
    }
    const defaultOption = (code: number, msg: string, data: any) => {
        if (code === 200) {
            const arrGroup = allGroup.map((item: any, index: any) => {
                item.job_total = item.job_total.map((id: any) => String(id))
                const members = data.filter((obj: any) => item.job_total.includes(String(obj.id)))
                const groupItem = {
                    name: `Group${index + 1}`,
                    product_version: `Group${index + 1}`,
                    members
                }
                return groupItem
            })
            window.sessionStorage.setItem('compareData', JSON.stringify(arrGroup))
            window.sessionStorage.setItem('originType', 'test_plan')
            history.push(`/ws/${wsId}/test_analysis/compare`)
        } else {
            requestCodeMessage(code, msg)
        }
    }
    const queryResultFn = function* (paramData: any) {
        yield queryPlanConstraint(paramData)

    }

    const handleNext = () => {
        const params = {
            plan_instance_list: selectedRowKeys.join(','),
            ws_id: wsId
        }
        const generObj = queryResultFn(params)
        const excuteResult: any = generObj.next();
        excuteResult.value.then((result: any) => {
            const { code, msg, data } = result;
            defaultOption(code, msg, data);
        })

    }

    useEffect(() => {
        groupItems.current = document.querySelectorAll('#box li')
        if (groupItems.current) groupItems.current = Array.from(groupItems.current)
    }, [allGroup])

    const getLeftVal = (index: number) => {
        if (groupItems.current && groupItems.current[0]) {
            const widthLi = parseInt(window.getComputedStyle(groupItems.current[0]).width)
            return index * widthLi
        }
        return 0
    }

    const getScrollLeftVal = () => {
        if (scrollbarsRef.current) {
            const scrollTop = scrollbarsRef.current.getScrollLeft();
            return scrollTop
        }
    }
    const handleScroll = () => {
        const box: any = document.getElementById('job_group')
        const width = box.clientWidth
        if (scrollbarsRef.current) {
            const scrollTop = getScrollLeftVal()
            scrollbarsRef.current.scrollLeft(scrollTop + width - 230)
        }
    }
    // 滚动条参数
    const scroll = {
        // 如果最终结果表格内容与表格头部无法对齐。
        // 表格头需要增加空白列，弹性布局
        width: '100%',
    }
    return (
        <div className={styles.job_compare} style={{display: allGroup.length ? 'block' : 'none'}}>
            <div className={styles.title}>
                <FormattedMessage id="plan.comparison.column"/><span>（{allGroup.length}）</span>
            </div>
            <div className={styles.job_group} id='job_group'>
                <Scrollbars style={scroll} ref={scrollbarsRef}>
                    <ul id='box'>
                        {
                            allGroup.map((item: any, index: number) => {
                                const left = getLeftVal(index)
                                return (
                                    <li
                                        style={{ borderRight: allGroup.length > 1 && index !== allGroup.length - 1 ? '1px dashed rgba(151, 151, 151, 0.4)' : 'none', position: 'absolute', left: `${left}px` }}>
                                        <div className={styles.job_group_title}>{`Group${index + 1}(Job Num:${item.job_total && item.job_total.length || 0})`}</div>

                                    </li>
                                )
                            })
                        }
                    </ul>
                </Scrollbars>
                <div className={styles.operate}>
                    <Space>
                        <RightOutlined onClick={handleScroll} style={{ opacity: padding ? 1 : 0 }} />
                        <Button onClick={handleCancle}><FormattedMessage id="operation.cancel"/></Button>
                        <Button type="primary" onClick={handleNext}><FormattedMessage id="operation.next"/></Button>
                    </Space>
                </div>
            </div>
        </div>

    )

}