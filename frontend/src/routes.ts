import { createBrowserRouter } from "react-router-dom";
import Splash from "./screens/Splash";
import EnterName from "./screens/EnterName";
import CreateOrJoin from "./screens/CreateOrJoin";
import CreateRoom from "./screens/CreateRoom";
import JoinRoom from "./screens/JoinRoom";
import Lobby from "./screens/Lobby";
import RoleReveal from "./screens/RoleReveal";
import WaitingForOthers from "./screens/WaitingForOthers";
import DayDiscussion from "./screens/DayDiscussion";
import Voting from "./screens/Voting";
import ExecutionReveal from "./screens/ExecutionReveal";
import NightRandomQuestion from "./screens/NightRandomQuestion";
import NightVampireKill from "./screens/NightVampireKill";
import NightHunterInspect from "./screens/NightHunterInspect";
import GameOver from "./screens/GameOver";
import StyleGuide from "./screens/StyleGuide";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Splash,
  },
  {
    path: "/enter-name",
    Component: EnterName,
  },
  {
    path: "/create-or-join",
    Component: CreateOrJoin,
  },
  {
    path: "/create-room",
    Component: CreateRoom,
  },
  {
    path: "/join-room",
    Component: JoinRoom,
  },
  {
    path: "/lobby",
    Component: Lobby,
  },
  {
    path: "/role-reveal",
    Component: RoleReveal,
  },
  {
    path: "/waiting-for-others",
    Component: WaitingForOthers,
  },
  {
    path: "/day-discussion",
    Component: DayDiscussion,
  },
  {
    path: "/voting",
    Component: Voting,
  },
  {
    path: "/execution-reveal",
    Component: ExecutionReveal,
  },
  {
    path: "/night-random-question",
    Component: NightRandomQuestion,
  },
  {
    path: "/night-vampire-kill",
    Component: NightVampireKill,
  },
  {
    path: "/night-hunter-inspect",
    Component: NightHunterInspect,
  },
  {
    path: "/game-over",
    Component: GameOver,
  },
  {
    path: "/style-guide",
    Component: StyleGuide,
  },
]);
