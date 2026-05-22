"use client";
import React from 'react';
import ComingSoonChart from '../ComingSoonChart';

const StockChart = ({ type = 'area', ...props }) => {
    return <ComingSoonChart type={type} {...props} />;
};

export default StockChart;
