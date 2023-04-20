/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin } from 'antd';
import { FormattedMessage } from 'umi'
import { queryProductList } from './service';
import styles from './style.less';

const FilterRadio: React.FC<any> = ({ confirm, onConfirm, page_size, ws_id }) => {
	const [project, setProject] = useState<any>([])
	const [val, setVal] = useState<any>()
	const [fetching, setFetching] = useState<boolean>(true)
	const [focus, setFous] = useState<boolean>(false)
	const { Option } = Select;

	const handleSearch = async () => {
		setFetching(true)
		const { data } = await queryProductList({ page_size: page_size || 10, page_num: 1, ws_id })
		let dataCopy = Array.isArray(data) ? data : []
		dataCopy = dataCopy.filter($val => $val)
		setProject(dataCopy)
		setFetching(false)
	}

	useEffect(() => {
		handleSearch()
	}, []);

	return (
		<div style={{ padding: 8 }}>
			<div className={styles.cover}
				onClick={() => {
					if (!focus) {
						confirm?.()
					}
				}}
			/>
			<Select
				showSearch
				allowClear
				notFoundContent={fetching ? <Spin size="small" /> : null}
				style={{ width: '100%' }}
				onChange={(value: number) => setVal(value)}
				placeholder={<FormattedMessage id="report.select.productVersion" />}
				optionFilterProp="children"
				showArrow={false}
				autoFocus={true}
				value={val}
				onFocus={() => { setFous(true) }}
				onBlur={() => {
					setTimeout(function () {
						setFous(false)
					}, 200)
				}}
				filterOption={
					(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
				}
			>
				{
					project.map((item: any) => {
						return <Option value={item} key={item}>{item}</Option>
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


