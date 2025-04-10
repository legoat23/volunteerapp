import React, { useState, useContext, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome, FiPieChart, FiUsers, FiSettings, FiBell, FiSearch, FiMenu, FiCalendar, FiMapPin, FiMessageSquare, FiHeart, FiShare2, FiUserPlus, FiMessageCircle } from 'react-icons/fi';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'leaflet/dist/leaflet.css';
import Papa from 'papaparse';

// Data Constants
const lineChartData = [
  { name: 'Jan', users: 4000, sessions: 2400 },
  { name: 'Feb', users: 3000, sessions: 1398 },
  { name: 'Mar', users: 2000, sessions: 9800 },
  { name: 'Apr', users: 2780, sessions: 3908 },
  { name: 'May', users: 1890, sessions: 4800 },
  { name: 'Jun', users: 2390, sessions: 3800 },
];

const pieChartData = [
  { name: 'Desktop', value: 400 },
  { name: 'Mobile', value: 300 },
  { name: 'Tablet', value: 100 },
];

const volunteerHoursByIndustry = [
  { name: 'Education', hours: 120 },
  { name: 'Environment', hours: 80 },
  { name: 'Healthcare', hours: 60 },
  { name: 'Community Service', hours: 90 },
  { name: 'Animal Welfare', hours: 40 }
];

const impactScoreData = [
  { name: 'Lives Impacted', value: 250 },
  { name: 'Hours Served', value: 390 },
  { name: 'Projects Completed', value: 15 }
];

const impactOverTimeData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 75 },
  { month: 'Mar', score: 85 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 90 },
  { month: 'Jun', score: 95 }
];

const leaderboardData = [
  { name: 'Gustavo F.', hours: 120, rank: 1 },
  { name: 'Walter W.', hours: 115, rank: 2 },
  { name: 'Hank S.', hours: 100, rank: 3 },
  { name: 'Skyler W.', hours: 95, rank: 4 },
  { name: 'Jesse P.', hours: 90, rank: 5 }
];

