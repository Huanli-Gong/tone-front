/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Layout, Menu, Space, Popover } from 'antd'
import styles from './index.less'
import { FormattedMessage, history, useIntl, useParams, getLocale, useLocation, useRouteMatch, useModel } from 'umi'
import { useClientSize } from '@/utils/hooks'
import { WorkspaceMenuIcon } from '@/utils/menuIcon'
import AdComponent from './components/Ad'

const { document }: any = window

/* @ts-ignore */
const filterUnaccessible = (arr: any[]) => arr.reduce((pre, cur) => {
    const { routes, unaccessible } = cur
    if (!unaccessible)
        return pre.concat({ ...cur, routes: routes && routes.length > 0 ? filterUnaccessible(routes) : [] })
    return pre
}, [])

/* @ts-ignore */
const filterHideInMenu = (arr: any[]) => arr.reduce((pre, cur) => {
    const { routes, hideInMenu } = cur
    if (!hideInMenu)
        return pre.concat({ ...cur, routes: routes && routes.length > 0 ? filterHideInMenu(routes) : [] })
    return pre
}, [])

const getRegString = (path: any) => path?.split('/').reduce((p: any, c: any) => {
    if (~c.indexOf(':'))
        return p.concat(~c.indexOf(':ws_id') ? '([a-zA-Z0-9]{8})' : '.+')
    return p.concat(c)
}, []).join('\/')

const ignorePath = ["401", "500", "404", "403", 'test_report'].map((i: string) => `/ws/:ws_id/${i}`)

const WorkspaceLayout: React.FC<AnyType> = (props) => {
    // const { initialState } = useModel('@@initialState')
    const enLocale = getLocale() === 'en-US'
    const { route: { routes } } = props

    const routeMatch = useRouteMatch()
    const { ws_id }: any = useParams()
    const { pathname } = useLocation()
    const { formatMessage } = useIntl()
    const { height } = useClientSize()

    const [openKeys, setOpenKeys] = useState<any>([])

    const realPath = pathname.replace(ws_id, ':ws_id')

    const onMenuClick = ({ path }: any) => history.push(path?.replace(':ws_id', ws_id))

    useEffect(() => {
        const l = ignorePath.filter((i: any) => !!~realPath.indexOf(i))
        if (l?.length > 0) return
        routes.forEach((item: any) => {
            if (~realPath.indexOf(item.path)) {
                let title = `Workspace.${item.name}`;
                if (item.children && item.children.length > 0) {
                    item.children.forEach((ctx: any) => {
                        const hasChildPath = realPath === ctx.path
                        if (hasChildPath) {
                            title += '.' + ctx.name
                        }
                    })
                }
                document.title = formatMessage({ id: title }) ? formatMessage({ id: title }) + ` - T-One` : 'T-One'
            }
        })
    }, [routes, realPath])

    const hasLeftMenu = useMemo(() => {
        for (const route of routes) {
            const { path, inNav } = route
            const regStr = getRegString(path)
            if (regStr) {
                const exp = new RegExp(`^${regStr}`)
                const reg = exp.test(pathname)
                if (reg) return !inNav
            }
        }
        return false
    }, [routes, pathname])

    const inLeftRoutes = React.useMemo(() => {
        return filterHideInMenu(filterUnaccessible(routes)).filter((route: any) => !route.inNav)
    }, [routes])

    const rootSubmenuKeys = useMemo(() => {
        return inLeftRoutes.reduce((pre: any, item: any) => {
            if (item.children && item.children.length > 0) return pre.concat(item.path)
            return pre
        }, [])
    }, [inLeftRoutes])

    useEffect(() => {
        setOpenKeys(
            realPath?.replace(routeMatch.path, '')?.split('/')?.filter(Boolean)?.map(
                (i, index, arr) => `${routeMatch.path}/`.concat(arr.slice(0, index + 1).join('/'))
            )
        )
    }, [])

    const onOpenChange = useCallback((keys: any) => {
        const latestOpenKey: any = keys.find((key: any) => openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    }, [rootSubmenuKeys, openKeys]);

    const selectedKeys = React.useMemo(() => {
        return realPath?.replace(routeMatch.path, '')?.split('/')?.filter(Boolean)?.map(
            (i, index, arr) => `${routeMatch.path}/`.concat(arr.slice(0, index + 1).join('/'))
        )
    }, [realPath])

    // 国际化英文模式，菜单项内容过长缩略问题
    const EllipsisDiv = ({ placement = 'top', style = {}, item = {}, child = {} }: any) => {
        const caseRoute = ["TestTemplateManage", "GroupBaseline", "ClusterBaseline", "GroupManage"].includes(child.name)
        const text = formatMessage({ id: `Workspace.${item.name}.${child.name}` })
        return caseRoute && enLocale ?
            <Popover content={text} placement={placement}>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer', ...style }}>
                    {text}
                </div>
            </Popover> :
            <div>{text}</div>
    }

    if (hasLeftMenu)
        return (
            <Layout className={styles.layout} >
                <Layout.Sider theme="light" className={styles.ws_slider}>
                    <Menu
                        selectedKeys={selectedKeys}
                        className={styles.ws_menu_styles}
                        mode="inline"
                        triggerSubMenuAction={'hover'}
                        openKeys={openKeys}
                        onOpenChange={onOpenChange}
                    >
                        {
                            inLeftRoutes?.map(
                                (item: any) => {
                                    if (item.routes && item.routes.length > 0) {
                                        return (
                                            <Menu.SubMenu
                                                key={item.path}
                                                title={
                                                    <Space>
                                                        {WorkspaceMenuIcon(item.name)}
                                                        <FormattedMessage id={`Workspace.${item.name}`} />
                                                    </Space>
                                                }
                                                popupClassName={styles.ws_sb_st}
                                            >
                                                {item.routes.map((child: any): any => (
                                                    <Menu.Item key={child.path} onClick={() => onMenuClick(child)}>
                                                        <EllipsisDiv item={item} child={child} />
                                                    </Menu.Item>
                                                ))}
                                            </Menu.SubMenu>
                                        )
                                    }
                                    return (
                                        <Menu.Item
                                            key={item.path}
                                            onClick={() => onMenuClick(item)}
                                        >
                                            <Space>
                                                {WorkspaceMenuIcon(item.name)}
                                                <FormattedMessage id={`Workspace.${item.name}`} />
                                            </Space>
                                        </Menu.Item>
                                    )
                                }
                            )
                        }
                    </Menu>
                </Layout.Sider>
                <Layout.Content className={styles.content} style={{ minHeight: height - 50 }}>
                    <div style={{ background: "#fff", margin: 0, padding: 0, height: "100%" }}>
                        {props.children}
                    </div>
                </Layout.Content>
                <AdComponent />
            </Layout>
        )

    return (
        <div style={{ minHeight: height - 50, background: "#fff" }}>
            {props.children}
            <AdComponent />
        </div>
    )
}

export default WorkspaceLayout
