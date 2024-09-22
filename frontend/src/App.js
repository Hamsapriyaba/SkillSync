import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home'; 
import FileUpload from './components/FileUpload';


const App = () => {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home Component for the root path */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<FileUpload />} />
      </Routes>
    
  );
};

export default App;
