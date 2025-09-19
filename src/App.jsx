// import React from "react";
// import { Routes, Route, Link } from "react-router-dom";
// import Dashboard from "./pages/Dashboard";
// import PropertyPage from "./pages/PropertyPage";
// import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

// export default function App() {
//   return (
//     <>
//       <AppBar position="static" color="primary" enableColorOnDark>
//         <Toolbar>
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             Flex Living Reviews Dashboard
//           </Typography>
//           <Button color="inherit" component={Link} to="/">
//             Dashboard
//           </Button>
//         </Toolbar>
//       </AppBar>
//       <Box sx={{ mt: 4 }}>
//         <Routes>
//           <Route path="/" element={<Dashboard />} />
//           <Route path="/property/:listingId" element={<PropertyPage />} />
//         </Routes>
//       </Box>
//     </>
//   );
// }

import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  BarChartOutlined,
  HomeOutlined,
  TeamOutlined,
  UserOutlined, 
} from "@ant-design/icons";
import Dashboard from "./pages/Dashboard";
import PropertyPage from "./pages/PropertyPage";

const { Header, Sider, Content } = Layout;

export default function App() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, margin: 16, color: "#fff", fontWeight: "bold", textAlign: "center" }}>
          Flex Living
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            { key: "/", icon: <BarChartOutlined />, label: <Link to="/">Dashboard</Link> },
            { key: "/property", icon: <HomeOutlined />, label: "Properties" },
            { key: "/users", icon: <TeamOutlined />, label: "Properties" },
            { key: "/profile", icon: <UserOutlined />, label: "Properties" },
          ]}
        />
      </Sider>

      {/* Main content area */}
      <Layout>
        <Header style={{ background: "#fff", padding: "0 20px" }}>
          <h2 style={{ margin: 0 }}>Reviews Dashboard</h2>
        </Header>
        <Content style={{ margin: "20px", padding: "20px", background: "#f5f6fa" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/property/:listingId" element={<PropertyPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