const recentActivity = [
  { id: 1, user: 'John D.', action: 'Completed Beach Cleanup', time: '2h ago' },
  { id: 2, user: 'Sarah M.', action: 'Started Food Bank Project', time: '4h ago' },
  { id: 3, user: 'Mike R.', action: 'Reached 100 hours', time: '6h ago' },
  { id: 4, user: 'Emma W.', action: 'Joined Tree Planting', time: '8h ago' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Styled Components - Fix the order
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const Sidebar = styled.div`
  width: ${props => props.collapsed ? '80px' : '250px'};
  background-color: #1a1a1a;
  color: white;
  padding: 20px 10px;
  transition: all 0.3s ease;
  position: fixed;
  height: 100vh;
  overflow-x: hidden;
  z-index: 1000;

  ${Logo} {
    transition: all 0.3s ease;
    overflow: hidden;
    white-space: nowrap;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  margin-bottom: 40px;
`;

const MenuToggle = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  padding: 5px;
  
  &:hover {
    color: #ddd;
  }
`;

const NavMenu = styled.ul`
  list-style: none;
  padding: 0;
`;

const NavItem = styled.li`
  margin: 8px 0;
`;

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 12px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  gap: 12px;
  transition: all 0.3s ease;
  
  span {
    opacity: ${props => props.collapsed ? '0' : '1'};
    visibility: ${props => props.collapsed ? 'hidden' : 'visible'};
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  
  svg {
    font-size: 20px;
    min-width: 20px;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MainContent = styled.div`
  flex: 1;
  margin-left: ${props => props.collapsed ? '80px' : '250px'};
  transition: margin-left 0.3s ease;
  background-color: #f8f9fa;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px 16px;
  width: 300px;
  
  svg {
    color: #666;
    margin-right: 8px;
  }
  
  input {
    border: none;
    background: none;
    outline: none;
    width: 100%;
    font-size: 14px;
    
    &::placeholder {
      color: #999;
    }
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NotificationDropdown = styled.div`
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 300px;
  padding: 8px;
  margin-top: 8px;
`;

const NotificationBell = styled.div`
  position: relative;
  cursor: pointer;
  
  svg {
    font-size: 20px;
    color: #666;
  }
  
  &:hover ${NotificationDropdown} {
    display: block;
  }
`;

const NotificationCount = styled.span`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
`;

const NotificationItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationText = styled.div`
  font-size: 14px;
  color: #333;
`;

const NotificationTime = styled.div`
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SocialUserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const UserRole = styled.span`
  font-size: 12px;
  color: #666;
`;

const ContentArea = styled.main`
  padding: 20px;
`;

const PageTitle = styled.div`
  margin-bottom: 24px;
  
  h1 {
    font-size: 24px;
    color: #333;
    font-weight: 600;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const CardTitle = styled.h3`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const CardValue = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const CardChange = styled.div`
  font-size: 14px;
  color: ${props => props.positive ? '#00b894' : '#ff4757'};
`;

// Add these new styled components
const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-top: 24px;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  grid-column: ${props => props.fullWidth ? '1 / -1' : 'auto'};
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  color: #333;
  margin-bottom: 16px;
`;

const ChartLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 16px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.color};
`;

const CalendarWrapper = styled.div`
  .rbc-calendar {
    background: white;
    padding: 20px;
    border-radius: 8px;
  }
`;

const MapWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
`;

const RecommendedEvents = styled.div`
  grid-column: 1 / -1;
  
  h2 {
    margin-bottom: 20px;
    color: #333;
  }
`;

const EventCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const EventTitle = styled.h3`
  font-size: 18px;
  color: #333;
`;

const EventCategory = styled.span`
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
`;

const EventDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  color: #666;
  font-size: 14px;
`;

const EventLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EventDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const SignUpButton = styled.a`
  display: inline-block;
  background: #00b894;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    background: #00a187;
  }
`;

// Replace the existing HomeContent component with this updated version
const HomeContent = () => (
  <>
    <DashboardGrid>
      <Card>
        <CardTitle>Total Volunteer Hours</CardTitle>
        <CardValue>390</CardValue>
        <CardChange positive>+45 hours this month</CardChange>
      </Card>
      <Card>
        <CardTitle>Impact Score</CardTitle>
        <CardValue>95</CardValue>
        <CardChange positive>+5 points</CardChange>
      </Card>
      <Card>
        <CardTitle>Projects</CardTitle>
        <CardValue>15</CardValue>
        <CardChange>Active this month</CardChange>
      </Card>
      <Card>
        <CardTitle>Ranking</CardTitle>
        <CardValue>#3</CardValue>
        <CardChange positive>Top 5%</CardChange>
      </Card>
    </DashboardGrid>

    <ChartGrid>
      <ChartCard>
        <ChartTitle>Hours by Industry</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={volunteerHoursByIndustry}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="hours"
            >
              {volunteerHoursByIndustry.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <ChartLegend>
          {volunteerHoursByIndustry.map((entry, index) => (
            <LegendItem key={entry.name}>
              <LegendColor color={COLORS[index % COLORS.length]} />
              <span>{entry.name}</span>
            </LegendItem>
          ))}
        </ChartLegend>
      </ChartCard>

      <ChartCard>
        <ChartTitle>Impact Breakdown</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={impactScoreData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#00b894" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard fullWidth>
        <ChartTitle>Impact Score Over Time</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={impactOverTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#00b894" 
              strokeWidth={2}
              dot={{ fill: '#00b894' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <LeaderboardCard>
        <ChartTitle>Leaderboard</ChartTitle>
        <LeaderboardList>
          {leaderboardData.map((user) => (
            <LeaderboardItem key={user.rank}>
              <LeaderboardRank>{user.rank}</LeaderboardRank>
              <LeaderboardName>{user.name}</LeaderboardName>
              <LeaderboardHours>{user.hours} hrs</LeaderboardHours>
            </LeaderboardItem>
          ))}
        </LeaderboardList>
      </LeaderboardCard>

      <ActivityCard>
        <ChartTitle>Recent Activity</ChartTitle>
        <ActivityList>
          {recentActivity.map((activity) => (
            <ActivityItem key={activity.id}>
              <ActivityUser>{activity.user}</ActivityUser>
              <ActivityAction>{activity.action}</ActivityAction>
              <ActivityTime>{activity.time}</ActivityTime>
            </ActivityItem>
          ))}
        </ActivityList>
      </ActivityCard>
    </ChartGrid>
  </>
);

// Add these new styled components
const LeaderboardCard = styled(ChartCard)`
  background: white;
  padding: 24px;
`;

const LeaderboardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LeaderboardItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${props => props.rank === 1 ? '#fff8e1' : '#fff'};
  border-radius: 8px;
  border: 1px solid #eee;
`;

const LeaderboardRank = styled.div`
  width: 24px;
  height: 24px;
  background: ${props => props.children === 1 ? '#ffd700' : '#f5f5f5'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-right: 12px;
`;

const LeaderboardName = styled.div`
  flex: 1;
  font-weight: 500;
`;

const LeaderboardHours = styled.div`
  color: #00b894;
  font-weight: 500;
`;

const ActivityCard = styled(ChartCard)`
  background: white;
  padding: 24px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
`;

const ActivityUser = styled.div`
  font-weight: 500;
  margin-right: 8px;
`;

const ActivityAction = styled.div`
  flex: 1;
  color: #666;
`;

const ActivityTime = styled.div`
  color: #999;
  font-size: 12px;
`;

// First, let's create a context to manage user data at the app level
const UserContext = React.createContext();

// Add this before the Dashboard component
const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    role: "Administrator"
  });

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ userData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Modify the SettingsContent component
const SettingsContent = () => {
  const { userData, updateUserData } = useContext(UserContext);
  const [formData, setFormData] = useState(userData);
  const [generalSettings, setGeneralSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    darkMode: false,
    shareProfile: true,
    showImpact: true
  });

  const [volunteerPreferences, setVolunteerPreferences] = useState({
    maxDistance: "25",
    preferredCategories: ["Environment", "Education"],
    availableDays: ["Monday", "Saturday"],
    minimumHours: "2",
    maximumHours: "8"
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateProfile = () => {
    updateUserData(formData);
    // You could add a success notification here
  };

  const handleGeneralSettingChange = (setting) => {
    setGeneralSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleVolunteerPreferenceChange = (preference, value) => {
    setVolunteerPreferences(prev => ({
      ...prev,
      [preference]: value
    }));
  };

  return (
    <SettingsContainer>
      <SettingsSection>
        <SectionTitle>Account Settings</SectionTitle>
        <SettingsCard>
          <SettingsGroup>
            <SettingsHeader>Personal Information</SettingsHeader>
            <FormGroup>
              <Label>Full Name</Label>
              <Input 
                type="text" 
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Email</Label>
              <Input 
                type="email" 
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone</Label>
              <Input 
                type="tel" 
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </FormGroup>
            <UpdateButton onClick={handleUpdateProfile}>Update Profile</UpdateButton>
          </SettingsGroup>
        </SettingsCard>

        <SettingsCard>
          <SettingsGroup>
            <SettingsHeader>Notification Preferences</SettingsHeader>
            <ToggleGroup>
              <ToggleLabel>
                Email Notifications
                <ToggleSwitch
                  checked={generalSettings.emailNotifications}
                  onChange={() => handleGeneralSettingChange('emailNotifications')}
                />
              </ToggleLabel>
              <ToggleDescription>Receive updates about your volunteer activities via email</ToggleDescription>
            </ToggleGroup>

            <ToggleGroup>
              <ToggleLabel>
                Push Notifications
                <ToggleSwitch
                  checked={generalSettings.pushNotifications}
                  onChange={() => handleGeneralSettingChange('pushNotifications')}
                />
              </ToggleLabel>
              <ToggleDescription>Get real-time updates on your browser</ToggleDescription>
            </ToggleGroup>

            <ToggleGroup>
              <ToggleLabel>
                Weekly Digest
                <ToggleSwitch
                  checked={generalSettings.weeklyDigest}
                  onChange={() => handleGeneralSettingChange('weeklyDigest')}
                />
              </ToggleLabel>
              <ToggleDescription>Receive a weekly summary of volunteer opportunities</ToggleDescription>
            </ToggleGroup>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection>
        <SectionTitle>Volunteer Preferences</SectionTitle>
        <SettingsCard>
          <SettingsGroup>
            <SettingsHeader>Location & Availability</SettingsHeader>
            <FormGroup>
              <Label>Maximum Travel Distance (miles)</Label>
              <Input
                type="number"
                value={volunteerPreferences.maxDistance}
                onChange={(e) => handleVolunteerPreferenceChange('maxDistance', e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>Preferred Categories</Label>
              <CategoryGrid>
                {['Environment', 'Education', 'Healthcare', 'Community Service', 'Animal Welfare', 'Arts & Culture'].map(category => (
                  <CategoryChip
                    key={category}
                    selected={volunteerPreferences.preferredCategories.includes(category)}
                    onClick={() => {
                      const newCategories = volunteerPreferences.preferredCategories.includes(category)
                        ? volunteerPreferences.preferredCategories.filter(c => c !== category)
                        : [...volunteerPreferences.preferredCategories, category];
                      handleVolunteerPreferenceChange('preferredCategories', newCategories);
                    }}
                  >
                    {category}
                  </CategoryChip>
                ))}
              </CategoryGrid>
            </FormGroup>

            <FormGroup>
              <Label>Available Days</Label>
              <DaySelector>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <DayChip
                    key={day}
                    selected={volunteerPreferences.availableDays.includes(day)}
                    onClick={() => {
                      const newDays = volunteerPreferences.availableDays.includes(day)
                        ? volunteerPreferences.availableDays.filter(d => d !== day)
                        : [...volunteerPreferences.availableDays, day];
                      handleVolunteerPreferenceChange('availableDays', newDays);
                    }}
                  >
                    {day.slice(0, 3)}
                  </DayChip>
                ))}
              </DaySelector>
            </FormGroup>

            <FormGroup>
              <Label>Hours Preference (per event)</Label>
              <HoursPicker>
                <Input
                  type="number"
                  value={volunteerPreferences.minimumHours}
                  onChange={(e) => handleVolunteerPreferenceChange('minimumHours', e.target.value)}
                  placeholder="Min"
                />
                <span>to</span>
                <Input
                  type="number"
                  value={volunteerPreferences.maximumHours}
                  onChange={(e) => handleVolunteerPreferenceChange('maximumHours', e.target.value)}
                  placeholder="Max"
                />
              </HoursPicker>
            </FormGroup>
          </SettingsGroup>
        </SettingsCard>

        <SettingsCard>
          <SettingsGroup>
            <SettingsHeader>Privacy Settings</SettingsHeader>
            <ToggleGroup>
              <ToggleLabel>
                Share Profile
                <ToggleSwitch
                  checked={generalSettings.shareProfile}
                  onChange={() => handleGeneralSettingChange('shareProfile')}
                />
              </ToggleLabel>
              <ToggleDescription>Allow other volunteers to see your profile and activities</ToggleDescription>
            </ToggleGroup>

            <ToggleGroup>
              <ToggleLabel>
                Show Impact
                <ToggleSwitch
                  checked={generalSettings.showImpact}
                  onChange={() => handleGeneralSettingChange('showImpact')}
                />
              </ToggleLabel>
              <ToggleDescription>Display your volunteer impact on your public profile</ToggleDescription>
            </ToggleGroup>
          </SettingsGroup>
        </SettingsCard>
      </SettingsSection>
    </SettingsContainer>
  );
};

// Modify the UserProfile component in the Dashboard
const UserProfileSection = () => {
  const { userData } = useContext(UserContext);
  
  return (
    <UserProfile>
      <ProfileImage src="https://via.placeholder.com/40" alt="User" />
      <UserInfo>
        <SocialUserName>{userData.name}</SocialUserName>
        <UserRole>{userData.role}</UserRole>
      </UserInfo>
    </UserProfile>
  );
};

// Update the Dashboard component to use UserProfileSection
const Dashboard = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "New user registration", time: "5m ago" },
    { id: 2, text: "Server update completed", time: "1h ago" },
    { id: 3, text: "Database backup successful", time: "2h ago" },
  ]);

  return (
    <DashboardContainer>
      <Sidebar collapsed={isSidebarCollapsed}>
        <LogoSection>
          <Logo>{isSidebarCollapsed ? '🚀' : '🚀 Dashboard'}</Logo>
          <MenuToggle onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            <FiMenu />
          </MenuToggle>
        </LogoSection>
        <NavMenu>
          <NavItem>
            <StyledLink to="/" collapsed={isSidebarCollapsed}>
              <FiHome /> <span>Home</span>
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/recommendations" collapsed={isSidebarCollapsed}>
              <FiCalendar /> <span>Recommendations</span>
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/social" collapsed={isSidebarCollapsed}>
              <FiMessageSquare /> <span>Community</span>
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/settings" collapsed={isSidebarCollapsed}>
              <FiSettings /> <span>Settings</span>
            </StyledLink>
          </NavItem>
          <NavItem>
            <StyledLink to="/chatbot" collapsed={isSidebarCollapsed}>
              <FiMessageCircle /> <span>Help Bot</span>
            </StyledLink>
          </NavItem>
        </NavMenu>
      </Sidebar>
      
      <MainContent collapsed={isSidebarCollapsed}>
        <Header>
          <SearchBar>
            <FiSearch />
            <input type="text" placeholder="Search..." />
          </SearchBar>
          <HeaderActions>
            <NotificationBell>
              <FiBell />
              <NotificationCount>3</NotificationCount>
              <NotificationDropdown>
                {notifications.map(notification => (
                  <NotificationItem key={notification.id}>
                    <NotificationText>{notification.text}</NotificationText>
                    <NotificationTime>{notification.time}</NotificationTime>
                  </NotificationItem>
                ))}
              </NotificationDropdown>
            </NotificationBell>
            <UserProfileSection />
          </HeaderActions>
        </Header>
        
        <ContentArea>
          <PageTitle>
            <CurrentPage />
          </PageTitle>
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/settings" element={<SettingsContent />} />
            <Route path="/recommendations" element={<RecommendationsContent />} />
            <Route path="/social" element={<SocialContent />} />
            <Route path="/chatbot" element={<ChatbotContent />} />
          </Routes>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

const CurrentPage = () => {
  const location = useLocation();
  const getPageTitle = () => {
    switch(location.pathname) {
      case '/': return 'Dashboard Overview';
      case '/settings': return 'Settings';
      case '/recommendations': return 'Recommendations';
      case '/social': return 'Community';
      case '/chatbot': return 'Volunteer Assistant';
      default: return 'Dashboard';
    }
  };
  return <h1>{getPageTitle()}</h1>;
};

// Update the parseVolunteerEvents function
const parseVolunteerEvents = (csvText) => {
  console.log('Raw CSV text:', csvText); // Debug raw data

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true
  });

  console.log('Papa Parse results:', results); // Debug parsed data

  const events = results.data
    .filter(event => event.start_date_date && event.end_date_date)
    .map(event => {
      console.log('Processing event:', event); // Debug individual event processing
      
      // Parse dates correctly
      const startDate = moment(event.start_date_date).toDate();
      const endDate = moment(event.end_date_date).toDate();
      
      console.log('Parsed dates:', { startDate, endDate }); // Debug date parsing

      return {
        id: event.opportunity_id || String(Math.random()),
        title: event.title || 'Untitled Event',
        start: startDate,
        end: endDate,
        location: event.locality || 'Location TBD',
        category: event.category_desc || 'General',
        coordinates: [
          parseFloat(event.Latitude) || 40.7128,
          parseFloat(event.Longitude) || -74.0060
        ],
        intensity: 50,
        description: event.summary || 'No description available',
        organization: event.org_title || 'Organization',
        type: event.recurrence_type || 'onetime'
      };
    })
    .filter(event => !isNaN(event.start.getTime()) && !isNaN(event.end.getTime()));

  console.log('Final processed events:', events); // Debug final output
  return events;
};

