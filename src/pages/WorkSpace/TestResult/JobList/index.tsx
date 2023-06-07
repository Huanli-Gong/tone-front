import React from "react"
import { Space, Tabs } from "antd"
import styled from "styled-components"
import { useAccess, useParams, useLocation, useIntl } from "umi"
import { queryTestResultList } from "../services"
import StateRow from "./StateRow"
import ListTable from "./ListTable"
import FilterRow from "./Filters"
import { filterColumns } from "./Filters/columns"
import { JobListProvider } from "./provider"

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

    .ant-tabs-nav, 
    div > .ant-tabs-nav {
        margin: 0!important;
    }

    .ant-tabs-nav-wrap {
        background-color: #fafbfc;
        height: 64px;
        border-bottom: 1px solid #f0f0f0;
    }
`

type IProps = Record<string, any>

const DEFAULT_PAGE_QUERY = { page_num: 1, page_size: 20 }

const DEFAULT_COLUMNS_SET_DATA = {
    name: { order: 1, disabled: false, },
    state: { order: 2, disabled: false },
    test_type: { order: 3, disabled: false, },
    test_result: { order: 4, disabled: false, },
    project_name: { order: 5, disabled: false, },
    product_version: { order: 6, disabled: true, },
    creator_name: { order: 7, disabled: false, },
    start_time: { order: 8, disabled: false, },
    end_time: { order: 9, disabled: false, },
}

const REMEBER_COLUMNS_STATE_STRING_KEY = "test-job-list-columns-state"

const BaseTab: React.FC<IProps> = () => {
    const { formatMessage } = useIntl()
    const { ws_id } = useParams() as any
    const { query } = useLocation() as any

    const access = useAccess()

    const [tab, setTab] = React.useState(query.tab ?? "all")
    const [pageQuery, setPageQuery] = React.useState({ ...DEFAULT_PAGE_QUERY, tab, ws_id, ...query })
    const [selectionType, setSelectionType] = React.useState(1)
    const [filter, setFilter] = React.useState(false)

    const [initialColumns, setInitialColumns] = React.useState({})

    React.useEffect(() => {
        const columnStates = localStorage.getItem(REMEBER_COLUMNS_STATE_STRING_KEY)
        if (!columnStates) {
            localStorage.setItem(REMEBER_COLUMNS_STATE_STRING_KEY, JSON.stringify(DEFAULT_COLUMNS_SET_DATA))
            setInitialColumns(DEFAULT_COLUMNS_SET_DATA)
        }
        else {
            const base = JSON.parse(columnStates)

            setInitialColumns(
                base.product_version ?
                    base :
                    { ...base, product_version: DEFAULT_COLUMNS_SET_DATA.product_version }
            )
        }
    }, [])

    React.useEffect(() => {
        if (JSON.stringify(initialColumns) !== "{}")
            localStorage.setItem(REMEBER_COLUMNS_STATE_STRING_KEY, JSON.stringify(initialColumns))
    }, [initialColumns])

    const [source, setSource] = React.useState()

    const fetchTestJobCount = React.useCallback(async () => {
        const { code, ...rest } = await queryTestResultList({ query_count: 1, tab, ws_id })
        if (code !== 200) return
        setSource(rest)
    }, [tab, ws_id])

    React.useEffect(() => {
        fetchTestJobCount()
    }, [tab, ws_id])

    React.useEffect(() => {
        if (ws_id !== pageQuery.ws_id)
            setPageQuery(({ ...DEFAULT_PAGE_QUERY, tab: "all", ws_id }))
    }, [pageQuery.ws_id, ws_id])

    const defaultTabKeys = [
        { tab: formatMessage({ id: 'ws.result.list.all.job' }), key: 'all' },
        access.IsWsSetting() && { tab: formatMessage({ id: 'ws.result.list.my.job' }), key: 'my' },
        access.IsWsSetting() && { tab: formatMessage({ id: 'ws.result.list.collection' }), key: 'collection' }
    ].filter(Boolean)

    const hanldeTabClick = (tabKey: string) => {
        setTab(tabKey)
        setPageQuery({ tab: tabKey, ...DEFAULT_PAGE_QUERY, ws_id })
    }

    return (
        <JobListProvider.Provider value={{ initialColumns, setInitialColumns, DEFAULT_COLUMNS_SET_DATA }}>
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
                                            selectionType={selectionType}
                                            onSelectionChange={setSelectionType}
                                            onFilterChange={setFilter}
                                        />
                                        {
                                            filter &&
                                            <FilterRow
                                                columns={
                                                    filterColumns.map((item: any) => ({
                                                        ...item,
                                                        placeholder: formatMessage({ id: `ws.result.list.please.placeholder.${item.name}` }),
                                                    }))
                                                }
                                                pageQuery={pageQuery}
                                                onChange={(vals) => setPageQuery({ tab, ws_id, ...vals, ...DEFAULT_PAGE_QUERY })}
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
                    setRadioValue={setSelectionType}
                />
            </React.Fragment>
        </JobListProvider.Provider>
    )
}

export default BaseTab