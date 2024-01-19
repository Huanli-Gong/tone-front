import React from "react"
import { Select, Spin, Tag, Empty } from "antd"
import type { SelectProps } from "antd"
import { useRequest, useParams, request, FormattedMessage } from "umi"
import {
    queryTag,
    queryTestSuite,
    queryJobType,
    queryProjectId,
} from '../../services'
import styled from "styled-components"
import { queryMember } from "@/services/Workspace"

const TagSelectStyled = styled(Select)`
    /* .ant-select-selector { padding-left: 4px!important; }; */
`

const stateRender = ({ label, value }: any) => {
    return (
        <Tag
            color={label.props?.color}
            closable={false}
            style={{ marginRight: 3 }}
        >
            {label.props?.children || value}
        </Tag>
    )
}

const tagRender = ({ label, closable, onClose, value }: any) => {
    return (
        <Tag
            color={label.props?.color}
            closable={closable}
            onClose={onClose}
            style={{ marginRight: 3 }}
        >
            {label.props?.children || value}
        </Tag>
    )
}

const BasicSelect: React.FC<SelectProps & any> = (props) => {
    const { ws_id } = useParams() as any
    const { api, dataSet, searchKey, ...rest } = props

    if (!api)
        return <Select {...rest} />

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, loading, run } = useRequest(
        (params = { ws_id, page_num: 1, page_size: 500 }) => api(params),
        { debounceInterval: 300 }
    )

    const { placeholder, value, ...iProps } = rest
    if (!data) return <Select loading={loading} placeholder={placeholder} {...iProps} />

    const handleSearch = (keyword: any) => {
        if (!searchKey) return
        run({ [searchKey]: keyword, ws_id })
    }

    let selectProps = {
        ...rest,
        notFoundContent: loading ?
            <Spin size="small" /> :
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
        options: dataSet ? data.map(dataSet) : data,
    }

    if (searchKey) {
        selectProps = {
            ...selectProps,
            onSearch: handleSearch,
            filterOption: false
        }
    }

    const hanldeVisibleChange = (v: boolean) => {
        if (v) return
        run({ ws_id })
    }

    return (
        <Select {...selectProps} onDropdownVisibleChange={hanldeVisibleChange} />
    )
}


const states = [
    { value: 'success', label: 'Complete', bgColor: '#81BF84' },
    { value: 'pass', label: 'Pass', bgColor: '#81BF84' },
    { value: 'running', label: 'Running', bgColor: '#649FF6' },
    { value: 'fail', label: 'Fail', bgColor: '#C84C5A' },
    { value: 'pending', label: 'Pending', bgColor: '#D9D9D9', color: '#1d1d1d' },
    { value: 'stop', label: 'Stop', bgColor: '#D9D9D9', color: '#1d1d1d' },
    { value: 'skip', label: 'Skip', bgColor: '#D9D9D9', color: '#1d1d1d' }
]

const StateSelect: React.FC<any> = (props) => {
    return (
        <Select
            {...props}
            tagRender={stateRender}
            options={
                states.map((i: any) => ({
                    value: i.value,
                    label: (
                        <Tag
                            color={i.bgColor}
                            style={{ color: i.color ? i.color : '' }}
                        >
                            {i.label}
                        </Tag>
                    ),
                    name: i.label
                }))
            }
        />
    )
}

const TagSelect: React.FC<any> = (props) => {
    const { ws_id } = useParams() as any
    const { data, loading } = useRequest(() => queryTag({ ws_id }), { debounceInterval: 300 })

    const { placeholder, value, ...rest } = props
    if (!data) return <Select loading={loading} placeholder={placeholder} {...rest} />

    return (
        <TagSelectStyled
            {...props}
            tagRender={tagRender}
            labelInValue
            filterOption={(input, option) => (option?.name ?? '').toLowerCase().includes(input.toLowerCase())}
            mode="multiple"
            options={
                data.map((i: any) => ({
                    value: i.id,
                    label: (
                        <Tag
                            color={i.tag_color}
                            style={{ color: i.color ? i.color : '' }}
                        >
                            {i.name}
                        </Tag>
                    ),
                    name: i.name
                }))
            }
        />
    )
}

