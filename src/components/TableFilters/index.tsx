import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Row, Col, Divider, Typography, Radio, Checkbox } from 'antd'
import { FilterFilled } from '@ant-design/icons'
import { FormattedMessage } from 'umi'
import SelectDrop from '@/components/Public/SelectDrop'
import { useClientSize } from '@/utils/hooks';
import styles from './index.less'
import { Scrollbars } from 'react-custom-scrollbars';
import SearchInput from '@/components/Public/SearchInput';

const RadioGroupTableFilter: React.FC<any> = ({ confirm, onConfirm, list, initVal }) => {
    const [val, setVal] = useState<any>(initVal === undefined ? '' : initVal)

    const handleConfirm = () => {
        confirm()
        onConfirm(val)
    }

    const handleReset = () => {
        confirm()
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
                                key={item.name}
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

const CheckboxTableFilter: React.FC<any> = ({ confirm, onConfirm, list, styleObj, initVal }) => {
    const [groupValue, setGroupValue] = useState<any>(initVal || [])
    const [flag, setFlag] = useState<boolean>(false)
    const [allChecked, setAllChecked] = useState<boolean>(false)
    const scrollbarsRef: any = useRef(null)
    const { height: layoutHeight } = useClientSize()
    const handleConfirm = () => {
        confirm()
        onConfirm(groupValue)
    }

    const handleReset = () => {
        setGroupValue([])
        confirm()
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

    const scroll = {
        // 最大高度，内容超出该高度会出现滚动条
        height: layoutHeight - 200,
    }
    useEffect(() => {
        setFlag(scrollbarsRef?.current?.clientHeight > layoutHeight - 200 || false)
    }, [layoutHeight])

    return (

        <Row className={styles.wrapper_styles}
            style={flag && styleObj && { ...styleObj }}
            ref={scrollbarsRef}>
            <Checkbox
                className={styles.filter_item_styles}
                indeterminate={indeterminate}
                onClick={handleCheckAll}
                checked={allChecked}
            >
                <FormattedMessage id="all" />
            </Checkbox>
            <Scrollbars autoHeightMax={scroll.height} autoHeight={true}>
                <Checkbox.Group
                    onChange={handleChange}
                    value={groupValue}
                    className={styles.checkbox_filter}
                >
                    {
                        list.map(
                            (item: any, index: number) => (
                                <Checkbox
                                    className={styles.filter_item_styles}
                                    style={{
                                        background: index % 2 === 0 ? 'rgba(0,0,0,0.02)' : '#fff'
                                    }}
                                    key={item.name}
                                    value={item.value}
                                >
                                    {item.name}
                                </Checkbox>
                            )
                        )
                    }
                </Checkbox.Group>
            </Scrollbars>
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
// 复选框过滤
export const getCheckboxFilter = (props: any, setProps: any, list: any, name: string, styleObj?: any) => ({
    filterDropdown: ({ confirm }: any) => (
        <CheckboxTableFilter
            initVal={props[name]}
            list={list}
            confirm={confirm}
            onConfirm={(val: string) => setProps({ ...props, [name]: val })}
            styleObj={styleObj}
        />
    ),
    filterIcon: <FilterFilled style={{ color: props[name] && props[name].length ? '#1890ff' : undefined }} />
})
// Input框过滤
export const getSearchFilter = (props: any, setProps: any, name: string, desc?: string, styleObj?: any) => ({
    filterDropdown: ({ confirm }: any) => (
        <SearchInput
            confirm={confirm}
            onConfirm={(val: string) => setProps({ ...props, [name]: val })}
            initVal={props[name]}
            placeholder={[desc]}
            styleObj={styleObj}
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
            onConfirm={(val: string) => setProps({ ...props, [name]: val })}
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
            onConfirm={(val: string, valName: string) => setParams({ ...params, [name]: val, userName: valName })}
        />
    ),
    filterIcon: <FilterFilled style={{ color: params[name] ? '#1890ff' : undefined }} />
})