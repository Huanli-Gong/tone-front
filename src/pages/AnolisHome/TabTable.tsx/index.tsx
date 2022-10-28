import React from "react"
import { Tabs, Row, Space, Input, Button, Spin, Empty } from "antd"
import { useIntl, useAccess, Access, history } from "umi"

import styled from "styled-components"
import { TSpace, Whiteboard } from "../styled"
import { TableRow, TableHeader } from "./TableColumns"

import { queryHomeWorkspace } from '@/services/Workspace';
import CommonPagination from "@/components/CommonPagination"

const BaseTabs = styled(Tabs)`
    .ant-tabs-nav {
        margin: 0;
        &::before { border: none; }
    }
    .ant-tabs-nav-wrap { padding: 0; }
`
const BaseBoard = styled.div`
    width: 100%;
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const DEFAULT_TAB_KEY = { scope: "history" }
const DEFAULT_PAGE_QUERY = { page_size: 50, page_num: 1 }

type DefaultListQuery = {
    page_num?: number;
    page_size?: number;
    total?: number;
    data?: any[]
} & Record<string, any>

const tabsKeys = ['all', 'history', 'joined', 'created']

const WorkspaceTabs: React.FC = () => {
    const intl = useIntl()
    const access = useAccess()

    const [loading, setLoading] = React.useState(true)
    const [params, setParams] = React.useState<DefaultListQuery>({ ...DEFAULT_TAB_KEY, ...DEFAULT_PAGE_QUERY })
    const [tabkey, setTabkey] = React.useState(DEFAULT_TAB_KEY.scope)

    const [dataSource, setDataSource] = React.useState<DefaultListQuery>({})

    const onSearch = (value: string) => {
        setParams(p => ({ ...p, keyword: value, ...DEFAULT_PAGE_QUERY }))
    }

    const fetcher = async () => {
        setLoading(true)
        const { code, msg, ...rest } = await queryHomeWorkspace(params)
        setLoading(false)
        setDataSource(code !== 200 ? {} : rest)
    }

    React.useEffect(() => {
        fetcher()
    }, [params])

    React.useEffect(() => {
        tabkey !== params.scope && setParams(p => ({ ...p, scope: tabkey, ...DEFAULT_PAGE_QUERY }))
    }, [tabkey])

    return (
        <Whiteboard style={{ width: "100%", padding: "8px 20px" }} direction="vertical">
            <Row style={{ background: "#fff", width: "100%" }} justify="space-between" align="middle">
                <BaseTabs
                    defaultActiveKey={tabkey}
                    onTabClick={t => setTabkey(t)}
                >
                    {
                        tabsKeys.map((i: string) => (
                            <Tabs.TabPane
                                key={i}
                                tab={intl.formatMessage({ id: `pages.home.tab.${i}` })}
                            />
                        ))
                    }
                </BaseTabs>
                <Space>
                    <Input.Search
                        placeholder={intl.formatMessage({ id: 'pages.home.input.placeholder' })}
                        onSearch={onSearch}
                        style={{ width: 270 }}
                        allowClear={true}
                    />
                    <Access accessible={access.ApplyPrivate()}>
                        <Button onClick={() => history.push('/workspace/create')}>
                            {
                                intl.formatMessage({ id: "pages.home.create.workspace" })
                            }
                        </Button>
                    </Access>
                </Space>
            </Row>
            <Row>
                <TSpace direction="column" gap={8} style={{ width: "100%" }}>
                    {
                        !loading &&
                        (
                            !!dataSource.data?.length ?
                                <>
                                    <TableHeader />
                                    {
                                        (dataSource?.data || []).map((i: any) => (
                                            <TableRow
                                                key={i.id}
                                                {...i}
                                            />
                                        ))
                                    }
                                    <CommonPagination
                                        total={dataSource?.total || 0}
                                        pageSize={params?.page_size || 50}
                                        currentPage={params?.page_num || 1}
                                        onPageChange={(page_num, page_size) => setParams((p: any) => ({ ...p, page_num, page_size }))}
                                    />
                                </> :
                                <BaseBoard>
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </BaseBoard>
                        )
                    }
                    {loading && <BaseBoard ><Spin /></BaseBoard>}
                </TSpace>
            </Row>
        </Whiteboard>
    )
}

export default WorkspaceTabs