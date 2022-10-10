import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin } from 'antd';
import { useIntl, FormattedMessage } from 'umi'
import { member } from '../../service';

import styles from './index.less'

const filterRadio: React.FC<any> = ({ confirm, onConfirm }) => {
	const [user, setUser] = useState<any>([])
	const [keyword, setKeyword] = useState<string>()
	const [val, setVal] = useState<any>()
	const [fetching, setFetching] = useState<boolean>(true)
	const { Option } = Select;

	useEffect(() => {
		handleSearch()
	}, []);

	const handleSearch = async (word?: string) => {
		const param = word && word.replace(/\s*/g, "")
		if (keyword && keyword == param) return
		setKeyword(param)
		setFetching(true)
		let { data } = await member({ keyword: param, page_size: 50, page_num: 1 })
		setUser(data || [])
		setFetching(false)
	}

	return (
		<div className={styles.filter_search_wrapper}>
			<div>
				<Select
					allowClear
					onDropdownVisibleChange={() => handleSearch()}
					notFoundContent={fetching ? <Spin size="small" /> : null}
					filterOption={false}
					showSearch
					onSearch={handleSearch}
					style={{ width: '100%' }}
					onChange={(value: number) => setVal(value)}
					showArrow={false}
					autoFocus={true}
					mode="multiple"
					value={val}
				>
					{
						user.map((item: any) => (
							<Option value={item.id} key={item.id}>{item.last_name}</Option>
						))
					}
				</Select>
			</div>
			<Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
			<Space>
				<Button
					onClick={() => {
						confirm && confirm()
						if (val && val.length > 0) {
							onConfirm(val.toString())
						}
					}}
					type="link"
					size="small"
					style={{ width: 75 }}
				>
					<FormattedMessage id="operation.search" />
				</Button>
				<Button
					type="text"
					onClick={() => {
						confirm && confirm()
						setVal(undefined)
						onConfirm(undefined)
						handleSearch()
					}}
					size="small"
					style={{ width: 75 }}
				>
					<FormattedMessage id="operation.reset" />
				</Button>
			</Space>
		</div>
	);
};

export default filterRadio;


