import React from "react"
import { Select, SelectProps, Spin, Tag, Empty, Input } from "antd"
import { useRequest, useParams, request } from "umi"
import {
    queryCreators,
    queryTag,
    queryTestServer,
    queryTestSuite,
    queryJobType,
    queryProjectId,
    queryTestCloudServer
} from '../../services'
import styled from "styled-components"

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

    const { data, loading, run } = useRequest(
        (params = { ws_id }) => api(params),
        { debounceInterval: 300 }
    )

    const { placeholder } = rest
    if (!data) return <Input placeholder={placeholder} />

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
        >
            {
                states.map((item: any) => (
                    <Select.Option
                        key={item.value}
                        value={item.value}
                    >
                        <Tag
                            color={item.bgColor}
                            style={{ color: item.color ? item.color : '' }}
                        >
                            {item.label}
                        </Tag>
                    </Select.Option>
                ))
            }
        </Select>
    )
}

const TagSelect: React.FC<any> = (props) => {
    const { ws_id } = useParams() as any
    const { api, ...rest } = props
    const { data } = useRequest(() => queryTag({ ws_id }), { debounceInterval: 300 })

    const { placeholder } = rest
    if (!data) return <Input placeholder={placeholder} />

    return (
        <TagSelectStyled
            {...rest}
            tagRender={tagRender}
            labelInValue
            mode="multiple"
        >
            {
                data.map(
                    (item: any) => (
                        <Select.Option
                            value={item.id}
                            key={item.id}
                            label={item.name}
                        >
                            <Tag
                                color={item.tag_color}
                                style={{ color: item.color ? item.color : '' }}
                            >
                                {item.name}
                            </Tag>
                        </Select.Option>
                    )
                )
            }
        </TagSelectStyled>
    )
}

const ServerSelect: React.FC<any> = (props) => {
    const { onChange, placeholder } = props
    const { ws_id } = useParams() as any

    const { data } = useRequest(() => request(`/api/server/server_snapshot/`, { params: { ws_id } }))

    /* const { data: group } = useRequest(() => queryTestServer({ ws_id, page_size: 999 }), { initialData: [] })
    const { data: cloud } = useRequest(() => queryTestCloudServer({ ws_id, page_size: 999 }), { initialData: [] })

    const cloudList = cloud.filter((obj: any) => obj && obj.is_instance).map((i: any) => ({ value: i.private_ip, label: i.private_ip }))
    const groupList = group.reduce((pre: any, cur: any, index: any) => {
        const { sub_server_list, ip } = cur
        let list: any = []
        if (sub_server_list && sub_server_list.length > 0) {
            list = list.concat(sub_server_list.map((child: any) => ({ value: child.ip, label: child.ip })))
        }
        return pre.concat({ value: ip, label: ip }, list)
    }, [])

    const options = groupList.concat(cloudList) */


    if (!data)
        return (
            <Select
                mode="multiple"
                {...props}
            />
        )

    const options = data.map((ips: any) => ({ label: ips, value: ips })).filter(Boolean)

    return (
        <Select
            {...props}
            mode="multiple"
            onSelect={onChange}
            options={options}
        />
    )
}

export const columns = [
    {
        name: "job_id",
        label: "JobID",
        placeholder: "请输入JobID",
    },
    {
        name: "name",
        label: "Job名称",
        placeholder: "请输入Job名称",
    },
    {
        label: '失败case',
        name: 'fail_case',
        placeholder: "请输入多个失败case,多个以英文逗号分隔",
    }, // 可输入多个
    {
        label: '创建人',
        name: 'creators',
        placeholder: "请选择创建人",
        searchKey: "keyword",
        render: (
            <BasicSelect
                api={queryCreators}
                mode="multiple"
                labelInValue
            />
        ),
        dataSet: (item: any) => ({ value: item.id, label: item.last_name })
    }, // 可选择多个 // 
    {
        label: 'Job标签',
        name: 'tags',
        placeholder: "请选择标签",
        render: <TagSelect />,
    }, // 可选择多个 // /api/job/tag/ws_id=xxx  标签
    {
        label: '状态',
        name: 'state',
        placeholder: "请选择状态",
        render: <StateSelect />
    },  // Pending（pending）、Running（running）、Success、Fail、Stop  状态
    {
        label: '测试机',
        name: 'server',
        placeholder: "请选择测试机",
        render: <ServerSelect />
    }, // api/server/test_server//? ws_id=4
    {
        label: 'TestSuite',
        name: 'test_suite',
        placeholder: "请选择TestSuite",
        render: (
            <BasicSelect
                api={queryTestSuite}
                searchKey="name"
                mode="multiple"
                labelInValue
            />
        ),
        dataSet: (item: any) => ({ ...item, value: item.id, label: item.name })
    }, // 可选择多个 // api/case/test_suite/? page_num=4 & page_size=1000
    {
        label: 'Job类型',
        name: 'job_type_id',
        placeholder: "请选择Job类型",
        render: (
            <BasicSelect
                api={queryJobType}
                labelInValue
            />
        ),
        dataSet: (item: any) => ({ label: item.name, value: item.id })
    }, // api/job/type/?ws_id=xxx
    {
        label: '测试类型',
        name: 'test_type',
        placeholder: "请选择测试类型",
        render: (
            <BasicSelect
                options={[
                    { value: 'functional', label: '功能测试' },
                    { value: 'performance', label: '性能测试' },
                    { value: 'business', label: '业务测试' },]
                }
            />
        )
    }, // 功能测试（functional）、性能测试（performance）
    {
        label: '所属项目',
        name: 'project_id',
        placeholder: "请选择所属项目",
        render: <BasicSelect api={queryProjectId} />,
        dataSet: (item: any) => ({ value: item.id, label: `${item.name}(${item.product_name})` })
    } // /api/sys/product/?ws_id=xxx   # 所属项目
]