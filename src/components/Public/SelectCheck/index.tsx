/* eslint-disable @typescript-eslint/no-unused-expressions */
import React, { useState } from 'react';
import { Checkbox, Button, Divider, Space } from 'antd';
import { FormattedMessage } from 'umi'
import styles from './style.less';

const FilterRadio: React.FC<any> = ({ list, confirm, onConfirm }) => {

	const [val, setVal] = useState<number[]>([])
	const [all, setAll] = useState<boolean>(false)
	const [init, setInit] = useState<boolean>(false)
	const handleDomainRadio = ($val: any) => {
		setInit(!!$val.length && $val.length < list.length)
		setVal($val)
		setAll($val.length === list.length)
	}
	const box = list.map((item: any) => (item.id))
	const onCheckAllChange = (e: any) => {
		setVal(e.target.checked ? box : []),
			setAll(e.target.checked)
		setInit(false)
	}
	return (
		<div className={styles.filter}>
			<div style={{ display: 'flex', flexDirection: 'column', maxHeight: 280, overflow: "auto", gap: 4 }}>
				<Checkbox
					indeterminate={init}
					className={styles.domain}
					onChange={onCheckAllChange}
					checked={all}
				>
					<FormattedMessage id="operation.select.all" />
				</Checkbox>
				<Checkbox.Group onChange={handleDomainRadio} value={val}>
					<Space direction="vertical" size={4}>
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
						confirm?.()
						const params = val && val.join(',')
						onConfirm(params)
					}}
				>
					<FormattedMessage id="operation.ok" />
				</Button>
				<Button
					size="small"
					type="text"
					style={{ border: 'none' }}
					onClick={() => {
						confirm?.()
						setVal([])
						onConfirm(undefined)
						setAll(false)
						setInit(false)
					}}
				>
					<FormattedMessage id="operation.reset" />
				</Button>
			</div>
		</div>
	);
};

export default FilterRadio;


