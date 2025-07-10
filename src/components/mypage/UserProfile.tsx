import { User } from "@/types/MypageType";

export default function UserProfile({ user }: { user: User }) {
  return (
    <div className="h-[24em] flex flex-col items-center justify-between bg-neutral-900 rounded-2xl shadow-lg p-8">
      <img
        src={user.avatar}
        alt={user.name}
        className="w-28 h-28 rounded-full border-4 border-blue-500 object-cover shadow-lg"
      />
      <div className="text-center">
        <div className="text-2xl font-extrabold mt-4 text-white drop-shadow-[0_1px_6px_rgba(0,255,128,0.25)]">{user.name}</div>
        <div className="text-neutral-400 text-sm">{user.email}</div>
      </div>
      <div className="flex gap-8 mt-4">
        <div>
          <span className="text-blue-400 font-extrabold text-xl drop-shadow-[0_1px_6px_rgba(0,128,255,0.25)]">Lv.{user.level}</span>
          <div className="text-xs text-neutral-400">레벨</div>
        </div>
        <div>
          <span className="text-green-400 font-extrabold text-xl drop-shadow-[0_1px_6px_rgba(0,255,128,0.25)]">{user.totalPlays}</span>
          <div className="text-xs text-neutral-400">연습횟수</div>
        </div>
      </div>
    </div>
  );
} 