// Add this function before the RecommendationsContent component
const fetchCSVData = async () => {
  try {
    const response = await fetch('/NYC_Service__Volunteer_Opportunities__Historical_.csv');
    const csvText = await response.text();
    return csvText;
  } catch (error) {
    console.error('Error fetching CSV:', error);
    return null;
  }
};

// Update the RecommendationsContent component
const RecommendationsContent = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [calendarDate, setCalendarDate] = useState(new Date(2011, 7, 1));

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvText = await fetchCSVData();
        if (csvText) {
          const parsedEvents = parseVolunteerEvents(csvText);
          console.log('Number of events:', parsedEvents.length);
          
          if (parsedEvents.length > 0) {
            const sortedEvents = parsedEvents.sort((a, b) => a.start - b.start);
            setCalendarDate(sortedEvents[0].start);
            setEvents(sortedEvents);
            setFilteredEvents(sortedEvents);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    if (category === 'All') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.category === category));
    }
  };

  const categories = ['All', ...new Set(events.map(event => event.category))];

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#00b894',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };

    if (event.type === 'ongoing') {
      style.backgroundColor = '#0984e3';
    }

    return {
      style
    };
  };

  return (
    <>
      <DashboardGrid>
        <Card>
          <CardTitle>Available Opportunities</CardTitle>
          <CardValue>{events.length}</CardValue>
          <CardChange>In NYC area</CardChange>
        </Card>
        <Card>
          <CardTitle>Categories</CardTitle>
          <CardValue>{categories.length - 1}</CardValue>
          <CardChange>Different focus areas</CardChange>
        </Card>
        <Card>
          <CardTitle>Organizations</CardTitle>
          <CardValue>{new Set(events.map(e => e.organization)).size}</CardValue>
          <CardChange>Active partners</CardChange>
        </Card>
        <Card>
          <CardTitle>Current Filter</CardTitle>
          <CardValue>{categoryFilter}</CardValue>
          <CardChange>{filteredEvents.length} opportunities</CardChange>
        </Card>
      </DashboardGrid>

      <ChartGrid>
        <FilterSection>
          <FilterTitle>Filter by Category:</FilterTitle>
          <CategoryButtons>
            {categories.map(category => (
              <CategoryButton
                key={category}
                selected={category === categoryFilter}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </CategoryButton>
            ))}
          </CategoryButtons>
        </FilterSection>

        <ChartCard fullWidth>
          <ChartTitle>Upcoming Volunteer Opportunities</ChartTitle>
          <CalendarWrapper>
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              eventPropGetter={eventStyleGetter}
              tooltipAccessor={event => `${event.title} - ${event.organization}`}
              date={calendarDate}
              onNavigate={date => setCalendarDate(date)}
              defaultView="month"
              views={['month', 'week', 'day']}
            />
          </CalendarWrapper>
        </ChartCard>

        <ChartCard fullWidth>
          <ChartTitle>Opportunity Locations</ChartTitle>
          <MapWrapper>
            <MapContainer
              center={[40.7128, -74.0060]} // NYC coordinates
              zoom={11}
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredEvents.map(event => (
                <Circle
                  key={event.id}
                  center={event.coordinates}
                  radius={500}
                  fillColor="#00b894"
                  fillOpacity={0.6}
                  stroke={false}
                />
              ))}
            </MapContainer>
          </MapWrapper>
        </ChartCard>

        <OpportunitiesList>
          <h2>Available Opportunities</h2>
          {filteredEvents.map(event => (
            <OpportunityCard key={event.id}>
              <OpportunityHeader>
                <OpportunityTitle>{event.title}</OpportunityTitle>
                <OpportunityType>{event.type}</OpportunityType>
              </OpportunityHeader>
              <OpportunityDetails>
                <OpportunityOrg>{event.organization}</OpportunityOrg>
                <OpportunityLocation>
                  <FiMapPin /> {event.location}
                </OpportunityLocation>
                <OpportunityDate>
                  <FiCalendar /> {moment(event.start).format('MMM DD, YYYY')}
                  {event.type === 'ongoing' && ' - Ongoing'}
                </OpportunityDate>
              </OpportunityDetails>
              <OpportunityDescription>{event.description}</OpportunityDescription>
              <SignUpButton href="#">View Details</SignUpButton>
            </OpportunityCard>
          ))}
        </OpportunitiesList>
      </ChartGrid>
    </>
  );
};

