import {BrowserRouter as Router, Route,Routes} from "react-router-dom";
import Home from './components/Home';
import Updated from './components/Updated';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/updated" element={<Updated />}></Route>
        </Routes>
    </Router>
    </div>
  );
}

export default App;
