"use client";
import React from 'react';
import ComingSoonChart from '../ComingSoonChart';

const SalesChart = ({ type = 'bar', ...props }) => {
    return <ComingSoonChart type={type} {...props} />;
};

export default SalesChart;
