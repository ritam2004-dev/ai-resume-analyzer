const getRingColor = (score) => {
  if (score >= 75) return '#1D9E75';
  if (score >= 50) return '#BA7517';
  return '#E24B4A';
};

const getTag = (score) => {
  if (score >= 75) return <span className="tag tag-good">Strong</span>;
  if (score >= 50) return <span className="tag tag-warn">Average</span>;
  return <span className="tag tag-bad">Needs Work</span>;
};

export function ScoreRing({ score }) {
  const r = 34, c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  return (
    <div className="ring-wrap">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={getRingColor(score)} strokeWidth="6"
          strokeDasharray={`${fill.toFixed(1)} ${c.toFixed(1)}`} strokeLinecap="round" />
      </svg>
      <div className="ring-num">{score}</div>
    </div>
  );
}

export function SubScoreCard({ label, score, tips }) {
  return (
    <div className="card">
      <div className="sec-title">{label} {getTag(score)}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{score}/100</div>
      <div className="mini-bar"><div className="mini-fill" style={{ width: `${score}%` }} /></div>
      <div style={{ marginTop: 10 }}>
        {(tips || []).map((t, i) => <div className="item" key={i}>{t}</div>)}
      </div>
    </div>
  );
}

export function ResultsView({ result, hasJD }) {
  const { overall_score, score_label, score_summary, strengths, improvements,
          skills_found, skills_matching, ats_score, ats_tips,
          impact_score, impact_tips, format_score, format_tips } = result;

  return (
    <div className="fade-in">
      <div className="score-ring">
        <ScoreRing score={overall_score} />
        <div>
          <div className="score-label">{score_label}</div>
          <div className="score-desc">{score_summary}</div>
        </div>
      </div>

      <div className="card">
        <div className="sec-title">Strengths <span className="tag tag-good">Positive</span></div>
        {(strengths || []).map((s, i) => <div className="item" key={i}>{s}</div>)}
      </div>

      <div className="card">
        <div className="sec-title">Areas to Improve <span className="tag tag-warn">Action needed</span></div>
        {(improvements || []).map((s, i) => <div className="item" key={i}>{s}</div>)}
      </div>

      <div className="card">
        <div className="sec-title">
          Skills Detected
          {hasJD && <span style={{ fontSize: 12, color: 'var(--text-success)' }}>green = JD match</span>}
        </div>
        <div className="skill-grid">
          {(skills_found || []).map((s, i) => {
            const isMatch = hasJD && (skills_matching || []).map(x => x.toLowerCase()).includes(s.toLowerCase());
            return <span className={`skill-tag ${isMatch ? 'match' : ''}`} key={i}>{s}</span>;
          })}
        </div>
      </div>

      <SubScoreCard label="ATS Compatibility"       score={ats_score}    tips={ats_tips}    />
      <SubScoreCard label="Impact & Quantification" score={impact_score} tips={impact_tips} />
      <SubScoreCard label="Format & Structure"      score={format_score} tips={format_tips} />
    </div>
  );
}
