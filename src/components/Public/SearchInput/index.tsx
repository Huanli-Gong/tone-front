/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { Space, Button, Input, Divider } from 'antd';
import { useIntl, FormattedMessage } from 'umi'

const FilterRadio: React.FC<any> = (props) => {
	const { confirm, onConfirm, autoFocus = true, placeholder, styleObj, currentData, value } = props
	const { formatMessage } = useIntl()
	const [val, setVal] = useState<any>(value || undefined)
	const input: any = useRef(null);
	useEffect(() => {
		autoFocus && input.current.focus()
	}, [autoFocus]);
	const defData = Object.prototype.toString.call(currentData) === '[object Object]' ? Object.values(currentData) : []
	useEffect(() => {
		if (!currentData) return;
		setVal('')
	}, defData);
	const { Search } = Input;

	useEffect(() => {
		setVal(value)
	}, [value])

	return (
		<div style={{ padding: 8 }}>
			<div>
				<Search
					ref={input}
					placeholder={placeholder || formatMessage({ id: 'please.enter' })}
					value={val}
					onChange={(e: any) => setVal(e.target.value)}
					onSearch={($val: any) => {
						confirm?.()
						onConfirm($val?.trim())
					}}
					onPressEnter={() => {
						confirm?.()
						onConfirm(val?.trim())
					}}
					size="middle"
					style={{ width: (styleObj && styleObj.container) || 150 }}
				/>
			</div>
			<Divider style={{ marginTop: '10px', marginBottom: '4px' }} />
			<Space>
				<Button
					onClick={() => {
						confirm?.()
						onConfirm(val?.trim())
					}}
					type="link"
					size="small"
					style={{ width: (styleObj && styleObj.button_width) || 75 }}
				>
					<FormattedMessage id="operation.search" />
				</Button>
				<Button
					type="text"
					onClick={() => {
						confirm?.()
						setVal('')
						onConfirm('')
					}}
					size="small"
					style={{ width: (styleObj && styleObj.button_width) || 75, border: 'none' }}
				>
					<FormattedMessage id="operation.reset" />
				</Button>
			</Space>
		</div>
	);
};

export default FilterRadio;


