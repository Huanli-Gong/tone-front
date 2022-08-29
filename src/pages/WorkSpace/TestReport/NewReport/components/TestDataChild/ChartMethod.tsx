export const handleColor = (name: any) => {
    const dict = {
        normal: 'rgba(0,0,0,1)',
        increase: '#81BF84',
        decline: '#C84C5A',
        invalid: 'rgba(0,0,0,0.25)',
    }
    return dict[name]
}

export const switchExpectation = (str:string) => {
    let text = '';
    switch (str) {
        case 'increase':
            text = 'more is better'
            break;
        case '上升':
            text = 'more is better'
            break;
        case 'decline':
            text = 'less is better'
            break;
        case '下降':
            text = 'less is better'
            break;
        default:
            text = '-'
            break;
    }
    return text;
}