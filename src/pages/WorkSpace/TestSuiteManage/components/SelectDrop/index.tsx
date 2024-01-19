/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin } from 'antd';
import { FormattedMessage } from 'umi'

import styles from './index.less'
import { queryMember } from '@/services/Workspace';

const FilterRadio: React.FC<any> = ({ confirm, onConfirm }) => {
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
		const { data } = await queryMember({ keyword: param, page_size: 50, page_num: 1 })
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
						confirm?.()
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
						confirm?.()
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

export default FilterRadio;


