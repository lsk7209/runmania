import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const sections = [
  {
    title: "1. Service Purpose",
    body: "Runmania publishes running shoe guides, product review summaries, calculators, and general running information for educational use.",
  },
  {
    title: "2. Content Accuracy",
    body: "We aim to keep information useful and current, but product specifications, prices, availability, and policies may change. Always confirm details with the seller or manufacturer before making a purchase.",
  },
  {
    title: "3. Health Disclaimer",
    body: "The site does not replace professional medical advice. Running discomfort, injury symptoms, or training concerns should be reviewed by a qualified professional.",
  },
  {
    title: "4. Advertising and Affiliate Links",
    body: "Some pages may contain advertisements or affiliate links. These placements do not override our editorial criteria, which are based on runner needs, product characteristics, and practical use cases.",
  },
  {
    title: "5. Contact",
    body: "For corrections, privacy requests, or site operation questions, contact us at contact@runmania.kr.",
  },
];

const Terms = () => {
  usePageMeta({
    title: "Terms of Use | Runmania",
    description:
      "Runmania terms of use covering educational content, product information, advertising disclosure, and contact details.",
    canonicalPath: "/terms",
    keywords: "runmania terms, terms of use, advertising disclosure",
  });

  return (
    <main className="min-h-screen pt-14">
      <section className="px-4 py-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2 text-primary">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">Terms</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold">Terms of Use</h1>
          <p className="mb-10 text-sm text-muted-foreground">
            Last updated: June 8, 2026
          </p>

          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="mb-3 text-base font-bold">{section.title}</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
};

export default Terms;
