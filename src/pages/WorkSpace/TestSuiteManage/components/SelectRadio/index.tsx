import React, { useState } from 'react';
import { Radio, Button, Divider } from 'antd';
import styles from '../../style.less';

const filterRadio: React.FC<any> = ({ list, confirm, onConfirm }) => {
	const [val, setVal] = useState<number>()
	const handleDomainRadio = (e: any) => {
		setVal(e.target.value)
	}
	return (
		<div className={styles.filter}>
			<div>
				<Radio.Group onChange={handleDomainRadio} value={val} >
					{
						list.map((item: any) => (
							<Radio
								className={styles.domain}
								value={item.id}
								key={item.id}
							>
								{item.name}
							</Radio>
						))
					}
				</Radio.Group>
			</div>
			<Divider style={{ margin: '10px 0' }} />
			<div className={styles.confirm}>
				<Button
					size="small"
					type="link"
					onClick={() => {
						confirm()
						setVal(undefined)
						onConfirm(undefined)
					}}
				>
					重置
				</Button>
				<Button
					size="small"
					type="primary"
					onClick={() => {
						confirm()
						onConfirm(val)
					}}
				>
					确定
				</Button>
			</div>
		</div>
	);
};

export default filterRadio;


