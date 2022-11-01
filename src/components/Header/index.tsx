import React, { useEffect, useRef, useState } from 'react'
import RightContent from '@/components/RightContent'
import { history, useModel, useRequest, useAccess, useParams, FormattedMessage } from 'umi'
import { Typography, Row, Menu, Col, Avatar, Popover, Dropdown, Space } from 'antd'
import { ReactComponent as BackHome } from '@/assets/svg/back_home.svg'
import styles from './index.less'
import TestJobTabs from './components/JobTab'
import { HearderDropdown } from './components/HeaderDropdown'
import { CaretDownOutlined } from '@ant-design/icons'
import SwithRouteIcon from './components/SwithIcon'
import { HeaderContainer, LogoWrapper, WorkspaceTitle, HeaderCls } from './styled'
import logoPng from '@/assets/img/logo.png'
import { useSize } from 'ahooks'
import pageAdShow from "@/assets/img/header_page_show_ad.png"
import styled from 'styled-components'
import { HeaderProvider } from './Provider'
import { queryTestTemplateList } from '@/pages/WorkSpace/TestTemplateManage/service'
import { queryJobTypeList } from '@/pages/WorkSpace/JobTypeManage/services'

const AdShowBtn = styled.div`
    background: url(${pageAdShow}) no-repeat right center/100% 100%;
    width: 30px;
    height: 30px;
    position: absolute;
    right: 0;
    top: 0;
    cursor: pointer;
`
const defaultParams = { enable: "True", page_num: 1, page_size: 999 }

const Header: React.FC<Record<string, any>> = (props: any) => {
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

    const leftRef = useRef(null) as any
    const left = useSize(leftRef)

    const openAd = () => {
        setInitialState((p: any) => ({ ...p, wsAdShow: wsId }))
    }

    const { data: jobTypes, run: jobTypesRun, loading: typeFetchLoading } = useRequest(
        () => queryJobTypeList({ ws_id: wsId, enable: "True" }),
        {
            initialData: [],
            manual: true,
            debounceInterval: 300,
            formatResult: (r) => {
                let result = []
                if (r.code === 200) {
                    result = r.data
                    setInitialState({ ...initialState, jobTypeList: r.data })
                }
                return result
            },
            // refreshDeps: [wsId, initialState?.refreshMenu]
        }
    )

    const { data: jobTypeTemplates, run: jobTemplatesRun, loading: templateFetchLoading } = useRequest(
        (params: any = { ...defaultParams, ws_id: wsId }) => queryTestTemplateList(params),
        {
            initialData: [],
            debounceInterval: 300,
            manual: true
        }
    )

    React.useEffect(() => {
        if (wsId) {
            jobTypesRun()
            jobTemplatesRun({ ...defaultParams, ws_id: wsId })
        }
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
    }, [pathname, props.menuData])

    const handleMenuOpenChange = (keys: any) => setOpenKeys(keys)

    const iconRf = useRef(null) as any
    const iconWrapperSise = useSize(iconRf)

    return (
        <HeaderProvider.Provider
            value={{
                jobTemplates: jobTypeTemplates,
                jobTypes: jobTypes,
                ws_id: wsId,
                templatesRun: jobTemplatesRun,
                typesRun: jobTypesRun,
                typeFetchLoading,
                templateFetchLoading,
            }}
        >
            <HeaderContainer align="middle" justify="space-between">
                <Row align="middle" wrap={false} style={{ width: `calc(100% - ${left?.width ? 1 + left?.width : 0}px)` }}>
                    <Row ref={iconRf}>
                        {
                            !isWs &&
                            <LogoWrapper align="middle" onClick={() => history.push('/')}>
                                <Avatar shape="square" src={logoPng} size={32} style={{ marginRight: 16 }} />
                                <Typography.Title level={3} >T-One</Typography.Title>
                            </LogoWrapper>
                        }
                        {
                            isWs &&
                            <WorkspaceTitle align="middle" wrap={false}>
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
                    </Row>

                    <HeaderCls
                        style={{ width: `calc(100% - ${iconWrapperSise?.width ? 1 + iconWrapperSise?.width : 0}px)` }}
                    >
                        <Menu
                            mode="horizontal"
                            selectedKeys={selectedKeys}
                            openKeys={openKeys}
                            onOpenChange={handleMenuOpenChange}
                            subMenuOpenDelay={.5}
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
                                                                />
                                                            }
                                                            visible={visible}
                                                            // visible
                                                            onVisibleChange={setVisible}
                                                        >
                                                            <Row>
                                                                <Space>
                                                                    {SwithRouteIcon(item.locale)}
                                                                    <span
                                                                        style={{ height: '100%', display: "inline-block" }}
                                                                        onClick={() => {
                                                                            if (jobTypes.length > 0) {
                                                                                const isDefaultIdx = jobTypes.findIndex((item: any) => item.is_first)
                                                                                if (isDefaultIdx > -1)
                                                                                    history.push(`/ws/${ws_id}/test_job/${jobTypes[isDefaultIdx].id}`)
                                                                                else
                                                                                    history.push(`/ws/${ws_id}/test_job/${jobTypes[0].id}`)
                                                                            }
                                                                        }}
                                                                    >
                                                                        {/* {item.name} */}
                                                                        <FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE' } />
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
                                                    <Menu.Item key={itemPath} title={<FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE' } />}> {/* {item.name} */}
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
                                                                            return (
                                                                                <Menu.Item
                                                                                    key={i.path}
                                                                                    title={<FormattedMessage id={i.locale || 'DEF_COMMON_FORMATE' } />} // {i.name}
                                                                                    onClick={() => history.push(i.path.replace(':ws_id', ws_id))}
                                                                                >
                                                                                    {/* {i.name} */}
                                                                                    <FormattedMessage id={i.locale || 'DEF_COMMON_FORMATE' } />
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
                                                                        {/* {item.name} */}
                                                                        <FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE'} />
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
                                                    title={<FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE'} />} // {item.name}
                                                >
                                                    <Space>
                                                        {SwithRouteIcon(item.locale)}
                                                        {/* {item.name} */}
                                                        <FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE'} />
                                                    </Space>
                                                    <div className={'nav_bottom_line'} />
                                                </Menu.Item>
                                            )
                                        }
                                        return (
                                            <Menu.Item
                                                onClick={() => history.push(item.path)}
                                                key={item.path}
                                                title={<FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE' } />} // {item.name}
                                            >
                                                <Space>
                                                    {SwithRouteIcon(item.locale)}
                                                    <span><FormattedMessage id={item.locale || 'DEF_COMMON_FORMATE'} /></span>
                                                </Space>
                                                <div className={'nav_bottom_line'} />
                                            </Menu.Item>
                                        )
                                    }
                                )
                            }
                        </Menu>
                    </HeaderCls>
                </Row>
                <div ref={leftRef}>
                    <RightContent wsId={wsId} isWs={isWs} routes={routes} />
                </div>

                {
                    initialState?.hasAdWs?.includes(wsId) &&
                    <AdShowBtn onClick={openAd} />
                }
            </HeaderContainer >
        </HeaderProvider.Provider>
    )
}

export default Header