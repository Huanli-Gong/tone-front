import React, { useEffect, useState } from 'react'
import { queryJobTypeList } from '@/pages/WorkSpace/JobTypeManage/services'
import RightContent from '@/components/RightContent'
import { history, useModel, useRequest, useAccess } from 'umi'
import { Typography, Row, Menu, Col, Avatar, Popover, Dropdown, Space } from 'antd'
import { ReactComponent as BackHome } from '@/assets/svg/back_home.svg'
import styles from './index.less'
import TestJobTabs from './components/JobTab'
import { HearderDropdown } from './components/HeaderDropdown'
import { CaretDownOutlined } from '@ant-design/icons'
import { useClientSize } from '@/utils/hooks'
import SwithRouteIcon from './components/SwithIcon'
import { HeaderContainer, LogoWrapper, WorkspaceTitle } from './styled'
import logoPng from '@/assets/img/logo.png'

export default (props: any) => {
    const { initialState, setInitialState } = useModel('@@initialState')
    const { pathname } = location
    const access = useAccess()
    const [isWs, setIsWs] = useState(false)
    const [backLogo, setBackLogo] = useState(false)
    const [wsId, setWsId] = useState<any>(null)
    const [openKeys, setOpenKeys] = useState<any>([])
    const [selectedKeys, setSelectedKeys] = useState<any>([])
    const [routes, setRoutes] = useState([])
    const [visible, setVisible] = useState(false)

    const { data: types, run } = useRequest(
        () => queryJobTypeList({ ws_id: wsId, enable: 'True' }),
        {
            manual: true,
            initialData: [],
            debounceInterval: 1000,
            formatResult: (r) => {
                let result = []
                if (r.code === 200) {
                    result = r.data
                    setInitialState({ ...initialState, jobTypeList: r.data })
                }
                return result
            }
        }
    )

    useEffect(() => {
        if (wsId) run()
    }, [wsId, initialState?.refreshMenu])

    useEffect(() => {
        const is_ws = pathname.indexOf('/ws/') > -1
        let wsRoutes: any
        if (is_ws)
            [{ children: wsRoutes }] = props.menuData.filter((item: any) => item.path === '/ws/:ws_id')
        else
            wsRoutes = props.menuData.filter((item: any) => item.path !== '/ws/:ws_id')

        setRoutes(wsRoutes)
        setIsWs(is_ws)

        if (is_ws && /\/ws\/([a-zA-Z0-9]{8})\/.*/.test(pathname))
            setWsId(pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1'))

        for (const route of wsRoutes) {
            const { path } = route
            const regStr = path.split('/').reduce((p: any, c: any) => {
                if (~c.indexOf(':'))
                    return p.concat(~c.indexOf(':ws_id') ? '[a-zA-Z0-9]{8}' : '.+')
                return p.concat(c)
            }, []).join('/')
            const exp = new RegExp(`^${regStr}${is_ws ? '' : route.children ? '/' : '$'}`)
            // console.log( exp , route )
            const reg = exp.test(pathname)
            if (reg) {
                setSelectedKeys([path])
                break;
            }
        }

        return () => {
            setBackLogo(false)
            setWsId(null)
            setSelectedKeys([])
        }
    }, [pathname])

    // console.log( routes )

    const handleMenuOpenChange = (keys: any) => setOpenKeys(keys)

    const { width: layoutWidth } = useClientSize()

    return (
        <HeaderContainer align="middle" justify="space-between">
            <div>
                <Row align="middle" wrap={false}>
                    {
                        !isWs &&
                        <LogoWrapper align="middle" onClick={() => history.push('/')}>
                            <Avatar shape="square" src={logoPng} size={32} style={{ marginRight: 16 }} />
                            <Typography.Title level={3} >T-One</Typography.Title>
                        </LogoWrapper>
                    }
                    {
                        isWs &&
                        <WorkspaceTitle align="middle">
                            <div
                                style={{ height: 50, verticalAlign: 'middle', marginRight: 24, display: 'flex', alignItems: 'center' }}
                                onMouseEnter={() => setBackLogo(true)}
                                onMouseLeave={() => setBackLogo(false)}
                            >
                                {
                                    <Popover style={{ marginRight: 20 }} content={"返回首页"}>
                                        {
                                            backLogo ?

                                                <BackHome
                                                    style={{ width: 32, height: 32, cursor: 'pointer' }}
                                                    onClick={() => history.push('/')}
                                                />
                                                :
                                                <Avatar shape="square" src={require('@/assets/img/logo.png')} size={32} />
                                        }
                                    </Popover>
                                }
                            </div>
                            <HearderDropdown ws_id={wsId} />
                        </WorkspaceTitle>

                    }
                    <Menu
                        mode="horizontal"
                        selectedKeys={selectedKeys}
                        openKeys={openKeys}
                        onOpenChange={handleMenuOpenChange}
                        subMenuOpenDelay={.5}
                        key={layoutWidth}
                        className={styles.menu}
                    >
                        {
                            routes.map(
                                (item: any, index: number) => {
                                    const itemPath = item.path

                                    if (isWs) {
                                        if (!item.inNav) return false
                                        let path: string = item.path
                                        const ws_id = pathname.replace(/\/ws\/([a-zA-Z0-9]{8})\/.*/, '$1')
                                        path = path.replace(':ws_id', ws_id)
                                        if (itemPath.indexOf('/test_job') > -1) {
                                            return (
                                                <Menu.Item key={itemPath} >
                                                    <Dropdown
                                                        arrow={true}
                                                        // trigger={['click']}
                                                        overlayClassName={styles.dropdownArrowHide}
                                                        overlay={
                                                            <TestJobTabs
                                                                onOk={() => setVisible(false)}
                                                                ws_id={ws_id}
                                                                types={types}
                                                            />
                                                        }
                                                        visible={visible}
                                                        onVisibleChange={setVisible}
                                                    >
                                                        <Row>
                                                            <Space>
                                                                {SwithRouteIcon(item.locale)}
                                                                <span
                                                                    style={{ height: '100%', display: "inline-block" }}
                                                                    onClick={() => {
                                                                        if (types.length > 0) {
                                                                            const isDefaultIdx = types.findIndex((item: any) => item.is_first)
                                                                            if (isDefaultIdx > -1)
                                                                                history.push(`/ws/${ws_id}/test_job/${types[isDefaultIdx].id}`)
                                                                            else
                                                                                history.push(`/ws/${ws_id}/test_job/${types[0].id}`)
                                                                        }
                                                                    }}
                                                                >
                                                                    {item.name}
                                                                </span>
                                                                <CaretDownOutlined style={{ fontSize: 10 }} />
                                                            </Space>
                                                            <div className={'nav_bottom_line'} />
                                                        </Row>
                                                    </Dropdown>
                                                </Menu.Item>
                                            )
                                        }
                                        if (item.children && item.children.length > 0) {
                                            return (
                                                <Menu.Item key={itemPath} title={item.name}>
                                                    <Dropdown
                                                        arrow={true}
                                                        overlayClassName={styles.dropdownArrowHide}
                                                        overlay={
                                                            <Menu
                                                                style={{ minWidth: 96 }}
                                                                selectedKeys={[pathname.replace(ws_id, ':ws_id')]}
                                                            >
                                                                {
                                                                    item.children.map((i: any) => {
                                                                        if (!access.canWsAdmin()) {
                                                                            if (i.name === '计划管理') {
                                                                                return false
                                                                            }
                                                                        }
                                                                        return (
                                                                            <Menu.Item
                                                                                key={i.path}
                                                                                title={i.name}
                                                                                onClick={() => history.push(i.path.replace(':ws_id', ws_id))}
                                                                            >
                                                                                {i.name}
                                                                            </Menu.Item>
                                                                        )
                                                                    })
                                                                }
                                                            </Menu>
                                                        }
                                                    >
                                                        <Row>
                                                            <Space>
                                                                {SwithRouteIcon(item.locale)}
                                                                <span style={{ height: '100%', display: "inline-block" }} >
                                                                    {item.name}
                                                                </span>
                                                                <CaretDownOutlined style={{ fontSize: 10 }} />
                                                            </Space>
                                                            <div className={'nav_bottom_line'} />
                                                        </Row>
                                                    </Dropdown>
                                                </Menu.Item>
                                            )
                                        }
                                        return (
                                            <Menu.Item
                                                onClick={() => history.push(path)}
                                                key={itemPath}
                                                title={item.name}
                                            >
                                                <Space>
                                                    {SwithRouteIcon(item.locale)}
                                                    {item.name}
                                                </Space>
                                                <div className={'nav_bottom_line'} />
                                            </Menu.Item>
                                        )
                                    }
                                    return (
                                        <Menu.Item
                                            onClick={() => history.push(item.path)}
                                            key={item.path}
                                            title={item.name}
                                        >
                                            <Space>
                                                {SwithRouteIcon(item.locale)}
                                                <span>{item.name}</span>
                                            </Space>
                                            <div className={'nav_bottom_line'} />
                                        </Menu.Item>
                                    )
                                }
                            )
                        }
                    </Menu>
                </Row>
            </div>
            <div>
                <RightContent wsId={wsId} isWs={isWs} />
            </div>
        </HeaderContainer >
    )
}