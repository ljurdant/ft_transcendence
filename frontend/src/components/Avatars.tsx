import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

import { useAuth } from './AuthProvider'

// Styles

const SmallAvatar = {border: 2, width: 50, height: 50}

export function PlayerAvatar(props: {image: string } ) {
    const auth = useAuth();

    return(
        <div >
        <IconButton >
            <Tooltip title="Profile" placement="bottom">
                <Avatar src={props.image + "?" + auth.imageId}  sx={SmallAvatar} />
            </Tooltip>
        </IconButton>
        </div>
    );
}
