"use client";
import React from 'react';
import ComingSoonChart from '../ComingSoonChart';

const BillsChart = ({ type = 'line', ...props }) => {
    return <ComingSoonChart type={type} {...props} />;
};

export default BillsChart;
