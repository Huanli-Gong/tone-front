import React, { useState, useEffect, useRef } from 'react';
import { Tabs } from 'antd';
import JoinTable from './components/JoinTable';
import { quantity } from './service';
import type { Count } from './data';
import { FormattedMessage } from 'umi';
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { TabCard } from '@/components/UpgradeUI';

const { TabPane } = Tabs;

const UserManagement: React.FC<{}> = () => {
	const approve = useRef<any>(null)
	const record = useRef<any>(null)
	const [num, setNum] = useState<Count>({
		backlog_count: 0,
		finished_count: 0
	})

	const [tab, setTab] = useState('1')
	const getNum = async () => {
		const data = await quantity()
		if (data.code === 200) {
			setNum(data.data)
		}
	};

	useEffect(() => {
		getNum()
	}, []);

	const handleTab = (key: string) => {
		switch (key) {
			case '1':
				approve.current?.handleTab()
				break;
			case '2':
				record.current?.handleTab()
				break;
			default:
				break;
		}
		setTab(key)
		getNum()
	}

	return (
		<TabCard
			title={
				<Tabs
					defaultActiveKey="1"
					onChange={handleTab}
					className={styles.tab_style}
				>
					<TabPane
						tab={
							<span>
								{<FormattedMessage id="sys.approve.tab.pending" />} {num.backlog_count}
							</span>
						}
						key="1"
					/>
					<TabPane
						tab={
							<span>
								{<FormattedMessage id="sys.approve.tab.record" />} {num.finished_count}
							</span>
						}
						key="2"
					/>
				</Tabs>
			}
		>
			{
				tab === '1' ?
					<JoinTable onRef={approve} status={0} getNum={getNum} /> :
					<JoinTable onRef={record} status={1} />
			}
		</TabCard>
	);
};

export default UserManagement;
