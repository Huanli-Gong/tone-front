import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Input, Button, Space } from 'antd';
import { history } from 'umi'
import WorkspaceTable from './components/WorkspaceTable';
import { quantity } from './service';
import { Count } from './data';
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { TabCard } from '@/components/UpgradeUI';

const { TabPane } = Tabs;
const { Search } = Input;

const WorkspaceManagement: React.FC<{}> = () => {
	const [index, setIndex] = useState<string>('1');
	const all = useRef<any>(null)
	const overt = useRef<any>(null)
	const secret = useRef<any>(null)
	const [num, setNum] = useState<Count>({
		total_count: 0,
		public_count: 0,
		un_public_count: 0
	})

	const getNum = async () => {
		const data = await quantity()
		data && setNum(data.data)
	};

	useEffect(() => {
		getNum()
	}, []);

	const handleTab = (key: string) => {
		setIndex(key)
		switch (key) {
			case '1':
				all.current && all.current.handleTab()
				break;
			case '2':
				overt.current && overt.current.handleTab()
				break;
			case '3':
				secret.current && secret.current.handleTab()
				break;
			default:
				break;
		}
		getNum()
	}

	const onSearch = (val: string) => {
		switch (index) {
			case '1':
				all.current.search(val)
				break;
			case '2':
				overt.current.search(val)
				break;
			case '3':
				secret.current.search(val)
				break;
			default:
				break;
		}
	}

	const operations = <Space>
		<Search
			placeholder="搜索workspace"
			onSearch={onSearch}
			style={{ width: 200 }}
		/>
		<Button type="primary" onClick={() => history.push('/workspace/create')} >新建Workspace</Button>
	</Space>

	return (
		<TabCard
			title={
				<Tabs
					defaultActiveKey=""
					onChange={handleTab}
					className={styles.tab_style}
				>
					<TabPane tab={"全部 " + num.total_count} key="1" />
					<TabPane tab={"公开 " + num.public_count} key="2" />
					<TabPane tab={"私密 " + num.un_public_count} key="3" />
				</Tabs>
			}
			extra={ operations }
		>
			{ index === '1' && <WorkspaceTable onRef={all} />}
			{ index === '2' && <WorkspaceTable onRef={overt} is_public={1} />}
			{ index === '3' && <WorkspaceTable onRef={secret} is_public={0} />}
		</TabCard>
	);
};

export default WorkspaceManagement;
