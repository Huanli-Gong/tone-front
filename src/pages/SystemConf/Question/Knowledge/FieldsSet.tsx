import { Select } from "antd";
import React from "react";
import type { SelectProps } from 'antd'
import { useRequest } from "umi";
import { getBootSetting } from "./services";

const ALl_SELECT_OPTIONS = [{
    label: '全部',
    value: ''
}]

export const useFieldsSet: any = () => {
    const { data } = useRequest(getBootSetting, { initialData: { problem_type: '', problem_attribution: '' } })
    const { problem_type, problem_attribution } = data

    const SelectProblemAttribution: React.FC<SelectProps> = (props) => {
        if (!problem_attribution) return <Select {...props} />
        return (
            <Select
                allowClear
                options={[{ value: '', label: '全部归属' }].concat(problem_attribution?.split(',').map((i: any) => ({ value: i, label: i })))}
                {...props}
            />
        )
    }

    const SelectProblemType: React.FC<SelectProps> = (props) => {
        if (!problem_type) return <Select {...props} />
        return (
            <Select
                allowClear
                options={[{ value: '', label: '全部分类' }].concat(problem_type?.split(',').map((i: any) => ({ value: i, label: i })))}
                {...props}
            />
        )
    }

    return {
        problem_type,
        SelectProblemAttribution,
        problem_attribution,
        SelectProblemType
    }
}

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

export const SelectEnable: React.FC<SelectProps> = (props) => {
    return (
        <Select
            allowClear
            options={ALl_SELECT_OPTIONS.map((i: any) => ({ ...i, label: '全部状态' })).concat(PROBLEM_ENABLE_OPTIONS)}
            {...props}
        />
    )
}