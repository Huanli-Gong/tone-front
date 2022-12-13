import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Badge } from 'antd';
import { FormattedMessage } from 'umi'

const filterRadio: React.FC<any> = ({ confirm, onConfirm, stateVal, tabType, dataArr }) => {
	const [optionData, setOptionData] = useState<string[]>([])
	const [val, setVal] = useState<string | undefined>(stateVal)

	const { Option } = Select;
	useEffect(() => {
		setOptionData(dataArr)
	}, [])
	useEffect(() => {
		setVal('')
	}, [tabType])
	const handleSearch = (value: string) => {
		const data = dataArr.filter((item: any) => {
			return item.toLowerCase().includes(value)
		})
		setOptionData(data)
	}
	const handleSelectChange = (value: string) => {
		setVal(value)
		setOptionData(dataArr)
	}

	const StateBadge = (state: string) => {
		switch (state) {
			case 'Available': return <Badge status="success" text="Available" />
			case 'Alive': return <Badge status="success" text="Alive" />
			case 'Occupied': return <Badge status="processing" text="Occupied" />
			case 'Reserved': return <Badge status="default" text="Reserved" />
			case 'Broken': return <Badge status="error" text="Broken" />
			case 'Online': return <Badge status="success" text="Online" />
			case 'Offline': return <Badge status="error" text="Offline" />
			default: return <></>
		}
	}

	return (
		<div style={{ padding: 8 }}>
			<div>
				<Select
					allowClear
					style={{ width: '100%' }}
					placeholder={<FormattedMessage id="ws.dashboard.please.select.state" />}
					showSearch
					onSearch={handleSearch}
					onChange={handleSelectChange}
					value={val}
				>
					{
						optionData.map((item: string) => <Option key={item} value={item}>
							{StateBadge(item)}
						</Option>)

					}
				</Select>
			</div>
			<Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
			<Space>
				<Button
					onClick={() => {
						confirm()
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
						confirm()
						setVal(undefined)
						onConfirm(undefined)
						setOptionData(dataArr)
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