// Add these new styled components
const SettingsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SettingsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const SettingsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px;
`;

const SettingsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SettingsHeader = styled.h3`
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: #666;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00b894;
  }
`;

const UpdateButton = styled.button`
  background: #00b894;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background: #00a187;
  }
`;

const ToggleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ToggleLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
`;

const ToggleDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  position: relative;
  width: 50px;
  height: 24px;
  appearance: none;
  background-color: #ddd;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:checked {
    background-color: #00b894;
  }

  &:before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: white;
    top: 2px;
    left: 2px;
    transition: left 0.3s;
  }

  &:checked:before {
    left: 28px;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
`;

const CategoryChip = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  text-align: center;
  transition: all 0.3s ease;
  background-color: ${props => props.selected ? '#00b894' : '#f5f5f5'};
  color: ${props => props.selected ? 'white' : '#666'};

  &:hover {
    background-color: ${props => props.selected ? '#00a187' : '#e9ecef'};
  }
`;

const DaySelector = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const DayChip = styled.div`
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.selected ? '#00b894' : '#f5f5f5'};
  color: ${props => props.selected ? 'white' : '#666'};

  &:hover {
    background-color: ${props => props.selected ? '#00a187' : '#e9ecef'};
  }
`;

const HoursPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  input {
    width: 80px;
  }

  span {
    color: #666;
  }
`;

// Add these new styled components
const FilterSection = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 20px;
`;

const FilterTitle = styled.h3`
  margin-bottom: 12px;
  color: #333;
`;

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CategoryButton = styled.button`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.selected ? '#00b894' : '#f5f5f5'};
  color: ${props => props.selected ? 'white' : '#666'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.selected ? '#00a187' : '#e9ecef'};
  }
`;

const OpportunitiesList = styled.div`
  grid-column: 1 / -1;
  
  h2 {
    margin-bottom: 20px;
    color: #333;
  }
`;

const OpportunityCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const OpportunityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OpportunityTitle = styled.h3`
  font-size: 18px;
  color: #333;
`;

const OpportunityType = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background: #e9ecef;
  font-size: 12px;
  color: #666;
`;

const OpportunityDetails = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
`;

const OpportunityOrg = styled.div`
  font-weight: 500;
  color: #00b894;
`;

const OpportunityLocation = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
`;

const OpportunityDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
`;

const OpportunityDescription = styled.p`
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
`;

// Add this new component
const SocialContent = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: {
        name: 'Walter White',
        avatar: 'https://via.placeholder.com/40',
        role: 'Environmental Volunteer'
      },
      content: 'Just finished a beach cleanup with an amazing team! We collected over 200 pounds of trash. Every small action counts! 🌊♻️',
      image: 'https://via.placeholder.com/600x400',
      likes: 24,
      comments: [
        { id: 1, user: 'John Doe', content: 'Amazing work! When is the next cleanup?' },
        { id: 2, user: 'Emma Wilson', content: 'This is so inspiring! 👏' }
      ],
      timestamp: '2h ago'
    },
    {
      id: 2,
      user: {
        name: 'Mike Ermentraut',
        avatar: 'https://via.placeholder.com/40',
        role: 'Education Volunteer'
      },
      content: 'Today\'s tutoring session was incredible! Seeing students light up when they understand a concept is the best feeling. 📚✨',
      likes: 18,
      comments: [
        { id: 1, user: 'Lisa Chen', content: 'You\'re making such a difference!' }
      ],
      timestamp: '4h ago'
    }
  ]);

  const [activeTab, setActiveTab] = useState('feed');

  return (
    <SocialContainer>
      <SocialSidebar>
        <SidebarSection>
          <h3>Your Profile</h3>
          <ProfileStats>
            <StatItem>
              <StatValue>45</StatValue>
              <StatLabel>Hours</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>12</StatValue>
              <StatLabel>Events</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>89</StatValue>
              <StatLabel>Connections</StatLabel>
            </StatItem>
          </ProfileStats>
        </SidebarSection>

        <SidebarSection>
          <h3>Active Volunteers</h3>
          <ActiveUsersList>
            {[1, 2, 3, 4, 5].map(i => (
              <ActiveUser key={i}>
                <UserAvatar src={`https://via.placeholder.com/32`} alt="User" />
                <UserStatus online />
                <SocialUserName>Volunteer {i}</SocialUserName>
              </ActiveUser>
            ))}
          </ActiveUsersList>
        </SidebarSection>
      </SocialSidebar>

      <MainFeed>
        <FeedTabs>
          <TabButton 
            active={activeTab === 'feed'} 
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </TabButton>
          <TabButton 
            active={activeTab === 'events'} 
            onClick={() => setActiveTab('events')}
          >
            Events
          </TabButton>
          <TabButton 
            active={activeTab === 'groups'} 
            onClick={() => setActiveTab('groups')}
          >
            Groups
          </TabButton>
        </FeedTabs>

        <CreatePost>
          <PostInput placeholder="Share your volunteer experience..." />
          <PostActions>
            <PostButton>📷 Photo</PostButton>
            <PostButton>📍 Location</PostButton>
            <PostButton primary>Share</PostButton>
          </PostActions>
        </CreatePost>

        {posts.map(post => (
          <PostCard key={post.id}>
            <PostHeader>
              <SocialUserInfo>
                <UserAvatar src={post.user.avatar} alt={post.user.name} />
                <div>
                  <SocialUserName>{post.user.name}</SocialUserName>
                  <UserRole>{post.user.role}</UserRole>
                </div>
              </SocialUserInfo>
              <PostTime>{post.timestamp}</PostTime>
            </PostHeader>

            <PostContent>{post.content}</PostContent>
            {post.image && <PostImage src={post.image} alt="Post content" />}

            <SocialPostActions>
              <ActionButton>
                <FiHeart /> {post.likes} Likes
              </ActionButton>
              <ActionButton>
                <FiMessageSquare /> {post.comments.length} Comments
              </ActionButton>
              <ActionButton>
                <FiShare2 /> Share
              </ActionButton>
            </SocialPostActions>

            <CommentSection>
              {post.comments.map(comment => (
                <Comment key={comment.id}>
                  <CommentUser>{comment.user}</CommentUser>
                  <CommentContent>{comment.content}</CommentContent>
                </Comment>
              ))}
              <AddComment>
                <CommentInput placeholder="Write a comment..." />
                <CommentButton>Post</CommentButton>
              </AddComment>
            </CommentSection>
          </PostCard>
        ))}
      </MainFeed>

      <SocialSidebar right>
        <SidebarSection>
          <h3>Suggested Connections</h3>
          <SuggestedList>
            {[1, 2, 3].map(i => (
              <SuggestedUser key={i}>
                <UserInfo>
                  <UserAvatar src={`https://via.placeholder.com/32`} alt="User" />
                  <div>
                    <SocialUserName>Volunteer {i}</SocialUserName>
                    <UserRole>Environmental Volunteer</UserRole>
                  </div>
                </UserInfo>
                <ConnectButton>
                  <FiUserPlus /> Connect
                </ConnectButton>
              </SuggestedUser>
            ))}
          </SuggestedList>
        </SidebarSection>

        <SidebarSection>
          <h3>Upcoming Events</h3>
          <EventsList>
            {[1, 2, 3].map(i => (
              <SocialEventCard key={i}>
                <SocialEventDate>
                  <span>MAR</span>
                  <span>{10 + i}</span>
                </SocialEventDate>
                <EventInfo>
                  <SocialEventTitle>Beach Cleanup {i}</SocialEventTitle>
                  <SocialEventLocation>Santa Monica Beach</SocialEventLocation>
                </EventInfo>
              </SocialEventCard>
            ))}
          </EventsList>
        </SidebarSection>
      </SocialSidebar>
    </SocialContainer>
  );
};

