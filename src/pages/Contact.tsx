import { motion } from "framer-motion";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";
import usePageMeta from "@/hooks/usePageMeta";

const Contact = () => {
  usePageMeta({
    title: "Contact | Runmania",
    description:
      "Contact Runmania for content corrections, partnership inquiries, privacy requests, and running shoe recommendation feedback.",
    canonicalPath: "/contact",
    keywords: "runmania contact, running shoe recommendation inquiry, contact@runmania.kr",
  });

  return (
    <main className="min-h-screen pt-14">
      <section className="border-b border-border px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2 text-primary">
            <MessageSquare className="h-5 w-5" />
            <span className="text-sm font-medium">Contact</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold">Contact Runmania</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            Runmania provides running shoe guides, review summaries, and free
            calculators for runners. Use this page for content corrections,
            advertising or partnership questions, privacy requests, and general
            feedback about the site.
          </p>
        </motion.div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-border bg-card p-6">
            <Mail className="mb-3 h-5 w-5 text-primary" />
            <h2 className="mb-2 text-base font-bold">Email</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Send inquiries to{" "}
              <a
                href="mailto:contact@runmania.kr"
                className="font-medium text-primary hover:underline"
              >
                contact@runmania.kr
              </a>
              . We review messages related to factual accuracy, product data,
              affiliate disclosures, and user privacy.
            </p>
          </article>

          <article className="rounded-xl border border-border bg-card p-6">
            <ShieldCheck className="mb-3 h-5 w-5 text-primary" />
            <h2 className="mb-2 text-base font-bold">Response Scope</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Runmania does not provide medical diagnosis or personalized injury
              treatment. If pain continues while running, consult a qualified
              medical or sports professional.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
};

export default Contact;
