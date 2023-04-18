import React, { useEffect, useMemo, useState } from 'react'
import { Row, Col, Divider, Typography, Radio, Checkbox, Space, DatePicker, Button } from 'antd'
import { FilterFilled } from '@ant-design/icons'
import { FormattedMessage, useIntl } from 'umi'
import SelectDrop from '@/components/Public/SelectDrop'
import styles from './index.less'
import SearchInput from '@/components/Public/SearchInput';
import moment from "moment"

const RadioGroupTableFilter: React.FC<any> = ({ confirm, onConfirm, list, initVal }) => {
    const [val, setVal] = useState<any>(initVal === undefined ? '' : initVal)

    const handleConfirm = () => {
        confirm?.()
        onConfirm(val)
    }

    const handleReset = () => {
        confirm?.()
        onConfirm()
        setVal('')
    }

    const handleChange = ({ target }: any) => {
        setVal(target.value)
    }

    return (
        <Row className={styles.wrapper_styles}>
            <Radio.Group onChange={handleChange} className={styles.checkbox_filter} value={val}>
                <Radio className={styles.filter_item_styles} value=""><FormattedMessage id="all" /></Radio>
                {
                    list.map(
                        (item: any, index: number) => (
                            <Radio
                                className={styles.filter_item_styles}
                                style={{
                                    background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : '#fff'
                                }}
                                key={item.value}
                                value={item.value}
                            >{item.name}</Radio>
                        )
                    )
                }
            </Radio.Group>
            <Divider style={{ margin: 0 }} />
            <Col span={24} >
                <Row style={{ height: 32 }} justify="center" align="middle">
                    <Col
                        span={12}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={handleConfirm}
                    >
                        <Typography.Text style={{ color: '#008dff' }}><FormattedMessage id="operation.ok" /></Typography.Text>
                    </Col>
                    <Col
                        span={12}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                        onClick={handleReset}
                    >
                        <Typography.Text><FormattedMessage id="operation.reset" /></Typography.Text>
                    </Col>
                </Row>
            </Col>
        </Row>
    )
}

const CheckboxTableFilter: React.FC<any> = ({ confirm, onConfirm, list, initVal }) => {
    const [groupValue, setGroupValue] = useState<any>(initVal || [])
    const [allChecked, setAllChecked] = useState<boolean>(false)
    // const scrollbarsRef: any = useRef(null)
    // const { height: layoutHeight } = useClientSize()
    const handleConfirm = () => {
        confirm?.()
        onConfirm(groupValue)
    }

    const handleReset = () => {
        setGroupValue([])
        confirm?.()
        onConfirm()

    }

    const handleChange = (val: any) => {
        setGroupValue(val)
    }

    const handleCheckAll = ({ target }: any) => {
        const checkedAll = target.checked
        if (checkedAll) return setGroupValue(list.map(({ value }: any) => value))
        setGroupValue([])
    }

    const indeterminate = useMemo(() => {
        return !!groupValue.length && groupValue.length < list.length
    }, [groupValue])

    useEffect(() => {
        setAllChecked(groupValue.length && groupValue.length === list.length || false)
    }, [groupValue])

    return (
        <Space style={{ maxWidth: 360 }} direction="vertical" size={0}>
            <Checkbox
                className={styles.filter_item_styles}
                indeterminate={indeterminate}
                onClick={handleCheckAll}
                checked={allChecked}
            >
                <FormattedMessage id="all" />
            </Checkbox>
            <Checkbox.Group
                onChange={handleChange}
                value={groupValue}
                className={styles.checkbox_filter}
            >
                <Space direction="vertical" size={0} style={{ maxWidth: 360, maxHeight: 260, overflow: "auto" }} >
                    {
                        list.map(
                            (item: any, index: number) => (
                                <Checkbox
                                    className={styles.filter_item_styles}
                                    style={{
                                        background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : '#fff'
                                    }}
                                    key={item.value}
                                    value={item.value}
                                >
                                    <Typography.Text ellipsis={{ tooltip: true }} style={{ width: 300 }}>
                                        {item.name}
                                    </Typography.Text>
                                </Checkbox>
                            )
                        )
                    }
                </Space>
            </Checkbox.Group>
            <Divider style={{ margin: 0 }} />
            <Row style={{ height: 32 }} justify="center" align="middle">
                <Col
                    span={12}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={handleConfirm}
                >
                    <Typography.Text style={{ color: '#008dff' }}><FormattedMessage id="operation.ok" /></Typography.Text>
                </Col>
                <Col
                    span={12}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    onClick={handleReset}
                >
                    <Typography.Text><FormattedMessage id="operation.reset" /></Typography.Text>
                </Col>
            </Row>
        </Space>
    )
}

