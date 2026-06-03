import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Compass,
  HeartHandshake,
  Instagram,
  Mail,
  Map,
  MessageCircleHeart,
  Phone,
  Sprout,
  Sunrise,
  UserRound,
} from "lucide-react";
import wordmarkDarkSrc from "@/assets/brand/wordmark-dark.png";
import navMarkSrc from "@/assets/brand/nav-mark.png";
import { siteConfig } from "@/config/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Index,
});

const reveal: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

function Navbar({ showTestimonials }: { showTestimonials: boolean }) {
  const links = [
    { label: "Home", href: "#home" },
    { label: "About", href: "#about" },
    { label: "Coaching", href: "#coaching" },
    ...(showTestimonials ? [{ label: "Testimonials", href: "#testimonials" }] : []),
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#241f2f]/48 text-white shadow-[0_20px_80px_-58px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20">
        <a
          href="#home"
          className="flex min-w-0 shrink-0 items-center gap-3 text-white"
          aria-label={siteConfig.shortName}
        >
          <img
            src={navMarkSrc}
            alt=""
            className="h-9 w-auto max-w-[84px] shrink-0 object-contain sm:h-10 sm:max-w-[104px] lg:h-11 lg:max-w-[118px]"
            draggable={false}
          />
          <span className="brand-script hidden text-[1.65rem] font-normal leading-none text-[#fff8ea] drop-shadow-[0_0_18px_rgba(255,248,234,0.18)] sm:block lg:text-[2rem]">
            A&apos;New Dawn
          </span>
        </a>

        <div className="hidden items-center gap-7 text-sm font-semibold text-white/66 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <a
          href="/book"
          className="inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2.5 text-sm font-semibold text-[#312234] shadow-[0_16px_40px_-22px_rgba(255,235,190,0.8)] transition hover:-translate-y-0.5 hover:bg-[#ffe5b8]"
        >
          Book a Session
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </nav>
  );
}

function DawnScene() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.5,
  });
  const sunY = useTransform(smoothProgress, [0, 1], ["18vh", "-8vh"]);
  const skyOpacity = useTransform(smoothProgress, [0, 0.8], [1, 0.25]);
  const hillY = useTransform(smoothProgress, [0, 1], ["0vh", "10vh"]);
  const textY = useTransform(smoothProgress, [0, 1], ["0vh", "18vh"]);
  const textOpacity = useTransform(smoothProgress, [0, 0.72], [1, 0]);

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-[105vh] overflow-hidden bg-[#251f2d] pt-20 text-white"
    >
      <motion.div style={{ opacity: skyOpacity }} className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#211d31_0%,#5f4351_42%,#d98a5a_73%,#fff0cc_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,rgba(255,231,165,0.5),rgba(255,183,93,0.18)_23%,rgba(35,31,47,0)_58%)]" />
        <div className="absolute inset-0 opacity-40 bg-[linear-gradient(115deg,rgba(179,202,224,0.22),transparent_34%,rgba(238,173,184,0.18)_62%,transparent)]" />
      </motion.div>

      <motion.div
        style={{ y: hillY }}
        className="absolute inset-x-0 bottom-0 z-[1] h-[50vh] bg-[linear-gradient(180deg,transparent_0%,rgba(73,50,53,0.58)_22%,#302832_58%,#211d25_100%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-[18vh] z-[2] h-24 bg-[radial-gradient(ellipse_at_center,rgba(255,226,179,0.16),transparent_64%)] blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        style={{ y: sunY }}
        className="absolute left-1/2 top-[53%] z-[3] h-44 w-44 -translate-x-1/2 rounded-full bg-[#ffd880]/60 blur-sm shadow-[0_0_90px_35px_rgba(255,201,116,0.34),0_0_220px_90px_rgba(255,168,95,0.22)] sm:h-64 sm:w-64"
        aria-hidden="true"
      />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center px-4 pb-20 pt-12 sm:px-6"
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="w-full max-w-4xl pt-8"
        >
          <motion.h1
            variants={reveal}
            className="w-full max-w-6xl font-serif text-5xl font-medium leading-[1.08] tracking-normal text-white sm:text-6xl sm:leading-[1.04] lg:text-7xl xl:text-8xl"
          >
            <span className="block">Step out of the fog</span>
            <span className="block lg:whitespace-nowrap">
              and into{" "}
              <span className="text-[#fff8ea] drop-shadow-[0_0_26px_rgba(255,248,234,0.24)]">
                A'New Dawn.
              </span>
            </span>
          </motion.h1>
          <motion.p
            variants={reveal}
            className="mt-8 max-w-2xl text-lg leading-8 text-white/78 sm:text-xl"
          >
            Faith-centered coaching for emerging leaders, young adults, and women ready to rebuild
            identity, rediscover purpose, and turn clarity into aligned action.
          </motion.p>
          <motion.div variants={reveal} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-medium text-[#312234] shadow-[0_22px_80px_-26px_rgba(255,237,200,0.9)] transition hover:-translate-y-0.5 hover:bg-[#ffe5b8]"
            >
              Begin with a Session
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/10 px-7 py-4 font-medium text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/16"
            >
              Meet the Approach
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      className="mx-auto max-w-3xl text-center"
    >
      <motion.p variants={reveal} className="brand-kicker mb-4">
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={reveal}
        className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl"
      >
        {title}
      </motion.h2>
      <motion.div variants={reveal} className="mt-6 text-lg leading-8 text-muted-foreground">
        {children}
      </motion.div>
    </motion.div>
  );
}

