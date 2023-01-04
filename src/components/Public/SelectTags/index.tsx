import React, { useState, useEffect } from 'react';
import { Space, Button, Select, Divider, Spin, Tag, message } from 'antd';
import { isNaN } from 'lodash'
import { member } from './service';
import styles from './style.less';
import { useIntl, FormattedMessage  } from 'umi'

const filterRadio: React.FC<any> = ({ ws_id, confirm, onConfirm, autoFocus,run_mode}) => {
	const { formatMessage } = useIntl()
	const [tagsPagination, setTagsPagination] =  useState({ total: 0, page_num: 1, page_size: 10 });
	const [isEnd,setIsEnd] = useState(false)
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
		requestData({ name: param, page_num: 1, page_size: 10, ws_id }, 'reset')
	}
  const handlePopupScroll = (e: any) => {
    const { page_num, page_size, total, } = tagsPagination
    const { clientHeight, scrollHeight, scrollTop} = e.target
    if ( clientHeight + scrollTop + 1 >= scrollHeight && !isNaN(page_num) && Math.ceil(total/page_size) > page_num && !isEnd) {
      requestData({ name: keyword, page_num: page_num + 1, page_size, ws_id }, 'concat')
    }
  }
	const requestData = async (query: any, option="concat") => {
		setFetching(true)
		try {
			let res = await member(query)
			if (res.code === 200) {
				// 分页数据合并。
				if (option === 'concat') {
					const data = tags.concat(res.data || [])
					setTags(data || [])
					setTagsPagination(res);
					if(data.length === res.total) setIsEnd(true)
				} else if (option === 'reset') {
					// 新的数据。
					setTags(res.data || [])
					setTagsPagination(res);
				}
			} else {
				message.error(res.msg || formatMessage({id: 'request.failed'})  );
			}
			setFetching(false)
		} catch (err) {
			setFetching(false)
		}
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
						confirm?.()
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
				onPopupScroll={fetching? ()=> {}: handlePopupScroll} // 防抖
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
						setIsEnd(false)
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

export default filterRadio;
