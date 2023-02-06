import React, { useState, useEffect, useImperativeHandle, useRef, useMemo } from 'react';
import styles from '../style.less';
import { useIntl, FormattedMessage, getLocale } from 'umi'
import { WorkspaceTable, WorkspaceList, TableListParams } from '../../data.d';
import { Avatar, Space, Switch, Table, Typography, Row, message } from 'antd';
import { HolderOutlined } from '@ant-design/icons'
import { workspaceList, updateTopWorkspaceOrder, getWrokspaces } from '../../service';
import { ReactComponent as PublicIcon } from '@/assets/svg/public.svg'
import { ReactComponent as UnPublicIcon } from '@/assets/svg/no_public.svg'
import AvatarCover from '@/components/AvatarCover'
import DetailModal from '../DetailModal';
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragableBodyRow from '@/components/Table/DrageTable'
import CommonPagination from '@/components/CommonPagination';
import { QusetionIconTootip } from '@/components/Product';
import { saveWorkspaceConfig } from '@/services/Workspace';
import EllipsisPulic from '@/components/Public/EllipsisPulic';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

const UserTable: React.FC<WorkspaceList> = ({ is_public, onRef, top, tab }) => {
    const { formatMessage } = useIntl()
    const enLocale = getLocale() === 'en-US'

    const [keyword, setKeyword] = useState<string>('')
    const detailModalRef = useRef<{ show: (ws_id: string) => void }>(null)
    const initParams = { page_num: 1, page_size: 20, is_approved: 1, is_public }
    const [showNum, setShowNum] = useState<number>(0);
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState<number>(initParams.page_num);
    const [size, setSize] = useState<number>(initParams.page_size);

    const getList = async (initParams: TableListParams) => {
        setLoading(true)
        const data = tab !== '1' ? await workspaceList(initParams) : await getWrokspaces(initParams)
        setData(data || [])
        setShowNum(data?.show_total)
        setLoading(false)
    };

    useEffect(() => {
        getList(initParams)
    }, []);

    const onChange = (page_num: any, page_size: any) => {
        const initParams = { page_num, page_size, is_approved: 1, is_public, keyword }
        getList(initParams)
        setPage(page_num)
        setSize(page_size)
    }

    const refresh = () => {
        let params = { page_num: page, page_size: size, is_approved: 1, is_public, keyword }
        getList(params)
    }

    useImperativeHandle(onRef, () => ({
        search: (key: string) => {
            getList({ ...initParams, ...{ page_size: size, keyword: key } })
            setKeyword(key)
        },
        handleTab: refresh
    }));

    const getInfo = async (id: string) => {
        detailModalRef.current?.show(id)
    }

    const canTopWsNumb = BUILD_APP_ENV === "opensource" ? 9 : 12

    const columns: any[] = useMemo(() => {
        return (
            [
                top && {
                    title: '',
                    width: 20,
                    className: 'dragIconWrapper',
                    render: (_: any, row: any) => (
                        (row.is_show && !row.is_common) &&
                        <Row style={{ cursor: 'pointer' }} align="middle" justify="center" className="drageIcon">
                            <HolderOutlined />
                        </Row>
                    )
                },
                {
                    title: <FormattedMessage id="workspace.cover" />,
                    dataIndex: 'logo',
                    className: 'row_cursor',
                    width: 70,
                    render: (_: number, row: WorkspaceTable) => <AvatarCover size="small" {...row} />,
                    // <img className={styles.img} src={row.logo}  />,
                }, {
                    title: <FormattedMessage id="workspace.show_name" />,
                    dataIndex: 'show_name',
                    className: 'row_cursor',
                    width: 180,
                    render: (_: number, row: WorkspaceTable) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.show_name || ''} />,
                }, {
                    title: <FormattedMessage id="workspace.owner" />,
                    dataIndex: 'owner_name',
                    className: 'row_cursor',
                    width: 124,
                    // ellipsis: true,
                    render: (_: number, row: WorkspaceTable) => <Space style={{ width: '124px' }}>
                        <Avatar size={25} src={row.owner_avatar} alt={row.owner_name} />
                        <EllipsisPulic title={row.owner_name || ''} width={99} />
                    </Space>,
                }, {
                    title: <FormattedMessage id="workspace.brief.introduction" />,
                    dataIndex: 'description',
                    className: 'row_cursor',
                    ellipsis: {
                        showTitle: false
                    },
                    width: 210,
                    render: (_: number, row: WorkspaceTable) => <ColumnEllipsisText ellipsis={{ tooltip: true }} children={row.description || ''} />,
                }, {
                    title: <FormattedMessage id="workspace.number" />,
                    dataIndex: 'member_count',
                    className: 'row_cursor',
                    width: enLocale ? 155 : 85,
                }, {
                    title: <FormattedMessage id="workspace.is_public" />,
                    dataIndex: 'is_public',
                    className: 'row_cursor',
                    width: 100,
                    render: (_: number, row: WorkspaceTable) => (
                        row.is_public ?
                            <div className={styles.bar}>
                                <PublicIcon />
                                <span style={{ paddingLeft: '6px' }}><FormattedMessage id="workspace.public" /></span>
                            </div> :
                            <div className={styles.bar}>
                                <UnPublicIcon />
                                <span style={{ paddingLeft: '6px' }}><FormattedMessage id="workspace.private" /></span>
                            </div>
                    )
                },
                top && {
                    title: (
                        <QusetionIconTootip
                            placement="left"
                            title={<FormattedMessage id="workspace.home.recommended" />}
                            desc={
                                <ul style={{ listStyle: 'auto', paddingInlineStart: 25, paddingTop: 15 }}>
                                    <li><FormattedMessage id="workspace.recommended1" /></li>
                                    <li><FormattedMessage id="workspace.recommended2" /></li>
                                </ul>
                            }
                        />
                    ),
                    width: enLocale ? 240 : 100,
                    render(_: any, row: any, idx: number) {
                        return (
                            <Switch
                                checkedChildren={<FormattedMessage id="operation.yes" />}
                                unCheckedChildren={<FormattedMessage id="operation.no" />}
                                disabled={row.is_common}
                                checked={row.is_common || row.is_show}
                                onClick={() => {
                                    if (showNum >= canTopWsNumb) {
                                        if (page === 1 && idx < canTopWsNumb) {
                                            onTopChange(row)
                                        } else {
                                            // message.error(`最多配置${canTopWsNumb}个推荐Workspace`)
                                            message.error(formatMessage({ id: `workspace.configure.up.to.${canTopWsNumb}.recommended` }))
                                        }
                                    } else {
                                        onTopChange(row)
                                    }
                                }}
                            />
                        )
                    }
                }, {
                    title: <FormattedMessage id="Table.columns.operation" />,
                    width: 100,
                    render(_: any, row: any) {
                        return <Typography.Link onClick={() => getInfo(row.id)}><FormattedMessage id="operation.detail" /></Typography.Link>
                    }
                }].filter(Boolean)
        )
    }, [data, showNum, enLocale])

    const onTopChange = async (row: any) => {
        const { is_show, id } = row
        const { code } = await saveWorkspaceConfig({ is_show: !is_show, id })
        if (code === 200) refresh()
    }

    const components = {
        body: {
            row: DragableBodyRow,
        },
    };

    const onMoveRow = async (dragIndex: number, hoverIndex: number) => {
        if (dragIndex === hoverIndex) return
        const { code } = await updateTopWorkspaceOrder({ from: dragIndex, to: hoverIndex })
        if (code === 200) refresh()
        // const dragRow = data.data[dragIndex];
        // const putData = update(data.data, {
        //     $splice: [
        //         [dragIndex, 1],
        //         [hoverIndex, 0, dragRow],
        //     ],
        // })
        // setData({ ...data, data: putData });
    }

    const tableProps = useMemo(() => {
        const defaultProps = {
            size: "small",
            rowKey: "id",
            columns,
            dataSource: data.data,
            loading,
            pagination: false,
            scroll: {
                x: '100%'
            }
        }

        if (!top) return defaultProps
        return {
            ...defaultProps,
            components,
            onRow: (record: any, index: any) => ({
                index,
                onMove: onMoveRow,
                disable: !record.is_show || record.is_common,
                is_show: record.is_common || record.is_show
            })
        }
    }, [top, data, components])

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <Table
                    {...tableProps as any}
                />
            </DndProvider>

            <CommonPagination
                currentPage={data.page_num}
                pageSize={data.page_size}
                total={data.total}
                onPageChange={(page_num: number, page_size: any) => onChange(page_num, page_size)}
            />
            <DetailModal ref={detailModalRef} refresh={refresh} />
        </>
    );

};

export default UserTable;