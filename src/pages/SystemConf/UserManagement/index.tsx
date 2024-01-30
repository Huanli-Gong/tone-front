/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState, useRef, useEffect } from 'react';
import { Tabs } from 'antd';
import UserManagementTable from './components/UserManagementTable';
import RoleManagementTable from './components/RoleManagementTable';
import { roleList } from './service';
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { TabCard } from '@/components/UpgradeUI';
import { useIntl } from 'umi';

const { TabPane } = Tabs;

const UserManagement: React.FC<{}> = () => {
	const { formatMessage } = useIntl()
	const [select, setSelect] = useState<any[]>([]);
	const [rolelist, setRolelist] = useState<any[]>([]);
	const [num, setNum] = useState<number>(0);
	const [roleTotal, setRoleTotal] = useState<number>(0);
	const all = useRef<any>(null)
	const [index, setIndex] = useState<string>('1');

	const getRoleSysList = async () => {
		const { data } = await roleList({ role_type: 'system', is_filter: '1' }) // is_filter: '1':根据用户角色过滤
		data && setSelect(data.list)
		data && setNum(data.num)
	};

	const getRoleList = async () => {
		const { total } = await roleList({ role_type: '' })
		total && setRoleTotal(total)
	};

	const getRoleFilterSysList = async () => {
		const { data } = await roleList({ role_type: 'system', is_filter: '0' }) // is_filter: '1':不过滤，获取全量
		const all = [{ id: '', name: "all", title: "all" }]
		data && setRolelist(all.concat(data.list || []))
	};

	useEffect(() => {
		getRoleList()
		getRoleSysList()
		getRoleFilterSysList()
		return () => {
			setRolelist([])
		}
	}, []);

	const handleTab = (key: string) => {
		setIndex(key)
	}

	return (
		<TabCard
			title={
				<Tabs
					defaultActiveKey="1"
					onChange={handleTab}
					className={styles.tab_style}
				>
					<TabPane tab={`${formatMessage({ id: 'user.tab.user' })} ${num || 0}`} key="1" />
					<TabPane tab={`${formatMessage({ id: 'user.tab.role' })} ${roleTotal || 0}`} key="2" />
				</Tabs>
			}
		>
			{
				index === '1' ?
					!!select.length && !!rolelist.length && <UserManagementTable
						onRef={all}
						select={select}
						rolelist={rolelist}
						callbackTotal={setNum}
					/> :
					<RoleManagementTable />
			}
		</TabCard>
	);
};

export default UserManagement;
