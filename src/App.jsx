import { useState, useEffect, useRef } from "react";

const SUBJECTS = ["算数", "国語", "理科", "社会"];
const SUBJECT_COLORS = { 算数: "#FF6B6B", 国語: "#4ECDC4", 理科: "#45B7D1", 社会: "#96CEB4" };
const SUBJECT_ICONS = { 算数: "🔢", 国語: "📖", 理科: "🔬", 社会: "🌍" };
const TIME_SLOTS = ["朝", "夜"];
const SCALE_LABELS = {
  体調: ["😴", "😔", "😐", "🙂", "😄"],
  気持ち: ["😭", "😢", "😐", "😊", "🥰"],
  自信度: ["😰", "😟", "😐", "😌", "💪"],
  姿勢: ["😴", "😔", "😐", "🙂", "🌟"],
  気持ち_parent: ["😮‍💨", "😟", "😐", "😊", "😁"],
};
const HAMSTER_MOODS = ["😴", "🐹", "😊🐹", "🐹✨", "🏆🐹"];

const DAILY_CHECKS = [
  { key: "meal", label: "ご飯を楽しく食べれた", icon: "🍚" },
  { key: "sleep", label: "よく寝た", icon: "😴" },
  { key: "book", label: "本読めた", icon: "📚" },
  { key: "rest", label: "テレビ・ゲーム休憩", icon: "🎮" },
  { key: "talk", label: "家族とおしゃべり", icon: "💬" },
];

// ハムスターの習性を活かしたランダムコメント
const OMOCHI_MESSAGES = [
  "ぼくも今日は回し車を全力でがんばったよ！きみもいっしょにがんばろう🐾",
  "ハムスターはね、毎日こつこつ走るのが得意なんだ。きみもそうだよ！✨",
  "ほっぺに食べ物をためるみたいに、知識もどんどんためていこう📚",
  "ぼく、昨日も回し車で10キロ走ったよ！きみの勉強もすごいね🏃",
  "ハムスターは夜行性だけど、きみは朝も夜もがんばってるね！えらい🌟",
  "ぼくのほっぺたみたいに、頭の中にいっぱい詰め込んでいこう💡",
  "今日も巣作り（勉強）お疲れさま！少しずつ積み上げていこうね🏠",
  "回し車って止まらないけど、きみの努力もそれと同じだよ！🔄",
  "ぼくも今日は新しいルートを探検したよ。きみも新しい問題に挑戦！🗺️",
  "ハムスターの歯は一生伸び続けるんだよ。きみの力も伸び続けてるね🦷✨",
  "寒い日も回し車をがんばるぼくを見習って、今日もファイト！❄️🐹",
  "ほっぺたパンパンになるまで詰め込んだよ！きみも知識をパンパンに！😄",
];

function getOmochiMessage(streak, totalDays) {
  if (streak >= 7) return "すごい！" + streak + "日連続だ！ぼくの回し車より速いかも！🏆🐹";
  if (streak >= 3) return streak + "日連続！ぼくも負けずに回し車がんばるよ！🔥";
  if (totalDays === 0) return "はじめまして！おもちだよ🐹 いっしょにがんばろうね！";
  // 時間帯によってメッセージを変える + ランダム
  const idx = Math.floor(Date.now() / (1000 * 60 * 60)) % OMOCHI_MESSAGES.length;
  return OMOCHI_MESSAGES[idx];
}

// ---- UI コンポーネント ----

function ScaleSelector({ label, value, onChange, scaleKey, color = "#FF8C42" }) {
  const icons = SCALE_LABELS[scaleKey] || SCALE_LABELS["気持ち"];
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {icons.map((icon, i) => (
          <button key={i} onClick={() => onChange(i + 1)} style={{
            width: 48, height: 48, borderRadius: 12,
            border: value === i + 1 ? `3px solid ${color}` : "2px solid #e8e0d5",
            background: value === i + 1 ? color + "18" : "#FAFAF8",
            fontSize: 22, cursor: "pointer", transition: "all 0.15s",
            transform: value === i + 1 ? "scale(1.15)" : "scale(1)",
            boxShadow: value === i + 1 ? `0 4px 12px ${color}44` : "none",
          }}>{icon}</button>
        ))}
      </div>
    </div>
  );
}

