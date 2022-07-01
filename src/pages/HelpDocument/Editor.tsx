import React, { useState, useEffect, useRef } from 'react'
import { Table, Popover, message, Tooltip, Tag } from 'antd';
import * as SortableHOC from 'react-sortable-hoc';
import { MenuOutlined } from '@ant-design/icons';
import arrayMove from 'array-move';
import _ from 'lodash';
import styles from './index.less';
import { deleteHelpDoc, updateHelpDoc } from './services'
import { history, useAccess, Access } from 'umi'
import { ReactComponent as Ellipsis } from '@/assets/svg/ellipsis.svg'
import { requestCodeMessage } from '@/utils/utils';

const { sortableContainer, sortableElement, sortableHandle }: any = SortableHOC

const EllipsisRect = ({ record, text, helpId, reactNode, handleClick, index }: any) => {
    const ellipsis = useRef<any>(null)
    const [show, setShow] = useState(false)
    const access = useAccess()
    useEffect(() => {
        let show = false
        if (ellipsis.current) {
            const clientWidth = ellipsis.current.clientWidth
            const scrollWidth = ellipsis.current.scrollWidth
            show = clientWidth < scrollWidth
            setShow(show)
        }
        const arrTr = document.querySelectorAll('tr')
        if (arrTr) {
            Array.from(arrTr).forEach((item: any) => {
                item.style.backgroundColor = ''
                const num = item.getAttribute('data-row-key')
                if (Number(num) === currentTrIndex) item.style.backgroundColor = '#F8F9FA'
            })
        }
        window.addEventListener('click', onClickWindow, false)
        return () => {
            window.removeEventListener('click', onClickWindow, false)
        }
    }, [])
    const onClickWindow = () => {
        const arrTr = document.querySelectorAll('tr')
        if (arrTr) {
            Array.from(arrTr).forEach((item: any, num: number) => {
                item.classList.remove('del_selected');
            })
        }
        const oBox: any = document.getElementById('image_box')
        if (oBox) {
            oBox.style.width = 0
            oBox.style.height = 0
        }
    }
    const handleDelClick = (e: any, index: number) => {
        e.stopPropagation();
        const arrTr = document.querySelectorAll('tr')
        if (arrTr) {
            Array.from(arrTr).forEach((item: any, num: number) => {
                // item.classList.remove('del_selected');
                if (index === num) item.classList.add('del_selected');
            })
        }
    }

    return (

        <div className={styles.addDocTitle} >
            {show ?
                <Tooltip placement="topLeft" title={text} overlayStyle={{ wordBreak: 'break-all' }}>
                    <span
                        ref={ellipsis}
                        onClick={_.partial(handleClick, record)}
                        className={String(helpId) === String(record.key) ? styles.item_active : styles.item_doc}>
                        {text}
                    </span>
                </Tooltip >
                :
                <span
                    ref={ellipsis}
                    onClick={_.partial(handleClick, record)}
                    className={String(helpId) === String(record.key) ? styles.item_active : styles.item_doc}>
                    {text}

                </span>
            }
            <Access accessible={access.IsAdmin()}>
                <Popover placement="bottom" content={reactNode(record)} trigger="click" className={styles.popover}>
                    <div className={styles.del_doc_icon} onClick={_.partial(handleDelClick, _, index)}>
                        <Ellipsis />
                    </div>
                </Popover>
            </Access>
        </div>
    )
}
const DragHandle = sortableHandle(() => (
    <Tooltip title='拖拽排序'>
        <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} className={styles.doc_drag} />
    </Tooltip>
));

const SortableItem = sortableElement((props: any) => <tr {...props} />);
const SortableContainer = sortableContainer((props: any) => <tbody {...props} />);
let currentTrIndex = 0
const getAllDocs = (data: any, id: any) => {
    const arr = data.map((item: any, index: number) => {
        if (String(item.id) === String(id)) currentTrIndex = index
        return (
            {
                key: item.id,
                name: item.title || '',
                index: index,
                className: String(item.id) === String(id) ? 'selected' : '',
                active: item.active,
                order_id: item.order_id,
                tags: item.tags,
            }
        )
    })
    return arr
}

