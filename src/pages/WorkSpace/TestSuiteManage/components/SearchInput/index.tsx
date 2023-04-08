import React, { useState, useRef, useEffect } from 'react';
import { Space, Button, Input, Divider } from 'antd';
import { useIntl, FormattedMessage } from 'umi'

import styles from './index.less'

const FilterRadio: React.FC<any> = ({ confirm, onConfirm, autoFocus }) => {
	const { formatMessage } = useIntl()
	const [val, setVal] = useState<any>()
	const input: any = useRef(null);
	useEffect(() => {
		input.current.focus()
	}, [autoFocus]);
	const { Search } = Input;
	return (
		<div className={ styles.filter_input_wrapper }>
			<div>
				<Search
					ref={input}
					placeholder={formatMessage({id: 'please.enter'}) }
					value={val}
					onChange={(e: any) => setVal(e.target.value)}
					onSearch={(val: any) => onConfirm(val)}
					onPressEnter={() => {
						confirm?.()
						onConfirm(val)
					}}
					size="middle"
					style={{ width: 150 }}
				/>
			</div>
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
						setVal("")
						onConfirm("")
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


