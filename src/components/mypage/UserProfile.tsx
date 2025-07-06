"use client";

interface User {
  name: string;
  email: string;
  avatar: string;
  level: number;
  totalPlays: number;
}

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="bg-neutral-900 rounded-2xl p-8 border border-neutral-800">
      <div className="flex flex-col items-center text-center">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-full border-4 border-blue-500 mb-4"
        />
        <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
        <p className="text-gray-400 text-sm mb-4">{user.email}</p>
        <div className="flex gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">Lv.{user.level}</div>
            <div className="text-xs text-gray-500">레벨</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{user.totalPlays}</div>
            <div className="text-xs text-gray-500">연습횟수</div>
          </div>
        </div>
      </div>
    </div>
  );
} 