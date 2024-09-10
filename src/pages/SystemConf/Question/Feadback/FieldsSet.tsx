import { Select } from "antd";
import React from "react";
import type { SelectProps } from 'antd'

const ALl_SELECT_OPTIONS = [{
    label: '全部',
    value: ''
}]

export const FEEDBACK_TYPE = [
    {
        value: 'Collect',
        label: '问题收集',
    },
    {
        value: 'Suggest',
        label: '意见反馈'
    }
]

export const feedbackTypeMap = new Map(FEEDBACK_TYPE.map((o: any) => ([o.value, o.label])))

export const FEEDBACK_ENABLE = [
    {
        value: 'Init',
        label: '未处理',
        status: 'warning',
    },
    {
        value: 'Ignore',
        label: '忽略',
        status: 'default',
    },
    {
        value: 'Accept',
        label: '已处理',
        status: 'success',
    }
]

export const SelectType: React.FC<SelectProps> = (props) => {
    return (
        <Select
            allowClear
            options={ALl_SELECT_OPTIONS.map((i: any) => ({ ...i, label: '全部分类' })).concat(FEEDBACK_TYPE)}
            {...props}
        />
    )
}

export const SelectEnable: React.FC<SelectProps> = (props) => {
    return (
        <Select
            allowClear
            options={ALl_SELECT_OPTIONS.map((i: any) => ({ ...i, label: '全部状态' })).concat(FEEDBACK_ENABLE)}
            {...props}
        />
    )
}