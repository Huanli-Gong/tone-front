import React, { useRef } from 'react';
import { Pagination, Spin } from 'antd';
import type { TableProps } from 'antd';
import { useIntl } from 'umi';
import styles from './style.less';
import { ResizeHooksTable } from '@/utils/table.hooks';

type Any = AnyType & { refreshDeps?: any[] };

const CommonTable: React.FC<TableProps<Any> & Any> = (props) => {
    const {
        total = 0,
        loading,
        handlePage,
        showPagination = true,
        page = 1,
        paginationBottom = false,
        pageSize = 10,
        className,
        ...rest
    } = props;

    const { formatMessage } = useIntl();
    const table = useRef<any>(null);

    const getTop = (e: any) => {
        let offset = e.offsetTop;
        if (e.offsetParent != null) offset += getTop(e.offsetParent);
        return offset;
    };

    const onSelect = () => {
        const _top = getTop(table.current);
        if (_top == 0) return;
        let _scroll = _top - 200;
        if (_top <= 377) _scroll = _top - 377;
        window.scrollTo({
            top: _scroll,
            behavior: 'smooth',
        });
    };

    return (
        <Spin spinning={loading as any}>
            <div ref={table} />
            {/* @ts-ignore */}
            <ResizeHooksTable
                size={'small'}
                className={`${styles.table_empty} ${className}`}
                pagination={false}
                {...rest}
            />
            {showPagination && (
                <div
                    className={`${paginationBottom ? null : `common_pagination`} ${
                        !loading && total ? styles.pagination : styles.hidden
                    }`}
                >
                    {total >= 1 && (
                        <>
                            <div className={total == 0 ? styles.hidden : ''}>
                                {formatMessage({ id: 'pagination.total.strip' }, { data: total })}
                            </div>
                            <Pagination
                                className={total == 0 ? styles.hidden : ''}
                                showQuickJumper
                                showSizeChanger
                                current={page}
                                pageSize={pageSize}
                                defaultCurrent={1}
                                size="small"
                                onChange={(page_num: number, page_size: any) => {
                                    handlePage(page_num, page_size);
                                    onSelect();
                                }}
                                onShowSizeChange={(page_num: number, page_size: any) => {
                                    handlePage(1, page_size);
                                    onSelect();
                                }}
                                total={total}
                            />
                        </>
                    )}
                </div>
            )}
        </Spin>
    );
};

export default CommonTable;
