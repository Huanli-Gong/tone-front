import React, { useState, useRef, useEffect } from 'react';
import { Tabs, Input, Space, Select } from 'antd';
import UserManagementTable from './components/UserManagementTable';
import RoleManagementTable from './components/RoleManagementTable';
import { roleList } from './service';
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { TabCard } from '@/components/UpgradeUI';

const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

const UserManagement: React.FC<{}> = () => {

	const [select, setSelect] = useState<any[]>([]);
	const [rolelist, setRolelist] = useState<any[]>([]);
	const [num, setNum] = useState<number>(0);
	const [roleTotal,setRoleTotal] = useState<number>(0);
	const [role, setRole] = useState<number>()
	const [keyword, setKeyword] = useState<string>()

	const getRoleSysList = async () => {
		const { data } = await roleList({ role_type: 'system', is_filter: '1' }) // is_filter: '1':根据用户角色过滤
		data && setSelect(data.list)
		data && setNum(data.num)
		// all.current && all.current.search()
	};
	const getRoleList = async () => {
        const { total } = await roleList({ role_type: '' })
		total && setRoleTotal(total)
    };
	const getRoleFilterSysList = async () => {
		const { data } = await roleList({ role_type: 'system', is_filter: '0' }) // is_filter: '1':不过滤，获取全量
		let all = [{ id: '', name: "all", title: "all" }]
		data && setRolelist(all.concat(data.list))
	};
	useEffect(() => {
		getRoleList()
		getRoleSysList()
		getRoleFilterSysList()
	}, []);


	const all = useRef<any>(null)
	const [index, setIndex] = useState<string>('1');

	const handleTab = (key: string) => {
		setIndex(key)
		switch (key) {
			case '1':
				all.current && all.current.handleTab()
				break;

			default:
				break;
		}
	}
	
	const onSearch = (val: string) => {
		setKeyword(val)
		switch (index) {
			case '1':
				all.current && all.current.search(val)
				break;
			default:
				break;
		}
	}

	const handleChange = (val: number) => {
		setRole(val)
		switch (index) {
			case '1':
				all.current && all.current.select(val)
				break;
			default:
				break;
		}
	}

	<Space>
		<Select
			style={{ width: 180 }}
			placeholder="请选择角色"
			allowClear
			defaultValue={role}
			onChange={(val: number) => {
				handleChange(val)
			}}
		//onFocus={handleSelectFocus}
		>
			{select.map((item: any) => {
				return <Option key={item.id} value={item.id} >{item.name}</Option>
			})}
		</Select>
		<Search
			placeholder="搜索用户"
			allowClear
			defaultValue={keyword}
			onSearch={onSearch}
			style={{ width: 200 }}
		/>
	</Space>
	return (
		<TabCard
			title={
				<Tabs
					defaultActiveKey="1"
					onChange={handleTab}
					className={styles.tab_style}
				>
					<TabPane tab={"用户 " + num} key="1" />
					<TabPane tab={"角色 " + roleTotal} key="2" />
				</Tabs>
			}
		>
			{
				index === '1' ?
					<UserManagementTable
						onRef={all}
						select={select}
						rolelist={rolelist}
						onSearch={onSearch}
						RoleChange={handleChange}
					/> :
					<RoleManagementTable />
			}
		</TabCard>
	);
};

export default UserManagement;
