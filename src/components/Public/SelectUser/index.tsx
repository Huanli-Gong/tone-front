import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin } from 'antd';
import { FormattedMessage, useParams } from 'umi'
import { member } from './service';
import styles from './style.less';

const FilterRadio: React.FC<any> = ({ confirm, onConfirm, autoFocus, page_size, mode = 'multiple' }) => {
	const { ws_id } = useParams() as any
	const [user, setUser] = useState<any>([])
	const [keyword, setKeyword] = useState<string>()
	const [val, setVal] = useState<any>()
	const [fetching, setFetching] = useState<boolean>(true)
	const [focus, setFous] = useState<boolean>(false)
	const { Option } = Select;
	useEffect(() => {
		handleSearch()
	}, []);
	const handleSearch = async (word?: string) => {
		const param = word && word.replace(/\s*/g, "")
		if (keyword && keyword == param) return
		setKeyword(param)
		setFetching(true)
		let { data } = await member({ ws_id, keyword: param, page_size: page_size || 10, page_num: 1 })
		setUser(Array.isArray(data) ? data : [])
		setFetching(false)
	}
	const handleCancleSel = () => {
		handleSearch()
	}
	return (
		<div style={{ padding: 8 }}>
			<div className={styles.cover}
				onClick={() => {
					if (!focus) {
						confirm?.()
					}
				}}
			>
			</div>
			<Select
				mode={mode}
				allowClear
				notFoundContent={fetching ? <Spin size="small" /> : 'Not Found'}
				filterOption={false}
				showSearch
				onSearch={handleSearch}
				style={{ width: '100%' }}
				onChange={(value: number) => setVal(value)}
				onDeselect={handleCancleSel}
				onClear={handleCancleSel}
				showArrow={false}
				autoFocus={true}
				value={val}
				onFocus={() => { setFous(true) }}
				onBlur={() => {
					setTimeout(function () {
						setFous(false)
					}, 200)
				}}
			>
				{
					user.map((item: any) => {
						return <Option value={item.id} key={item.id}>{item.last_name}</Option>
					})
				}
			</Select>
			<Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
			<Space>
				<Button
					onClick={() => {
						confirm?.()
						onConfirm(val)
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
					style={{ width: 75, border: 'none' }}
				>
					<FormattedMessage id="operation.reset" />
				</Button>
			</Space>
		</div>
	);
};

export default FilterRadio;


