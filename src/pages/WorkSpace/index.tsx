import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Layout, Menu, Space } from 'antd'
import styles from './index.less'
import { FormattedMessage, history, useIntl, useParams } from 'umi'
import { useClientSize } from '@/utils/hooks'
import { WorkspaceMenuIcon } from '@/utils/menuIcon'
import AdCompoent from './components/Ad'

const { document }: any = window

const WorkspaceLayout = (props: any) => {
    // const { initialState } = useModel('@@initialState')
    const { ws_id }: any = useParams()
    const { pathname } = props.location
    const { routes } = props.route
    const { height: windowHeight } = useClientSize()

    const timeStampKey = useMemo(() => new Date().getTime(), [props.location])
    const intl = useIntl()

    const [openKeys, setOpenKeys] = useState<any>([])

    const realPath = pathname.replace(ws_id, ':ws_id')
    
    const routeRight = useMemo(() => {
        return routes.filter(
            (cur: any) => !cur.inNav && !cur.unaccessible
        )
    }, [routes])

    const onMenuClick = useCallback(({ path }) => {
        history.push(path.replace(':ws_id', ws_id))
    }, [ws_id])

    useEffect(() => {
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
                document.title = intl.messages[title] ? intl.messages[title] + `- T-One` : 'T-One'
            }
        })
    }, [routes, realPath])

    const hasLeftMenu = useMemo(() => {
        for (const route of routes) {
            const { path, inNav } = route
            const regStr = path.split('/').reduce((p: any, c: any) => {
                if (~c.indexOf(':'))
                    return p.concat(~c.indexOf(':ws_id') ? '([a-zA-Z0-9]{8})' : '.+')
                return p.concat(c)
            }, []).join('\/')
            const exp = new RegExp(`^${regStr}`)
            const reg = exp.test(pathname)
            if (reg) return !inNav
        }
        return true
    }, [routes, pathname])

    const rootSubmenuKeys = useMemo(() => {
        return routeRight.reduce((pre: any, item: any) => {
            if (item.children && item.children.length > 0) return pre.concat(item.path)
            return pre
        }, [])
    }, [routeRight])

    const getOpenKeys = useCallback(
        () => {
            if (routeRight && routeRight.length > 0) {
                for (let x = 0, len = routeRight.length; x < len; x++) {
                    const routerItem = routeRight[x]
                    if (routerItem.path === realPath)
                        return [realPath];
                    if (routerItem.children) {
                        for (let i = 0, l = routerItem.children.length; i < l; i++) {
                            const childItem = routerItem.children[i]
                            if (childItem.path === realPath)
                                return [routerItem.path, realPath]
                        }
                    }
                }
            }
            return []
        }, [routeRight, realPath ]
    )

    useEffect(() => {
        setOpenKeys(getOpenKeys())
    }, [routeRight,pathname])

    const onOpenChange = useCallback((keys: any) => {
        const latestOpenKey: any = keys.find((key: any) => openKeys.indexOf(key) === -1);
        if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
            setOpenKeys(keys);
        } else {
            setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
        }
    }, [rootSubmenuKeys, openKeys]);

    if (!hasLeftMenu)
        return (
            <div key={timeStampKey} style={{ minHeight: windowHeight - 50, background: "#fff" }}>
                {props.children}
                <AdCompoent />
            </div>
        )
        
    return (
        <Layout key={timeStampKey} className={styles.layout} >
            <Layout.Sider theme="light" className={styles.ws_slider}>
                <Menu
                    selectedKeys={[realPath]}
                    className={styles.ws_menu_styles}
                    mode="inline"
                    triggerSubMenuAction={'hover'}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                >
                    {
                        routeRight.map(
                            (item: any) => {
                                if (item.hideInMenu) return false
                                if (item.routes && item.routes.length > 0) {
                                    return (
                                        <Menu.SubMenu key={item.path}
                                            title={<Space>{WorkspaceMenuIcon(item.name)}<FormattedMessage id={`Workspace.${item.name}`} /></Space>}
                                            popupClassName={styles.ws_sb_st}
                                        >
                                            {item.routes.map((child: any): any => {
                                                if (!child.hideInMenu && !child.unaccessible) {
                                                    return (
                                                        <Menu.Item key={child.path} onClick={() => onMenuClick(child)}>
                                                            <FormattedMessage id={`Workspace.${item.name}.${child.name}`} />
                                                        </Menu.Item>
                                                    )
                                                }
                                            })}
                                        </Menu.SubMenu>
                                    )
                                }
                                return (
                                    <Menu.Item key={item.path} onClick={() => onMenuClick(item)}>
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
            <Layout.Content className={styles.content} style={{ minHeight: windowHeight - 50 }}>
                <div style={{ background: "#fff", margin: 0, padding: 0, height: "100%" }}>
                    {props.children}
                </div>
            </Layout.Content>
            <AdCompoent />
        </Layout>
    )
}

export default WorkspaceLayout
