import React from "react";
import { Routes, Route } from "react-router-dom";
// import Login from "./rou";
// import register from "./routes/Signup";
import Dashboard from "./routes/Dashboard";
import MainLayout from "./layouts/MainLayout";
import Home from "./routes/Home";
import Login from "./routes/Login";
import Register from "./routes/Register";
const App: React.FC = () => {
  return (
    <MainLayout>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Dashboard />} /> 
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    </MainLayout>
  );
};

export default App;