export const DateRangeTimePickerComponent: React.FC<AnyType> = ({ value, onOk, confirm }) => {
    const intl = useIntl()
    const [val, setVal] = React.useState<any>(value)

    const handleChange = (date: any) => {
        setVal(date)
    }

    const handleReset = () => {
        setVal(undefined)
        onOk?.({ start_time: undefined, end_time: undefined })
        confirm?.()
    }

    const handleOk = () => {
        const [start_time, end_time] = val
        onOk?.({
            start_time: start_time ? moment(start_time).format("YYYY-MM-DD HH:mm:ss") : undefined,
            end_time: end_time ? moment(end_time).format("YYYY-MM-DD HH:mm:ss") : undefined
        })
        confirm?.()
    }

    return (
        <Space
            direction="vertical"
            size={4}
            style={{ padding: 6 }}
        >
            <DatePicker.RangePicker
                size="middle"
                format="YYYY-MM-DD"
                // showTime={{ format: 'HH:mm:ss' }}
                onChange={handleChange}
                autoComplete="off"
                allowClear
                showNow
                value={val}
            />
            <Divider style={{ margin: 0 }} />
            <Row>
                <Col span={12} style={{ textAlign: "center" }} onClick={handleOk}>
                    <Button type="link" style={{ width: "100%" }} size="small">
                        {intl?.formatMessage({ id: "operation.ok" })}
                    </Button>
                </Col>
                <Col span={12} style={{ textAlign: "center", cursor: "pointer" }} onClick={handleReset}>
                    {intl?.formatMessage({ id: "operation.reset" })}
                </Col>
            </Row>
        </Space>
    )
}

export const getRangeDatePickerFilter = (value: any, onOk: any) => {
    const [start_time, end_time] = value
    return {
        filterDropdown: ({ confirm }: any) => (
            <DateRangeTimePickerComponent
                onOk={onOk}
                value={value}
                confirm={confirm}
            />
        ),
        filterIcon: () => <FilterFilled style={{ color: start_time || end_time ? '#1890ff' : undefined }} />,
    }
}
// 复选框过滤
export const getCheckboxFilter = (props: any, setProps: any, list: any, name: string) => ({
    filterDropdown: ({ confirm }: any) => (
        <CheckboxTableFilter
            initVal={props[name]}
            list={list}
            confirm={confirm}
            onConfirm={(val: string) => setProps({ ...props, [name]: val, page_num: 1 })}
        />
    ),
    filterIcon: <FilterFilled style={{ color: props[name] && props[name].length ? '#1890ff' : undefined }} />
})
// Input框过滤
export const getSearchFilter = (props: any, setProps: any, name: string, desc?: string) => ({
    filterDropdown: ({ confirm }: any) => (
        <SearchInput
            confirm={confirm}
            onConfirm={(val: string) => setProps({ ...props, [name]: val, page_num: 1 })}
            initVal={props[name]}
            placeholder={[desc]}
        />
    ),
    filterIcon: () => <FilterFilled style={{ color: props[name] ? '#1890ff' : undefined }} />,
})
// Radio框过滤
export const getRadioFilter = (props: any, setProps: any, list: any, name: string) => ({
    filterDropdown: ({ confirm }: any) => (
        <RadioGroupTableFilter
            initVal={props[name]}
            list={list}
            confirm={confirm}
            onConfirm={(val: string) => setProps({ ...props, [name]: val, page_num: 1 })}
        />
    ),
    filterIcon: <FilterFilled style={{ color: props[name] || props[name] === 0 ? '#1890ff' : undefined }} />
})
// 创建人下拉框过滤
export const getUserFilter = (params: any, setParams: any, name: string) => ({
    filterDropdown: ({ confirm }: any) => (
        <SelectDrop
            initVal={{ id: params[name], name: params.userName }}
            confirm={confirm}
            onConfirm={(val: string, valName: string) => setParams({ ...params, [name]: val, userName: valName, page_num: 1 })}
        />
    ),
    filterIcon: <FilterFilled style={{ color: params[name] ? '#1890ff' : undefined }} />
})