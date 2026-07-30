/**
 * game.js
 * Task 6: Quiz engines + level flow.
 *
 * Public API:
 *   App.game.startLevel(levelId, container, onEnd)
 *     渲染 5 题, 每题依次出现; 答对进下一题, 答错原地重试不跳过.
 *     onEnd({ stars, attemptedWords, correctCount, totalChallenges, completed })
 *
 * Challenge routing by ch.type:
 *   "listen-choose"  -> _renderListenChoose
 *   "look-choose"    -> _renderLookChoose
 *   "read-after"     -> _renderReadAfter (不支持 SpeechRecognition 时自动跳过)
 *   "letter-sound"   -> Task 7 (暂跳过, 记为通过)
 *   "drag-match"     -> Task 7 (暂跳过, 记为通过)
 */
(function() {
  const READ_PASS_THRESHOLD = 60;
  const READ_MAX_RETRY       = 3;

  let _attemptedWords = [];   // 本关尝试过的单词列表 (每次 startLevel 清零)
  let _currentRetry   = 0;    // 当前题的重试次数 (每次新题清零)

  function startLevel(levelId, container, onEnd) {
    const level = window.App.data.getLevel(levelId);
    if (!level) {
      console.warn("[game] level not found:", levelId);
      if (onEnd) onEnd({ stars: 0, attemptedWords: [], correctCount: 0, totalChallenges: 0, completed: false });
      return;
    }
    _attemptedWords = [];

    const st = {
      level,
      index: 0,
      correctCount: 0
    };

    renderFrame(container, st, onEnd);
  }

  function renderFrame(container, st, onEnd) {
    container.innerHTML = "";

    const frame = document.createElement("div");
    frame.className = "screen game-screen";

    const header = document.createElement("div");
    header.className = "game-header";
    header.innerHTML = `
      <div class="game-progress">
        <span class="game-progress-current">${st.index + 1}</span>
        <span class="game-progress-sep">/</span>
        <span class="game-progress-total">${st.level.challenges.length}</span>
      </div>
      <div class="game-level-name">${st.level.title}</div>
    `;
    frame.appendChild(header);

    const progress = document.createElement("div");
    progress.className = "game-progress-bar";
    const ratio = st.index / st.level.challenges.length;
    progress.innerHTML = `<div class="game-progress-bar-fill" style="width:${ratio * 100}%"></div>`;
    frame.appendChild(progress);

    const quizArea = document.createElement("div");
    quizArea.className = "quiz-area";
    frame.appendChild(quizArea);

    const eggStage = document.createElement("div");
    eggStage.className = "game-egg-stage";
    const eggHolder = document.createElement("div");
    eggStage.appendChild(eggHolder);
    frame.appendChild(eggStage);

    const s = window.App.state.data;
    window.App.egg.render(eggHolder, {
      color: s.egg.color,
      expression: s.egg.expression,
      size: "md"
    });

    container.appendChild(frame);

    renderCurrentQuiz(quizArea, eggHolder, st, onEnd, () => {
      st.index += 1;
      _currentRetry = 0;
      if (st.index >= st.level.challenges.length) {
        onLevelEnd(container, st, onEnd);
      } else {
        renderFrame(container, st, onEnd);
      }
    });
  }

  function renderCurrentQuiz(quizArea, eggHolder, st, onEnd, onPass) {
    const ch = st.level.challenges[st.index];
    if (!ch) { onPass(); return; }

    switch (ch.type) {
      case "learn-intro":
        return renderLearnIntro(quizArea, eggHolder, ch, st, onPass);
      case "listen-choose":
        return renderListenChoose(quizArea, eggHolder, ch, st, onPass);
      case "look-choose":
        return renderLookChoose(quizArea, eggHolder, ch, st, onPass);
      case "read-after":
        return renderReadAfter(quizArea, eggHolder, ch, st, onPass);
      case "letter-sound":
      case "drag-match":
        recordWord(getWordFromChallenge(ch));
        return onPass();
      default:
        console.warn("[game] unknown type:", ch.type);
        return onPass();
    }
  }

  function getWordFromChallenge(ch) {
    if (ch.word) return ch.word;
    if (ch.audio) return ch.audio;
    if (ch.target) return ch.target;
    if (ch.options && typeof ch.options[ch.answerIndex] === "string") return ch.options[ch.answerIndex];
    if (ch.pairs && ch.pairs[0] && ch.pairs[0].word) return ch.pairs[0].word;
    return "";
  }

  function recordWord(word) {
    if (word && _attemptedWords.indexOf(word) === -1) _attemptedWords.push(word);
  }


  // ===== 入门识词 (不判分) =====
  function renderLearnIntro(quizArea, eggHolder, ch, st, onPass) {
    recordWord(ch.word);

    quizArea.innerHTML = `
      <div class="quiz-prompt">先听一听，跟着读一遍</div>
      <div class="quiz-image">${ch.emoji}</div>
      <div class="quiz-target">${ch.word}</div>
      <div class="quiz-cn">${ch.cn || ""}</div>
      ${ch.phonetic ? `<div class="quiz-phonetic">${ch.phonetic}</div>` : ""}
      <div class="quiz-read-buttons">
        <button class="quiz-demoBtn">🔊 听发音</button>
        <button class="quiz-learn-next">我学会了 ✓</button>
      </div>
    `;

    // 进题时自动朗读一次
    window.App.speech.speak(ch.word);

    quizArea.querySelector(".quiz-demoBtn").addEventListener("click", () => {
      window.App.speech.speak(ch.word);
    });
    // 任意按钮点击都视为通过, 不判分
    quizArea.querySelector(".quiz-learn-next").addEventListener("click", () => {
      // 直接进下一题, 不计 correctCount (跟读回顾题算重试过不算)
      onPass();
    });
  }


  // ===== 听音选图 =====
  function renderListenChoose(quizArea, eggHolder, ch, st, onPass) {
    recordWord(ch.audio);

    quizArea.innerHTML = `
      <div class="quiz-prompt">听一听，选出对应的图</div>
      <button class="quiz-replay" aria-label="再听一次">🔊 再听一次</button>
      <div class="quiz-options quiz-options-3">
        ${ch.options.map((o, i) => `
          <button class="quiz-option-card" data-idx="${i}">
            <div class="quiz-option-emoji">${o.emoji}</div>
            <div class="quiz-option-label">${o.label}</div>
          </button>
        `).join("")}
      </div>
    `;

    const speak = () => window.App.speech.speak(ch.audio);
    speak();

    quizArea.querySelector(".quiz-replay").addEventListener("click", speak);

    quizArea.querySelectorAll(".quiz-option-card").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        judge(quizArea, eggHolder, idx === ch.answerIndex, st, onPass);
      });
    });
  }


  // ===== 看图选词 =====
  function renderLookChoose(quizArea, eggHolder, ch, st, onPass) {
    recordWord(ch.options[ch.answerIndex]);

    quizArea.innerHTML = `
      <div class="quiz-prompt">看图片，选出正确的单词</div>
      <div class="quiz-image">${ch.image}</div>
      <div class="quiz-options quiz-options-words">
        ${ch.options.map((w, i) => `
          <button class="quiz-option-word" data-idx="${i}">${w}</button>
        `).join("")}
      </div>
    `;

    quizArea.querySelectorAll(".quiz-option-word").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx, 10);
        judge(quizArea, eggHolder, idx === ch.answerIndex, st, onPass);
      });
    });
  }


  // ===== 跟读闯关 =====
  function renderReadAfter(quizArea, eggHolder, ch, st, onPass) {
    if (!window.App.speech.hasRecognition) {
      console.log("[game] read-after skipped (no SpeechRecognition)");
      quizArea.innerHTML = `<div class="quiz-skip-hint">跟读题型当前浏览器不支持，已自动跳过</div>`;
      setTimeout(onPass, 700);
      return;
    }
    recordWord(ch.target);

    quizArea.innerHTML = `
      <div class="quiz-prompt">跟读：听一听，然后大声读出来</div>
      <div class="quiz-target">${ch.target}</div>
      ${ch.phonetic ? `<div class="quiz-phonetic">${ch.phonetic}</div>` : ""}
      <div class="quiz-read-buttons">
        <button class="quiz-demoBtn">🔊 听示范</button>
        <button class="quiz-mic">🎤 我来读</button>
      </div>
      <div class="quiz-read-result"></div>
    `;

    const resultEl = quizArea.querySelector(".quiz-read-result");
    const demoBtn  = quizArea.querySelector(".quiz-demoBtn");
    const micBtn   = quizArea.querySelector(".quiz-mic");

    demoBtn.addEventListener("click", () => window.App.speech.speak(ch.target));

    micBtn.addEventListener("click", () => {
      micBtn.disabled = true;
      micBtn.textContent = "🎤 听中...";
      resultEl.innerHTML = `<div class="quiz-listening">请说出来...</div>`;

      window.App.speech.recognizeWord(ch.target).then(r => {
        if (r.unsupported) {
          resultEl.innerHTML = `<div class="quiz-encourage">浏览器不支持，自动通过</div>`;
          setTimeout(() => pass(quizArea, eggHolder, st, onPass), 800);
          return;
        }
        const correct = r.score >= READ_PASS_THRESHOLD;
        _currentRetry += 1;

        if (correct) {
          resultEl.innerHTML = `
            <div class="quiz-score quiz-score-pass">得分 ${r.score} 分</div>
            <div class="quiz-encourage">${encourage(_currentRetry, true)}</div>
          `;
          setTimeout(() => pass(quizArea, eggHolder, st, onPass), 900);
        } else if (_currentRetry >= READ_MAX_RETRY) {
          resultEl.innerHTML = `
            <div class="quiz-score quiz-score-soft">得分 ${r.score} 分</div>
            <div class="quiz-encourage">没关系，听到你说出来就是最棒的！</div>
          `;
          setTimeout(() => pass(quizArea, eggHolder, st, onPass), 1100);
        } else {
          resultEl.innerHTML = `
            <div class="quiz-score quiz-score-fail">得分 ${r.score} 分</div>
            <div class="quiz-encourage">${encourage(_currentRetry, false, false)}</div>
          `;
          setTimeout(() => {
            micBtn.disabled = false;
            micBtn.textContent = "🎤 再读一次";
          }, 700);
        }
      });
    });
  }


  // ===== 判分 + 动画 =====
  function judge(quizArea, eggHolder, isRight, st, onPass) {
    if (isRight) {
      pass(quizArea, eggHolder, st, onPass);
    } else {
      _currentRetry += 1;
      if (window.App.speech) window.App.speech.playWrong();
      eggFall(eggHolder);
      quizArea.classList.add("quiz-area--wrong");
      setTimeout(() => {
        quizArea.classList.remove("quiz-area--wrong");
        // 重渲染同一题, 不进下一题, 单词和按钮全部重置
        // 重新 build 一遍会清掉原有 handler (innerHTML = ...)
        const ch = st.level.challenges[st.index];
        renderChallengeByType(ch, quizArea, eggHolder, st, onPass);
      }, 1000);
    }
  }

  function renderChallengeByType(ch, quizArea, eggHolder, st, onPass) {
    switch (ch.type) {
      case "learn-intro":
        // learn-intro 不会答错, 不会进此分支, 仅防漏
        return renderLearnIntro(quizArea, eggHolder, ch, st, onPass);
      case "listen-choose": return renderListenChoose(quizArea, eggHolder, ch, st, onPass);
      case "look-choose":   return renderLookChoose(quizArea, eggHolder, ch, st, onPass);
      case "read-after":    return renderReadAfter(quizArea, eggHolder, ch, st, onPass);
      default:
        onPass();
    }
  }

  function pass(quizArea, eggHolder, st, onPass) {
    st.correctCount += 1;
    if (window.App.speech) window.App.speech.playCorrect();
    eggCheer(eggHolder);
    quizArea.classList.add("quiz-area--correct");
    setTimeout(() => onPass(), 800);
  }

  function eggCheer(eggHolder) {
    const e = eggHolder.querySelector(".egg");
    if (!e) return;
    e.classList.remove("egg-fall");
    e.classList.add("egg-cheer");
    setTimeout(() => e.classList.remove("egg-cheer"), 1200);
  }

  function eggFall(eggHolder) {
    const e = eggHolder.querySelector(".egg");
    if (!e) return;
    e.classList.remove("egg-cheer");
    e.classList.add("egg-fall");
    setTimeout(() => e.classList.remove("egg-fall"), 1100);
  }

  function encourage(retry, isPass, softPass) {
    if (isPass) return retry <= 1 ? "太棒了！" : "说得真好！";
    if (softPass) return "没关系，听到你说出来就是最棒的！";
    const softLines = [
      "差一点点，再来一次好吗？",
      "可以试试慢一点说",
      "听不清哦，再大声一点？"
    ];
    return softLines[retry % softLines.length];
  }


  function onLevelEnd(container, st, onEnd) {
    const correct = st.correctCount;
    const total = st.level.challenges.length;
    let stars = 1;
    if (correct >= total * 0.8) stars = 3;
    else if (correct >= total * 0.6) stars = 2;

    window.App.state.completeDay(st.level.id, stars, _attemptedWords);

    const summary = {
      stars,
      attemptedWords: _attemptedWords.slice(),
      correctCount: correct,
      totalChallenges: total,
      completed: true
    };
    console.log("[game] level end:", summary);

    container.innerHTML = `
      <div class="screen game-summary">
        <div class="game-stars">${"★".repeat(stars)}${"☆".repeat(3 - stars)}</div>
        <div class="game-summary-title">闯关成功！</div>
        <div class="game-summary-sub">答对 ${correct} / ${total} 题</div>
        <button class="btn-primary btn-large game-back-btn">回到地图</button>
      </div>
    `;
    if (window.App.speech) setTimeout(() => window.App.speech.playVictory(), 200);
    container.querySelector(".game-back-btn").addEventListener("click", () => {
      window.App.state.advanceDay();
      if (onEnd) onEnd(summary);
      window.App.go("world-map");
    });
  }


  window.App = window.App || {};
  window.App.game = { startLevel };
})();
