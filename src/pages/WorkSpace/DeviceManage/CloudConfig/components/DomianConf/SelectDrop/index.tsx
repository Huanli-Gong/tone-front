import React,{ useState, useEffect } from 'react';
import {Space, Button, Select, Divider, Spin} from 'antd';
import { member,queryCloudAk } from '../../../service';
import _ from 'lodash'
import styles from './index.less'

const filterRadio: React.FC<any> = ({confirm,onConfirm,name,ws_id}) => {
	const [user, setUser ] = useState<any>([])
	const [keyword,setKeyword] = useState<string>()
	const [val,setVal] = useState<any>()
	const [fetching , setFetching ] = useState<boolean>(true)
	const { Option } = Select;

	useEffect(() => {
		handleSearch()
	}, []);

	const handleSearch = async (word?: string) => {
		const param = word && word.replace(/\s*/g,"")
		if (keyword && keyword==param) return 
		setKeyword(param)
		setFetching(true)
		let optionData:any[] = []

		if(name === 'creator' || name === 'creator_name' || name === 'update_user'){
			let { data } = await member( { keyword:param,page_size:50,page_num:1 } )
			if(_.isArray(data)) {
				optionData = data.map(item=>({id:item.id,name:item.last_name}))
			}
		}
		if(name === 'ak_name'){
			let { data } = await queryCloudAk(
				{ 
				page_num: 1,
				page_size: 1000,
				name: param,
				ws_id 
				})
			if(_.isArray(data)) {
				optionData = data.map(item=>({id:item.id,name:item.name}))
			}
		}
		
		setUser(optionData||[])
		setFetching(false)
	}
	const isMultiple = () =>{
		if(name === 'ak_name' || name === 'creator' || name === 'creator_name' || name === 'update_user') return 'multiple'
		return '-'
	}
	const placeholder = () => {
	
		if (name === 'creator' || name === 'creator_name') {
			return '请选择创建者'
		}
		if (name === 'update_user') {
			return '请选择修改者'
		}
		if (name === 'ak_name') {
			return '请选择akName'
		}
	}
	return (
		<div className={ styles.filter_search_wrapper }>
			<div>
				<Select
					allowClear
					onDropdownVisibleChange={() => handleSearch()}
					notFoundContent={fetching ? <Spin size="small" /> : null}
					filterOption={false}
					showSearch
					onSearch={handleSearch}
					style={{ width: '100%' }}
					onChange={(value:any) => setVal(value)}
					showArrow={false}
					autoFocus={true}
					mode={isMultiple()}
					value={val}
					placeholder={placeholder()}
				>
					{
						user.map(( item: any ) => (
							<Option value={item.id} key={item.id}>{item.name}</Option>
						))
					}
				</Select>
			</div>
			<Divider style={{marginTop:'10px',marginBottom:'4px'}} />
			<Space>
				<Button
					onClick={() => {
						confirm && confirm()
						onConfirm( val )
						// val.length > 0 && onConfirm( val.toString() )
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
						confirm && confirm()
						setVal(undefined)
						onConfirm(undefined)
						handleSearch()
					}} 
					size="small" 
					style={{ width: 75 }}
				>
					重置
				</Button>
			</Space>
		</div>
	);
};

export default filterRadio;


