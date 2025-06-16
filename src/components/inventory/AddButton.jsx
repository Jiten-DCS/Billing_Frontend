import React from 'react';

const AddButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
        height: '2rem',
        padding: '0 0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid #d1d5db',
        backgroundColor: 'transparent',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: '0.875rem' }}>+</span>
      <span>Add</span>
    </button>
  );
};

export default AddButton;