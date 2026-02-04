import React, { useState } from 'react';
import { addVisitor } from '../api/api';
import '../styles/SecurityDashboard.css'; // Reusing styles for now

const AddVisitorModal = ({ onClose, onVisitorAdded, initialData = {} }) => {
    const [formData, setFormData] = useState({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        mobile: initialData.mobile || '',
        email: initialData.email || '',
        organisation: initialData.organisation || '',
        visitorType: initialData.visitorType || 'Parent',
        purpose: initialData.purpose || '',
    });

    const handleFormChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                phone: formData.mobile,
                purpose: formData.purpose,
                company: formData.organisation,
                host_name: formData.visitorType,
            };
            const newVisitor = await addVisitor(apiData);
            onVisitorAdded(newVisitor);
            alert('Visitor added successfully!');
            onClose();
        } catch (error) {
            console.error('Error adding visitor:', error);
            alert('Error adding visitor: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Visitor</h2>
                    <p>Fill in the visitor details</p>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="visitor-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>First Name *</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => handleFormChange('firstName', e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name *</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => handleFormChange('lastName', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mobile Number *</label>
                        <input
                            type="tel"
                            value={formData.mobile}
                            onChange={(e) => handleFormChange('mobile', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleFormChange('email', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Organisation</label>
                        <input
                            type="text"
                            value={formData.organisation}
                            onChange={(e) => handleFormChange('organisation', e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Visitor Type *</label>
                        <select
                            value={formData.visitorType}
                            onChange={(e) => handleFormChange('visitorType', e.target.value)}
                        >
                            <option value="Parent">Parent</option>
                            <option value="Donor">Donor</option>
                            <option value="Trustee">Trustee</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Purpose of Visit *</label>
                        <input
                            type="text"
                            value={formData.purpose}
                            onChange={(e) => handleFormChange('purpose', e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
                            Add Visitor
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVisitorModal;
