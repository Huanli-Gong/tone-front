import { Select } from "antd";
import React from "react";
import type { SelectProps } from 'antd'

const ALl_SELECT_OPTIONS = [{
    label: '全部',
    value: ''
}]

export const PROBLEM_TYPE_OPTIONS = [

]

export const PROBLEM_ATTRIBUTION_OPTIONS = [
    {
        label: 'Toneagent',
        value: 'Toneagent',
    },
    {
        label: 'Runner',
        value: 'Runner',
    },
    {
        label: 'Proxy',
        value: 'Proxy',
    },
    {
        label: 'User',
        value: 'User',
    },
    {
        label: 'Other',
        value: 'Other'
    },
]

export const PROBLEM_ENABLE_OPTIONS = [
    {
        label: '启用',
        value: 1,
        status: 'success'
    },
    {
        label: '禁用',
        value: 0,
        status: 'error'
    }
]

export const SelectProblemType: React.FC<SelectProps> = (props) => {
    return (
        <Select
            allowClear
            options={ALl_SELECT_OPTIONS.map((i: any) => ({ ...i, label: '全部分类' })).concat(PROBLEM_TYPE_OPTIONS)}
            {...props}
        />
    )
}

export const SelectProblemAttribution: React.FC<SelectProps> = (props) => {
    return (
        <Select
            allowClear
            options={ALl_SELECT_OPTIONS.map((i: any) => ({ ...i, label: '全部归属' })).concat(PROBLEM_ATTRIBUTION_OPTIONS)}
            {...props}
        />
    )
}

export const SelectEnable: React.FC<SelectProps> = (props) => {
    return (
        <Select
            allowClear
            options={ALl_SELECT_OPTIONS.map((i: any) => ({ ...i, label: '全部状态' })).concat(PROBLEM_ENABLE_OPTIONS as any)}
            {...props}
        />
    )
}