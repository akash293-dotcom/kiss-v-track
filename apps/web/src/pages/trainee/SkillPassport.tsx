import React from 'react';
import { Card } from '../../components/ui/Card';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function SkillPassport() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-gradient-to-br from-indigo-50 to-teal-50 rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden">
        <div className="bg-indigo-900 text-white p-8 text-center border-b-4 border-teal-500">
          <h1 className="text-4xl font-bold tracking-widest uppercase">KISS SKILL PASSPORT</h1>
        </div>
        
        <div className="p-8">
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden border-2 border-indigo-200">
              <img src={user?.profilePhoto || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500 text-lg">ID: {user?.campusId || 'TRN-2023-442'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Verified Skills" className="border border-teal-100 bg-white/80 backdrop-blur">
              <ul className="space-y-3 mt-4">
                <li className="flex items-center text-gray-800 font-medium">
                  <CheckCircle2 className="text-teal-500 mr-2" /> Web Development Fundamentals
                </li>
                <li className="flex items-center text-gray-800 font-medium">
                  <CheckCircle2 className="text-teal-500 mr-2" /> React JS Advanced
                </li>
              </ul>
            </Card>

            <div className="space-y-6">
              <Card title="Achievements" className="border border-indigo-100 bg-white/80 backdrop-blur">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <p className="text-3xl font-bold text-indigo-700">12</p>
                    <p className="text-sm font-medium text-gray-600">Skills Verified</p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <p className="text-3xl font-bold text-teal-700">4</p>
                    <p className="text-sm font-medium text-gray-600">Products Created</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg col-span-2">
                    <p className="text-3xl font-bold text-yellow-700">2</p>
                    <p className="text-sm font-medium text-gray-600">Certificates Earned</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