// Add these styled components
const SocialContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  gap: 20px;
  margin: -20px;
  padding: 20px;
  min-height: calc(100vh - 80px);
`;

const SocialSidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
`;

const MainFeed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FeedTabs = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.active ? '#00b894' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#666'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.active ? '#00a187' : '#e9ecef'};
  }
`;

const CreatePost = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const PostInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00b894;
  }
`;

const PostActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PostButton = styled.button`
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.primary ? '#00b894' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#666'};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${props => props.primary ? '#00a187' : '#e9ecef'};
  }
`;

const PostCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const SocialUserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const PostTime = styled.div`
  font-size: 12px;
  color: #999;
`;

const PostContent = styled.p`
  color: #666;
  margin-bottom: 16px;
  line-height: 1.5;
`;

const PostImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const SocialPostActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background-color: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e9ecef;
  }
`;

const CommentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Comment = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CommentUser = styled.span`
  font-weight: 500;
  color: #00b894;
`;

const CommentContent = styled.p`
  color: #666;
  margin: 0;
`;

const AddComment = styled.div`
  display: flex;
  gap: 8px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00b894;
  }
`;

const CommentButton = styled.button`
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background-color: #00b894;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background-color: #00a187;
  }
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const ProfileStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 600;
  color: #333;