function StudyTimeButton({ minutes, onChange }) {
  const totalHours = Math.floor(minutes / 60);
  const totalMins = minutes % 60;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 600 }}>勉強時間</div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{
          background: "linear-gradient(135deg, #FF8C42, #FF6B6B)", borderRadius: 16,
          padding: "12px 20px", color: "white", fontSize: 28, fontWeight: 800,
          minWidth: 100, textAlign: "center", boxShadow: "0 4px 16px rgba(255,107,107,0.4)",
        }}>
          {totalHours > 0 ? `${totalHours}h ` : ""}{totalMins}分
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onChange(Math.max(0, minutes - 15))} style={{
            width: 44, height: 44, borderRadius: 12, border: "none",
            background: "#f0ece6", fontSize: 20, cursor: "pointer", fontWeight: 700, color: "#888",
          }}>−</button>
          <button onClick={() => onChange(minutes + 15)} style={{
            width: 44, height: 44, borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #FF8C42, #FFB347)",
            fontSize: 20, cursor: "pointer", fontWeight: 700, color: "white",
            boxShadow: "0 2px 8px rgba(255,140,66,0.4)",
          }}>＋</button>
        </div>
        <div style={{ fontSize: 12, color: "#aaa" }}>15分単位で追加</div>
      </div>
    </div>
  );
}

function SubjectSelector({ selected, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 600 }}>勉強した科目（複数OK）</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SUBJECTS.map((s) => (
          <button key={s}
            onClick={() => onChange(selected.includes(s) ? selected.filter((x) => x !== s) : [...selected, s])}
            style={{
              padding: "8px 16px", borderRadius: 20,
              border: selected.includes(s) ? `2px solid ${SUBJECT_COLORS[s]}` : "2px solid #e8e0d5",
              background: selected.includes(s) ? SUBJECT_COLORS[s] + "22" : "#FAFAF8",
              color: selected.includes(s) ? SUBJECT_COLORS[s] : "#999",
              fontWeight: selected.includes(s) ? 700 : 400, cursor: "pointer", fontSize: 14,
              transition: "all 0.15s", transform: selected.includes(s) ? "scale(1.05)" : "scale(1)",
            }}
          >{SUBJECT_ICONS[s]} {s}</button>
        ))}
      </div>
    </div>
  );
}

function TimeSlotSelector({ value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 8, fontWeight: 600 }}>勉強した時間帯</div>
      <div style={{ display: "flex", gap: 8 }}>
        {TIME_SLOTS.map((slot) => (
          <button key={slot} onClick={() => onChange(slot)} style={{
            padding: "10px 24px", borderRadius: 20,
            border: value === slot ? "2px solid #FF8C42" : "2px solid #e8e0d5",
            background: value === slot ? "#FFF3E8" : "#FAFAF8",
            color: value === slot ? "#FF8C42" : "#999",
            fontWeight: value === slot ? 700 : 400, cursor: "pointer", fontSize: 16,
          }}>
            {slot === "朝" ? "🌅 朝" : "🌙 夜"}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 2, color = "#FF8C42" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          width: "100%", borderRadius: 12, border: `2px solid ${color}33`,
          padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
          background: color + "08", resize: "vertical", boxSizing: "border-box",
          outline: "none", lineHeight: 1.6,
        }}
      />
    </div>
  );
}

function DailyCheckList({ checks, onChange, bestDay, onBestDayChange, color = "#FF8C42" }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 10, fontWeight: 600 }}>✅ 今日できたこと（チェック）</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {DAILY_CHECKS.map(({ key, label, icon }) => {
          const checked = checks[key] || false;
          return (
            <button key={key} onClick={() => onChange({ ...checks, [key]: !checked })} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
              borderRadius: 12, cursor: "pointer",
              border: checked ? `2px solid ${color}` : "2px solid #e8e0d5",
              background: checked ? color + "12" : "#FAFAF8", textAlign: "left", transition: "all 0.15s",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: checked ? `2px solid ${color}` : "2px solid #ddd",
                background: checked ? color : "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "white", transition: "all 0.15s",
              }}>{checked ? "✓" : ""}</div>
              <span style={{ fontSize: 13, color: checked ? "#555" : "#999" }}>{icon} {label}</span>
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, color: "#888", marginBottom: 6, fontWeight: 600 }}>🌟 その他・最高だったこと</div>
        <textarea value={bestDay} onChange={(e) => onBestDayChange(e.target.value)}
          placeholder="今日最高だったこと、なんでもOK！" rows={2}
          style={{
            width: "100%", borderRadius: 12, border: `2px solid ${color}33`,
            padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
            background: color + "08", resize: "vertical", boxSizing: "border-box", outline: "none", lineHeight: 1.6,
          }}
        />
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 16px" }}>
      <div style={{ flex: 1, height: 1, background: "#f0ece6" }} />
      <div style={{ fontSize: 11, color: "#ccc", whiteSpace: "nowrap" }}>{label}</div>
      <div style={{ flex: 1, height: 1, background: "#f0ece6" }} />
    </div>
  );
}

