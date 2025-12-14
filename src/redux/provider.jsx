'use client'; // <-- مهم جداً باش يخدم كـ Client Component

import { Provider } from 'react-redux';
import { store } from './store'; // استيراد الـ store لي صاوبناه

export default function ReduxProvider({ children }) {
  return <Provider store={store}>{children}</Provider>;
}