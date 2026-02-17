"use client";
import React from 'react';
import ComingSoonChart from '../ComingSoonChart';

const CustomersChart = ({ type = 'line', ...props }) => {
    return <ComingSoonChart type={type} {...props} />;
};

export default CustomersChart;
