import React, { useEffect } from 'react';
import { Layout, Menu, Space } from 'antd';
import { FormattedMessage, history } from 'umi';
import { layoutProps } from './data.d';
import styles from './style.less';
import { resizeClientSize } from '@/utils/hooks'
import { SystemMenuIcon } from '@/utils/menuIcon'
import { useMemo } from 'react';
const { Sider, Content } = Layout;

const systemLayout = (props: layoutProps) => {
	const { route, location } = props
	const { routes } = route
	let routeRight: any[] = []
	routes.map(item => { !item.unaccessible && routeRight.push(item) })
	const { path } = routeRight[0]
	const { pathname } = location
	const onClick = async (path: string) => {
		history.push(path)
	}

	const timeStampKey = useMemo(() => new Date().getTime() , [ location ])

	useEffect(() => {
		pathname == '/system' && history.push(path);
	});

	const { windowHeight } = resizeClientSize()

	return (
		<Layout key={ timeStampKey } className={styles.layout} >
			<Sider
				theme="light"
				className={styles.side}
			>
				<Menu 
					mode="inline" 
					selectedKeys={[ pathname ]}
				>
					{
						routeRight.map(
							(item, index) => (
								!item.hideInMenu &&
								<Menu.Item
									key={ item.path }
									onClick={() => onClick(item.path)}
								>
									<Space>
										{SystemMenuIcon(item.name)}
										{<FormattedMessage id={"SystemConf.menuLayout." + item.name} />}
									</Space>
								</Menu.Item>
							)
						)
					}
				</Menu>
			</Sider>
			<Content style={{ marginLeft: 200, padding: 20, height: windowHeight - 50, overflow: 'auto' }} >
				<div style={{ width: '100%', background: '#fff' , minHeight : windowHeight - 90 }}>
					{
						props.children
					}
				</div>
			</Content>
		</Layout>
	);
};

export default systemLayout;



{/* <div
className={styles.menu}
key={index}
onClick={() => onClick(item.path)}
>
<div
	className={pathname == item.path ? styles.selected : styles.menuItem}
>
	<Space>
		{SystemMenuIcon(item.name)}
		{<FormattedMessage id={"SystemConf.menuLayout." + item.name} />}
	</Space>
</div>
</div> */}