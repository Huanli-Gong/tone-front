import React from 'react'
import { Button, Pagination, Row, Space, Spin, Typography } from "antd"
import { useIntl, useLocation, useParams } from 'umi'
import { queryBaselineList } from './services'
import { requestCodeMessage } from '@/utils/utils';
import { ImportOutlined } from "@ant-design/icons"
import styled from 'styled-components'

import AddModal from "./components/AddModal"
import BaselineFilter from "./components/BaselineSearch"
import ListContent from "./components/ListContent"
import RightContent from "./components/RightContent"

const gap = "16px";

const Container = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: ${gap};
    padding: 20px;
    overflow: hidden;
    position: relative;
`

const LoadingWrapper = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
`

const Body = styled.div`
    width: 100%;
    height: calc(100% - 22px - ${gap});
    display: flex;
    gap: ${gap};
`

const leftW = "395px";

const Left = styled.div`
    width: ${leftW};
    border: 1px solid #eee;
    height: 100%;
`

const LeftTopButton = styled.div`
    padding: 20px;    
`

const LeftFilterRow = styled.div`
    position: relative;
    width: 100%;
    height: 32px;
    background-color: rgba(0,0,0,.02);
    padding-left: 20px;
    padding-right: 10px;
    line-height: 32px;
    font-size: 14px;
    font-weight: 700;
    color: rgba(0,0,0,.85);
    display: flex;
    justify-content: space-between;
    align-items: center;
`

const Right = styled.div`
    height: 100%;
    width: calc(100% - ${leftW} - ${gap});
`

type IProps = Record<string, any>

const BaselineManage: React.FC<IProps> = (props) => {
    const { route: { name } } = props
    const intl = useIntl()
    const { pathname, query } = useLocation() as any
    const { ws_id }: any = useParams()
    const { baseline_id } = query

    const addBaselineModal = React.useRef<any>(null)

    const PAGE_DEFAULT_PARAMS: any = {
        test_type: name,
        page_size: 20,
        page_num: 1,
        ws_id
    }

    const [list, setList] = React.useState<Workspace.BaselineListQuery>()
    const [loading, setLoading] = React.useState<boolean>(true)
    const [listParams, setListParams] = React.useState<any>(PAGE_DEFAULT_PARAMS)
    const [current, setCurrent] = React.useState<Workspace.BaselineItem>({})  // 当前基线

    const fetchList = async (params = PAGE_DEFAULT_PARAMS) => {
        setLoading(true)
        const { code, msg, ...rest } = await queryBaselineList(params)
        setLoading(false)
        if (code !== 200) return requestCodeMessage(code, msg)
        setList(rest)
    }

    const queryData = async (params: any = PAGE_DEFAULT_PARAMS) => {
        setListParams(params)
        fetchList(params)
    }

    React.useMemo(() => {
        if (!list) return
        const { data } = list
        if (data && data?.length > 0) {
            const idx = data?.findIndex(({ id }: any) => id === (current?.id || + baseline_id))
            if (~idx) {
                setCurrent(data?.[idx])
                return;
            }
            setCurrent(data?.[0])
        }
        else
            setCurrent({})
    }, [list])

    React.useEffect(() => {
        queryData()
    }, [pathname])

    return (
        <Container>
            <Typography.Text >
                {intl.formatMessage({ id: `Workspace.baseline.${name}` })}
            </Typography.Text>
            <Body>
                <Left >
                    <LeftTopButton>
                        <Row justify={"space-between"}>
                            <Button
                                type="primary"
                                onClick={() => addBaselineModal.current?.show()}
                            >
                                {intl.formatMessage({ id: `baseline.create.btn` })}
                            </Button>
                            <Button type="link">
                                <ImportOutlined />
                            </Button>
                        </Row>
                    </LeftTopButton>
                    <LeftFilterRow>
                        <Space>
                            {intl.formatMessage({ id: `baseline.all.baseline` })}
                            <span>({list?.total || 0})</span>
                        </Space>
                        <BaselineFilter
                            search={listParams?.name}
                            onSearch={($name?: string) => {
                                queryData({ ...listParams, name: $name, page_num: 1 })
                            }}
                        />
                    </LeftFilterRow>
                    <ListContent
                        test_type={name}
                        current={current}
                        setCurrent={setCurrent as any}
                        {...list}
                        refresh={() => queryData(listParams)}
                    />
                    <Row
                        justify="space-between"
                        style={{ padding: "0 20px 8px" }}
                    >
                        {
                            intl.formatMessage({ id: "pagination.total.strip" }, { data: list?.total || 0 })
                        }
                        <Pagination
                            total={list?.total || 0}
                            current={listParams?.page_num}
                            pageSize={listParams?.page_size}
                            size="small"
                            onChange={(page_num, page_size) => {
                                queryData({ ...listParams, page_num, page_size })
                            }}
                        />
                    </Row>
                </Left>
                <Right>
                    <RightContent
                        test_type={name}
                        current={current}
                        refresh={() => queryData(listParams)}
                        {...list}
                        editRef={addBaselineModal}
                    />
                </Right>
            </Body>
            <AddModal
                ref={addBaselineModal}
                title={name}
                onOk={queryData}
            />
            {
                loading &&
                <LoadingWrapper>
                    <Spin spinning={loading} />
                </LoadingWrapper>
            }
        </Container>
    )
}

export default React.memo(BaselineManage)