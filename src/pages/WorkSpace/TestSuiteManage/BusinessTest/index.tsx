/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { message, Table, Pagination } from 'antd';
import { FilterFilled, CaretRightFilled, CaretDownFilled } from '@ant-design/icons';
import { useIntl, FormattedMessage, useParams, useLocation } from 'umi';
import moment from 'moment';
import SearchInput from '@/components/Public/SearchInput';
import SelectDrop from '@/components/Public//SelectDrop';
import SuiteList from './components/SuiteList';
import { queryBusinessList } from '../service';
import styles from './index.less';
import { ColumnEllipsisText } from '@/components/ColumnComponents';

/**
 * ws-业务测试
 */
export default () => {
    const { ws_id } = useParams() as any;
    const { formatMessage } = useIntl();
    const location = useLocation() as any;
    const [loading, setLoading] = useState<any>(false);
    const [data, setData] = useState<any>({ data: [], total: 0, page_num: 1 });
    const [pageSize, setPageSize] = useState<number>(10);
    // 展开的行id
    const [expandKeys, setExpandKeys] = useState<string[]>([]);
    const [filterQuery, setFilterQuery] = useState<any>({});
    const [autoFocus, setFocus] = useState<boolean>(true);
    const [service_name, setServiceName] = useState<string>('');
    const [creator, setCreator] = useState<number>();

    // 1.请求数据
    const getTableData = async (query: any) => {
        setLoading(true);
        try {
            const res: any = await queryBusinessList({ ...filterQuery, ws_id, ...query });
            const { code, msg } = res || {};
            if (code === 200) {
                setData(res);
            } else {
                message.error(msg || formatMessage({ id: 'request.failed' }));
            }
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = { page_num: 1, page_size: pageSize, name: service_name, owner: creator };
        setFilterQuery(query);
        getTableData(query);
        //过滤字段过滤触发
    }, [service_name, creator, location?.query]);

    const columns: any = [
        {
            title: <FormattedMessage id="suite.business.name" />,
            dataIndex: 'name',
            fixed: 'left',
            width: 'auto',
            filterIcon: () => (
                <FilterFilled style={{ color: service_name ? '#1890ff' : undefined }} />
            ),
            filterDropdown: ({ confirm }: any) => (
                <SearchInput
                    confirm={confirm}
                    autoFocus={autoFocus}
                    onConfirm={(val: string) => {
                        setServiceName(val);
                    }}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus);
                }
            },
            render: (text: any) => {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{text}</ColumnEllipsisText>;
            },
        },
        {
            title: <FormattedMessage id="suite.gmt_created" />,
            dataIndex: 'gmt_created',
            onCell: () => ({ style: { minWidth: 170 } }),
            render: (text: any) => {
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                        {text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </ColumnEllipsisText>
                );
            },
        },
        {
            title: <FormattedMessage id="suite.gmt_modified" />,
            dataIndex: 'gmt_modified',
            onCell: () => ({ style: { minWidth: 170 } }),
            render: (text: any) => {
                return (
                    <ColumnEllipsisText ellipsis={{ tooltip: true }}>
                        {text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </ColumnEllipsisText>
                );
            },
        },
        {
            title: 'Owner',
            dataIndex: 'creator_name',
            onCell: () => ({ style: { minWidth: 150 } }),
            filterIcon: () => <FilterFilled style={{ color: creator ? '#1890ff' : undefined }} />,
            filterDropdown: ({ confirm }: any) => (
                <SelectDrop
                    confirm={confirm}
                    onConfirm={(val: number) => {
                        setCreator(val);
                    }}
                />
            ),
            onFilterDropdownVisibleChange: (visible: any) => {
                if (visible) {
                    setFocus(!autoFocus);
                }
            },
            render: (text: any) => {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{text}</ColumnEllipsisText>;
            },
        },
        {
            title: <FormattedMessage id="suite.remarks" />,
            dataIndex: 'description',
            render: (text: any) => {
                return <ColumnEllipsisText ellipsis={{ tooltip: true }}>{text}</ColumnEllipsisText>;
            },
        },
    ];

    const onChange = (page: number, page_size: number) => {
        setPageSize(page_size);
        getTableData({ page_num: page, page_size });
    };

    const list = data.data,
        total = data.total,
        pageNum = data.page_num;

    return (
        <div>
            <Table
                className={styles.businessList_root}
                size="small"
                loading={loading}
                rowKey={(record) => record.id}
                columns={columns}
                dataSource={list}
                expandable={{
                    expandedRowKeys: expandKeys,
                    expandedRowRender: (record: any) => {
                        const { test_suite_list = [] } = record;
                        return <SuiteList business_id={record.id} dataSource={test_suite_list} />;
                    },
                    onExpand: (_: any, record: any) => {
                        _ ? setExpandKeys([record.id]) : setExpandKeys([]);
                    },
                    expandIcon: ({ expanded, onExpand, record }: any) =>
                        expanded ? (
                            <CaretDownFilled onClick={(e) => onExpand(record, e)} />
                        ) : (
                            <CaretRightFilled onClick={(e) => onExpand(record, e)} />
                        ),
                }}
                scroll={{ x: 'auto' }}
                pagination={false}
            />
            {!!total && (
                <div className={styles.common_pagination}>
                    <div>{formatMessage({ id: 'pagination.total.strip' }, { data: total })}</div>
                    <Pagination
                        showQuickJumper
                        showSizeChanger
                        defaultCurrent={1}
                        current={pageNum}
                        pageSize={pageSize}
                        total={total}
                        // size="small"
                        onChange={(page_num: number, page_size: any) => {
                            onChange(page_num, page_size);
                        }}
                        onShowSizeChange={(page_num: number, page_size: any) => {
                            onChange(1, page_size);
                        }}
                    />
                </div>
            )}
        </div>
    );
};
