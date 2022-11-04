import React from "react"
import { Space, Tabs } from "antd"
import styled from "styled-components"
import { useAccess, useParams, useLocation, useIntl } from "umi"
import { queryTestResultList } from "../services"
import StateRow from "./StateRow"
import ListTable from "./ListTable"
import FilterRow from "./Filters"
import { columns } from "./Filters/columns"

const activeCss = `
    color: #1890FF;
    background-color: #E6F7FF;
`

type TitleCountProps = {
    currentActive: boolean;
}

const TabPaneTitleCount = styled.span<TitleCountProps>`
    height: 20px;
    display: inline-block;
    border-radius: 12px;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    padding: 0 7px;
    margin-top: 2px;
    font-weight: 500;

    ${({ currentActive }) => currentActive ? activeCss : "background-color: rgba(0,0,0,.04);"}
`

const TabPaneTitle = styled(Space)`
    font-size: 16px;
    font-weight: 500;
    background-color: #fafbfc;
    &:hover{
        color: #1890FF;
        ${TabPaneTitleCount} {
            background: #E6F7FF;
        }
    }
`

const TabsStyled = styled(Tabs)`
    width: 100%;
    overflow: hidden;

    .ant-tabs-nav {
        margin: 0;
    }

    .ant-tabs-nav-wrap {
        background-color: #fafbfc;
        height: 64px;
        border-bottom: 1px solid #f0f0f0;
    }
`

type IProps = {
    [k: string]: any
}

const DEFAULT_PAGE_QUERY = { page_num: 1, page_size: 20 }

const BaseTab: React.FC<IProps> = (props) => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { query } = useLocation() as any

    const access = useAccess()

    const [tab, setTab] = React.useState(query.tab ?? "all")
    const [pageQuery, setPageQuery] = React.useState({ ...DEFAULT_PAGE_QUERY, ...query, tab, ws_id, state: query.state || "" })
    const [selectionType, setSelectionType] = React.useState()
    const [filter, setFilter] = React.useState(false)

    const [source, setSource] = React.useState()

    const fetchTestJobCount = async () => {
        const { code, msg, ...rest } = await queryTestResultList({ query_count: 1, tab, ws_id })
        if (code !== 200) return
        setSource(rest)
    }

    React.useEffect(() => {
        fetchTestJobCount()
    }, [tab, ws_id])

    const defaultTabKeys = [
        { tab: formatMessage({ id: 'ws.result.list.all.job' }), key: 'all' },
        access.IsWsSetting() && { tab: formatMessage({ id: 'ws.result.list.my.job' }), key: 'my' },
        access.IsWsSetting() && { tab: formatMessage({ id: 'ws.result.list.collection' }), key: 'collection' }
    ].filter(Boolean)

    const hanldeTabClick = (tabKey: string) => {
        setTab(tabKey)
        setPageQuery((p: any) => ({ tab: tabKey, ...DEFAULT_PAGE_QUERY, state: "", ws_id }))
    }

    return (
        <React.Fragment>
            <TabsStyled
                onTabClick={hanldeTabClick}
                activeKey={tab}
            >
                {
                    defaultTabKeys.map(
                        ($tab: any) => {
                            return (
                                <Tabs.TabPane
                                    key={$tab.key}
                                    tab={
                                        <TabPaneTitle size={4}>
                                            <span >{$tab.tab}</span>
                                            <TabPaneTitleCount
                                                currentActive={tab === $tab.key}
                                            >
                                                {
                                                    source ?
                                                        source[`${$tab.key === 'all' ? 'ws' : $tab.key}_job`] : 0
                                                }
                                            </TabPaneTitleCount>
                                        </TabPaneTitle>
                                    }
                                >
                                    <StateRow
                                        stateCount={source}
                                        pageQuery={pageQuery}
                                        setPageQuery={setPageQuery}
                                        onSelectionChange={setSelectionType}
                                        onFilterChange={setFilter}
                                    />
                                    {
                                        filter &&
                                        <FilterRow
                                            columns={
                                                columns.map((item: any) =>
                                                ({
                                                    ...item,
                                                    placeholder: formatMessage({ id: `ws.result.list.please.placeholder.${item.name}` }),
                                                })
                                                )
                                            }
                                            pageQuery={pageQuery}
                                            onChange={(vals) => setPageQuery((p: any) => ({ tab, ws_id, state: p.state, ...vals, ...DEFAULT_PAGE_QUERY }))}
                                        />
                                    }

                                </Tabs.TabPane>
                            )
                        }
                    )
                }
            </TabsStyled>
            <ListTable
                pageQuery={pageQuery}
                countRefresh={fetchTestJobCount}
                setPageQuery={setPageQuery}
                radioValue={selectionType}
            />
        </React.Fragment>
    )
}

export default BaseTab