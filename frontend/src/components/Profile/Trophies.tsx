import { Stack, Typography } from "@mui/material";
import Star from "../../images/Trophies/star.png";
import ThreeStars from "../../images/Trophies/threestars.png";
import TheQuitter from "../../images/Trophies/quitter.png";
import Frankencat from "../../images/Trophies/frankencat.png";

enum achievements {
  ONESTAR,
  THREESTARS,
  QUIT,
  CHANGEAVATAR,
}

const ImgStyle = {
  width: "70px",
  minHeight: "70px",

  padding: '1%'
};

const ATrophyStyle = {
  backgroundColor: "rgb(100, 100, 200, 0.2)",
  alignItems: "center",
};

function ATrophie(props: { image: string; title: string; label: string }) {
  return (
    <Stack direction="row" spacing={2} sx={ATrophyStyle}>
      <img src={props.image} alt="Trophy" style={ImgStyle} />
      <Stack>
        <Typography variant="subtitle2">{props.title}</Typography>
        <Typography variant="subtitle1" color="black">
          {props.label}
        </Typography>
      </Stack>
    </Stack>
  );
}

function OneWinTrophy() {
  return (
    <ATrophie image={Star} label="You're the star, man!" title="First win" />
  );
}

function ThreeWinsTrophy() {
  return (
    <ATrophie
      image={ThreeStars}
      label="Like taking candy to a baby!"
      title="Three wins"
    />
  );
}

function QuitTrophy() {
  return (
    <ATrophie
      image={TheQuitter}
      label="Baby please don't go"
      title="Quit the game"
    />
  );
}

function ChangeAvatarTrophy() {
  return (
    <ATrophie
      image={Frankencat}
      label="He has changed, for sure"
      title="Changed avatar"
    />
  );
}

export {
  ChangeAvatarTrophy,
  QuitTrophy,
  OneWinTrophy,
  ThreeWinsTrophy,
  achievements,
};

