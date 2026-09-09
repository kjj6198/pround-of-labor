import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import { RiArrowRightUpLine, RiCloseLine } from "@remixicon/react";
import archive from "../../data/stories.json";
import { Chapter } from "./Shared";

type Story = (typeof archive.items)[number];
const selectedStoryIds = new Set([
  "delivery-2026",
  "minimum-2024",
  "mingyang-2023",
  "labor-court-2020",
  "original-12",
  "original-13",
  "original-10",
  "original-06",
  "original-04",
  "original-02",
]);
const selectedStories = archive.items.filter((story) => selectedStoryIds.has(story.id));
const topics = {
  集體行動: { theme: "coral" },
  職業安全: { theme: "olive" },
  制度改變: { theme: "sand" },
  照顧與工作: { theme: "sage" },
  薪資與就業: { theme: "sand" },
  公共討論: { theme: "sage" },
};
function topicFor(category: string) {
  return Object.entries(topics).find(([name]) => name === category)?.[1] ?? topics.制度改變;
}
function StoryCover({
  story,
  expanded = false,
  reduced,
}: {
  story: Story;
  expanded?: boolean;
  reduced: boolean;
}) {
  const shared = (part: string) => (reduced ? undefined : `${part}-${story.id}`);
  return (
    <motion.div className="story-cover" layoutId={shared("cover")} style={{ borderRadius: 0 }}>
      <motion.div className="story-art" layoutId={shared("art")} aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}illustrations/${story.illustration}.webp`}
          alt=""
          width="1536"
          height="1024"
          loading={expanded ? "eager" : "lazy"}
          decoding="async"
        />
      </motion.div>
      <motion.div
        className="story-title"
        layoutId={shared("title")}
        layout={reduced ? false : "position"}
      >
        <div className="story-meta">
          <time dateTime={story.date.includes("–") ? undefined : story.date}>
            {story.date.replaceAll("-", ".")}
          </time>
          <span>{story.category}</span>
        </div>
        {expanded ? <h2 id={`story-title-${story.id}`}>{story.title}</h2> : <h3>{story.title}</h3>}
        <p className="text-xs">{story.summary}</p>
      </motion.div>
    </motion.div>
  );
}
function ReadingPanel({
  story,
  close,
  reduced,
  trigger,
}: {
  story: Story;
  close: () => void;
  reduced: boolean;
  trigger: HTMLButtonElement | null;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const onClose = useRef(close);
  onClose.current = close;
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const oldPadding = document.body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const siblings = Array.from(document.body.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== layer.current,
    );
    const previous = siblings.map((element) => ({
      element,
      inert: element.inert,
    }));
    for (const { element } of previous) element.inert = true;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    closeButton.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose.current();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        panel.current?.querySelectorAll<HTMLElement>('a[href],button,summary,[tabindex="0"]') ?? [],
      ).filter(
        (element) => element.getClientRects().length > 0 && !element.hasAttribute("disabled"),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (
        event.shiftKey &&
        (document.activeElement === first || document.activeElement === panel.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = oldOverflow;
      document.body.style.paddingRight = oldPadding;
      for (const { element, inert } of previous) element.inert = inert;
      trigger?.focus({ preventScroll: true });
    };
  }, [trigger]);
  return createPortal(
    <div ref={layer} className="story-layer">
      <motion.div
        className="story-overlay"
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={close}
      />
      <motion.div className="story-modal-shell" layoutRoot>
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`story-title-${story.id}`}
          tabIndex={-1}
          className={`story-modal story-theme-${topicFor(story.category).theme}`}
          layoutId={reduced ? undefined : `card-${story.id}`}
          layoutScroll
          style={{ borderRadius: 6 }}
          initial={reduced ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduced ? 0 : 1 }}
        >
          <button ref={closeButton} className="story-close" aria-label="關閉故事" onClick={close}>
            <RiCloseLine size={23} />
          </button>
          <StoryCover story={story} expanded reduced={reduced} />
          <motion.div
            className="story-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            transition={{ duration: 0.2, delay: reduced ? 0 : 0.12 }}
          >
            {story.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
            {story.note ? (
              <aside className="story-correction">
                <strong>編輯註記</strong>
                <p>{story.note}</p>
              </aside>
            ) : null}
            <div className="story-references">
              <h3>資料來源</h3>
              <ul>
                {story.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                      <RiArrowRightUpLine size={15} />
                    </a>
                  </li>
                ))}
              </ul>
              <p>查核日期：{archive.checkedAt}</p>
            </div>
            {story.original ? (
              <details className="original-story">
                <summary>閱讀原作全文</summary>
                <p className="original-notice">
                  以下保留原文。日期與數字的更正，請見上方編輯註記。
                </p>
                <p className="caption">
                  原標題：{story.original.title}
                  <br />
                  原日期：{story.original.date}
                </p>
                {story.original.text.split(/\n\s*\n/).map((text) => (
                  <p key={text}>{text}</p>
                ))}
                {story.original.imageCredit ? (
                  <p className="caption">原圖署名：{story.original.imageCredit}</p>
                ) : null}
              </details>
            ) : null}
            <button className="story-done" onClick={close}>
              回到故事列表 <RiCloseLine size={16} />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}
export function Stories() {
  const [selected, setSelected] = useState<Story | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion() ?? false;
  return (
    <section id="history" className="history-section">
      <div className="page-shell section">
        <Chapter
          number="05"
          english="LABOR HISTORY"
          title="罷工、職災與勞動法，台灣走過的路。"
          description="精選十件改變台灣勞動制度與工作現場的重要事件。點開卡片可閱讀全文及資料來源。"
        />
        <MotionConfig
          reducedMotion="user"
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        >
          <LayoutGroup id="labor-stories">
            <ul className="story-grid">
              {selectedStories.map((story) => (
                <li key={story.id}>
                  <motion.button
                    aria-haspopup="dialog"
                    aria-label={`閱讀：${story.title}`}
                    className={`story-card story-theme-${topicFor(story.category).theme}`}
                    layoutId={reduced ? undefined : `card-${story.id}`}
                    style={{ borderRadius: 6 }}
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setSelected(story);
                    }}
                  >
                    <StoryCover story={story} reduced={reduced} />
                  </motion.button>
                </li>
              ))}
            </ul>
            <AnimatePresence>
              {selected ? (
                <ReadingPanel
                  key={selected.id}
                  story={selected}
                  close={() => setSelected(null)}
                  reduced={reduced}
                  trigger={trigger.current}
                />
              ) : null}
            </AnimatePresence>
          </LayoutGroup>
        </MotionConfig>
        <p className="stories-footnote">
          從完整資料中精選十則台灣勞動紀事。插畫由 GPT Image
          依議題生成，並非事件現場紀錄。原文與更正說明收在各篇內。
        </p>
      </div>
    </section>
  );
}
