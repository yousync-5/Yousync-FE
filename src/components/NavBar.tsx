import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'

export const NavBar: React.FC = () => {
  const router = useRouter()

  const handleProfileClick = () => {
    // 회원가입 구현 전까지 임시 리디렉트
    router.push('/mypage/1')
  }

  const handleLogoClick = () => {
    router.push('/')
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-neutral-950 flex items-center justify-between px-6 py-4 z-50">
      <div className="mx-auto text-center">
        <h1 
        onClick={handleLogoClick}
        className="text-red-600 text-3xl font-extrabold cursor-pointer">YOUSYNC</h1>
        <p className="text-xs tracking-wider text-white">SLOGAN HERE</p>
      </div>

      <div
        onClick={handleProfileClick}
        className="
          absolute right-6 top-1/2 -translate-y-1/2
          cursor-pointer
          transition-transform duration-200 ease-in-out
          hover:scale-110 hover:opacity-80 >
        "
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white">
          <Image
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSH2OhGS1FmftYMFPrLoBs4tYq_RudCwMjFJul37rVJsE-apHzj50DWZVrDZmOBGgtwAew&usqp=CAU"
            alt="프로필 이미지"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </header>
  )
}
