import { memo, useMemo, useEffect, useState, useContext } from 'react'
import { ReactComponent as CatalogCollapsed } from '@/assets/svg/Report/collapsed.svg'
import { useIntl, FormattedMessage } from 'umi';
import { Typography, Space, Tree, Row } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { throttle } from 'lodash';
import produce from 'immer';

import {
    CatalogExpand,
    CatalogExpandInnerIcon,
    Catalog,
    CatalogBody,
    CatalogTitle,
    CatalogDrageSpace,
    CatalogRound,
    LittleRound
} from '../ReportUI';
import { ReportContext } from '../Provider';

const TemplateCatalog = () => {
    const { formatMessage } = useIntl()
    const { domainResult, collapsed, setDomainResult, setCollapsed } = useContext(ReportContext)
    const [roundHeight, setRoundHeight] = useState<any>(3)
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
                const name = i === 'perf_item' ? formatMessage({ id: 'performance.test' }) : formatMessage({ id: 'functional.test' })
                const show = i === 'perf_item' ? 'need_perf_data' : 'need_func_data'
                if (domainResult[i] && domainResult[show]) {
                    const treeData = domainResult[i].map(
                        (item: any, index: number) => filterItem(item, i, index, index + '')
                    )
                    const expandkeys = getCatalogTreeKeys(treeData)
                    return {
                        treeData,
                        expandkeys,
                        name,
                        id: i,
                        show: domainResult[show],
                    }
                }
                return {
                    treeData: [], expandkeys: [], name, id: i, show: domainResult[show]
                }
            }
        )
    }, [domainResult])

    const leftArr = useMemo(() => {
        const leftNav: any = []
        if (domainResult.need_test_background) {
            leftNav.push('need_test_background')
        }
        if (domainResult.need_test_method) {
            leftNav.push('need_test_method')
        }
        if (domainResult.need_test_conclusion) {
            leftNav.push('need_test_conclusion')
        }
        if (domainResult.need_test_summary) {
            leftNav.push('need_test_summary')
        }
        if (domainResult.need_test_env || domainResult.need_env_description) {
            leftNav.push('need_test_env')
        }
        if (domainResult.need_perf_data || domainResult.need_func_data) {
            leftNav.push('test_data')
        }
        return leftNav;
    }, [domainResult])

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
        catalogSource.forEach((item: any) => {
            if (item.id === node.name) {
                const delDate = item.treeData.reduce(
                    (pre: any, cur: any) => delNode(pre, cur, dragNode), []
                )
                const newData = delDate.reduce(
                    (pre: any, cur: any) => filterDropSrouce(pre, cur, node, dragNode), []
                )
                const refreshData = newData.map((i: any, index: number) => treeDataRefreshRowkey(i, `${index}`))
                setDomainResult(
                    produce(
                        domainResult,
                        (draftState: any) => {
                            draftState[node.name] = refreshData
                        }
                    )
                )
            }
        })
    }

    const dictNav = (name: string) => {
        const list: any = {
            'need_test_background': formatMessage({ id: 'report.test.background' }),
            'need_test_method': formatMessage({ id: 'report.test.method' }),
            'need_test_conclusion': formatMessage({ id: 'report.test.conclusion' }),
            'need_test_summary': 'Summary',
            'need_test_env': formatMessage({ id: 'report.test.env' }),
            'test_data': formatMessage({ id: 'report.test.data' }),
        }
        return list[name]
    }


    const handleScroll = throttle((e: any) => {
        let bst = e.target.scrollTop
        let arr = document.querySelectorAll(`.spaceWarpper .ant-space-item .markSpace span`) as any
        let leftArr = document.querySelectorAll('.position_mark') as any
        if (bst < 120) {
            for (let i = 0; i < arr.length; i++) {
                arr[i].classList.remove('toc-selected');
            }
            setRoundHeight(undefined)
        } else {
            for (let i = 0; i < leftArr.length; i++) {
                let title = document.querySelector(`#${leftArr[i].id}`) as any
                let leftTitle = document.querySelector(`#left_${leftArr[i].id}`) as any
                if (title?.offsetParent?.offsetTop === 0) {
                    if (title?.offsetTop - 1 <= bst) {
                        for (let k = 0; k < arr.length; k++) {
                            arr[k]?.classList.remove('toc-selected')
                        }
                        leftTitle?.classList.add('toc-selected');
                        setRoundHeight(leftTitle?.offsetTop)
                    }
                } else {
                    if (title?.offsetParent?.offsetTop + title?.offsetTop - 52 <= bst) {
                        for (let k = 0; k < arr.length; k++) {
                            arr[k]?.classList.remove('toc-selected')
                        }
                        leftTitle?.classList.add('toc-selected');
                        const parentNode = leftTitle?.id.substring(5, 14)
                        const parentTop = (document.querySelector(`#left_${parentNode}`) as any)?.offsetTop || 0
                        const parentTreeTop = (document.querySelector(`#left_tree_${parentNode}`) as any)?.offsetTop || 0
                        if (leftTitle.attributes['class'].nodeValue == 'toc-selected') {
                            if (leftTitle?.id === 'left_perf_item' || leftTitle?.id === 'left_func_item') {
                                setRoundHeight(parentTop)
                            } else {
                                const childTop = leftTitle.offsetParent.offsetTop
                                setRoundHeight(parentTreeTop + childTop)
                            }
                        } else {
                            const childTop = leftTitle.children[0].children[0].offsetParent.offsetTop
                            setRoundHeight(parentTreeTop + childTop)
                        }
                    }
                }
            }
        }
    }, 200)

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, true)
        return () => {
            window.removeEventListener('scroll', handleScroll, true)
        }
    }, [])

    const handleCatalogItemClick = (name: string) => {
        let arr = document.querySelectorAll(`.spaceWarpper .ant-space-item .markSpace span`) as any
        for (let i = 0; i < arr.length; i++) {
            arr[i].classList.remove('toc-selected');
        }
        let leftName = document.querySelector(`#left_${name}`) as any
        leftName?.classList.add('toc-selected');
        setRoundHeight(leftName?.offsetTop)
        document.querySelector(`#${name}`)?.scrollIntoView()
        if (leftName?.id === 'left_perf_item' || leftName?.id === 'left_func_item') {
            document.querySelector("#report-body-container")?.scrollBy({ top: -52 })
        }
    }

    const handleSelectTree = (_: any, evt: any) => {
        let brr = document.querySelectorAll(`.spaceWarpper .ant-space-item .markSpace span`) as any
        for (let i = 0; i < brr.length; i++) {
            brr[i].classList.remove('toc-selected');
        }
        const { node } = evt
        const { rowKey, name } = node
        let tree_name = `${name}-${rowKey}`
        let leftName = document.querySelector(`#left_${tree_name}`) as any
        leftName.classList.add('toc-selected');
        const target = evt?.nativeEvent?.target
        const parentTreeTop = (document.querySelector(`#left_tree_${node.name}`) as any).offsetTop
        if (target.attributes['class'].nodeValue == 'toc-selected') {
            const childTop = target.offsetParent.offsetTop
            setRoundHeight(parentTreeTop + childTop)
        } else {
            const childTop = target.children[0].children[0].offsetParent.offsetTop
            setRoundHeight(parentTreeTop + childTop)
        }
        document.querySelector(`#${tree_name}`)?.scrollIntoView()
        document.querySelector("#report-body-container")?.scrollBy({ top: -52 })
    }

    return (
        <Catalog collapsed={collapsed}>
            {/* 目录 icon 展开 */}
            <CatalogExpand onClick={() => setCollapsed(!collapsed)} >
                <CatalogCollapsed />
                <CatalogExpandInnerIcon>
                    {collapsed ? <RightOutlined title={formatMessage({ id: 'operation.expand' })} /> : <LeftOutlined title={formatMessage({ id: 'operation.collapse' })} />}
                </CatalogExpandInnerIcon>
            </CatalogExpand>
            {/* 内容部分 */}
            <CatalogBody>
                <CatalogTitle>
                    <Typography.Text strong><FormattedMessage id="report.catalogue" /></Typography.Text>
                </CatalogTitle>
                <Row style={{ position: 'relative', paddingLeft: 13, borderLeft: '1px solid #e5e5e5' }} id="left-catalog-wrapper">
                    {roundHeight > 0 && <CatalogRound count={roundHeight}>
                        <LittleRound />
                    </CatalogRound>
                    }
                    <Space direction="vertical" style={{ width: '100%' }} className="spaceWarpper">
                        {
                            leftArr.map((item: any, idx: number) => (
                                <div className='markSpace' key={item + idx}>
                                    <span
                                        onClick={() => handleCatalogItemClick(item)}
                                        id={`left_${item}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {dictNav(item)}
                                    </span>
                                </div>
                            ))
                        }
                        {
                            catalogSource.map(
                                (item: any, index: number) => (
                                    item.show ?
                                        <CatalogDrageSpace key={index} className='markSpace'>
                                            <span onClick={(e) => handleCatalogItemClick(item.id)} id={`left_${item.id}`} style={{ cursor: 'pointer' }}>
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
                                                            <span id={`left_${node.name}-${node.rowKey}`}>{node.title}</span>
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