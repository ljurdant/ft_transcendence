import Stack from "@mui/material/Stack";
import ChooseName from "./ChooseName/ChooseName";
import ChooseAuth from "./ChooseAuth/ChooseAuth";
import ChooseAvatar from "./ChooseAvatar/ChooseAvatar";

export default function Settings() {
  return (
    <Stack spacing={5} sx={{padding: "15vh 20vw"}}>
      <ChooseAvatar />
      <ChooseName />
      <ChooseAuth />
    </Stack>
  );
}
