import {useState} from 'react'
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import {client, toastThatError} from '../App'
import {User} from 'interfaces';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from './AuthProvider';
import {socket} from 'App';

const TitleStyle = {
	fontWeight: '800', 
	textShadow: '1px 1px 1px black',
}

const LittleBoxForInput = {
	width: '70vw',
	padding: 2,
	border: '4px solid black',
	backgroundColor: 'rgb(120, 100, 220, 0.95)',
}

const FirstConnexionModal = {
	padding: 4,
	backgroundColor: 'rgb(128, 161, 212, 0.95)',
	border: '2px solid black',
	position: 'absolute',
	top: '20%',
	left: '20%',
}


export default function FirstLoginPrompt(props: {user: User | undefined}) {
	const [open, setOpen] = useState(true);
	const [username, setUsername] = useState<string>("")
	const [selectedFile, setSelectedFile] = useState<any>();
	
	let auth = useAuth();

	async function submitNameAndAvatar() {
		try {
			await client.patch("/users/me", {username: username})
			setOpen(false)
			if (selectedFile) {
				const formData = new FormData();
				formData.append('avatar', selectedFile)
		
				await client.put("/users/upload-avatar", formData)
				// console.log("Put avatar request success")
			}
		} catch {
			toastThatError('Choose another name.');		
		}

		try {
			const response = await client.get("/users/me");
			auth.update(response.data);
		} catch {
			// console.log("not logged in");
		}
	}


	function ChooseFirstAvatar() {	

		const changeHandler = (event: any) => {
			if (event.target.files[0].size < 1048577
				&& event.target.files[0].size !== 0
				&& /^image/.test(event.target.files[0].type)) {
				setSelectedFile(event.target.files[0]);
			} else {
				setSelectedFile(null);
				if (event.target.files[0].size >= 1048577)
					toastThatError('The image you try to upload is too big!');
				else if (event.target.files[0].size === 0)
					toastThatError('The image you try to upload is empty!');
				else
					toastThatError("Invalid file.")
			}
		};
	
		return (
			<Box sx={LittleBoxForInput}>
				<Stack spacing={2}>
					<Typography
						variant="h6"
						color='rgb(200, 100, 30)'
						sx={TitleStyle}
					>
						Choose your avatar:
					</Typography>
					<Stack spacing={5} direction="row" alignItems="flex-start">
						<Button
							component="label"
							variant="contained"
							startIcon={<PhotoCamera />}
							color="secondary"
						>
							Upload
							<input hidden accept="image/*" type="file" onChange={changeHandler} />
						</Button>
						{selectedFile ? (
							<Stack spacing={2}>
							<Typography variant="body2">Filename: {selectedFile.name}</Typography>
							<Typography variant="body2">Filetype: {selectedFile.type}</Typography>
							<Typography variant="body2">
								Size: {Math.round(selectedFile.size / 1024)}KB
							</Typography>
							</Stack>
						) : (
							<Typography variant="body2">No file selected yet</Typography>
						)}
					</Stack>
				</Stack>
			</Box>
		  );
	}

	
	return (
		<Modal open={open} >
			<Box sx={FirstConnexionModal}>
				<Stack spacing={3}>
					<Typography 
						variant="h5"
						color='rgb(85, 70, 230)'
						sx={TitleStyle}
					>
						Hey, first login?
					</Typography>
					<Box sx={LittleBoxForInput}>
						<Typography
							variant="h6"
							color='rgb(200, 100, 30)'
							sx={TitleStyle}
						>
						Choose your username:
						</Typography>
						<TextField
							error={/^[\w]{0,16}$/.test(username) === false}
							helperText={"Your username may only contain letters, digits or underscore, and must be at least 2 characters long."}
							inputProps={{maxLength: 16}}
							onInput={(e: any) => setUsername(e.target.value)}
						/>
					</Box>
					<ChooseFirstAvatar />
					<Button 
						onClick={submitNameAndAvatar}
						variant="contained"
						sx={{
							backgroundColor: 'rgb(100, 190, 100)',
							border: '2px solid black',
							textShadow: '1px 1px 1px black',
						}}
						disabled={/^[\w]{2,16}$/.test(username) === false}
						>
						I'm all set!
					</Button>
				</Stack>
			</Box>
		</Modal>
	)
}
