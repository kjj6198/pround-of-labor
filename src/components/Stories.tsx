import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useReducedMotion } from "motion/react";
import {
  RiArrowRightUpLine,
  RiCloseLine,
  RiAddLine,
  RiSearchLine,
  RiMegaphoneLine,
  RiShieldCheckLine,
  RiScales3Line,
  RiHandHeartLine,
  RiMoneyDollarCircleLine,
  RiChatQuoteLine,
} from "@remixicon/react";
import archive from "../../data/stories.json";
import { Chapter } from "./Shared";

type Story = (typeof archive.items)[number];
const topics = {
  集體行動: { icon: RiMegaphoneLine, theme: "coral", word: "發聲" },
  職業安全: { icon: RiShieldCheckLine, theme: "olive", word: "平安" },
  制度改變: { icon: RiScales3Line, theme: "sand", word: "權利" },
  照顧與工作: { icon: RiHandHeartLine, theme: "sage", word: "照顧" },
  薪資與就業: { icon: RiMoneyDollarCircleLine, theme: "sand", word: "生活" },
  公共討論: { icon: RiChatQuoteLine, theme: "sage", word: "對話" },
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
  const { icon: Icon, word } = topicFor(story.category);
  const shared = (part: string) => (reduced ? undefined : `${part}-${story.id}`);
  return (
    <motion.div className="story-cover" layoutId={shared("cover")} style={{ borderRadius: 0 }}>
      <motion.div className="story-art" layoutId={shared("art")} aria-hidden="true">
        <svg className="story-art-word" viewBox="0 0 260 140">
          <text x="0" y="118">
            {word}
          </text>
        </svg>
        <Icon size={128} strokeWidth={0.25} />
        <span className="story-art-rule" />
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
      </motion.div>
      <span className="story-cover-footer" aria-hidden="true">
        <span>勞動紀事 ／ {story.date.slice(0, 4)}</span>
        {expanded ? "LABOR ARCHIVE" : <RiAddLine size={23} />}
      </span>
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
    const previous = siblings.map((element) => ({ element, inert: element.inert }));
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
          style={{ borderRadius: 18 }}
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
            <p className="story-deck">{story.summary}</p>
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
                  保留原稿的敘事與觀點；日期、數字及爭議的補充請見上方編輯註記與來源。
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
                  <p className="caption">
                    原圖署名：{story.original.imageCredit}。本版卡面為議題圖像。
                  </p>
                ) : null}
              </details>
            ) : null}
            <button className="story-done" onClick={close}>
              讀完了，回到故事集 <RiCloseLine size={16} />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>,
    document.body,
  );
}
export function Stories() {
  const [collection, setCollection] = useState("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(6);
  const [selected, setSelected] = useState<Story | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion() ?? false;
  const filtered = archive.items.filter(
    (story) =>
      (collection === "all" || story.collection === collection) &&
      `${story.title} ${story.category} ${story.date} ${story.summary} ${story.original?.title ?? ""} ${story.paragraphs.join(" ")} ${story.original?.text ?? ""}`.includes(
        query.trim(),
      ),
  );
  return (
    <section id="history" className="history-section">
      <div className="page-shell section">
        <Chapter
          number="04"
          english="NOTHING CAME FOR FREE"
          title="今天的權利，是一步步爭取來的。"
          description="從一場罷工，到一項制度。打開故事，讀見每一次改變背後的人。"
        />
        <div className="stories-toolbar">
          <div className="stories-filters" role="group" aria-label="故事範圍">
            {[
              { id: "all", label: "全部紀事", count: 31 },
              { id: "recent", label: "近年新增", count: 12 },
              { id: "original", label: "原作故事", count: 19 },
            ].map((filter) => (
              <button
                key={filter.id}
                aria-pressed={collection === filter.id}
                onClick={() => {
                  setCollection(filter.id);
                  setLimit(6);
                }}
              >
                {filter.label}
                <span>{filter.count}</span>
              </button>
            ))}
          </div>
          <label className="story-search">
            <RiSearchLine size={18} />
            <input
              type="search"
              aria-label="搜尋故事"
              placeholder="搜尋事件、年份或議題"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setLimit(6);
              }}
            />
          </label>
        </div>
        <p className="stories-count" aria-live="polite">
          {filtered.length} 則紀事・由近到遠{collection === "recent" ? "・2018–2026 更新範圍" : ""}
        </p>
        <MotionConfig
          reducedMotion="user"
          transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        >
          <LayoutGroup id="labor-stories">
            <ul className="story-grid">
              {filtered.slice(0, limit).map((story) => (
                <li key={story.id}>
                  <motion.button
                    aria-haspopup="dialog"
                    aria-label={`閱讀：${story.title}`}
                    className={`story-card story-theme-${topicFor(story.category).theme}`}
                    layoutId={reduced ? undefined : `card-${story.id}`}
                    style={{ borderRadius: 18 }}
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setSelected(story);
                    }}
                  >
                    <StoryCover story={story} reduced={reduced} />
                    <span className="story-card-summary">
                      {story.summary}
                      <RiArrowRightUpLine size={20} />
                    </span>
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
        {filtered.length === 0 ? (
          <p className="stories-empty">找不到符合的故事。試試「罷工」、「工安」或年份。</p>
        ) : null}
        {limit < filtered.length ? (
          <button className="stories-more" onClick={() => setLimit(limit + 6)}>
            再看 {Math.min(6, filtered.length - limit)} 則故事 <RiAddLine size={19} />
          </button>
        ) : null}
        <p className="stories-footnote">
          保留原作 19 則紀事，新增 12 則故事。卡面為議題圖像；完整原稿與日期更正可在故事內閱讀。
        </p>
      </div>
    </section>
  );
}
