import {Link, useNavigate} from 'react-router-dom'
import {User} from 'interfaces';
import {PlayerAvatar} from	'../Avatars';
import FriendBar from 'components/FriendBar/FriendBar';
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import ForumIcon from '@mui/icons-material/Forum'
import GamesIcon from '@mui/icons-material/Games'
import SettingsIcon from '@mui/icons-material/Settings';
import Tooltip from '@mui/material/Tooltip'
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { useAuth } from "components/AuthProvider";
import { Container, TextField } from '@mui/material';
import { client } from 'App';
import Autocomplete from '@mui/material/Autocomplete';
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import {useState} from "react";




function LogOutLink() {
	let auth = useAuth();
	let navigate = useNavigate();

	async function logout() {
		try {
			await client.get('/auth/logout');
			// console.log("Logout successful.");
		} catch {
			// console.log("Logout failed.")
		}
		auth.signout(() => navigate("/login"));
	}

	return (
		<Tooltip title={"Logout"} placement="bottom">
			<Button
				onClick={logout}
				variant="contained"
				startIcon={<MeetingRoomIcon />}
				color="secondary"
			/>
		</Tooltip>
	);
}

function AppBarButton(props: {icon: any, link: string, tooltip: any}) {
	return (
		<Tooltip title={props.tooltip} placement="bottom">
			<Button
				variant="contained"
				color="secondary"
				component={Link}
				to={props.link}>
				{props.icon}
			</Button>
		</Tooltip>
	);
}

function PlayerName(props: {name: string}) {
	return (
		<Tooltip title={props.name} placement="bottom">
		<Typography
			variant="h6"
			noWrap
			component="div"
			sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
			>
			{props.name}
		</Typography>
		</Tooltip>
	);
}

function ProjectName() {
	return (
		<Typography
		  variant="h4"
		  noWrap
		  component="div"
		  sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' }, overflow: 'hidden', textOverflow: 'ellipsis'}}
		>The Ponger's Guide to the Galaxy</Typography>
	);
}


function ProfileSearch(props : {user: User, users: User[]}) {
	let navigate = useNavigate();

	function handleOnSubmit(e: any, selectedUser: User | null) {
		if (typeof selectedUser === 'object' && !!selectedUser) {
			navigate(`/profile/${selectedUser.id}`);
		} else if (typeof selectedUser === 'string') {
			if (props.users.find(user => user.username === selectedUser))
				navigate(`/profile/${props.users.find(user => user.username === selectedUser)?.id}`);
		}
	}


	return (
	<Autocomplete
		id="search..."
		onChange={handleOnSubmit}
		options={props.users}
		getOptionLabel={(option: any) => option?.username }
		renderInput={(params) => <TextField {...params} label="search..." />}
		sx={{ width: '15vw', maxWidth: '200px'}}
	/>
	)
}

export default function SearchAppBar(props: {user: User, users: User[], statusMap: Map<number, string>, setStatusMap: React.Dispatch<React.SetStateAction<Map<number, string>>>}) {
	let [open, setOpen] = useState<boolean>(false);

  return (
      <AppBar position="static" >
		<Container maxWidth="xl" >
			<Toolbar disableGutters>
				<Link to="profile">
					<PlayerAvatar image={process.env.REACT_APP_BACK_URL + '/avatars/' + props.user.id + '.png'} />
				</Link>
				<PlayerName name={props.user.username} />
				<ProjectName />
				<Stack direction="row" spacing={2}>
					<ProfileSearch user={props.user} users={props.users} />
					<Tooltip title="Friends">
						<Button onClick={() => setOpen(true)} variant="contained" color="secondary">
							<PeopleAltIcon />
						</Button>
					</Tooltip>
					<FriendBar user={props.user} users={props.users} statusMap={props.statusMap} setStatusMap={props.setStatusMap} open={open} setOpen={setOpen}/>
					<AppBarButton link="../game" tooltip={"Game"} icon={<GamesIcon />}/>
					<AppBarButton link="../chat" tooltip={"Forum"} icon={<ForumIcon />}/>
					<AppBarButton link="../settings" tooltip={"Settings"} icon={<SettingsIcon />}/>
					<LogOutLink />
				</Stack>
			</Toolbar>
		</Container>
	</AppBar>
	);
}
