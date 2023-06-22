
import Typography from '@mui/material/Typography';
import { createSvgIcon } from '@mui/material/utils';

export default function Crown({idx}) {
    const CrownIcon = createSvgIcon(
        <path fill="currentColor" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1Z"/>,
        'Crown',
      );
    if (idx === 1) {
        return (
                <CrownIcon sx={{color: "gold"}}/>
        )
    } else if (idx === 2) {
        return (
            <CrownIcon sx={{color: "silver"}}/>
        )
    } else if (idx === 3) {
        return (
            <CrownIcon sx={{color: "#cd7f32"}}/>
        )
    } else {
        return (
            <Typography component="div" sx={{color: "#15792b"}}>{"No." + idx}</Typography>
        )
    }
}