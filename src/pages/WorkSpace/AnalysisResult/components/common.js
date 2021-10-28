import React from 'react';
// 填充颜色
const handleColor = ( name ) => {
    const dict = {
        normal: 'normal',
        increase: 'increase',
        decline: 'decline',
        invalid: 'invalid',
    }
    return dict[name]
} 
// 填充图标
const handleIcon = ( name ) => {
    const dict = {
        normal: '',
        invalid: '⊘',
        increase: '↑',
        decline: '↓',
    }
    return dict[name]
}


export { handleColor, handleIcon }