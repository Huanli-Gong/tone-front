import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin, Tag } from 'antd';
import { member } from './service';
import styles from './style.less';

const filterRadio: React.FC<any> = ({ confirm, onConfirm, autoFocus,run_mode}) => {
	const [tags, setTags] = useState<any>([])
	const [keyword, setKeyword] = useState<string>()
	const [val, setVal] = useState<any>([])
	const [fetching, setFetching] = useState<boolean>(true)
	const { Option } = Select;
	const [focus,setFous] = useState<boolean>(false)
	useEffect(() => {
		handleSearch()
	}, []);
	const handleSearch = async (word?: string) => {
		const param = word && word.replace(/\s*/g, "")
		if (keyword && keyword == param) return
		setKeyword(param)
		setFetching(true)
		let { data } = await member({ name: param, page_size: 10, page_num: 1 }) //, run_environment: 'aliyun', run_mode:run_mode
		setTags(data || [])
		setFetching(false)
	}
	const tagRender = (props: any) => {
		const { label, closable, onClose } = props;
		return (
			<Tag color={label.props.color} closable={closable} onClose={onClose} style={{ marginRight: 3 }}>
				{label.props.children}
			</Tag>
		)
	}
	return (
		<div style={{ padding: 8, width: 200 }}>
			<div className={styles.cover}
				onClick={() => {
					if(!focus){
						confirm()
					}
				}}
			>
			</div>
			<Select
				mode="multiple"
				allowClear
				notFoundContent={fetching ? <Spin size="small" /> : null}
				filterOption={false}
				showSearch
				onSearch={handleSearch}
				style={{ width: '100%' }}
				onChange={(value: any) => setVal(value)}
				showArrow={false}
				autoFocus={true}
				onFocus={()=>{setFous(true)}}
				onBlur={()=>{
					setTimeout(function(){
						setFous(false)
					},200)
				}}
				value={val}
				tagRender={tagRender}
			>
				{
					tags.map((item: any) => {
						return <Option key={item.id} value={item.id}>
							<Tag color={item.tag_color} >{item.name}</Tag>
						</Option>
					})
				}
			</Select>
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
					搜索
			</Button>
				<Button
					type="text"
					onClick={() => {
						confirm()
						setVal(undefined)
						onConfirm(undefined)
						handleSearch()
					}}
					size="small"
					style={{ width: 75, border: 'none' }}
				>
					重置
			</Button>
			</Space>
		</div>
	);
};

export default filterRadio;


