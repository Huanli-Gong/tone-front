import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin } from 'antd';
import { FormattedMessage, useIntl } from 'umi'
import { member } from './service';

const filterRadio: React.FC<any> = ({ confirm, onConfirm, autoFocus, pageSize = 50, initVal }) => {
	const [user, setUser] = useState<any>([])
	const [keyword, setKeyword] = useState<string>()
	const [val, setVal] = useState<number | undefined>(initVal?.name)
	const [userName, setUserName] = useState<string | undefined>(initVal?.name)
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
		let { data } = await member({ keyword: param, page_size: pageSize })
		setUser(data || [])
		// if(initVal && val !== initVal?.id) setVal(initVal)
		setFetching(false)
	}

	return (
		<div style={{ padding: 8 }}>
			<div>
				<Select
					allowClear
					defaultOpen
					onClear={handleSearch}
					notFoundContent={fetching ? <Spin size="small" /> : null}
					filterOption={false}
					showSearch
					onSearch={handleSearch}
					style={{ width: '100%' }}
					onChange={(value: number, option: any) => {
						setUserName(option?.children)
						setVal(value)
					}}
					showArrow={false}
					autoFocus={true}
					value={val}
				>
					{
						user.map((item: any) => {
							return <Option value={item.id} key={item.id}>{item.last_name}</Option>
						})
					}
				</Select>
			</div>
			<Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
			<Space>
				<Button
					onClick={() => {
						let userId = val
						if (val && isNaN(Number(val))) userId = initVal?.id
						confirm()
						onConfirm(userId, userName)
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
						confirm()
						setVal(undefined)
						setUserName(undefined)
						onConfirm(undefined, undefined)
						handleSearch()
					}}
					size="small"
					style={{ width: 75, border: 'none' }}
				>
					<FormattedMessage id="operation.reset" />
				</Button>
			</Space>
		</div>
	);
};

export default filterRadio;


