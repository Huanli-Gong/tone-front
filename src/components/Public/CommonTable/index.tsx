import React, { useRef } from 'react';
import { UserTable } from './data.d';
import { Table, Pagination, Spin } from 'antd';
import styles from './style.less';
import ResizeTable from '@/components/ResizeTable'
const CommonTable: React.FC<UserTable> = ({
    list, columns,
    loading,
    scrollType = 0,
    total = 0, rowSelection,
    expandable, onRow = () => { return false }, handlePage,
    showPagination = true,
    page = 1,
    className = '',
    paginationBottom = false,
    pageSize = 10,
    components,
}) => {
    const table = useRef<any>(null)
    const getTop = (e: any) => {
        var offset = e.offsetTop;
        if (e.offsetParent != null) offset += getTop(e.offsetParent);
        return offset;
    }
    const onSelect = () => {
        const _top = getTop(table.current)
        if (_top == 0) return
        let _scroll = _top - 200
        if (_top <= 377) _scroll = _top - 377
        window.scrollTo({
            top: _scroll,
            behavior: "smooth"
        });
    }
    return (
        <Spin spinning={loading}>
            <div ref={table}></div>
            <ResizeTable
                size={"small"}
                columns={columns}
                className={`${styles.table_empty} ${className}`}
                dataSource={list}
                rowKey={record => record.id}
                pagination={false}
                rowSelection={rowSelection}
                expandable={expandable}
                scroll={{ x: scrollType }}
                components={components}
                onRow={(record, index) => {
                    return {
                        onClick: () => onRow(record),
                    };
                }}
            />
            {
                showPagination &&
                <div className={`${paginationBottom ? null : `common_pagination`} ${!loading && total ? styles.pagination : styles.hidden}`} >
                    {
                        total >= 1 &&
                        <>
                            <div className={total == 0 ? styles.hidden : ''}>
                                共{total}条
                            </div>
                            <Pagination
                                className={total == 0 ? styles.hidden : ''}
                                showQuickJumper
                                showSizeChanger
                                current={page}
                                pageSize={pageSize}
                                defaultCurrent={1}
                                size="small"
                                onChange={
                                    (page_num: number, page_size: any) => {
                                        handlePage(page_num, page_size)
                                        onSelect()
                                    }
                                }
                                onShowSizeChange={
                                    (page_num: number, page_size: any) => {
                                        handlePage(page_num, page_size)
                                        onSelect()
                                    }
                                }
                                total={total}
                            />
                        </>
                    }
                </div>
            }
        </Spin>
    )
};

export default CommonTable;

