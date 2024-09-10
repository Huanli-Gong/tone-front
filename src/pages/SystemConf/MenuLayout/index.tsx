/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Layout, Menu, Space } from 'antd';
import { FormattedMessage, history } from 'umi';
import type { layoutProps } from './data.d';
import styles from './style.less';
import { useClientSize } from '@/utils/hooks'
import { SystemMenuIcon } from '@/utils/menuIcon'
const { Sider, Content } = Layout;

const SystemLayout: React.FC<layoutProps> = (props) => {
	const { route, location } = props
	const { routes } = route
	const routeRight: any[] = []
	routes.forEach(item => {
		if (!item.unaccessible)
			routeRight.push(item)
	})
	const { path } = routeRight[0]
	const { pathname } = location
	const onClick = async ($path: string) => {
		history.push($path)
	}

	// eslint-disable-next-line react-hooks/rules-of-hooks, react-hooks/exhaustive-deps
	const timeStampKey = React.useMemo(() => new Date().getTime(), [location])

	useEffect(() => {
		if (pathname == '/system')
			history.push(path);
	}, [pathname, path]);

	const { height: windowHeight } = useClientSize()

	return (
		<Layout key={timeStampKey} className={styles.layout} >
			<Sider
				theme="light"
				className={styles.side}
			>
				<Menu
					mode="inline"
					selectedKeys={[pathname]}
					className="sysConfMenu"
				>
					{
						routeRight.map(
							(item) => (
								!item.hideInMenu &&
								<Menu.Item
									key={item.path}
									onClick={() => onClick(item.path)}
								>
									<Space>
										{SystemMenuIcon(item.name)}
										{<FormattedMessage id={"menu.systemConf." + item.name} />}
									</Space>
								</Menu.Item>
							)
						)
					}
				</Menu>
			</Sider>
			<Content style={{ padding: 20, minHeight: windowHeight - 50 }} >
				<div style={{ width: '100%', background: '#fff', minHeight: windowHeight - 90 }}>
					{
						props.children
					}
				</div>
			</Content>
		</Layout>
	);
};

export default SystemLayout;