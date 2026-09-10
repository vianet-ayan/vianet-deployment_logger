'use client'; // Required if using Next.js App Router

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTest as setUserTest } from '@/adminstore/slices/userSlice';
import { setTest as setSettingsTest } from '@/adminstore/slices/settingsSlice'; // Adjust path if needed

export default function Inventory() {
  const [userInputValue, setUserInputValue] = useState('');
  const [settingsInputValue, setSettingsInputValue] = useState('');

  const dispatch = useDispatch();

  // 1. Get current values right now from Redux
  const currentUserTest = useSelector((state: any) => state.user?.test);
  const currentSettingsTest = useSelector((state: any) => state.settings?.test);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Update user test if entered
    if (userInputValue.trim()) {
      dispatch(setUserTest(userInputValue));
      setUserInputValue('');
    }

    // Update settings test if entered
    if (settingsInputValue.trim()) {
      dispatch(setSettingsTest(settingsInputValue));
      setSettingsInputValue('');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <div className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Inventory Test Panel</h1>

        {/* 🟢 CURRENT VALUES SECTION */}
        <div className="flex flex-col gap-2 rounded-lg bg-slate-100 p-4 border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Current Values in Redux:
          </span>

          <div className="text-sm">
            <span className="font-semibold text-gray-700">Current User Test: </span>
            <span className="font-mono text-blue-600 font-bold">
              {currentUserTest || '(empty)'}
            </span>
          </div>

          <div className="text-sm">
            <span className="font-semibold text-gray-700">Current Settings Test: </span>
            <span className="font-mono text-green-600 font-bold">
              {currentSettingsTest || '(empty)'}
            </span>
          </div>
        </div>

        {/* 📝 INPUT FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Input 1: User Test */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">
              New User Test Value:
            </label>
            <input
              type="text"
              value={userInputValue}
              onChange={(e) => setUserInputValue(e.target.value)}
              placeholder={`Current: ${currentUserTest || 'None'}`}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Input 2: Settings Test */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600">
              New Settings Test Value:
            </label>
            <input
              type="text"
              value={settingsInputValue}
              onChange={(e) => setSettingsInputValue(e.target.value)}
              placeholder={`Current: ${currentSettingsTest || 'None'}`}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-2 w-full rounded-md bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            Update Redux Values
          </button>
        </form>
      </div>
    </div>
  );
}