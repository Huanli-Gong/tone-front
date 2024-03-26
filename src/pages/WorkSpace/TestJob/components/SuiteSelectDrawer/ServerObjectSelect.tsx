/* eslint-disable react-hooks/exhaustive-deps */
import { Select, Badge, Typography, Form } from 'antd'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { standloneServerList, queryClusterServer, queryClusterStandaloneServer, queryClusterGroupServer } from './services';
import debounce from 'lodash/debounce';
import { DrawerProvider } from './Provider'
import { useParams, useIntl } from 'umi'
import DropdownRender from '../DropdownRender';
import { useDocumentVisibility } from 'ahooks';

const getServerStatusMap = (state: string) => new Map([
    ["Available", "success"],
    ["Occupied", "error"],
    ["Reserved", "warning"],
]).get(state) || undefined

const filterRepeat = (olds: any = [], vals: any = []) => {
    const ids = olds?.map(({ id }: any) => id)
    return vals?.reduce((pre: any, cur: any) => {
        if (ids.includes(cur.id)) return pre
        return pre.concat(cur)
    }, []).concat(olds)
}

const ServerObjectSelect = (props: any) => {
    const { formatMessage } = useIntl()
    const { serverObjectType, run_mode, server_type, serverList } = props
    const { ws_id } = useParams<any>()
    const { setServerList } = useContext<any>(DrawerProvider)
    const PAGE_SIZE = 100
    const [fetching, setFetching] = useState(true)
    const [pageNum, setPageNum] = useState(1)
    const [pageVisibleState, setPageVisibleState] = React.useState(false)
    const [searchValue, setSearchValue] = useState(undefined)

    //内网单机
    const standaloneServerRequest = async (page_num = 1) => {
        const search = searchValue ? { ip: searchValue }: {}
        const { data, code } = await standloneServerList({ ws_id, state: ['Available', 'Occupied', 'Reserved'], page_num, page_size: PAGE_SIZE, ...search }) //, page_size : 2
        if (code === 200 && data) setServerList((p: any) => filterRepeat(p, data))
    }

    //内网集群
    const clusterServerRequest = async (page_num = 1) => {
        const search = searchValue ? { ip: searchValue }: {}
        const { data, code } = await queryClusterServer({ cluster_type: 'aligroup', ws_id, page_num, page_size: PAGE_SIZE, ...search })
        if (code === 200 && data) setServerList((p: any) => filterRepeat(p, data))
    }

    //云上单机
    const clusterStandaloneRequest = async () => {
        const search = searchValue ? { ip: searchValue }: {}
        const { data, code } = await queryClusterStandaloneServer({ ws_id, no_page: true, is_instance: serverObjectType === 'instance', state: ['Available', 'Occupied', 'Reserved'], ...search })
        if (code === 200 && data) setServerList((p: any) => filterRepeat(p, data))
    }

    //云上集群
    const clusterGroupRequest = async () => {
        const search = searchValue ? { ip: searchValue }: {}
        const { data, code } = await queryClusterGroupServer({ cluster_type: 'aliyun', ws_id, no_page: true, ...search })
        if (code === 200 && data) setServerList((p: any) => filterRepeat(p, data))
    }

    const queryServerList = async (page_num = 1) => {
        setFetching(true)
        if (server_type === 'aligroup') {
            if (run_mode === 'cluster')
                await clusterServerRequest(page_num)
            else
                await standaloneServerRequest(page_num)
        }
        else { //aliyun
            if (run_mode === 'cluster')
                await clusterGroupRequest()
            else
                await clusterStandaloneRequest()
        }
        setFetching(false)
    }

    useEffect(() => {
        if (serverObjectType !== 'ip' && serverObjectType !== 'server_tag_id') {
            queryServerList(1)
            setPageNum(1)
        }

        return () => {
            setPageVisibleState(false)
        }
    }, [serverObjectType, searchValue])

    const state = useDocumentVisibility()

    React.useEffect(() => {
        if (state === "hidden")
            setPageVisibleState(true)
        if (pageVisibleState && state === "visible") {
            queryServerList(1)
            setPageNum(1)
        }
    }, [state])

    const handleServerPopupScroll = ({ target }: any) => { //server
        if (server_type !== 'aligroup') return
        const { clientHeight, scrollHeight, scrollTop } = target
        if (clientHeight + scrollTop === scrollHeight) {
            const num = pageNum + 1
            setPageNum(num)
            queryServerList(num)
        }
    }

  // 搜索
  const onSearch = (word: any)=> {
    // console.log('word:', word)
    if (word) { 
        setSearchValue(word) 
    } else {
        setSearchValue(undefined)
    }
  }

    const switchServerMessage = useMemo(
        () => {
            switch (serverObjectType) {
                case 'server_object_id': return formatMessage({ id: 'select.suite.server_object_id.message' });
                case 'instance': return formatMessage({ id: 'select.suite.instance.message' });
                case 'setting': return formatMessage({ id: 'select.suite.setting.message' });
                default: return ''
            }
        }, [serverObjectType]
    )

    const options = useMemo(() => {
        let $options = []
        if (serverObjectType === 'server_object_id') {
            if (run_mode === 'standalone')
                $options = serverList.map((item: any) => {
                    const text = item.ip || item.sn
                    return {
                        value: item.id,
                        label: (
                            <Typography.Text ellipsis={{ tooltip: text }}>
                                <Badge status={getServerStatusMap(item.state) as any} style={{ marginRight: 8 }} />
                                {text}
                            </Typography.Text>
                        ),
                        search_key: text
                    }
                })
            else
                $options = serverList.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                    search_key: item.name
                }))
        }
        if (serverObjectType === 'instance')
            $options = serverList.filter((i: any) => i.is_instance).map((item: any) => {
                const ip = BUILD_APP_ENV ? item.private_ip : item.pub_ip
                const text = ip ? `${ip} / ${item.instance_name}` : item.instance_name
                return {
                    value: item.id,
                    label: (
                        <Typography.Text ellipsis={{ tooltip: text }}>
                            <Badge style={{ marginRight: 8 }} status={getServerStatusMap(item.state) as any} />
                            {text}
                        </Typography.Text>
                    ),
                    search_key: text
                }
            })

        if (serverObjectType === 'setting')
            $options = serverList.filter((i: any) => !i.is_instance).map((item: any) => ({
                value: item.id,
                label: <Typography.Text ellipsis={{ tooltip: true }}>{item.template_name}</Typography.Text>,
                search_key: item.template_name
            }))

        return $options
    }, [serverList, serverObjectType, run_mode])

    if (["ip", "server_tag_id"].includes(serverObjectType))
        return <></>

    return (
        <Form.Item noStyle>
            <Form.Item
                name="server_object_id"
                rules={[{ required: true, message: switchServerMessage }]}
            >
                <Select
                    allowClear
                    style={{ width: '100%' }}
                    placeholder={switchServerMessage}
                    dropdownMatchSelectWidth={340}
                    showSearch
                    onSearch={debounce(onSearch, 300)}
                    loading={fetching}
                    onPopupScroll={handleServerPopupScroll}
                    popupClassName="job_select_drop_cls"
                    dropdownRender={(menu: any) => (
                        <DropdownRender
                            menu={menu}
                            uri={`/ws/${ws_id}/device/${server_type === "aliyun" ? "cloud" : "group"}?t=${run_mode}&isInstance=${serverObjectType === "instance" ? 1 : 0}`}
                        />
                    )}
                    optionFilterProp="children"
                    filterOption={(input, option) => (option?.search_key ?? '').toLowerCase().includes(input.toLowerCase())}
                    options={options}
                />
            </Form.Item>
        </Form.Item>
    )
}

export default ServerObjectSelect