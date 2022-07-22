import React, { memo, useState, useMemo } from 'react'
import { ReactComponent as CatalogCollapsed } from '@/assets/svg/TestReport/collapsed.svg'

import { Typography, Space, Tree, Row } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import produce from 'immer'

import {
    CatalogExpand, CatalogExpandInnerIcon, Catalog, CatalogBody, CatalogTitle,
    CatalogDrageSpace, CatalogRound, LittleRound
} from '../styled'

const TemplateCatalog = (props: any) => {
    const { dataSource, collapsed, contrl, setDataSource, setCollapsed, prefix = "" } = props
    const [count, setCount] = useState<any>(0)
    const [roundHeight, setRoundHeight] = useState<Number>(3)
    /* 
            dragOverGapTop 拖拽上
    
            1. 拖拽到组
            2. 拖拽到平级
            3. 项可以到组，组不可到项
    
            当前key与node组key相等，代表是获取子项组
            dragenode可以移入
        */
    const filterDropSrouce = (pre: any, cur: any, node: any, dragNode: any) => {
        const isTop = node.dragOverGapTop
        const isBottom = node.dragOverGapBottom
        if (cur.key === node.key) {
            if (node.is_group) {
                if (isTop) return pre.concat(dragNode, cur)
                if (isBottom) return pre.concat({
                    ...cur,
                    children: cur.children.concat(dragNode)
                })
                return pre.concat(cur, dragNode)
            }
            return isTop ? pre.concat(dragNode, cur) : pre.concat(cur, dragNode)
        }

        if (cur.is_group) {
            const children: any = cur.list.reduce(
                (p: any, c: any) => filterDropSrouce(p, c, node, dragNode), []
            )
            return pre.concat({
                ...cur,
                children
            })
        }

        return pre.concat(cur)
    }

    const treeDataRefreshRowkey = (i: any, rowkey: string) => {
        if (i.is_group) {
            return {
                name: i.title,
                rowkey: `${rowkey}`,
                is_group: i.is_group,
                list: i.children.map((x: any, idx: number) => treeDataRefreshRowkey(x, `${rowkey}-${idx}`))
            }
        }
        return {
            name: i.title,
            rowkey: `${rowkey}`,
            list: i.list
        }
    }

    const getCatalogTreeKeys: any = (treeData: any[]) => {
        return treeData.reduce((pre: any, cur: any) => {
            if (cur.children && cur.children.length > 0)
                return pre.concat(cur.key, [].concat(getCatalogTreeKeys(cur.children)))
            return pre.concat(cur.key)
        }, [])
    }

    const filterItem = (data: any, name: string, index: number, key: string) => {
        if (data.is_group)
            return {
                ...data,
                title: data.name,
                name,
                key: `${key}-${index}`,
                allowDrop: true,
                children: data.list.map((item: any, idx: number) => filterItem(item, name, idx, `${key}-${index}`))
            }
        return {
            ...data,
            title: data.name,
            key: `${key}-${index}`,
            name,
        }
    }

    const catalogSource = useMemo(() => {
        const dataArray = ['perf_item', 'func_item']

        return dataArray.map(
            (i: any) => {
                const name = i === 'perf_item' ? '性能测试' : '功能测试'
                const show = i === 'perf_item' ? 'need_perf_data' : 'need_func_data'
                if (dataSource && dataSource[i] && dataSource[show]) {
                    const treeData = dataSource[i].map(
                        (item: any, index: number) => filterItem(item, i, index, index + '')
                    )
                    const expandkeys = getCatalogTreeKeys(treeData)
                    return {
                        treeData,
                        expandkeys,
                        name,
                        id: i,
                        show: dataSource[show],
                    }
                }
                return {
                    treeData: [], expandkeys: [], name, id: i, show: dataSource[show]
                }
            }
        )
    }, [dataSource])

    const delNode = (pre: any, cur: any, dragNode: any) => {
        if (cur.key === dragNode.key) return pre
        if (cur.is_group) {
            const children = cur.children.reduce(
                (p: any, c: any) => delNode(p, c, dragNode), []
            )
            return pre.concat({
                ...cur,
                children,
                list: children
            }, [])
        }
        return pre.concat(cur)
    }

    const onDrop = ({ event, node, dragNode, dragNodesKeys }: any): any => {
        if (!contrl) return false
        // if (!dragNode.allowDrop) return false
        // if ( dragNode.is_group && !node.is_group ) return false

        catalogSource.forEach((item: any) => {
            if (item.id === node.name) {
                const delDate = item.treeData.reduce(
                    (pre: any, cur: any) => delNode(pre, cur, dragNode), []
                )
                const newData = delDate.reduce(
                    (pre: any, cur: any) => filterDropSrouce(pre, cur, node, dragNode), []
                )
                const refreshData = newData.map((i: any, index: number) => treeDataRefreshRowkey(i, `${index}`))
                setDataSource(
                    produce(
                        dataSource,
                        (draftState: any) => {
                            draftState[node.name] = refreshData
                        }
                    )
                )
            }
        })
    }

    const handleCatalogItemClick = (name: string, num: number) => {
        setRoundHeight((document.querySelector(`#left_${name}`) as any)?.offsetTop)
        setCount(num)
        document.querySelector(`#${prefix}${name}`)?.scrollIntoView()
    }

    const handleSelectTree = (_: any, evt: any) => {
        const { node } = evt
        const { rowkey, name } = node
        const id = rowkey ? `${name}-${rowkey}` : `${name}`
        const nativeEvent = evt?.nativeEvent
        const target = nativeEvent.target

        console.log(prefix, id, prefix, document.querySelector(`#${prefix}${id}`))
        setRoundHeight((document.querySelector(`#left_tree_${node.name}`) as any).offsetTop + target.offsetParent.offsetTop)
        setCount(`${name}_${rowkey}`)
        document.querySelector(`#${prefix}${id}`)?.scrollIntoView()
    }

    return (
        <Catalog collapsed={collapsed}>
            {/* 目录 icon 展开 */}
            <CatalogExpand onClick={() => setCollapsed(!collapsed)} >
                <CatalogCollapsed />
                <CatalogExpandInnerIcon>
                    {collapsed ? <RightOutlined title="展开" /> : <LeftOutlined title="收起" />}
                </CatalogExpandInnerIcon>
            </CatalogExpand>
            {/* 内容部分 */}
            <CatalogBody>
                <CatalogTitle><Typography.Text strong>目录</Typography.Text></CatalogTitle>
                <Row style={{ position: 'relative', paddingLeft: 13, borderLeft: '1px solid #e5e5e5' }} id="left-catalog-wrapper">
                    {
                        roundHeight > 0 &&
                        <CatalogRound count={roundHeight}>
                            <LittleRound />
                        </CatalogRound>
                    }

                    <Space direction="vertical" style={{ width: '100%' }}>
                        {
                            [
                                ["need_test_background", "测试背景"],
                                ["need_test_method", "测试方法"],
                                ["need_test_conclusion", "测试结论"],
                                ["need_test_summary", "Summary"],
                                ["need_test_env", "测试环境", "need_env_description"],
                                ["test_data", "测试数据", "need_func_data"]
                            ].map((n: any, i: any) => {
                                const [field, title, field_2] = n
                                if (!dataSource) return
                                if (dataSource[field] || dataSource[field_2])
                                    return (
                                        <span
                                            key={field}
                                            onClick={
                                                () => handleCatalogItemClick(field, i)
                                            }
                                            id={`left_${field}`}
                                            style={{
                                                color: count === i ? '#1890FF' : '',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {title}
                                        </span>
                                    )
                                return
                            })
                        }

                        {
                            catalogSource.map(
                                (item: any, index: number) => (
                                    item.show ?
                                        <CatalogDrageSpace key={index}>
                                            <span
                                                onClick={(e) => handleCatalogItemClick(item.id, 6 + index)}
                                                id={`left_${item.id}`}
                                                style={{ color: count === 6 + index ? '#1890FF' : '', cursor: 'pointer' }}
                                            >
                                                {item.name}
                                            </span>
                                            <CatalogDrageSpace id={`left_tree_${item.id}`} style={{ marginTop: item.treeData.length > 0 ? 8 : 0 }}>
                                                <Tree
                                                    treeData={item.treeData}
                                                    onDrop={onDrop}
                                                    draggable
                                                    switcherIcon={<></>}
                                                    blockNode
                                                    titleRender={(node: any) => {
                                                        return (
                                                            <Typography.Text
                                                                id={`left_${node.rowkey}`}
                                                                style={{ color: `${node.name}_${node.rowkey}` === count ? '#1890FF' : '' }}
                                                            >
                                                                {node.title}
                                                            </Typography.Text>
                                                        )
                                                    }}
                                                    expandedKeys={item.expandkeys}
                                                    onSelect={handleSelectTree}
                                                />
                                            </CatalogDrageSpace>
                                        </CatalogDrageSpace>
                                        : null
                                )
                            )
                        }
                    </Space>
                </Row>
            </CatalogBody>
        </Catalog>
    )
}

export default memo(TemplateCatalog)