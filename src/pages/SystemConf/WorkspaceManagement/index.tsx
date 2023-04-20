/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useEffect, useState, useRef } from 'react';
import { Tabs, Input, Button, Space } from 'antd';
import { history, useIntl, FormattedMessage } from 'umi'
import WorkspaceTable from './components/WorkspaceTable';
import { quantity } from './service';
import type { Count } from './data';
import styles from '@/pages/SystemConf/MenuLayout/style.less'
import { TabCard } from '@/components/UpgradeUI';

const { TabPane } = Tabs;
const { Search } = Input;

const WorkspaceManagement: React.FC = () => {
	const { formatMessage } = useIntl()
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

	const getForwardEle = (key: string) => new Map([
		['1', all.current],
		['2', overt.current],
		['3', secret.current],
	]).get(key)

	const handleTab = (key: string) => {
		setIndex(key)
		getForwardEle(key)?.handleTab()
		getNum()
	}

	const onSearch = (val: string) => getForwardEle(index)?.search(val)

	const operations = <Space>
		<Search
			placeholder={formatMessage({ id: 'workspace.ws.search' })}
			onSearch={onSearch}
			style={{ width: 200 }}
		/>
		<Button type="primary" onClick={() => history.push('/workspace/create')}>
			<FormattedMessage id="workspace.ws.new" />
		</Button>
	</Space>

	return (
		<TabCard
			title={
				<Tabs
					defaultActiveKey=""
					onChange={handleTab}
					className={styles.tab_style}
				>
					<TabPane tab={`${formatMessage({ id: 'workspace.all' })} ${num.total_count}`} key="1" />
					<TabPane tab={`${formatMessage({ id: 'workspace.public' })} ${num.public_count}`} key="2" />
					<TabPane tab={`${formatMessage({ id: 'workspace.private' })} ${num.un_public_count}`} key="3" />
				</Tabs>
			}
			extra={operations}
		>
			{index === '1' && <WorkspaceTable tab={index} onRef={all} top />}
			{index === '2' && <WorkspaceTable tab={index} onRef={overt} is_public={1} />}
			{index === '3' && <WorkspaceTable tab={index} onRef={secret} is_public={0} />}
		</TabCard>
	);
};

export default WorkspaceManagement;
