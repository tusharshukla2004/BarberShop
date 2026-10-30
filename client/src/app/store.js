import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
