import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './baseApi';
import uiReducer from '@/features/ui/uiSlice';
import bookingDraftReducer from '@/features/booking/bookingDraftSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    bookingDraft: bookingDraftReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export default store;
