/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin } from 'antd';
import { useIntl, FormattedMessage } from 'umi'
import { queryCloudAk } from '../../../service';
import { queryMember } from '@/services/Workspace';
import _ from 'lodash'
import styles from './index.less'

const FilterRadio: React.FC<any> = ({ confirm, onConfirm, name, ws_id }) => {
	const { formatMessage } = useIntl()
	const [user, setUser] = useState<any>([])
	const [keyword, setKeyword] = useState<string>()
	const [val, setVal] = useState<any>()
	const [fetching, setFetching] = useState<boolean>(true)
	const { Option } = Select;

	const handleSearch = async (word?: string) => {
		const param = word && word.replace(/\s*/g, "")
		if (keyword && keyword == param) return
		setKeyword(param)
		setFetching(true)
		let optionData: any[] = []

		if (name === 'creator' || name === 'creator_name' || name === 'update_user') {
			const { data } = await queryMember({ keyword: param, page_size: 50, page_num: 1 })
			if (_.isArray(data)) {
				optionData = data.map(item => ({ id: item.id, name: item.last_name }))
			}
		}
		if (name === 'ak_name') {
			const { data } = await queryCloudAk(
				{
					page_num: 1,
					page_size: 1000,
					name: param,
					ws_id
				})
			if (_.isArray(data)) {
				optionData = data.map(item => ({ id: item.id, name: item.name }))
			}
		}

		setUser(optionData || [])
		setFetching(false)
	}

	useEffect(() => {
		handleSearch()
	}, []);

	const isMultiple = () => {
		if (name === 'ak_name' || name === 'creator' || name === 'creator_name' || name === 'update_user') return 'multiple'
		return undefined
	}
	const placeholder = () => {
		if (name === 'creator' || name === 'creator_name') {
			return formatMessage({ id: 'device.please.select.creator' })
		}
		if (name === 'update_user') {
			return formatMessage({ id: 'device.please.select.update_user' })
		}
		if (name === 'ak_name') {
			return formatMessage({ id: 'device.please.select.ak_name' })
		}
		return ""
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
					onChange={(value: any) => setVal(value)}
					showArrow={false}
					autoFocus={true}
					mode={isMultiple()}
					value={val}
					placeholder={placeholder()}
				>
					{
						user.map((item: any) => (
							<Option value={item.id} key={item.id}>{item.name}</Option>
						))
					}
				</Select>
			</div>
			<Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
			<Space>
				<Button
					onClick={() => {
						confirm?.()
						onConfirm(val)
						// val.length > 0 && onConfirm( val.toString() )
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


