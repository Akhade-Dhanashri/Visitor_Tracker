import React, { useState } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@ngo.org',
      role: 'Admin',
      status: 'Active',
    },
    {
      id: 2,
      name: 'Ramesh Gupta',
      email: 'ramesh@ngo.org',
      role: 'Guard',
      status: 'Active',
    },
    {
      id: 3,
      name: 'Sunita Rao',
      email: 'sunita@ngo.org',
      role: 'Guard',
      status: 'Active',
    },
    {
      id: 4,
      name: 'Anil Verma',
      email: 'anil@ngo.org',
      role: 'Guard',
      status: 'Inactive',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Guard',
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: users.length + 1,
      ...formData,
      status: 'Active',
    };
    setUsers([...users, newUser]);
    setFormData({ name: '', email: '', role: 'Guard' });
    setShowAddUserModal(false);
  };

  const toggleUserStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
          : user
      )
    );
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Manage system users and their roles</p>
        </div>
        <button
          className="add-user-btn"
          onClick={() => setShowAddUserModal(true)}
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
            {users.map((user) => (
              <tr key={user.id}>
                <td className="user-name">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="role-badge">
                    {user.role === 'Admin' ? '⚙️' : '👤'} {user.role}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-badge ${user.status.toLowerCase()}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn deactivate-btn"
                    onClick={() => toggleUserStatus(user.id)}
                  >
                    {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddUserModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="add-user-form">
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
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="Admin">Admin</option>
                  <option value="Guard">Security Guard</option>
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
                  Add User
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
