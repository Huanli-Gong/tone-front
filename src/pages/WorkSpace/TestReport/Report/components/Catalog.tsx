import React, { forwardRef, memo, useImperativeHandle, useMemo, useState } from 'react'
import { Tree, Typography } from 'antd'

import { UnorderedListOutlined, CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons'
import styled, { keyframes } from 'styled-components'
import produce from 'immer'

const CatalogTag = styled.div`
    position:absolute;
    right:240px;
    top:174px;
    height: 94px;
    z-index:9999;
    width: 36px;
    background: #1890FF;
    border-radius: 4px 0 0 4px;
    color:#fff;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    cursor:pointer;
    .ant-typography {
        color:#fff;
        font-size: 14px;
    }
    .anticon-unordered-list {
        font-size: 14px;
    }
    .anticon-caret-left {
        font-size: 14px;
    }
`

const toRight = keyframes`
    from {
        right: 0;
    }
    to {
        right: -240px;
    }
`;

const toLeft = keyframes`
    from {
        right: -240px;
    }
    to {
        right: 0px;
    }
`

interface CatalogProps {
    tigger: boolean | null
}

const CatalogContainer = styled.div<CatalogProps>`
    position:fixed;
    right:-240px;
    top:0;
    z-index:999;
    height:100%;
    animation: ${({ tigger }) => {
        if ( tigger === true ) return toLeft
        if ( tigger === false ) return toRight
        return 
    }} linear .2s forwards;
`

const TreeWrapper = styled.div`
    width: 240px;
    background: rgba(0,0,0,0.85);
    height:100%;
    overflow: auto;
    padding : 47px 20px;
    .ant-tree {
        background:transparent;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .ant-tree-title,
    .ant-tree-switcher-icon {
        color:#fff;
    }
    .ant-tree-node-content-wrapper:hover {
        background: transparent!important;
    }
    .ant-tree-node-content-wrapper.ant-tree-node-selected {
        background:transparent!important;
    }
`

const CustomTree = styled(Tree)`
    
`

const addRowkey = (item: any, index: number, key: any) => {
    if (item.children) {
        return {
            ...item,
            key: `${key}-${index}`,
            children: item.children.map(
                (ctx: any, index: number) => addRowkey(ctx, index, `${key}-${index}`)
            )
        }
    }
    return {
        ...item,
        key: `${key}-${index}`
    }
}

const filterItem = (data: any, name: string) => {
    if (data.is_group)
        return {
            ...data,
            title: data.name,
            name,
            allowDrop: true,
            children: data.list.map((item: any) => filterItem(item, name))
        }
    return {
        ...data,
        title: data.name,
        name,
    }
}

const Catalog = (props: any, ref: any) => {
    const { onClick, dataSource, onSourceChange } = props
    const [tigger, setTigger] = useState<null|boolean>( null )

    const DEFAULT_EXPANDED_KEYS = ['0-0','1-1','2-2']
    const [ expandedKeys , setExpandedKeys ] = useState<any>(DEFAULT_EXPANDED_KEYS)
    const treeData = useMemo(() => {
        const {
            need_test_background,
            need_test_conclusion,
            need_test_method,
            need_test_summary,
            need_test_env,
            need_func_data,
            need_perf_data,
            perf_item,
            func_item,
            is_default,
        } = dataSource
        let data: any = []

        const summary: any = {
            title: '概述',
            allowDrop: false,
            name: 'overView',
            children: []
        }

        if (need_test_background) 
            summary.children.push({ allowDrop: false, title: '测试背景', name: 'test_background' })
        if (is_default && need_test_method) 
            summary.children.push({ allowDrop: false, title: '测试方法', name: 'test_method' })
        if (need_test_conclusion) 
            summary.children.push({ allowDrop: false, title: '测试结论', name: 'test_result' })
        if (need_test_summary) 
            summary.children.push({ allowDrop: false, title: 'Summary', name: 'summary' })

        // need_test_method && summary.children.push({ title: '测试方法' })
        // need_test_summary && summary.children.push({ title: 'Summary' })

        data.push(summary)

        const testEnv: any = {
            title: '测试环境',
            allowDrop: false,
            name: 'test_env',
            children: []
        }
        if (need_test_env) 
            testEnv.children.push({ title: '测试环境', name: 'test_env' })

        data.push(testEnv)
        const testData: any = {
            title: '测试数据',
            name: 'test_data',
            children: []
        }

        if (need_perf_data) {
            testData.children.push({
                title: '性能数据',
                is_group : true,
                name: 'perf_item',
                allowDrop: true,
                children: perf_item.map((item: any) => filterItem(item, 'perf_item'))
            })
        }

        if (need_func_data) {
            testData.children.push({
                title: '功能数据',
                name: 'func_item',
                allowDrop: true,
                is_group : true,
                children: func_item.map((item: any) => filterItem(item, 'func_item'))
            })
        }

        data.push(testData)
        return data.map((item: any, index: number) => addRowkey(item, index, `${index}`))
    }, [dataSource])

    useImperativeHandle(ref, () => ({
        open() {
            setTigger(!tigger)
        }
    }))

    const filterDropSrouce = (pre: any, cur: any, node: any, dragNode: any) => {
        if (cur.key === node.key) {
            if (node.is_group) {
                const children = cur.children.concat(dragNode)
                return pre.concat({
                    ...cur,
                    children
                })
            }
            return pre.concat([cur, dragNode])
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
  
    const refreshRowkey = ( i : any , rowKey : string ) => {
        if ( i.is_group ) {
            return {
                name : i.title,
                rowKey : `${ rowKey }`,
                is_group : i.is_group,
                list : i.children.map(( x : any , idx : number ) => refreshRowkey( x , `${ rowKey }-${ idx }` ))
            }
        }
        return {
            name : i.title,
            rowKey : `${ rowKey }`,
            list : i.list
        }
    }
    const onDrop = ({ event, node, dragNode, dragNodesKeys }: any): any => {
        if (node.name === dragNode.name) {
            treeData.forEach((item: any) => {
                if (item.name === 'test_data') {
                    item.children.forEach(
                        (ctx: any) => {
                            if (ctx.name === node.name) {
                                // console.log( ctx )
                                let delDate = ctx.children.reduce(
                                    (pre: any, cur: any) => delNode(pre, cur, dragNode), []
                                )
                                let newData = []
                                if ( ctx.key === node.key ) 
                                    newData = [ dragNode , ...delDate ]
                                else 
                                    newData = delDate.reduce(
                                        (pre: any, cur: any) => filterDropSrouce(pre, cur, node, dragNode), []
                                    )
                                const refreshData = newData.map(( i : any , index : number ) => refreshRowkey( i , `${ index }`))
                                onSourceChange(
                                    produce(
                                        dataSource,
                                        ( draftState : any ) => {
                                            draftState[ node.name ] = refreshData
                                        }
                                    )
                                )
                            }
                        }
                    )
                }
            })
        }
    }

    const handleSelectTree = ( _ : any , evt : any ) => {
        const { node } = evt
        const { rowKey , name } = node 
        const id = rowKey ? `${ name }-${ rowKey }` : `${ name }`
        document.querySelector( `#${ id }` )?.scrollIntoView()
        document.querySelector( `#view-${id}` )?.scrollIntoView()
    }

    return (
        <CatalogContainer tigger={tigger}>
            <CatalogTag onClick={onClick} >
                <UnorderedListOutlined />
                <Typography.Text>目</Typography.Text>
                <Typography.Text>录</Typography.Text>
                {
                    tigger ?
                        <CaretRightOutlined /> :
                        <CaretLeftOutlined />
                }
            </CatalogTag>
            <TreeWrapper>
                <CustomTree
                    treeData={treeData}
                    onDrop={onDrop}
                    draggable
                    blockNode
                    expandedKeys={expandedKeys}
                    onExpand={(expandedKeys, {expanded: bool, node}) => {
                        setExpandedKeys( expandedKeys )
                    }}
                    onSelect={ handleSelectTree }
                />
            </TreeWrapper>
        </CatalogContainer>
    )
}

export default memo(forwardRef(Catalog))