function PainPoints() {
  const points = [
    "I know there is more in me, but I need clarity around who I am becoming.",
    "I want to move with purpose, but my next step still feels hidden.",
    "I need structure that helps me follow through when life gets loud.",
    "I want faith, identity, and practical action to finally work together.",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#251f2d] to-transparent opacity-25" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionIntro
          eyebrow="When purpose feels blurry"
          title="You do not have to force yourself into a future you cannot see yet."
        >
          <p>
            A'New Dawn helps you name what is true, renew your mindset, and build a clear path
            toward the person you are called to become.
          </p>
        </SectionIntro>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-4 md:grid-cols-2"
        >
          {points.map((point, index) => (
            <motion.div
              key={point}
              variants={reveal}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-white/62 p-7 shadow-[0_24px_70px_-45px_rgba(80,55,38,0.55)] backdrop-blur"
            >
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                {index + 1}
              </div>
              <p className="font-serif text-2xl leading-snug text-foreground">"{point}"</p>
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-[#e8a56b] to-accent opacity-40 transition group-hover:opacity-100" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function About() {
  const foundations = [
    {
      title: "Identity",
      text: "Rebuild the way you see yourself, your gifts, and the season you are in.",
    },
    {
      title: "Purpose",
      text: "Clarify your calling, your direction, and what your life is asking you to steward.",
    },
    {
      title: "Action",
      text: "Turn clarity into strategic steps, simple rhythms, and consistent follow-through.",
    },
  ];

  return (
    <section id="about" className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={{ opacity: 0, x: -36 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="aspect-[4/5] overflow-hidden rounded-[2rem] border border-primary/20 bg-[linear-gradient(145deg,#fff7e9,#efd7cd_42%,#d6ddee)] shadow-[0_35px_90px_-55px_rgba(72,46,35,0.65)]">
            <div className="flex h-full flex-col items-center justify-center px-10 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-white/55 text-primary shadow-sm">
                <UserRound className="h-10 w-10" />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary/70">
                Coach portrait placeholder
              </p>
              <p className="mt-5 max-w-xs text-sm leading-6 text-muted-foreground">
                Replace this with an approved brand portrait when ready.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={reveal} className="brand-kicker mb-4">
            About
          </motion.p>
          <motion.h2
            variants={reveal}
            className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl"
          >
            Where identity meets purpose, a new beginning becomes possible.
          </motion.h2>
          <motion.div
            variants={reveal}
            className="mt-8 space-y-6 text-lg leading-8 text-muted-foreground"
          >
            <p>
              A'New Dawn Coaching is for the person who senses there is more inside of them, but
              needs guidance, structure, and encouragement to step into it with peace.
            </p>
            <p>
              The work is faith-centered without being forced. We make room for honest reflection,
              mindset renewal, strategic clarity, and the kind of accountability that helps purpose
              become practical.
            </p>
          </motion.div>
          <motion.div variants={reveal} className="mt-9 grid gap-4 sm:grid-cols-3">
            {foundations.map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="brand-panel group rounded-2xl p-5 text-left transition hover:border-primary/35 hover:bg-white/92"
              >
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowRight className="h-4 w-4 -rotate-45 transition group-hover:translate-x-0.5" />
                </div>
                <h3 className="font-serif text-2xl leading-none text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Approach() {
  const steps = [
    {
      letter: "D",
      icon: Compass,
      title: "Discover",
      text: "We name what is true: your season, your pressure points, your gifts, and the identity you are rebuilding.",
    },
    {
      letter: "A",
      icon: Sprout,
      title: "Align",
      text: "We connect your faith, values, purpose, and priorities so your next steps stop feeling scattered.",
    },
    {
      letter: "W",
      icon: Sunrise,
      title: "Walk",
      text: "We build simple rhythms, reflection practices, and action plans that can hold up in real life.",
    },
    {
      letter: "N",
      icon: Map,
      title: "Navigate",
      text: "We keep refining the path with accountability, clarity worksheets, and strategic execution support.",
    },
  ];
  const fares = [
    {
      letter: "F",
      title: "Faith",
      text: "Start with spiritual grounding before rushing into decisions.",
    },
    {
      letter: "A",
      title: "Awareness",
      text: "Name the patterns, fears, and desires shaping the current season.",
    },
    {
      letter: "R",
      title: "Renewal",
      text: "Replace old narratives with truth, identity, and renewed perspective.",
    },
    {
      letter: "E",
      title: "Execution",
      text: "Turn clarity into simple actions, rhythms, and follow-through.",
    },
    {
      letter: "S",
      title: "Stewardship",
      text: "Keep tending the growth with accountability and reflection.",
    },
  ];

  return (
    <section id="coaching" className="relative overflow-hidden bg-[#fff7ed] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionIntro
          eyebrow="The Dawn Method"
          title="A framework for faith-aligned transformation."
        >
          <p>
            The process is structured on purpose. The depth comes from how identity, purpose, and
            action are walked out together.
          </p>
        </SectionIntro>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.title}
                variants={reveal}
                className="relative min-h-[340px] overflow-hidden rounded-2xl border border-primary/15 bg-background p-7 shadow-[0_30px_80px_-55px_rgba(75,50,35,0.65)]"
              >
                <div className="absolute right-6 top-4 font-serif text-8xl uppercase text-primary/8">
                  {step.letter}
                </div>
                <div className="relative z-10 mb-12 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="relative z-10 font-serif text-3xl text-foreground">{step.title}</h3>
                <p className="relative z-10 mt-5 leading-7 text-muted-foreground">{step.text}</p>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-14 rounded-2xl border border-primary/15 bg-background/80 p-6 shadow-[0_26px_80px_-60px_rgba(75,50,35,0.65)] sm:p-8"
        >
          <motion.div variants={reveal} className="mx-auto max-w-3xl text-center">
            <p className="brand-kicker mb-3">F.A.R.E.S. Method</p>
            <h3 className="font-serif text-3xl text-foreground sm:text-4xl">
              The inner rhythm beneath the Dawn Method.
            </h3>
          </motion.div>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {fares.map((item) => (
              <motion.div
                key={item.title}
                variants={reveal}
                className="rounded-xl border border-border/60 bg-white/62 p-4"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  {item.letter}
                </div>
                <h4 className="font-serif text-xl text-foreground">{item.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      title: "Free Discovery Call",
      icon: MessageCircleHeart,
    },
    {
      title: "Purpose Clarity Session",
      icon: Map,
    },
    {
      title: "Identity + Alignment Session",
      icon: HeartHandshake,
    },
    {
      title: "12-Week Transformation Program",
      icon: BookOpenText,
    },
  ];

  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionIntro eyebrow="Services" title="Choose the support your next chapter needs.">
          <p>
            Service names are listed here without public pricing. The right next step can be chosen
            through the booking flow or a direct conversation.
          </p>
        </SectionIntro>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <a
                key={service.title}
                href="/book"
                className="group rounded-2xl border border-border/60 bg-card p-7 shadow-[0_26px_70px_-52px_rgba(75,50,35,0.7)] transition duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-[0_32px_90px_-58px_rgba(75,50,35,0.82)]"
              >
                <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-full bg-accent/55 text-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl text-foreground">{service.title}</h3>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Book this option
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative overflow-hidden bg-[#241f2c] pb-32 pt-24 text-white sm:pb-40 sm:pt-32"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,214,142,0.16),transparent_45%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.p variants={reveal} className="brand-kicker mb-4">
            Testimonials
          </motion.p>
          <motion.h2
            variants={reveal}
            className="font-serif text-4xl font-medium leading-tight text-white sm:text-5xl"
          >
            Real stories will live here when clients are ready to share.
          </motion.h2>
          <motion.p variants={reveal} className="mt-6 text-lg leading-8 text-white/78">
            No invented praise, no placeholder success stories. This area is intentionally prepared
            for future approved testimonials.
          </motion.p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 grid gap-5 md:grid-cols-3"
        >
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              variants={reveal}
              className="rounded-2xl border border-white/14 bg-white/[0.075] p-7 backdrop-blur"
            >
              <div className="mb-10 h-2 w-20 rounded-full bg-white/28" />
              <p className="leading-7 text-white/78">Approved client testimonial placeholder.</p>
              <div className="mt-10 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/14" />
                <div>
                  <p className="text-sm font-medium text-white/88">Client</p>
                  <p className="text-xs text-white/62">Coming soon</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || ""),
      phone: String(formData.get("phone") || ""),
      message: String(formData.get("message") || ""),
    };

    const { error } = await supabase.from("contact_messages").insert([payload]);

    if (error) {
      setStatus("error");
      return;
    }

    form.reset();
    setStatus("success");
  };

  return (
    <section
      id="contact"
      className="relative z-10 scroll-mt-24 bg-background pt-36 pb-28 sm:pt-44 sm:pb-36"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr]">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.p variants={reveal} className="brand-kicker mb-4">
            Contact
          </motion.p>
          <motion.h2
            variants={reveal}
            className="font-serif text-4xl font-medium leading-tight text-foreground sm:text-5xl"
          >
            If your spirit is saying it is time, I would love to hear from you.
          </motion.h2>
          <motion.div variants={reveal} className="mt-8 space-y-4 text-muted-foreground">
            <p className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              {siteConfig.contactEmail}
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-primary" />
              {siteConfig.contactPhone}
            </p>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 transition hover:text-primary"
            >
              <Instagram className="h-5 w-5 text-primary" />
              @anewdawn.coaching
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.75 }}
          className="rounded-2xl border border-border/60 bg-card p-6 shadow-[0_34px_90px_-60px_rgba(75,50,35,0.8)] sm:p-8"
        >
          {status === "success" ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
              <CheckCircle2 className="mb-5 h-14 w-14 text-primary" />
              <h3 className="font-serif text-3xl text-foreground">Message sent</h3>
              <p className="mt-3 max-w-sm leading-7 text-muted-foreground">
                Thank you for reaching out. I will respond as soon as I can.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Name
                  <input
                    name="name"
                    required
                    className="mt-2 w-full rounded-xl border border-border bg-input/25 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="Your name"
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Email
                  <input
                    name="email"
                    required
                    type="email"
                    className="mt-2 w-full rounded-xl border border-border bg-input/25 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-foreground">
                Phone
                <input
                  name="phone"
                  type="tel"
                  className="mt-2 w-full rounded-xl border border-border bg-input/25 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="Optional"
                />
              </label>
              <label className="block text-sm font-medium text-foreground">
                Message
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="mt-2 w-full resize-none rounded-xl border border-border bg-input/25 px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                  placeholder="What would you like support with?"
                />
              </label>
              {status === "error" && (
                <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
              )}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-4 font-medium text-background transition hover:bg-primary disabled:opacity-50"
              >
                {status === "submitting" ? "Sending..." : "Send Message"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function FloatingCoachChat() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
          className="w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_28px_100px_-52px_rgba(36,31,44,0.8)]"
        >
          <div className="bg-[#241f2f] p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f6cf8d]">
              A'New Dawn assistant
            </p>
            <h3 className="mt-2 font-serif text-2xl text-[#fff8ea]">How can we help?</h3>
          </div>
          <div className="space-y-3 p-5">
            <p className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
              Welcome. You can start with the booking quiz, send a message, or visit Instagram for
              updates.
            </p>
            <a
              href="/book"
              className="flex items-center justify-between rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition hover:bg-primary"
            >
              Book a session
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Send a message
              <Mail className="h-4 w-4" />
            </a>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Instagram
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      )}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#241f2f] text-[#fff8ea] shadow-[0_22px_60px_-24px_rgba(36,31,44,0.85)] transition hover:-translate-y-0.5 hover:bg-primary"
        aria-label={open ? "Close A'New Dawn assistant" : "Open A'New Dawn assistant"}
      >
        <MessageCircleHeart className="h-6 w-6" />
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/70 bg-[#fffaf1] py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-primary">
          <Sunrise className="h-5 w-5" />
          <img
            src={wordmarkDarkSrc}
            alt={siteConfig.shortName}
            className="h-7 w-auto object-contain"
            draggable={false}
          />
        </div>
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function Index() {
  const [showTestimonials, setShowTestimonials] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "testimonials_enabled")
        .maybeSingle();

      setShowTestimonials(data?.value === "true");
    };

    void loadSettings();
  }, []);

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar showTestimonials={showTestimonials} />
      <DawnScene />
      <PainPoints />
      <About />
      <Approach />
      <Services />
      {showTestimonials && <Testimonials />}
      <Contact />
      <Footer />
      <FloatingCoachChat />
    </div>
  );
}
