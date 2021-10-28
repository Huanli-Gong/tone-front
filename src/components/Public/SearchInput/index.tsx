import React,{ useState, useRef, useEffect } from 'react';
import {Space, Button, Input,Divider} from 'antd';

const filterRadio: React.FC<any> = ({confirm,onConfirm,autoFocus,placeholder, styleObj, currentData}) => {
	const [val,setVal] = useState<any>()
	const input:any = useRef(null);
	useEffect(() => {
		input.current.focus()
	}, [autoFocus]);
	const defData = Object.prototype.toString.call(currentData) === '[object Object]' ? Object.values(currentData) : []
	useEffect(() => {
		if(!currentData) return;
		setVal('')
	}, defData);
	const { Search } = Input;
	return (
		<div style={{ padding: 8 }}>
		<div>
        <Search
		  ref={input}
          placeholder={placeholder || `请输入`}
		  value={val}
		  onChange={(e:any) => setVal(e.target.value)}
		  onSearch={(val:any) => {
			confirm()
			onConfirm(val)}
		  }
          onPressEnter={() => {
			  confirm()
			  onConfirm(val)
		  }}
		  size="middle"
		  style={{width:(styleObj && styleObj.container) || 150}}
        />
		</div>
		<Divider style={{marginTop:'10px',marginBottom:'4px'}} />
        <Space>
			<Button
				onClick={() => {
					confirm()
					onConfirm(val)
				}}
				type="link"
				size="small"
				style={{ width: (styleObj && styleObj.button_width) || 75 }}
			>
				搜索
			</Button>
			<Button 
				type="text"
				onClick={() => {
					confirm()
					setVal(undefined)
					onConfirm(undefined)
				}} 
				size="small" 
				style={{ width: (styleObj && styleObj.button_width) || 75,border:'none' }}
			>
				重置
			</Button>
        </Space>
      </div>
	);
};

export default filterRadio;