// ---- グラフ ----
function BarChart({ records }) {
  if (records.length === 0) return <div style={{ color: "#bbb", textAlign: "center", padding: 24 }}>まだ記録がありません</div>;
  const last7 = records.slice(-7);
  const maxTime = Math.max(...last7.map((r) => r.studyMinutes || 0), 60);
  return (
    <div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontWeight: 600 }}>📊 勉強時間（直近7日）</div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 120 }}>
        {last7.map((r, i) => {
          const height = ((r.studyMinutes || 0) / maxTime) * 100;
          const d = new Date(r.date);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, color: "#aaa" }}>{r.studyMinutes}分</div>
              <div style={{
                width: "100%", height: `${height}%`, minHeight: r.studyMinutes > 0 ? 4 : 2,
                background: r.timeSlot === "朝" ? "linear-gradient(180deg, #FFD700, #FFA500)" : "linear-gradient(180deg, #667eea, #764ba2)",
                borderRadius: "6px 6px 0 0", transition: "height 0.5s ease",
              }} />
              <div style={{ fontSize: 10, color: "#aaa" }}>{d.getMonth() + 1}/{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "#aaa" }}>
        <span>🟡 朝</span><span>🟣 夜</span>
      </div>
    </div>
  );
}

function MentalChart({ records }) {
  if (records.length === 0) return null;
  const last7 = records.slice(-7);
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontWeight: 600 }}>💝 メンタル推移</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {last7.map((r, i) => {
          const d = new Date(r.date);
          const childMood = r.child?.気持ち || 0;
          const parentMood = r.parent?.気持ち || 0;
          return (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{childMood > 0 ? SCALE_LABELS["気持ち"][childMood - 1] : "·"}</div>
              <div style={{ fontSize: 10, color: "#ccc" }}>{d.getMonth() + 1}/{d.getDate()}</div>
              {parentMood > 0 && <div style={{ fontSize: 12, opacity: 0.6 }}>{SCALE_LABELS["気持ち_parent"][parentMood - 1]}</div>}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>大: 子ども / 小: 保護者</div>
    </div>
  );
}

function SubjectChart({ records }) {
  if (records.length === 0) return null;
  const subjectTime = {};
  SUBJECTS.forEach((s) => (subjectTime[s] = 0));
  records.forEach((r) => {
    const subjects = r.subjects || [];
    const t = subjects.length > 0 ? (r.studyMinutes || 0) / subjects.length : 0;
    subjects.forEach((s) => { if (subjectTime[s] !== undefined) subjectTime[s] += t; });
  });
  const total = Object.values(subjectTime).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontWeight: 600 }}>📚 科目別の取り組み時間</div>
      {SUBJECTS.map((s) => {
        const pct = (subjectTime[s] / total) * 100;
        return (
          <div key={s} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span>{SUBJECT_ICONS[s]} {s}</span>
              <span style={{ color: "#aaa" }}>{Math.round(subjectTime[s])}分</span>
            </div>
            <div style={{ background: "#f0ece6", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: SUBJECT_COLORS[s], borderRadius: 6, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CheckChart({ records }) {
  if (records.length === 0) return null;
  const totals = {};
  DAILY_CHECKS.forEach(({ key }) => (totals[key] = 0));
  records.forEach((r) => {
    const checks = r.dailyChecks || {};
    DAILY_CHECKS.forEach(({ key }) => { if (checks[key]) totals[key]++; });
  });
  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontWeight: 600 }}>✅ 習慣チェック達成率</div>
      {DAILY_CHECKS.map(({ key, label, icon }) => {
        const pct = (totals[key] / records.length) * 100;
        return (
          <div key={key} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
              <span>{icon} {label}</span>
              <span style={{ color: "#aaa" }}>{Math.round(pct)}%</span>
            </div>
            <div style={{ background: "#f0ece6", borderRadius: 6, height: 8, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #96CEB4, #4ECDC4)", borderRadius: 6, transition: "width 0.5s ease" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- 履歴カード ----
function RecordCard({ record, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const d = new Date(record.date);
  const dateStr = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  const childMood = record.child?.気持ち || 3;
  const moodIcon = SCALE_LABELS["気持ち"][Math.max(0, childMood - 1)];
  const checks = record.dailyChecks || {};
  const checkedCount = DAILY_CHECKS.filter(({ key }) => checks[key]).length;

  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "14px 16px", marginBottom: 10,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0ece6",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }} onClick={() => setExpanded(!expanded)}>
        <div style={{ fontSize: 24, cursor: "pointer" }}>{moodIcon}</div>
        <div style={{ flex: 1, cursor: "pointer" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>{dateStr}</div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            {record.timeSlot === "朝" ? "🌅 朝" : "🌙 夜"} · {record.studyMinutes}分 · {(record.subjects || []).join(", ")}
            {checkedCount > 0 && ` · ✅${checkedCount}`}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
          style={{ border: "none", background: "none", fontSize: 16, cursor: "pointer", color: "#ddd", padding: 4 }}
        >🗑️</button>
        <div style={{ fontSize: 16, color: "#ccc", cursor: "pointer" }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {confirmDelete && (
        <div style={{ marginTop: 10, padding: "10px 14px", background: "#FFF0F0", borderRadius: 10, border: "1px solid #FFD0D0" }}>
          <div style={{ fontSize: 13, color: "#e05555", marginBottom: 8 }}>この記録を削除しますか？</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onDelete(record)} style={{
              flex: 1, padding: "8px", borderRadius: 8, border: "none",
              background: "#FF6B6B", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>削除する</button>
            <button onClick={() => setConfirmDelete(false)} style={{
              flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #ddd",
              background: "white", color: "#888", fontSize: 13, cursor: "pointer",
            }}>キャンセル</button>
          </div>
        </div>
      )}

      {expanded && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0ece6" }}>
          {record.child && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FF8C42", marginBottom: 6 }}>🐹 こどもの記録</div>
              <div style={{ fontSize: 12, color: "#888", lineHeight: 1.8 }}>
                体調: {SCALE_LABELS["体調"][(record.child.体調 || 3) - 1]} · 気持ち: {SCALE_LABELS["気持ち"][(record.child.気持ち || 3) - 1]} · 自信度: {SCALE_LABELS["自信度"][(record.child.自信度 || 3) - 1]}
              </div>
              {record.child.dekita && <div style={{ marginTop: 6, background: "#FFF8F0", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>🌟 {record.child.dekita}</div>}
              {record.child.tsumazuki && <div style={{ marginTop: 4, background: "#FFF0F0", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>💭 {record.child.tsumazuki}</div>}
              {record.child.hitokoto && <div style={{ marginTop: 4, background: "#F0F0FF", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>💌 {record.child.hitokoto}</div>}
            </div>
          )}
          {record.parent && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4ECDC4", marginBottom: 6 }}>👨‍👩‍👧 保護者の記録</div>
              {record.parent.goodPoint && <div style={{ marginTop: 4, background: "#F0FAFA", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>⭐ {record.parent.goodPoint}</div>}
              {record.parent.dekita && <div style={{ marginTop: 4, background: "#F0FFF4", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>🌟 {record.parent.dekita}</div>}
              {record.parent.tsumazuki && <div style={{ marginTop: 4, background: "#FFF0F0", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>💭 {record.parent.tsumazuki}</div>}
            </div>
          )}
          {(checkedCount > 0 || record.bestDay) && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#96CEB4", marginBottom: 6 }}>✅ 今日のチェック</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DAILY_CHECKS.filter(({ key }) => checks[key]).map(({ key, label, icon }) => (
                  <span key={key} style={{ fontSize: 11, background: "#F0FFF4", borderRadius: 20, padding: "3px 10px", color: "#555" }}>{icon} {label}</span>
                ))}
              </div>
              {record.bestDay && <div style={{ marginTop: 6, background: "#FFFBF0", borderRadius: 8, padding: "6px 10px", fontSize: 12 }}>🌟 {record.bestDay}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- 保存完了アニメーション ----
function SavedOverlay({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.35)",
      animation: "fadeIn 0.2s ease",
    }}>
      <div style={{
        background: "white", borderRadius: 28, padding: "36px 40px",
        textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "popIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)",
      }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>🐹</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#FF8C42", marginBottom: 6 }}>きろく完了！</div>
        <div style={{ fontSize: 14, color: "#aaa" }}>おもちも喜んでるよ🎉</div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popIn { from { transform: scale(0.7); opacity: 0 } to { transform: scale(1); opacity: 1 } }
      `}</style>
    </div>
  );
}

// ---- メインアプリ ----
export default function App() {
  const [tab, setTab] = useState("home");
  const [records, setRecords] = useState([]);
  const [today, setToday] = useState({
    date: new Date().toISOString().split("T")[0],
    timeSlot: "朝",
    studyMinutes: 0,
    subjects: [],
    child: { 体調: 0, 気持ち: 0, 自信度: 0, dekita: "", tsumazuki: "", hitokoto: "" },
    parent: { 姿勢: 0, goodPoint: "", 気持ち: 0, dekita: "", tsumazuki: "" },
    dailyChecks: {},
    bestDay: "",
  });
  const [saved, setSaved] = useState(false);
  const [totalDays, setTotalDays] = useState(0);
  const [gasUrl, setGasUrl] = useState("https://script.google.com/macros/s/AKfycbxIh-ZpX2N-QzCWtoWIphSVSuRfsRbXwPlYPQdqRwVGqncx70JhsyV_CA3zCJeM-qTF0A/exec");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const [omochiMsg, setOmochiMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const r = await window.storage.get("records");
        if (r) { const data = JSON.parse(r.value); setRecords(data); setTotalDays(data.length); }
      } catch (e) {}
      try {
        const g = await window.storage.get("gasUrl");
        if (g) setGasUrl(g.value);
      } catch (e) {}
    };
    load();
  }, []);

  // おもちメッセージを1時間ごとに更新
  useEffect(() => {
    const update = () => setOmochiMsg(getOmochiMessage(streak, totalDays));
    update();
    const timer = setInterval(update, 1000 * 60 * 60);
    return () => clearInterval(timer);
  }, [totalDays]);

  const saveGasUrl = async (url) => {
    setGasUrl(url);
    try { await window.storage.set("gasUrl", url); } catch (e) {}
  };

  const syncToSheet = async (record) => {
    if (!gasUrl) return;
    setSyncing(true);
    try {
      const encoded = encodeURIComponent(JSON.stringify(record));
      const res = await fetch(`${gasUrl}?data=${encoded}`, { method: "GET" });
      setSyncStatus(res.ok ? "ok" : "error");
    } catch {
      try {
        await fetch(gasUrl, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(record) });
        setSyncStatus("ok");
      } catch { setSyncStatus("error"); }
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 4000);
    }
  };

  const saveRecord = async () => {
    const newRecords = [...records];
    const existingIdx = newRecords.findIndex((r) => r.date === today.date && r.timeSlot === today.timeSlot);
    if (existingIdx >= 0) newRecords[existingIdx] = { ...today };
    else newRecords.push({ ...today });
    newRecords.sort((a, b) => (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot));
    setRecords(newRecords);
    setTotalDays(newRecords.length);
    try { await window.storage.set("records", JSON.stringify(newRecords)); } catch (e) {}
    await syncToSheet({ ...today });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
    setTab("home");
  };

  const deleteRecord = async (record) => {
    const newRecords = records.filter((r) => !(r.date === record.date && r.timeSlot === record.timeSlot));
    setRecords(newRecords);
    setTotalDays(newRecords.length);
    try { await window.storage.set("records", JSON.stringify(newRecords)); } catch (e) {}
  };

  const deleteAllRecords = async () => {
    setRecords([]);
    setTotalDays(0);
    try { await window.storage.set("records", JSON.stringify([])); } catch (e) {}
    setShowDeleteAll(false);
  };

  const totalMinutes = records.reduce((a, r) => a + (r.studyMinutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const streak = (() => {
    let s = 0;
    const todayStr = new Date().toISOString().split("T")[0];
    const dates = [...new Set(records.map((r) => r.date))].sort().reverse();
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const expected = new Date(todayStr);
      expected.setDate(expected.getDate() - i);
      if (d.toISOString().split("T")[0] === expected.toISOString().split("T")[0]) s++;
      else break;
    }
    return s;
  })();
  const hamsterMood = streak >= 7 ? 4 : streak >= 3 ? 3 : streak >= 1 ? 2 : today.studyMinutes > 0 ? 1 : 0;

  const S = {
    app: { maxWidth: 440, margin: "0 auto", minHeight: "100vh", background: "#FFFBF7", fontFamily: "'Hiragino Maru Gothic ProN', 'Noto Sans JP', sans-serif" },
    // ヘッダーをコンパクトに
    header: { background: "linear-gradient(135deg, #FF8C42 0%, #FFB347 100%)", padding: "14px 16px 52px", position: "relative", overflow: "hidden" },
    nav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 440, background: "white", borderTop: "1px solid #f0ece6", display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,0.08)" },
    navBtn: (a) => ({ flex: 1, padding: "8px 4px 12px", border: "none", background: "none", color: a ? "#FF8C42" : "#bbb", fontSize: 10, fontWeight: a ? 700 : 400, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }),
    content: { padding: "0 16px 100px", marginTop: -36 },
    card: { background: "white", borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    title: (c) => ({ fontSize: 16, fontWeight: 800, color: c || "#444", marginBottom: 16 }),
    saveBtn: (bg) => ({ width: "100%", padding: "16px", background: bg || "linear-gradient(135deg, #FF8C42, #FF6B6B)", border: "none", borderRadius: 16, color: "white", fontSize: 18, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,107,107,0.3)", letterSpacing: 1, marginTop: 4 }),
  };

  return (
    <div style={S.app}>
      <SavedOverlay visible={saved} />

      {/* ヘッダー（コンパクト化） */}
      <div style={S.header}>
        <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginBottom: 2 }}>中学受験 学習記録</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{HAMSTER_MOODS[hamsterMood]} おもちスタディ</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 1 }}>
              {streak > 0 ? `🔥 ${streak}日連続！` : "さあ今日もがんばろう！"}
            </div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} style={{
            background: "rgba(255,255,255,0.22)", border: "none", borderRadius: 12,
            padding: "7px 11px", cursor: "pointer", color: "white",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          }}>
            <span style={{ fontSize: 16 }}>⚙️</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>{gasUrl ? "連携中" : "設定"}</span>
          </button>
        </div>
      </div>

      <div style={S.content}>
        {syncStatus === "ok" && gasUrl && (
          <div style={{ background: "#96CEB4", color: "white", borderRadius: 12, padding: "8px 16px", marginBottom: 8, textAlign: "center", fontWeight: 700, fontSize: 13 }}>
            📊 スプレッドシートに送信しました！
          </div>
        )}
        {syncing && (
          <div style={{ background: "#FFB347", color: "white", borderRadius: 12, padding: "8px 16px", marginBottom: 8, textAlign: "center", fontWeight: 700, fontSize: 13 }}>
            📡 スプレッドシートに送信中...
          </div>
        )}

        {/* 設定モーダル */}
        {showSettings && (
          <div style={{ background: "white", borderRadius: 20, padding: 20, marginBottom: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "2px solid #FFE0C8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#FF8C42" }}>⚙️ スプレッドシート連携</div>
              <button onClick={() => setShowSettings(false)} style={{ border: "none", background: "none", fontSize: 20, cursor: "pointer", color: "#ccc" }}>✕</button>
            </div>
            <textarea value={gasUrl} onChange={(e) => saveGasUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/xxxxx/exec" rows={3}
              style={{ width: "100%", borderRadius: 10, border: "2px solid #FFE0C8", padding: "8px 10px", fontSize: 12, fontFamily: "monospace", background: "#FFF8F3", boxSizing: "border-box", resize: "none", outline: "none" }}
            />
            {gasUrl && <div style={{ marginTop: 8, fontSize: 12, color: "#96CEB4", fontWeight: 600 }}>✅ URL設定済み</div>}
          </div>
        )}

        {/* ホーム */}
        {tab === "home" && (
          <>
            {/* 統計カード */}
            <div style={{ ...S.card, display: "flex", gap: 0 }}>
              {[["累計時間", `${totalHours}h`], ["記録日数", `${totalDays}日`], ["連続日数", `🔥${streak}`]].map(([label, val], i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", borderRight: i < 2 ? "1px solid #f0ece6" : "none", padding: "4px 0" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#FF8C42" }}>{val}</div>
                  <div style={{ fontSize: 10, color: "#aaa" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* 今日の記録ボタン */}
            <div style={S.card}>
              <div style={S.title()}>今日の記録</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button onClick={() => setTab("child")} style={{ flex: 1, padding: "16px 10px", borderRadius: 16, border: "2px solid #FFE0C8", background: "#FFF8F3", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>🐹</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#FF8C42", marginTop: 4 }}>こどもが入力</div>
                </button>
                <button onClick={() => setTab("parent")} style={{ flex: 1, padding: "16px 10px", borderRadius: 16, border: "2px solid #D4F0EE", background: "#F0FAFA", cursor: "pointer", textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>👨‍👩‍👧</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#4ECDC4", marginTop: 4 }}>保護者が入力</div>
                </button>
              </div>
              <TimeSlotSelector value={today.timeSlot} onChange={(v) => setToday({ ...today, timeSlot: v })} />
            </div>

            {/* おもちより（ランダムメッセージ） */}
            <div style={{ ...S.card, background: "linear-gradient(135deg, #FFF3E8, #FFF8F3)", border: "2px solid #FFE0C8" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ fontSize: 36 }}>🐹</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#FF8C42", marginBottom: 3 }}>おもちより</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
                    {omochiMsg || getOmochiMessage(streak, totalDays)}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* こども入力 */}
        {tab === "child" && (
          <div style={S.card}>
            <div style={S.title("#FF8C42")}>🐹 こどもの記録</div>
            <StudyTimeButton minutes={today.studyMinutes} onChange={(v) => setToday({ ...today, studyMinutes: v })} />
            <SubjectSelector selected={today.subjects} onChange={(v) => setToday({ ...today, subjects: v })} />
            <Divider label="📊 今日のコンディション" />
            <ScaleSelector label="今日の体調" value={today.child.体調} onChange={(v) => setToday({ ...today, child: { ...today.child, 体調: v } })} scaleKey="体調" />
            <ScaleSelector label="気持ち（楽しかった？）" value={today.child.気持ち} onChange={(v) => setToday({ ...today, child: { ...today.child, 気持ち: v } })} scaleKey="気持ち" />
            <ScaleSelector label="自信度（できた感じ）" value={today.child.自信度} onChange={(v) => setToday({ ...today, child: { ...today.child, 自信度: v } })} scaleKey="自信度" />
            <Divider label="✏️ 今日の振り返り" />
            <TextArea label="🌟 今日のできた！" value={today.child.dekita} onChange={(v) => setToday({ ...today, child: { ...today.child, dekita: v } })} placeholder="できたこと、わかったこと、なんでも！" color="#FF8C42" />
            <TextArea label="💭 つまづき・課題" value={today.child.tsumazuki} onChange={(v) => setToday({ ...today, child: { ...today.child, tsumazuki: v } })} placeholder="どんなところが難しかった？" color="#FFB347" />
            <TextArea label="💌 自分へのひとこと" value={today.child.hitokoto} onChange={(v) => setToday({ ...today, child: { ...today.child, hitokoto: v } })} placeholder="今日がんばった自分へメッセージを書いてみよう！" color="#FF6B6B" />
            <Divider label="✅ 今日の生活チェック" />
            <DailyCheckList checks={today.dailyChecks} onChange={(v) => setToday({ ...today, dailyChecks: v })} bestDay={today.bestDay} onBestDayChange={(v) => setToday({ ...today, bestDay: v })} color="#FF8C42" />
            <button style={S.saveBtn()} onClick={saveRecord}>🐹 おもちと記録する！</button>
          </div>
        )}

        {/* 保護者入力 */}
        {tab === "parent" && (
          <div style={S.card}>
            <div style={S.title("#4ECDC4")}>👨‍👩‍👧 保護者の記録</div>
            <ScaleSelector label="子どもの勉強への姿勢" value={today.parent.姿勢} onChange={(v) => setToday({ ...today, parent: { ...today.parent, 姿勢: v } })} scaleKey="姿勢" color="#4ECDC4" />
            <ScaleSelector label="今日の保護者の気持ち" value={today.parent.気持ち} onChange={(v) => setToday({ ...today, parent: { ...today.parent, 気持ち: v } })} scaleKey="気持ち_parent" color="#4ECDC4" />
            <Divider label="✏️ 今日の記録" />
            <TextArea label="⭐ 今日の良かったこと・ほめたいこと" value={today.parent.goodPoint} onChange={(v) => setToday({ ...today, parent: { ...today.parent, goodPoint: v } })} placeholder="子どもの良かったところを書いてあげよう" color="#4ECDC4" />
            <TextArea label="🌟 今日のできた！（親から見て）" value={today.parent.dekita} onChange={(v) => setToday({ ...today, parent: { ...today.parent, dekita: v } })} placeholder="成長を感じた瞬間、できていたことなど" color="#45B7D1" />
            <TextArea label="💭 つまづき・課題" value={today.parent.tsumazuki} onChange={(v) => setToday({ ...today, parent: { ...today.parent, tsumazuki: v } })} placeholder="サポートが必要なこと、改善したいことなど" color="#96CEB4" />
            <Divider label="✅ 今日の生活チェック" />
            <DailyCheckList checks={today.dailyChecks} onChange={(v) => setToday({ ...today, dailyChecks: v })} bestDay={today.bestDay} onBestDayChange={(v) => setToday({ ...today, bestDay: v })} color="#4ECDC4" />
            <div style={{ background: "#F0FAFA", borderRadius: 12, padding: 14, marginBottom: 12, fontSize: 12, color: "#4ECDC4", lineHeight: 1.7 }}>
              💡 <strong>声かけヒント：</strong><br />結果より過程を褒めましょう。「よくがんばったね」など努力を認める言葉が子どものやる気につながります。
            </div>
            <button style={S.saveBtn("linear-gradient(135deg, #4ECDC4, #45B7D1)")} onClick={saveRecord}>💾 記録する</button>
          </div>
        )}

        {/* グラフ */}
        {tab === "graph" && (
          <>
            <div style={S.card}>
              <BarChart records={records} />
              <MentalChart records={records} />
              <SubjectChart records={records} />
              <CheckChart records={records} />
            </div>
            <div style={S.card}>
              <div style={S.title()}>📊 データエクスポート</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 12, lineHeight: 1.6 }}>CSVファイルをGoogleスプレッドシートに読み込めます。</div>
              <button onClick={() => {
                const headers = ["日付","時間帯","勉強時間(分)","科目","子:体調","子:気持ち","子:自信度","子:できた","子:つまづき","子:自分へのひとこと","親:姿勢","親:気持ち","親:良かった点","親:できた","親:つまづき",...DAILY_CHECKS.map(({label})=>`チェック:${label}`),"最高だったこと"];
                const rows = records.map((r) => [r.date,r.timeSlot,r.studyMinutes,(r.subjects||[]).join("/"),r.child?.体調||"",r.child?.気持ち||"",r.child?.自信度||"",r.child?.dekita||"",r.child?.tsumazuki||"",r.child?.hitokoto||"",r.parent?.姿勢||"",r.parent?.気持ち||"",r.parent?.goodPoint||"",r.parent?.dekita||"",r.parent?.tsumazuki||"",...DAILY_CHECKS.map(({key})=>(r.dailyChecks||{})[key]?"○":""),r.bestDay||""]);
                const csv = [headers,...rows].map((row)=>row.map((c)=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
                const blob = new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a"); a.href=url; a.download="学習記録.csv"; a.click(); URL.revokeObjectURL(url);
              }} style={{...S.saveBtn("linear-gradient(135deg, #96CEB4, #45B7D1)"), fontSize: 15}}>
                📥 CSVをダウンロード
              </button>
            </div>
          </>
        )}

        {/* 履歴 */}
        {tab === "history" && (
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={S.title()}>📅 記録一覧</div>
              {records.length > 0 && (
                <button onClick={() => setShowDeleteAll(true)} style={{ border: "1px solid #ffcccc", background: "#fff0f0", borderRadius: 8, padding: "5px 10px", fontSize: 12, color: "#e05555", cursor: "pointer" }}>
                  🗑️ 全件削除
                </button>
              )}
            </div>

            {showDeleteAll && (
              <div style={{ background: "#FFF0F0", borderRadius: 12, padding: 16, marginBottom: 16, border: "1px solid #FFD0D0" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e05555", marginBottom: 8 }}>⚠️ 全ての記録を削除しますか？</div>
                <div style={{ fontSize: 12, color: "#aaa", marginBottom: 12 }}>この操作は取り消せません。スプレッドシートのデータは残ります。</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={deleteAllRecords} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", background: "#FF6B6B", color: "white", fontWeight: 700, cursor: "pointer" }}>全部削除する</button>
                  <button onClick={() => setShowDeleteAll(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #ddd", background: "white", color: "#888", cursor: "pointer" }}>キャンセル</button>
                </div>
              </div>
            )}

            {records.length === 0 ? (
              <div style={{ textAlign: "center", color: "#bbb", padding: 24 }}>🐹 おもちがまってるよ！<br />最初の記録をつけてみよう</div>
            ) : (
              [...records].reverse().map((r, i) => <RecordCard key={i} record={r} onDelete={deleteRecord} />)
            )}
          </div>
        )}
      </div>

      <nav style={S.nav}>
        {[
          { key: "home", icon: "🏠", label: "ホーム" },
          { key: "child", icon: "🐹", label: "こども" },
          { key: "parent", icon: "👨‍👩‍👧", label: "保護者" },
          { key: "graph", icon: "📊", label: "グラフ" },
          { key: "history", icon: "📅", label: "履歴" },
        ].map(({ key, icon, label }) => (
          <button key={key} style={S.navBtn(tab === key)} onClick={() => setTab(key)}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
