import { Row, Space, Typography, Radio, Input, Popover, Checkbox } from "antd"
import type { RadioChangeEvent } from "antd"
import React from "react"
import styled from "styled-components"
import { useAccess, useLocation, useIntl, FormattedMessage } from "umi"
import { DownOutlined, UpOutlined, SettingOutlined } from '@ant-design/icons'
import { useProvider } from "./provider"
import produce from "immer"

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
    const { initialColumns, setInitialColumns } = useProvider()
    const intl = useIntl()

    return (
        <Popover
            placement="bottom"
            content={
                <Space direction="vertical" size={0}>
                    {
                        Object.entries(initialColumns).map((i: any) => {
                            const [name, value] = i
                            return (
                                <Checkbox
                                    key={name}
                                    checked={!value?.disabled}
                                    onChange={({ target }) => {
                                        setInitialColumns(produce(initialColumns, (draft: any) => {
                                            draft[name] = {
                                                ...draft[name],
                                                disabled: !target.checked
                                            }
                                        }))
                                    }}
                                >
                                    {intl.formatMessage({ id: `ws.result.list.${name}` })}
                                </Checkbox>
                            )
                        })
                    }
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