const ServerSelect: React.FC<any> = (props) => {
    const { onChange, value, ...iProps } = props
    const { ws_id } = useParams() as any

    const { data, loading } = useRequest(() => request(`/api/server/server_snapshot/`, { params: { ws_id } }))

    if (!data)
        return (
            <Select
                mode="multiple"
                loading={loading}
                {...iProps}
            />
        )

    const options = data.map((ips: any) => ({ label: ips, value: ips })).filter(Boolean)

    return (
        <Select
            {...props}
            mode="multiple"
            onSelect={onChange}
            options={options}
            filterOption={(input, option: any) => option.value?.indexOf(input.trim()) >= 0}
        />
    )
}

export const filterColumns = [
    {
        name: "job_id",
        label: <FormattedMessage id="ws.result.list.job_id" />,
    },
    {
        name: "name",
        label: <FormattedMessage id="ws.result.list.name" />,
    },
    {
        label: <FormattedMessage id="ws.result.list.fail_case" />,
        name: 'fail_case',
    }, // 可输入多个
    {
        label: <FormattedMessage id="ws.result.list.creators" />,
        name: 'creators',
        searchKey: "keyword",
        render: (
            <BasicSelect
                api={queryMember}
                mode="multiple"
                labelInValue
            />
        ),
        dataSet: (item: any) => ({ value: item.id, label: item.last_name })
    }, // 可选择多个 // 
    {
        label: <FormattedMessage id="ws.result.list.tags" />,
        name: 'tags',
        render: <TagSelect />,
    }, // 可选择多个 // /api/job/tag/ws_id=xxx  标签
    {
        label: <FormattedMessage id="ws.result.list.state" />,
        name: 'state',
        render: <StateSelect />
    },  // Pending（pending）、Running（running）、Success、Fail、Stop  状态
    {
        label: <FormattedMessage id="ws.result.list.server" />,
        name: 'server',
        render: <ServerSelect />
    }, // api/server/test_server//? ws_id=4
    {
        label: <FormattedMessage id="ws.result.list.test_suite" />,
        name: 'test_suite',
        render: (
            <BasicSelect
                api={queryTestSuite}
                searchKey="name"
                mode="multiple"
                labelInValue
            />
        ),
        dataSet: (item: any) => ({ ...item, value: item.id, label: item.name })
    },
    // 可选择多个 // api/case/test_suite/? page_num=4 & page_size=1000
    {
        label: <FormattedMessage id="ws.result.list.test_conf" />,
        name: 'test_conf',
    },
    {
        label: <FormattedMessage id="ws.result.list.job_type_id" />,
        name: 'job_type_id',
        render: (
            <BasicSelect
                api={queryJobType}
                labelInValue
            />
        ),
        dataSet: (item: any) => ({ label: item.name, value: item.id })
    }, // api/job/type/?ws_id=xxx
    {
        label: <FormattedMessage id="ws.result.list.test_type" />,
        name: 'test_type',
        render: (
            <BasicSelect
                options={[
                    { value: 'functional', label: <FormattedMessage id="functional.test" /> },
                    { value: 'performance', label: <FormattedMessage id="performance.test" /> },
                    { value: 'business', label: <FormattedMessage id="business.test" /> },]
                }
            />
        )
    },
    // 功能测试（functional）、性能测试（performance）
    {
        label: <FormattedMessage id="ws.result.list.project_id" />,
        name: 'project_id',
        render: <BasicSelect api={queryProjectId} />,
        dataSet: (item: any) => ({ value: item.id, label: `${item.name}(${item.product_name})` })
    },
    // /api/sys/product/?ws_id=xxx   # 所属项目
    {
        label: <FormattedMessage id="ws.result.list.product_version" />,
        name: 'product_version',
    },
]