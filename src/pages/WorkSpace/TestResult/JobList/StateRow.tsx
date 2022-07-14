import { Row, Space, Typography, Radio, Input, RadioChangeEvent } from "antd"
import React from "react"
import styled from "styled-components"
import { useAccess, useLocation, useParams } from "umi"
import { DownOutlined, UpOutlined } from '@ant-design/icons'

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

type IProps = {
    [k: string]: any;
}

const StateRow: React.FC<IProps> = (props) => {
    const { pageQuery, setPageQuery, stateCount, onSelectionChange, onFilterChange } = props

    const { ws_id } = useParams() as any
    const { query } = useLocation() as any
    const access = useAccess()

    const { state } = pageQuery

    const [inp, setInp] = React.useState("")
    const [filter, setFilter] = React.useState(JSON.stringify(query) !== "{}")
    const [keyType, setKeyType] = React.useState(1)

    /* filter change */
    React.useEffect(() => {
        onFilterChange && onFilterChange(filter)
    }, [filter])

    /* selection type change */
    React.useEffect(() => {
        onSelectionChange && onSelectionChange(keyType)
    }, [keyType])

    const jobStateKeys = [
        { name: '全部', key: 'all_job', val: '', },
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
                                () => setPageQuery((p: any) => ({ ...p, ws_id, page_size: 20, page_num: 1, state: item.val }))
                            }
                        >
                            {`${item.name}(${stateCount ? stateCount[item.key] : 0})`}
                        </BaseState>
                    ))
                }
            </Space>

            <Space>
                <Space>
                    <Typography.Text >选择作用：</Typography.Text>
                    <Radio.Group
                        onChange={({ target }: RadioChangeEvent) => setKeyType(target.value)}
                        value={keyType}
                    >
                        <Radio value={1}>报告和分析</Radio>
                        {access.WsMemberOperateSelf() && <Radio value={2}>批量删除</Radio>}
                    </Radio.Group>
                </Space>
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
                            <Space>收起过滤<UpOutlined /></Space> :
                            <Space>展开过滤<DownOutlined /></Space>
                    }
                </div>
            </Space>
        </Row>
    )
}

export default StateRow