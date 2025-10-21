'use client';

import { useState } from 'react';
import { useApiContext } from '@/context/ApiContext';

const ADMIN_PASSWORD = 'Pasword2026*-';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuthenticated } = useApiContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    
      setAuthenticated(true);
      setError('');
   
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-black">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-black">
            Enter the admin password to continue
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 text-center">
              <strong>Log in to the admin panel</strong>
            </p>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-black text-black bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm font-medium"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div> */}

          {/* {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )} */}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Access Admin Panel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
