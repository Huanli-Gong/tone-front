import React, { useState } from 'react'

import { Dropdown, Menu, Space, Avatar, Typography, Row, Spin } from 'antd'
import { CaretDownOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { queryWorkspaceHistory } from '@/services/Workspace'
import styles from './index.less'
import { history, useModel } from 'umi'

import styled from 'styled-components'
import { jumpWorkspace, redirectErrorPage } from '@/utils/utils'

const WorkspaceTitle = styled(Row)`
    width:210px;
    height:38px;
    background:rgba(255,255,255,.04);
    color:#fff !important;
    line-height:38px;
    padding:0 8px;
    border-radius: 4px;
    cursor:pointer;
`

const ShowName = styled(Typography.Text)`
    width: 138px;
    font-size: 14px;
    color: #F5F5F5 !important;
`
interface CoverProps {
    size: number
    theme_color: string
}

const Cover = styled.span<CoverProps>`
    display: inline-block;
    border-radius : 4px;
    font-size : 14px;
    font-weight : bold;
    width : ${({ size }) => size}px;
    height : ${({ size }) => size}px;
    line-height : ${({ size }) => size}px;
    text-align : center;
    color : #fff;
    background : ${({ theme_color }) => theme_color};
`
const WorkspaceCover: React.FC<any> = ({ logo, show_name, theme_color }) => logo ?
    <Avatar
        shape="square"
        size={24}
        src={logo}
    /> :
    <Cover size={24} theme_color={theme_color}>{show_name?.slice(0, 1)}</Cover>



export const HearderDropdown: React.FC<any> = (props) => {
    const { ws_id } = props

    const { initialState: { wsList, listFetchLoading }, setInitialState } = useModel("@@initialState")

    const [isOver, setIsOver] = useState(false)

    const queryWorkspaceList = async () => {
        setInitialState((p: any) => ({ ...p, listFetchLoading: true }))
        let num = isOver ? wsList?.page_num : wsList?.page_num + 1
        const { code, data, page_num, total_page } = await queryWorkspaceHistory({
            page_num: num, page_size: 20, call_page: 'menu', ws_id
        })
        if (code !== 200) {
            redirectErrorPage(500)
            return
        }
        setIsOver(total_page === page_num)
        if (Object.prototype.toString.call(data) === "[object Array]" && !!data.length) {
            setInitialState((p: any) => {
                const obj = p.wsList.data.concat(data).reduce((pre: any, cur: any) => {
                    pre[cur.id] = cur
                    return pre
                }, {})
                return {
                    ...p,
                    listFetchLoading: false,
                    wsList: {
                        page_num,
                        data: Object.entries(obj).map((item: any) => {
                            const [, val] = item
                            return val
                        })
                    }
                }
            })
        }
    }

    const current = React.useMemo(() => {
        if (!wsList) return {}
        const [workspace] = wsList?.data?.filter(({ id }: any) => id === ws_id)
        if (workspace) return workspace
        return {}
    }, [wsList, ws_id])

    const hanldeScroll = ({ target }: any) => {
        const { clientHeight, scrollTop, scrollHeight } = target
        if (clientHeight + scrollTop === scrollHeight && !isOver) {
            queryWorkspaceList()
        }
    }
    if (wsList?.data?.length === 0)
        return (
            <WorkspaceTitle align="middle" justify="space-between">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
            </WorkspaceTitle>
        )
    return (
        <Dropdown
            placement="bottomLeft"
            arrow={true}
            overlayClassName={styles.dropdownClass}
            dropdownRender={
                () => (
                    <Menu
                        className={styles.workspaceDropdownMenu}
                        onScroll={hanldeScroll}
                    >
                        {
                            wsList?.data?.map(
                                (workspace: any) => {
                                    const isActive = ws_id === workspace.id
                                    return (
                                        <Menu.Item
                                            key={workspace.id}
                                            onClick={() => {
                                                history.push(jumpWorkspace(workspace.id))
                                            }}
                                            className={isActive ? 'current_ws' : ''}
                                        >
                                            <Space >
                                                <WorkspaceCover {...workspace} />
                                                <Typography.Text
                                                    className={isActive && styles.active_typography}
                                                    style={{
                                                        width: 176 - 22 - 8,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        display: 'inline-block',
                                                        verticalAlign: 'middle'
                                                    }}
                                                >
                                                    {workspace.show_name}
                                                </Typography.Text>
                                                {isActive && <CheckOutlined style={{ color: 'rgba(0,0,0,.65)' }} />}
                                            </Space>
                                        </Menu.Item>
                                    )
                                }
                            )
                        }
                    </Menu>
                )
            }
        >
            {
                listFetchLoading ?
                    <WorkspaceTitle align="middle" justify="space-between">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}/>
                    </WorkspaceTitle> :
                    <WorkspaceTitle align="middle" justify="space-between">
                        <Space>
                            <WorkspaceCover {...current} />
                            <ShowName ellipsis>{current.show_name}</ShowName>
                        </Space>
                        <CaretDownOutlined style={{ fontSize: 10, marginLeft: 14 }} />
                    </WorkspaceTitle>
            }
        </Dropdown>
    )
}