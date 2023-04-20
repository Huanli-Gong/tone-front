import React, { useState } from 'react';
import { Radio, Button, Divider, Space } from 'antd';
import styles from './style.less';
import { switchUserRole2 } from '@/utils/utils';
import { useIntl, FormattedMessage } from 'umi'

const FilterRadio: React.FC<any> = ({ list, confirm, onConfirm, roleType }) => {
	// console.log(list,confirm, onConfirm, roleType)
	const { formatMessage } = useIntl()
	const [val, setVal] = useState<number>()
	const handleDomainRadio = (e: any) => {
		setVal(e.target.value)
	}

	return (
		<div className={styles.filter}>
			<Radio.Group onChange={handleDomainRadio} value={val} >
				<Space direction="vertical">
					{
						list.map((item: any) => (
							<Radio
								className={styles.domain}
								value={item.id}
								key={item.id}
							>
								{roleType === 'role' ? switchUserRole2(item.name, formatMessage) : item.name}
							</Radio>
						))
					}
				</Space>
			</Radio.Group>
			<Divider style={{ margin: '10px 0' }} />
			<div className={styles.confirm}>
				<Button
					size="small"
					type="link"
					style={{ border: 'none' }}
					onClick={() => {
						confirm?.()
						onConfirm(val)
					}}
				>
					<FormattedMessage id="operation.ok" />
				</Button>
				<Button
					size="small"
					type="text"
					onClick={() => {
						confirm?.()
						setVal(undefined)
						onConfirm(undefined)
					}}
				>
					<FormattedMessage id="operation.reset" />
				</Button>
			</div>
		</div>
	);
};

export default FilterRadio;


