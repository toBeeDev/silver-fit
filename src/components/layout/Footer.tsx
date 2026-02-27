import { Footer as FooterUI } from "@/components/ui/footer";
import { Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <FooterUI
      logo={
        <span className="logo-silver text-[19px] font-semibold tracking-[-0.02em]">
          SilverFit
        </span>
      }
      brandName=""
      socialLinks={[
        {
          icon: <Mail className="h-5 w-5" />,
          href: "mailto:bee.devlog@gmail.com",
          label: "이메일 문의",
        },
      ]}
      mainLinks={[
        { href: "/benefits", label: "복지혜택" },
        { href: "/insurance", label: "보험상품찾기" },
        { href: "https://www.bokjiro.go.kr", label: "복지로 바로가기" },
      ]}
      copyright={{
        text: "\u00A9 2026 SilverFit. All rights reserved.",
        license:
          "본 사이트는 복지혜택 정보를 안내하며, 실제 수급 자격은 해당 기관에 확인하시기 바랍니다.",
      }}
    />
  );
}
