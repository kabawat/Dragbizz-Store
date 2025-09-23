export { authAxios, unauthAxios } from './config/axiosConfig';
export { authService } from './auth';
export { productService, storeService, customerService } from './retailer';

// Default export
import axiosConfig from './config/axiosConfig';
export default axiosConfig;
