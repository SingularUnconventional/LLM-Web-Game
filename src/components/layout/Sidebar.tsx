import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

// You can use an icon library like react-icons
// import { FaHome, FaUserFriends, FaPuzzlePiece, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav
        className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}
        data-open={isOpen}
      >
        <div className={styles.logo}>
          <NavLink to="/">마음의 우주</NavLink>
        </div>
        <ul className={styles.menu}>
          <li>
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) => (isActive ? styles.active : '')}
              onClick={onClose}
            >
              {/* <FaHome /> */}
              <span>대시보드</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/persona-collection"
              className={({ isActive }) => (isActive ? styles.active : '')}
              onClick={onClose}
            >
              {/* <FaUserFriends /> */}
              <span>캐릭터 카드</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/counseling"
              className={({ isActive }) => (isActive ? styles.active : '')}
              onClick={onClose}
            >
              {/* <FaPuzzlePiece /> */}
              <span>수시 상담</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/emotion-log"
              className={({ isActive }) => (isActive ? styles.active : '')}
              onClick={onClose}
            >
              {/* <FaPuzzlePiece /> */}
              <span>감정 기록</span>
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
      {isOpen && <div className={styles.overlay} onClick={onClose}></div>}{' '}
      {/* Overlay for closing sidebar */}
    </>
  );
};

export default Sidebar;
