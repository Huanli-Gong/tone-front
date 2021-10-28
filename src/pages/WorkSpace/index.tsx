import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { Layout, Menu, Space } from 'antd'
import styles from './index.less'
import { FormattedMessage, history, useIntl, useModel, useParams } from 'umi'
import { resizeClientSize } from '@/utils/hooks'
import { WorkspaceMenuIcon } from '@/utils/menuIcon'

const { document }: any = window

const WorkspaceLayout = (props: any) => {
    const { ws_id }: any = useParams()
    const { pathname } = props.location
    const { routes } = props.route
    const { windowHeight } = resizeClientSize()

    const timeStampKey = useMemo(() => new Date().getTime(), [props.location])

    const intl = useIntl()
    const { initialState } = useModel('@@initialState')

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
        }, [routeRight, realPath]
    )

    useEffect(() => {
        setOpenKeys(getOpenKeys())
    }, [routeRight])

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
            <div key={ timeStampKey }>
                {props.children}
            </div>
        )
    return (
        <Layout key={timeStampKey} className={styles.layout} >
            <Layout.Sider theme="light" className={styles.ws_slider} style={{ height: windowHeight - 50 }} >
                <Menu
                    selectedKeys={[realPath]}
                    className={styles.ws_menu_styles}
                    mode="inline"
                    // expandIcon={}
                    triggerSubMenuAction={'hover'}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                >
                    {
                        routeRight.map(
                            (item: any) => {
                                if (item.hideInMenu) return false
                                if (item.routes && item.routes.length > 0)
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
                                            {
                                                item.routes.map(
                                                    (child: any): any => {
                                                        if (initialState?.authList.sys_role_title === 'super_admin' || initialState?.authList.sys_role_title === 'sys_admin') {
                                                            if (child.name === 'JoinDetail') child.hideInMenu = false
                                                        } else {
                                                            if (initialState?.authList.ws_role_title === 'ws_owner' || initialState?.authList.ws_role_title === 'ws_admin') {
                                                                if (child.name === 'JoinDetail') child.hideInMenu = false
                                                            } else {
                                                                if (child.name === 'JoinDetail') child.hideInMenu = true
                                                            }
                                                        }
                                                        if (!child.hideInMenu)
                                                            return (
                                                                <Menu.Item
                                                                    key={child.path}
                                                                    onClick={() => onMenuClick(child)}
                                                                >
                                                                    <FormattedMessage id={`Workspace.${item.name}.${child.name}`} />
                                                                </Menu.Item>
                                                            )

                                                    }
                                                )
                                            }
                                        </Menu.SubMenu>
                                    )
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
            <Layout.Content className={styles.content} style={{ height: windowHeight - 50 }}>
                <div style={{ background: '#fff', width: '100%', minHeight: windowHeight - 90 }}>
                    {props.children}
                </div>
            </Layout.Content>
        </Layout>
    )
}

export default WorkspaceLayout


    // console.log('state',props.location)

    // if ( /\/ws\/[a-zA-Z0-9]{8}\/dashboard/.test(pathname))          return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/job\/preview/.test(pathname))       return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_job/.test( pathname ) )        return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_template/.test( pathname ) )   return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_analysis/.test( pathname ) )   return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_report/.test( pathname ) )     return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_result/.test( pathname ) )     return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/suite_search/.test(pathname))       return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/suite_tab_search/.test(pathname))   return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_plan/.test(pathname))          return props.children
    // if ( /\/ws\/[a-zA-Z0-9]{8}\/test_create_report/.test(pathname)) return props.children

    // {state === 'permission' && <div style={{ textAlign: 'center', position: 'relative', top: '50%', transform: 'translateY(-50%)' }}>
    //                 <img alt="icon" src={RoleIcon}></img>
    //                 <span style={{ color: '#000', fontSize: 18, fontWeight: 'bold', display: 'block', marginTop: 20 }}>无权限</span>
    //             </div>}
    //             {state !== 'permission' && props.children}