import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-synas-teal text-synas-ink">
      <div className="grain" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="pixel pixel--drift left-[8%] top-[18%]" />
        <span className="pixel pixel--soft left-[14%] top-[22%]" />
        <span className="pixel right-[11%] top-[16%]" />
        <span className="pixel pixel--soft pixel--drift right-[17%] top-[21%] [animation-delay:1.4s]" />
        <span className="pixel left-[6%] bottom-[20%]" />
        <span className="pixel pixel--soft left-[11%] bottom-[16%]" />
        <span className="pixel pixel--drift right-[8%] bottom-[18%] [animation-delay:2.2s]" />
        <span className="pixel pixel--soft right-[13%] bottom-[23%]" />
        <span
          className="absolute left-[22%] top-[12%] h-2 w-2 bg-synas-ink opacity-[0.14]"
          style={{ boxShadow: "10px 8px 0 rgba(10,10,10,0.1)" }}
        />
        <span
          className="absolute right-[20%] bottom-[14%] h-1.5 w-1.5 bg-synas-ink opacity-[0.16]"
          style={{ boxShadow: "-8px -6px 0 rgba(10,10,10,0.1)" }}
        />
      </div>

      <header className="relative z-10 px-6 pt-8 sm:px-10 sm:pt-10 md:px-14 md:pt-12">
        <Image
          src="/synas-wordmark.png"
          alt="Synas"
          width={475}
          height={136}
          priority
          className="h-7 w-auto sm:h-8 md:h-9"
        />
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 pt-8 text-center sm:px-10 md:px-14">
        <p className="max-w-[22rem] font-mono text-[clamp(1rem,3.2vw,1.35rem)] leading-snug font-medium tracking-tight text-synas-ink sm:max-w-none">
          <span className="mr-2 select-none text-synas-ink/35" aria-hidden="true">
            &gt;
          </span>
          We{"\u2019"}re Cooking. Stay Tuned.{" "}
          <span className="eyes-gaze" aria-hidden="true">👀</span>
          <span className="cursor-blink" aria-hidden="true" />
          <span className="sr-only">_</span>
        </p>

        <h1 className="mt-7 max-w-[18ch] font-mono text-[clamp(1.7rem,5.4vw,3.4rem)] leading-[1.15] font-medium tracking-tight text-synas-ink sm:mt-8 sm:max-w-[22ch]">
          Systems that move businesses.
        </h1>

        <p className="mt-7 max-w-[28rem] text-[0.95rem] leading-relaxed text-synas-ink/70 sm:mt-8 sm:text-base md:text-[1.05rem]">
          Synas Labs builds AI automation, CRM systems, and business software
          that turn manual workflows into connected systems.
        </p>
      </section>

      <footer className="relative z-10 px-6 pb-7 sm:px-10 md:px-14">
        <a
          href="mailto:hello@synaslabs.com"
          className="font-mono text-[10px] tracking-[0.12em] text-synas-ink/70 lowercase transition-colors hover:text-synas-ink sm:text-[11px]"
        >
          hello@synaslabs.com
        </a>
      </footer>
    </main>
  );
}
