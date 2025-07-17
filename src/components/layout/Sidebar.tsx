import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

// You can use an icon library like react-icons
// import { FaHome, FaUserFriends, FaPuzzlePiece, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <NavLink to="/">마음의 우주</NavLink>
      </div>
      <ul className={styles.menu}>
        <li>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : ''}>
            {/* <FaHome /> */}
            <span>홈</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/sessions" className={({ isActive }) => isActive ? styles.active : ''}>
            {/* <FaUserFriends /> */}
            <span>꿈 목록</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/emotions" className={({ isActive }) => isActive ? styles.active : ''}>
            {/* <FaPuzzlePiece /> */}
            <span>마음의 조각</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/welcome" className={({ isActive }) => isActive ? styles.active : ''}>
            {/* <FaUserFriends /> */}
            <span>새로운 연결</span>
          </NavLink>
        </li>
      </ul>
      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          {/* <FaSignOutAlt /> */}
          <span>로그아웃</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
