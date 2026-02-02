import React, { useState, useEffect } from 'react';
import { getUsers, addUser, updateUser, toggleUserStatus, deleteUser } from '../api/api';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'security',
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitialFormData = () => ({
    name: '',
    email: '',
    password: '',
    role: 'security',
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(getInitialFormData());
    setShowAddUserModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Leave empty to keep unchanged
      role: user.role,
    });
    setShowAddUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Update existing user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateUser(editingUser.id, updateData);

        // Refresh list to get updated data
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updateData } : u));
        alert('User updated successfully!');
      } else {
        // Create new user
        const newUser = await addUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        setUsers([newUser, ...users]); // Add to top
        alert('User created successfully!');
      }

      setFormData(getInitialFormData());
      setShowAddUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const updatedUser = await toggleUserStatus(userId);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, status: updatedUser.status } : user
        )
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user: ' + error.message);
      }
    }
  };

  if (loading) {
    return <div className="user-management"><p>Loading users...</p></div>;
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage system users and their roles</p>
        </div>
        <button
          className="add-user-btn"
          onClick={openAddModal}
        >
          👤 Add User
        </button>
      </div>

      <div className="users-container">
        <div className="section-header">
          <h2>System Users</h2>
          <p>All registered users and their access levels</p>
        </div>

        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="user-name">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="role-badge">
                      {user.role === 'admin' ? '⚙️ Admin' : '👤 Security Guard'}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${(user.status || 'Active').toLowerCase()}`}
                    >
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="action-btn deactivate-btn"
                      onClick={() => handleToggleUserStatus(user.id)}
                    >
                      {(user.status || 'Active') === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(user)}
                      style={{ backgroundColor: '#2563EB', color: 'white', marginRight: '5px', marginLeft: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      style={{ backgroundColor: '#ff4444', color: 'white' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Edit User' : 'Add New User'}</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="add-user-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter user's full name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password (min 8 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required={!editingUser}
                  minLength={8}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="security">Security Guard</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
