import React from 'react'
import Image from 'next/image'
export const NavBar = () => {
    return (
        <header className="fixed top-0 left-0 w-full bg-neutral-950 flex items-center justify-between px-6 py-4 z-50">
          {/* 가운데 로고 & 슬로건 */}
          <div className="mx-auto text-center">
            <h1 className="text-red-600 text-3xl font-extrabold">YOUSYNC</h1>
            <p className="text-xs tracking-wider text-white">SLOGAN HERE</p>
          </div>
    
          {/* 우측 프로필 아이콘 */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white">
              <Image src="/profile.jpg" alt="profile" width={40} height={40} />
            </div>
          </div>
        </header>
      );
}
