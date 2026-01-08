
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Main from "./pages/Main";
import Chat from "./pages/Chat";
import AIConnect from "./pages/AIConnect";


// 2. 主 App 组件变得非常轻量，只负责控制 Key
export default function App() {
  // const [assistantId, setAssistantId] = useState("contentAgent");

  return (
    <>
 
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/chat/:assistantId" element={<AIConnect />} />
        </Routes>

    </>
  );
}
