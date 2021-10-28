import React, { useState } from 'react';
import { Radio, Button, Divider } from 'antd';
import styles from './style.less';
import { handleRole } from '@/components/Role/index.js';
const filterRadio: React.FC<any> = ({ list, confirm, onConfirm, roleType }) => {
	// console.log(list,confirm, onConfirm, roleType)
	const [val, setVal] = useState<number>()
	const handleDomainRadio = (e: any) => {
		setVal(e.target.value)
	}

	
	return (
		<div className={styles.filter}>
			<div>
				<Radio.Group onChange={handleDomainRadio} value={val} >
					{
						roleType === 'role' ?
							list.map((item: any) => {
								return <Radio className={styles.domain} value={item.id} key={item.id}>{handleRole(item.name)}</Radio>
							}) :
							list.map((item: any) => {
								return <Radio className={styles.domain} value={item.id} key={item.id}>{item.name}</Radio>
							})
					}
				</Radio.Group>
			</div>
			<Divider style={{ margin: '10px 0' }} />
			<div className={styles.confirm}>
				<Button
					size="small"
					type="link"
					style={{ border: 'none' }}
					onClick={() => {
						confirm()
						onConfirm(val)
					}
					}
				>
					确定
				</Button>
				<Button
					size="small"
					type="text"
					onClick={() => {
						confirm()
						setVal(undefined)
						onConfirm(undefined)
					}
					}
				>
					重置
				</Button>
			</div>
		</div>
	);
};

export default filterRadio;


