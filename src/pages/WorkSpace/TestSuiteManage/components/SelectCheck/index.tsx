import React, { useState } from 'react';
import { Checkbox, Button, Divider, Space } from 'antd';
import styles from './index.less';

const filterRadio: React.FC<any> = ({ list, confirm, onConfirm }) => {
	const [val, setVal] = useState<number[]>([])
	const [all, setAll] = useState<boolean>(false)
	const [init, setInit] = useState<boolean>(false)
	const handleDomainRadio = (val: any) => {
		setInit(!!val.length && val.length < list.length)
		setVal(val)
		setAll(val.length === list.length)
	}
	const box = list.map((item: any) => (item.id))
	const onCheckAllChange = (e: any) => {
		setVal(e.target.checked ? box : []),
			setAll(e.target.checked)
		setInit(false)
	}

	return (
		<div className={styles.filter}>
			<div style={{ display: 'flex', flexDirection: 'column', maxHeight: 280, overflow: "auto" }}>
				<Checkbox
					indeterminate={init}
					className={styles.domain}
					onChange={onCheckAllChange}
					checked={all}
				>
					全选
				</Checkbox>
				<Checkbox.Group onChange={handleDomainRadio} value={val}>
					<Space direction="vertical" size={0}>
						{
							list.map((item: any) => {
								return <Checkbox className={styles.domain} value={item.id} key={item.id}>{item.name}</Checkbox>
							})
						}
					</Space>
				</Checkbox.Group>
			</div>
			<Divider style={{ margin: '10px 0' }} />
			<div className={styles.confirm}>
				<Button
					size="small"
					type="link"
					onClick={() => {
						confirm && confirm()
						const params = val && val.join(',')
						onConfirm(params)
					}}
				>
					确定
				</Button>
				<Button
					size="small"
					type="text"
					onClick={() => {
						confirm && confirm()
						setVal([])
						onConfirm(undefined)
						setAll(false)
						setInit(false)
					}}
				>
					重置
				</Button>
			</div>
		</div>
	);
};

export default filterRadio;


