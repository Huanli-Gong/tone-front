
import { Avatar } from 'antd'
interface Props {
    size: 'large' | 'small' | number
    show_name?: string
    style?: any
    theme_color?: string
    logo?: string;
    shape?: 'circle' | 'square';
    className?: string;
    fontSize?: number;
}

const AvatarCover = (props: Props) => {
    const { size, show_name, style, theme_color, logo, shape, fontSize } = props

    if (logo)
        return (
            <Avatar
                shape={shape || 'square'}
                size={size === 'large' ? 80 : 32}
                src={logo}
                style={{ borderRadius: size === "large" ? 8 : 4, ...style }}
            />
        )

    let coverStyle: any = {
        borderRadius: shape === 'circle' ? '50%' : 4,
        fontSize: fontSize || 14,
        fontWeight: 'bold',
        width: typeof size === 'number' ? size : 32,
        height: typeof size === 'number' ? size : 32,
        textAlign: 'center',
        lineHeight: typeof size === 'number' ? size + 'px' : '32px',
        color: '#fff',
        background: theme_color,
    }

    if (size === 'large') {
        coverStyle = Object.assign(coverStyle, {
            borderRadius: shape === 'circle' ? '50%' : 8,
            fontSize: fontSize || 38,
            width: typeof size === 'number' ? size : 80,
            height: typeof size === 'number' ? size : 80,
            lineHeight: typeof size === 'number' ? size + 'px' : '80px'
        })
    }

    return (
        <div style={{ ...coverStyle, ...style }}>
            {show_name?.slice(0, 1)}
        </div>
    )
}

export default AvatarCover