"use client";
import React from 'react';
import ComingSoonChart from '../ComingSoonChart';

const SuppliersChart = ({ type = 'multi-line', ...props }) => {
    return <ComingSoonChart type={type} {...props} />;
};

export default SuppliersChart;