const SortableTable = ({ getHelpDocs, allHelpsData, helpId, setHelpId, setRightLoading, typePath, isPermier, handleGetDocDetailFn }: any) => {
    const [dataSource, getDataSource] = useState<any>([])

    useEffect(() => {
        getDataSource(getAllDocs(allHelpsData, helpId))
    }, [allHelpsData])

    const handleDel = async (record: any) => {
        setRightLoading(true)
        const { code, msg } = await deleteHelpDoc({ id: record.key })
        if (code === 200) {
            getHelpDocs('del', record.index)
        }
        else {
            setRightLoading(false)
            requestCodeMessage(code, msg)
        }
    }
    const handleClick = (record: any) => {
        // setRightLoading(true)
        try {
            const { key, index } = record
            setHelpId(key)
            handleGetDocDetailFn(key)
            history.push(`/${typePath}/${key}`)
            currentTrIndex = index
        } catch (e) {
            console.log(e)
            setRightLoading(false)
        }
    }
    const reactNode = (record: any) => (
        <div className={styles.doc_del_parent}>
            <p onClick={_.partial(handleDel, record)} className={styles.doc_del} >删除</p>
        </div>
    );
    const docType = typePath === 'help_doc' ? { 'mustRead': '必看', 'course': '教程', 'docs': '文档' }
        : { 'maintain': '维护', 'notice': '通知', 'upgrade': '升级', 'stop': '暂停' }

    const columns: any = [
        {
            title: 'Sort',
            dataIndex: 'sort',
            width: 30,
            height: 20,
            className: styles.drag_visible,
            render: (text: any, record: any) => record?.order_id !== 1 && isPermier && <DragHandle />,
        },
        {
            title: 'Tags',
            dataIndex: 'tags',
            width: 62,
            className: styles.type,
            render: (text: any, record: any) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isPermier && <span style={{ borderRadius: '50%', width: 6, height: 6, display: 'inline-block', background: record && record.active ? '#2ABA5D' : '#C63750', marginRight: 8 }} />}
                        <Tag
                            color={record && record.order_id === 1 ? (typePath === 'notice' ? '#FF4D4D' : '#108ee9') : 'rgba(0,0,0,0.04)'}
                            style={{
                                color: record && record.order_id === 1 ? '#fff' : 'rgba(0,0,0,0.65)',
                                border: 'none'
                            }}>
                            {record && docType[record.tags] || '-'}
                        </Tag>
                    </div>
                )
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            ellipsis: true,
            width: 240,
            height: 20,
            textWrap: 'word-break',
            render: (text: any, record: any, index: number) => {
                return (
                    <EllipsisRect
                        {...{ record, text, helpId, reactNode, handleClick, index }}
                    />
                )
            },
        },
    ];



    const onSortEnd = async ({ oldIndex, newIndex }: any) => {
        if (oldIndex !== newIndex) {
            const dataSourceCopy = _.cloneDeep(dataSource)
            const newData = arrayMove([].concat(dataSourceCopy), oldIndex, newIndex).filter(el => !!el);
            const dragData: any = newData[newIndex]
            const param = { id: dragData.key, order_id: dataSource[newIndex].order_id }
            const { code, msg } = await updateHelpDoc(param)
            if (code === 200) {
                // getHelpDocs() 有用
                getDataSource(newData)
            } else {
                requestCodeMessage(code, msg)
            }
        }
    };

    const DraggableBodyRow = ({ className, style, ...restProps }: any) => {
        // function findIndex base on Table rowKey props and should always be a right array index
        const index = dataSource.findIndex((x: any) => x.index === restProps['data-row-key']);
        return <SortableItem index={index} {...restProps} />;
    };
    const DraggableContainer: any = (props: any) => (
        <SortableContainer
            useDragHandle
            helperClass="row-dragging"
            onSortEnd={onSortEnd}
            {...props}
        />
    );

    return (
        <Table
            pagination={false}
            dataSource={dataSource}
            columns={columns}
            rowKey="index"
            className={dataSource.length ? styles.dataTable : styles.noDataTable}
            showHeader={false}
            components={{
                body: {
                    wrapper: DraggableContainer,
                    row: DraggableBodyRow,
                },
            }}
        />
    );
}
// }
export default SortableTable

