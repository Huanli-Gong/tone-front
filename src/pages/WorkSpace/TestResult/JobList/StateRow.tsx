import { Row, Space, Typography, Radio, Input, Popover, Checkbox } from "antd"
import type { RadioChangeEvent } from "antd"
import React from "react"
import styled from "styled-components"
import { useAccess, useLocation, useIntl, FormattedMessage } from "umi"
import { DownOutlined, UpOutlined, SettingOutlined } from '@ant-design/icons'
import { useProvider } from "./provider"
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

const activeCss = `
    color: #1890FF;
`

type ActiveStateProps = {
    active?: boolean
}

const BaseState = styled.span<ActiveStateProps>`
    cursor: pointer;
    ${({ active }) => active ? activeCss : ""}
`

type IProps = Record<string, any>

const SettingDropdown: React.FC = () => {
    const { initialColumns, setInitialColumns, DEFAULT_COLUMNS_SET_DATA } = useProvider()
    const intl = useIntl()
    const [indeterminate, setIndeterminate] = React.useState(true);
    const [checkAll, setCheckAll] = React.useState(false);

    const options = Object.entries(initialColumns)
    const allKey = options.map((i: any) => {
        const [name] = i
        return name
    })
    const baseList = options.map((i: any) => {
        const [name, { disabled }] = i
        if (!disabled)
            return name
    }).filter(Boolean)

    const [checkedList, setCheckedList] = React.useState<CheckboxValueType[]>(baseList);

    React.useEffect(() => {
        setCheckedList(baseList)
        setIndeterminate(!!baseList.length && baseList.length < options.length);
        setCheckAll(baseList.length === options.length);
    }, [initialColumns])

    const setColumnsState = (list: any[]) => {
        setInitialColumns((p: any) => Object.fromEntries(
            Object.entries(p).map((i: any) => {
                const [name, value] = i
                return [name, { ...value, disabled: !list.includes(name) }]
            })
        ), [])
    }

    const onCheckAllChange = (e: CheckboxChangeEvent) => {
        const checkValues = e.target.checked ? allKey : []
        setCheckedList(checkValues);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
        setColumnsState(checkValues)
    };

    const onChange = (list: CheckboxValueType[]) => {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < options.length);
        setCheckAll(list.length === options.length);
        setColumnsState(list)
    };

    return (
        <Popover
            placement="bottom"
            content={
                <Space direction="vertical" size={4}>
                    <Row justify="space-between" align={"middle"} style={{ marginBottom: 16 }}>
                        <Checkbox
                            indeterminate={indeterminate}
                            checked={checkAll}
                            onChange={onCheckAllChange}
                        >
                            <Typography.Text strong>
                                {intl.formatMessage({ defaultMessage: "列展示", id: "ws.result.list.columns.state.title" })}
                            </Typography.Text>
                        </Checkbox>
                        <Typography.Link
                            strong
                            onClick={() => setInitialColumns(DEFAULT_COLUMNS_SET_DATA)}
                        >
                            {intl.formatMessage({ defaultMessage: "重置", id: "ws.result.list.columns.state.reset" })}
                        </Typography.Link>
                    </Row>
                    <Checkbox
                        key={"id"}
                        checked={true}
                        disabled={true}
                    >
                        {intl.formatMessage({ id: `ws.result.list.id` })}
                    </Checkbox>
                    <Checkbox.Group
                        value={checkedList}
                        onChange={onChange}
                    >
                        <Space direction="vertical" size={4}>
                            {

                                Object.entries(initialColumns).map((i: any) => {
                                    const [name] = i
                                    return (
                                        <Checkbox
                                            key={name}
                                            value={name}
                                            disabled={["id"].includes(name)}
                                        >
                                            {intl.formatMessage({ id: `ws.result.list.${name}` })}
                                        </Checkbox>
                                    )
                                })
                            }
                        </Space>
                    </Checkbox.Group>
                </Space>
            }
        >
            <Typography.Text style={{ cursor: "pointer" }}>
                <SettingOutlined />
            </Typography.Text>
        </Popover>
    )
}

const StateRow: React.FC<IProps> = (props) => {
    const { formatMessage } = useIntl()
    const { pageQuery, setPageQuery, stateCount, onSelectionChange, onFilterChange } = props

    const { query } = useLocation() as any
    const access = useAccess()

    const { state } = pageQuery

    const [inp, setInp] = React.useState("")
    const [filter, setFilter] = React.useState(JSON.stringify(query) !== "{}")
    const [keyType, setKeyType] = React.useState(1)

    /* filter change */
    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onFilterChange && onFilterChange(filter)
    }, [filter])

    /* selection type change */
    React.useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        onSelectionChange && onSelectionChange(keyType)
    }, [keyType])

    const jobStateKeys = [
        { name: formatMessage({ id: 'all' }), key: 'all_job', val: undefined, },
        { name: 'Pending', key: 'pending_job', val: 'pending' },
        { name: 'Running', key: 'running_job', val: 'running' },
        { name: 'Complete', key: 'success_job', val: 'success' },
        { name: 'Fail', key: 'fail_job', val: 'fail' },
    ]

    return (
        <Row justify="space-between" style={{ height: 48, padding: "0 20px" }}>
            <Space size="large">
                {
                    jobStateKeys.map((item: any) => (
                        <BaseState
                            active={state === item.val}
                            key={item.key}
                            onClick={
                                () => setPageQuery((p: any) => ({ ...p, state: item.val }))
                            }
                        >
                            {`${item.name}(${stateCount ? stateCount[item.key] : 0})`}
                        </BaseState>
                    ))
                }
            </Space>

            <Space size={16}>

                <Space>
                    <Typography.Text><FormattedMessage id="ws.result.list.selection.function" />：</Typography.Text>
                    <Radio.Group
                        onChange={({ target }: RadioChangeEvent) => setKeyType(target.value)}
                        value={keyType}
                    >
                        <Radio value={1}><FormattedMessage id="ws.result.list.report.and.analysis" /></Radio>
                        {access.WsMemberOperateSelf() && <Radio value={2}><FormattedMessage id="ws.result.list.batch.delete" /></Radio>}
                    </Radio.Group>
                </Space>

                <SettingDropdown />

                <Input.Search
                    style={{ width: 160 }}
                    allowClear
                    value={inp}
                    onChange={({ target }) => setInp(target.value)}
                    onPressEnter={() => setPageQuery((p: any) => ({ ...p, search: inp.replaceAll(" ", "") }))}
                    onSearch={(val) => setPageQuery((p: any) => ({ ...p, search: val.replaceAll(" ", "") }))}
                />
                <div onClick={() => setFilter(!filter)} style={{ cursor: 'pointer' }}>
                    {
                        filter ?
                            <Space><FormattedMessage id="ws.result.list.collapse.filter" /><UpOutlined /></Space> :
                            <Space><FormattedMessage id="ws.result.list.expand.filter" /><DownOutlined /></Space>
                    }
                </div>

            </Space>
        </Row>
    )
}

export default StateRow