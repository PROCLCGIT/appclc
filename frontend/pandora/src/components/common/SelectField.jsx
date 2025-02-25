// src/components/common/SelectField.jsx
import { forwardRef } from 'react';
import PropTypes from 'prop-types';


const SelectField = forwardRef(({ 
  className, 
  children,
  ...props 
}, ref) => {
  return (
    <select
      className={`w-full rounded-md border border-gray-300 py-2 px-3 ${className || ''}`}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  );
});

SelectField.displayName = 'SelectField';
SelectField.propTypes = {
    className: PropTypes.string,
    children: PropTypes.node.isRequired,
  };

export default SelectField;