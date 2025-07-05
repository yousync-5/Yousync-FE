import Link from "next/link";
import { PiFilmSlateBold } from "react-icons/pi";

export default function FooterContainer() {
  return (
    <>
      <hr className="m-0 border-neutral-800" />
      <footer className="w-full bg-neutral-950 text-neutral-200 border-t border-neutral-800">
        <div className="max-w-[1000px] mx-auto px-6 pt-8 pb-4">
          {/* 상단: 로고 & 사이트 소개 */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-4">
            <div className="mb-2 sm:mb-0" style={{ maxWidth: 140 }}>
              <Link href="/main" className="block">
                <PiFilmSlateBold
                  style={{ width: 100, height: 36, color: "#e11d48" }}
                  aria-label="YotuView Logo"
                />
              </Link>
            </div>
            <div id="web-name" className="flex-1 text-start">
              <h5 className="font-bold mb-1 text-white text-lg">YouSync</h5>
              <p className="text-neutral-400 text-[14px]">
                궁금했던 숏츠 영상, 이제 자유롭게 분석하세요!
              </p>
              <p className="mt-4 mb-0 text-neutral-200">
                <Link
                  href="https://github.com/"
                  target="_blank"
                  className="af-tag hover:text-red-400"
                >
                  깃허브
                </Link>
                {" | "}
                <Link
                  href="https://github.com/pvvng/youtube-comment/issues"
                  target="_blank"
                  className="af-tag hover:text-red-400"
                >
                  이슈 제보
                </Link>
                {" | "}
                <Link
                  href="/contact"
                  className="af-tag hover:text-red-400"
                >
                  이거 만든 사람들
                </Link>
              </p>
            </div>
          </div>

          {/* 하단: 정책/카피라이트/reCAPTCHA */}
          <div className="mt-5 flex flex-col sm:flex-row sm:justify-between gap-2 text-start items-end">
            <Link
              href="/privacy-policy"
              className="text-blue-400 text-sm hover:text-red-400"
            >
              개인정보 보호 정책(Privacy Policy)
            </Link>
            <p className="text-neutral-400 text-[13px] sm:text-right">
              © 2025를 강타할 사상 최고의 팀
            </p>
            <p className="text-neutral-500 text-[12px] sm:text-right">
              This site is protected by reCAPTCHA and the Google{" "}
              <Link
                href="https://policies.google.com/privacy"
                className="underline hover:text-red-400"
                target="_blank"
              >
                Privacy Policy
              </Link>
              {" "}and{" "}
              <Link
                href="https://policies.google.com/terms"
                className="underline hover:text-red-400"
                target="_blank"
              >
                Terms of Service
              </Link>
              {" "}apply.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
