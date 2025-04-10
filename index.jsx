import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import styled from 'styled-components';

// Dashboard Components
const Dashboard = () => {
  return (
    <DashboardContainer>
      <Sidebar>
        <Logo>Dashboard</Logo>
        <NavMenu>
          <NavItem>
            <Link to="/">Home</Link>
          </NavItem>
          <NavItem>
            <Link to="/analytics">Analytics</Link>
          </NavItem>
          <NavItem>
            <Link to="/users">Users</Link>
          </NavItem>
          <NavItem>
            <Link to="/settings">Settings</Link>
          </NavItem>
        </NavMenu>
      </Sidebar>
      
      <MainContent>
        <Header>
          <SearchBar>
            <input type="text" placeholder="Search..." />
          </SearchBar>
          <UserProfile>
            <span>John Doe</span>
            <ProfileImage />
          </UserProfile>
        </Header>
        
        <ContentArea>
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/analytics" element={<AnalyticsContent />} />
            <Route path="/users" element={<UsersContent />} />
            <Route path="/settings" element={<SettingsContent />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

// Placeholder Components
const HomeContent = () => <div>Home Dashboard Content</div>;
const AnalyticsContent = () => <div>Analytics Content</div>;
const UsersContent = () => <div>Users Management Content</div>;
const SettingsContent = () => <div>Settings Content</div>;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #1a1a1a;
  color: white;
  padding: 20px;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 40px;
  text-align: center;
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 10px 0;
  
  a {
    color: white;
    text-decoration: none;
    padding: 10px;
    display: block;
    border-radius: 5px;
    
    &:hover {
      background-color: #333;
    }
  }
`;

const MainContent = styled.div`
  flex: 1;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SearchBar = styled.div`
  input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    width: 300px;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ProfileImage = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #ddd;
`;

const ContentArea = styled.main`
  padding: 20px;
`;

// Wrap the Dashboard with Router
const App = () => {
  return (
    <Router>
      <Dashboard />
    </Router>
  );
};

export default App;
