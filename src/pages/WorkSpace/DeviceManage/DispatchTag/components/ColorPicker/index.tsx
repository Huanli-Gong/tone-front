import React, { useState, useEffect } from 'react';
import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';
import { Divider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import CustomStyle from './style.less';
import Picker from '@/assets/svg/picker.png'

const colorPicker: React.FC<any> = ({ value, onChange }) => {

	const [displayColorPicker, setDisplayColorPicker] = useState<boolean>(false)
	const [show, setShow] = useState<boolean>(false)
	const [color, setColor] = useState<any>({ r: 255, g: 157, b: 78, a: 1 })
	const colors = [
		{ r: 255, g: 157, b: 78, a: 1 },
		{ r: 91, g: 216, b: 166, a: 1 },
		{ r: 91, g: 143, b: 249, a: 1 },
		{ r: 247, g: 102, b: 78, a: 1 },
		{ r: 255, g: 134, b: 183, a: 1 },
		{ r: 43, g: 158, b: 157, a: 1 },
		{ r: 146, g: 112, b: 202, a: 1 },
		{ r: 109, g: 200, b: 236, a: 1 },
		{ r: 102, g: 119, b: 150, a: 1 },
		{ r: 245, g: 188, b: 22, a: 1 },
		{ r: 231, g: 107, b: 242, a: 1 },
	]

	const handleClick = () => {
		setDisplayColorPicker(!displayColorPicker)
	};

	const handleClose = () => {
		setDisplayColorPicker(false)
	};

	const handleChange = (color: any) => {
		const rgb = color.rgb
		setColor(rgb)
		const rgba = `rgb(${rgb.r},${rgb.g},${rgb.b},${rgb.a})`
		if (onChange) {
			onChange(rgba);
		}
	};

	useEffect(() => {
		let rgb = { r: 255, g: 157, b: 78, a: 1 }
		if (value) {
			const init = value.slice(4, value.length - 1).split(',')
			rgb = {
				r: Number(init[0]),
				g: Number(init[1]),
				b: Number(init[2]),
				a: Number(init[3])
			}
		}
		setColor(rgb)
	}, [value]);

	const onselect = (item: any) => {
		setColor(item)
		setShow(false)
		const rgba = `rgb(${item.r},${item.g},${item.b},${item.a})`
		if (onChange) {
			onChange(rgba);
		}
	}

	const styles = reactCSS({
		'default': {
			color: {
				position: 'relative',
				width: '22px',
				height: '22px',
				borderRadius: '2px',
				background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
			},
			swatch: {
				padding: '5px',
				background: '#fff',
				borderRadius: '1px',
				boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
				display: 'inline-block',
				cursor: 'pointer',
			},
			popover: {
				position: 'absolute',
				zIndex: '2',
			},
			cover: {
				position: 'fixed',
				top: '0px',
				right: '0px',
				bottom: '0px',
				left: '0px',
			},
			warp: {
				position: 'absolute',
				paddingTop: '16px',
				paddingBottom: '6px',
				background: '#fff',
				boxShadow: '-12px 0 48px 16px rgba(0,0,0,0.03), -9px 0 28px 0 rgba(0,0,0,0.05), -6px 0 16px -8px rgba(0,0,0,0.08)',
				borderRadius: '2px',
				zIndex: 9999
			}
		},
	});

	return (
		<div>
			<div style={styles.swatch} className={CustomStyle.click} onClick={handleClick}>
				<div style={styles.color} className={CustomStyle.waves} />
			</div>
			{displayColorPicker ?
				<div style={styles.popover}>
					<div style={styles.cover} onClick={handleClose}></div>
					<div style={styles.warp}>
						<div style={{ background: "#fff", width: 244, paddingLeft: '16px' }}>
							{
								colors.map((item, index) => {
									return <div key={index}>
										<div
											className={CustomStyle.waves}
											style={{
												position: 'relative',
												float: 'left',
												marginRight: '16px',
												marginBottom: '16px',
												width: '22px',
												height: '22px',
												borderRadius: '2px',
												overflow: 'hidden',
												background: `rgba(${item.r}, ${item.g}, ${item.b}, ${item.a})`,
											}}
											onClick={() => onselect(item)}
										>
											{JSON.stringify(color) == JSON.stringify(item) && <CheckOutlined style={{ position: 'absolute', top: '5px', left: '5px', color: '#fff' }} />}
										</div>
									</div>
								})
							}
							<div>
								<div
									className={CustomStyle.waves}
									style={{
										float: 'left',
										marginRight: '16px',
										marginBottom: '16px',
										position: 'relative',
										width: '22px',
										height: '22px',
										borderRadius: '2px',
										overflow: 'hidden',
									}}
									onClick={() => setShow(!show)}
								>
									<img src={Picker} style={{ position: 'absolute', width: '22px' }} />
									<div style={{
										position: 'absolute',
										left: '4px',
										top: '4px',
										width: '14px',
										height: '14px',
										borderRadius: '2px',
										background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`
									}}
									></div>
								</div>
							</div>
						</div>
						{show && <Divider style={{ margin: 0 }} />}
						{show && <div style={{ padding: '6px' }}>
							<SketchPicker className={CustomStyle.picker} width={212} color={color} onChange={handleChange} presetColors={[]} />
						</div>
						}
					</div>
				</div> : null
			}
		</div>
	)
}

export default colorPicker