import React, { useState } from 'react'
import { Space, Dropdown } from 'antd'
import { FilterFilled } from '@ant-design/icons'
import SearchInput from '@/components/Public/SearchInput';
import SelectCheck from '../components/SelectCheck';
import SelectDrop from '../components/SelectDrop';

import styles from './index.less'

interface InputFilterProps {
    title: string,
    name: string,
    params: any,
    setParams: (props: any) => void,
    confirm?: () => void,
    list?: any
}

export const SearchColumnFilterTitle: React.FC<InputFilterProps> = ({ title, confirm, setParams, params, name }) => {
    const [visible, setVisible] = useState(false)

    const handleVisible = (v: boolean) => {
        setVisible(v)
    }

    return (
        <div className={styles.filter_wrapper_container}>
            <Space>
                <span>{title}</span>
                <Dropdown
                    open={visible}
                    onOpenChange={handleVisible}
                    trigger={['click']}
                    overlayStyle={{ background: "#fff", boxShadow: `0 9px 28px 8px rgb(0 0 0 / 5%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 3px 6px -4px rgb(0 0 0 / 12%)` }}
                    overlay={
                        <SearchInput
                            confirm={confirm}
                            onConfirm={
                                (val: any) => {
                                    const obj = {}
                                    obj[name] = val;
                                    setVisible(false)
                                    setParams({
                                        ...params, ...obj,
                                        // 每次查询后，分页参数都要重置为初始状态。
                                        page_num: 1,
                                    })
                                }
                            }
                        />
                    }
                >
                    <div className={styles.filter_icon_wrapper} >
                        <FilterFilled
                            className={
                                params[name] ?
                                    styles.filter_icon_contaner_active :
                                    styles.filter_icon_contaner
                            }
                        />
                    </div>
                </Dropdown>
            </Space>
        </div>
    )
}

export const CheckboxColumnFilterTitle: React.FC<InputFilterProps> = ({ title, confirm, setParams, params, name, list }) => {
    const [visible, setVisible] = useState(false)

    const handleVisible = (v: boolean) => {
        setVisible(v)
    }

    return (
        <div className={styles.filter_wrapper_container}>
            <Space>
                <span>{title}</span>
                <Dropdown
                    open={visible}
                    onOpenChange={handleVisible}
                    trigger={['click']}
                    overlay={
                        <SelectCheck
                            confirm={confirm}
                            onConfirm={
                                (val: any) => {
                                    const obj = {}
                                    obj[name] = val;
                                    setVisible(false)
                                    setParams({
                                        ...params, ...obj,
                                        // 每次查询后，分页参数都要重置为初始状态。
                                        page_num: 1,
                                    })
                                }
                            }
                            list={list}
                        />
                    }
                >
                    <div className={styles.filter_icon_wrapper} >
                        <FilterFilled
                            className={
                                params[name] ?
                                    styles.filter_icon_contaner_active :
                                    styles.filter_icon_contaner
                            }
                        />
                    </div>
                </Dropdown>
            </Space>
        </div>
    )
}

export const UserSearchColumnFilterTitle: React.FC<InputFilterProps> = ({ title, confirm, setParams, params, name }) => {
    const [visible, setVisible] = useState(false)

    const handleVisible = (v: boolean) => {
        setVisible(v)
    }

    return (
        <div className={styles.filter_wrapper_container}>
            <Space>
                <span>{title}</span>
                <Dropdown
                    open={visible}
                    onOpenChange={handleVisible}
                    trigger={['click']}
                    overlay={
                        <SelectDrop
                            confirm={confirm}
                            onConfirm={
                                (val: any) => {
                                    const obj = {}
                                    obj[name] = val;
                                    setVisible(false)
                                    setParams({ ...params, ...obj })
                                }
                            }
                        />
                    }
                >
                    <div className={styles.filter_icon_wrapper} >
                        <FilterFilled
                            className={
                                params[name] ?
                                    styles.filter_icon_contaner_active :
                                    styles.filter_icon_contaner
                            }
                        />
                    </div>
                </Dropdown>
            </Space>
        </div>
    )
}