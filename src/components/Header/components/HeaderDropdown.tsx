import React, { useState, useEffect } from 'react'

import { Dropdown, Menu, Space, Avatar, Typography, Row, Spin } from 'antd'
import { CaretDownOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { queryWorkspaceHistory } from '@/services/Workspace'
import styles from './index.less'
import { history, useModel, Redirect } from 'umi'
import _ from 'lodash'

import styled from 'styled-components'
import { jumpWorkspace } from '@/utils/utils'

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
    color: #F5F5F5;
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
    <Cover size={24} theme_color={theme_color}>{show_name.slice(0, 1)}</Cover>

const WorkspaceDropdownMenu = styled(Menu)`
    width: 220px;
    overflow: auto;
    max-height: 430px;
    padding: 20px 0;

    .ant-dropdown-menu-item {
        height:40px;
        display:flex;
        padding: 0 8px;
        color: rgba(0, 0, 0, 0.85);
    }

    .current_ws {
        background:rgba(0,0,0,.02);
    }
`

export const HearderDropdown: React.FC<any> = (props) => {
    const ws_id = props.ws_id
    const { initialState } = useModel('@@initialState')

    const [workspaces, setWorkspaces] = useState<Array<any>>([])
    const [ws, setWs] = useState<any>({ logo: '', show_name: '' })
    const [index, setIndex] = useState(1)

    const DEFAULT_PAGE_PARAMS = { page_num: 1, page_size: 20, call_page: 'menu', ws_id }
    const [pageParams, setPageParams] = useState(DEFAULT_PAGE_PARAMS)
    const [isOver, setIsOver] = useState(false)

    const queryWorkspaceList = async (params: any) => {
        const { data = [], code, next } = await queryWorkspaceHistory(params)
        if (code === 200) {
            const index = _.findIndex(data, function (o: any) { return o.id === ws_id })
            setIndex(index)
        }
        if (!next) setIsOver(true)
        if (code !== 200) setIndex(-2)
        setWorkspaces(workspaces.concat(data))
        const [current] = data.filter(({ id }: any) => id === ws_id)
        current && setWs(current)
    }

    useEffect(() => {
        const { refreshWorkspaceList } = initialState
        if (refreshWorkspaceList !== undefined) {
            setPageParams(DEFAULT_PAGE_PARAMS)
            queryWorkspaceList(DEFAULT_PAGE_PARAMS)
            setIsOver(false)
        }
    }, [initialState?.refreshWorkspaceList])

    useEffect(() => {
        queryWorkspaceList(pageParams)
        return () => {
            setPageParams(DEFAULT_PAGE_PARAMS)
            setWorkspaces([])
            setIsOver(false)
        }
    }, [])

    const hanldeScroll = ({ target }: any) => {
        const { clientHeight, scrollTop, scrollHeight } = target
        if (clientHeight + scrollTop === scrollHeight && !isOver) {
            setPageParams({ ...pageParams, page_num: pageParams.page_num + 1 })
            queryWorkspaceList({ ...pageParams, page_num: pageParams.page_num + 1 })
        }
    }

    if (index === -2) return <Redirect to="/500" />

    if (workspaces.length === 0)
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
            overlay={
                () => (
                    <WorkspaceDropdownMenu
                        onScroll={hanldeScroll}
                    >
                        {
                            workspaces.map(
                                (workspace: any, index: number) => {
                                    const isActive = ws.show_name === workspace.show_name
                                    return (
                                        <Menu.Item
                                            key={index}
                                            onClick={() => {
                                                setWs(workspace)
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
                    </WorkspaceDropdownMenu>
                )
            }
        >
            <WorkspaceTitle align="middle" justify="space-between">
                <Space>
                    <WorkspaceCover {...ws} />
                    <ShowName ellipsis>{ws.show_name}</ShowName>
                </Space>
                <CaretDownOutlined style={{ fontSize: 10, marginLeft: 14 }} />
            </WorkspaceTitle>
        </Dropdown>
    )

}