import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/HomePage";
import GamePlayPage from "../pages/GamePlayPage";
import EndingPage from "../pages/EndingPage";
import EmotionLogPage from "../pages/EmotionLogPage";
import PersonaCollectionPage from "../pages/PersonaCollectionPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/play",
    element: <GamePlayPage />,
  },
  {
    path: "/ending",
    element: <EndingPage />,
  },
  {
    path: "/emotion-log",
    element: <EmotionLogPage />,
  },
  {
    path: "/persona-collection",
    element: <PersonaCollectionPage />,
  },
]);

export default router;
