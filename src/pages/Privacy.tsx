import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const Privacy = () => {
  usePageMeta({
    title: "개인정보처리방침 | 런닝화매니아",
    description: "런닝화매니아의 개인정보처리방침입니다. 수집 정보, 이용 목적, 제3자 제공, 쿠키 정책 등을 안내합니다.",
    canonicalPath: "/privacy",
  });

  return (
    <main className="min-h-screen pt-14">
      <section className="px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">법적 고지</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
          <p className="text-sm text-muted-foreground mb-10">최종 업데이트: 2026년 5월 17일</p>

          <div className="space-y-10 text-sm leading-7 text-muted-foreground">

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">1. 수집하는 정보</h2>
              <p>런닝화매니아(이하 "사이트")는 다음 정보를 자동 수집할 수 있습니다:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>방문 페이지, 체류 시간, 유입 경로 (Google Analytics 4)</li>
                <li>브라우저 유형, 운영체제, 화면 해상도</li>
                <li>광고 노출·클릭 데이터 (Google AdSense)</li>
              </ul>
              <p className="mt-3">사이트는 회원 가입, 이름, 이메일, 전화번호 등 개인 식별 정보를 직접 수집하지 않습니다.</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">2. 정보 이용 목적</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>서비스 품질 개선 및 콘텐츠 최적화</li>
                <li>사이트 트래픽 분석 및 오류 진단</li>
                <li>관련성 높은 광고 제공</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">3. 제3자 서비스</h2>
              <p>사이트는 다음 제3자 서비스를 사용합니다:</p>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Google Analytics 4</strong> — 방문자 분석.
                  Google의 개인정보처리방침: <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>
                </li>
                <li>
                  <strong className="text-foreground">Google AdSense</strong> — 광고 게재.
                  맞춤 광고 설정: <a href="https://adssettings.google.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">4. 쿠키 및 유사 기술</h2>
              <p>
                Google Analytics·AdSense는 쿠키를 사용하여 방문자 행동을 분석하고 광고를 제공합니다.
                브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 기능이 제한될 수 있습니다.
              </p>
              <p className="mt-2">
                맞춤 광고를 원하지 않는 경우:
                <a href="https://optout.aboutads.info" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">aboutads.info 옵트아웃</a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">5. 데이터 보유 및 보안</h2>
              <p>
                사이트에서 직접 수집·저장하는 개인정보는 없습니다.
                제3자 서비스의 데이터 보유 기간은 각 서비스의 정책을 따릅니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">6. 아동 개인정보</h2>
              <p>
                사이트는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다.
                해당 정보가 수집된 사실을 발견하면 즉시 삭제 조치합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">7. 방침 변경</h2>
              <p>
                본 방침은 변경 시 이 페이지에 게시됩니다.
                중요한 변경의 경우 사이트 상단에 공지합니다.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-foreground mb-3">8. 문의</h2>
              <p>
                개인정보 관련 문의는 <strong className="text-foreground">contact@runmania.kr</strong> 로 연락해 주세요.
              </p>
            </section>

          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Privacy;