`;

const StatLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const ActiveUsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActiveUser = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserStatus = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.online ? '#00b894' : '#ff4757'};
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SocialEventCard = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SocialEventDate = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SocialEventTitle = styled.h3`
  font-size: 18px;
  color: #333;
`;

const SocialEventLocation = styled.div`
  font-size: 14px;
  color: #666;
`;

// Add these styled components with the other styled components
const SuggestedList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SuggestedUser = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: #f8f9fa;
`;

const ConnectButton = styled.button`
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  background-color: #00b894;
  color: white;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;

  &:hover {
    background-color: #00a187;
  }
`;

const EventInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

// Add the ChatbotContent component
const ChatbotContent = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hi! I\'m your volunteer assistant. I can help you find opportunities, answer questions, or guide you through the volunteering process. What would you like to know?',
      options: [
        'Find opportunities',
        'How to get started',
        'Track my hours',
        'Connect with others'
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (text) => {
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: text
    };

    const botResponse = {
      id: messages.length + 2,
      type: 'bot',
      content: getBotResponse(text),
      options: getOptionsForResponse(text)
    };

    setMessages([...messages, userMessage, botResponse]);
    setInputValue('');
  };

  const getBotResponse = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('find') || lowerText.includes('opportunities')) {
      return 'I can help you find volunteer opportunities! What type of volunteering interests you? (e.g., Environmental, Education, Community Service)';
    } else if (lowerText.includes('start')) {
      return 'Getting started is easy! First, update your profile with your interests and availability. Then, browse opportunities that match your preferences. Need help with any of these steps?';
    } else if (lowerText.includes('hours')) {
      return 'You can track your volunteer hours in the Dashboard. Would you like me to show you how to log your hours?';
    } else if (lowerText.includes('connect')) {
      return 'You can connect with other volunteers through our Community tab. You can join groups, participate in discussions, and find volunteer buddies!';
    }
    return 'I\'m here to help! Could you please be more specific about what you\'re looking for?';
  };

  const getOptionsForResponse = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('find') || lowerText.includes('opportunities')) {
      return ['Environmental', 'Education', 'Community Service', 'Healthcare', 'Other'];
    } else if (lowerText.includes('start')) {
      return ['Update profile', 'Browse opportunities', 'Get recommendations'];
    } else if (lowerText.includes('hours')) {
      return ['Log hours', 'View history', 'Generate report'];
    }
    return ['Find opportunities', 'How to get started', 'Track my hours', 'Connect with others'];
  };

  return (
    <ChatbotContainer>
      <ChatWindow ref={chatRef}>
        {messages.map(message => (
          <MessageContainer key={message.id} type={message.type}>
            <Message type={message.type}>
              {message.content}
            </Message>
            {message.options && (
              <OptionsContainer>
                {message.options.map((option, index) => (
                  <OptionButton
                    key={index}
                    onClick={() => handleSendMessage(option)}
                  >
                    {option}
                  </OptionButton>
                ))}
              </OptionsContainer>
            )}
          </MessageContainer>
        ))}
      </ChatWindow>
      <InputContainer>
        <ChatInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter' && inputValue.trim()) {
              handleSendMessage(inputValue.trim());
            }
          }}
        />
        <SendButton
          onClick={() => inputValue.trim() && handleSendMessage(inputValue.trim())}
        >
          Send
        </SendButton>
      </InputContainer>
    </ChatbotContainer>
  );
};

// Add these styled components for the chatbot
const ChatbotContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
`;

const ChatWindow = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.type === 'user' ? 'flex-end' : 'flex-start'};
  margin-bottom: 20px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  background-color: ${props => props.type === 'user' ? '#00b894' : '#f8f9fa'};
  color: ${props => props.type === 'user' ? 'white' : '#333'};
  margin-bottom: 8px;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const OptionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #00b894;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background-color: #00b894;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #00a187;
  }
`;

// Finally, wrap the App component with UserProvider
const App = () => {
  return (
    <Router>
      <UserProvider>
        <Dashboard />
      </UserProvider>
    </Router>
  );
};

export default App;
