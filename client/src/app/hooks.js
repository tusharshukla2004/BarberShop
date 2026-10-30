import { useDispatch, useSelector } from 'react-redux';

/**
 * Pre-typed dispatch hook for the Redux store
 * @returns {import('@reduxjs/toolkit').ThunkDispatch<any, any, any>}
 */
export const useAppDispatch = () => useDispatch();

/**
 * Pre-typed selector hook for the Redux store
 * @template T
 * @param {(state: any) => T} selector
 * @returns {T}
 */
export const useAppSelector = useSelector;
