import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { store } from "./index";

export const useAppDispatch = () => useDispatch();

export const useAppSelector = (selector, equalityFn = shallowEqual) => {
  return useSelector(selector, equalityFn);
};

export { store };
