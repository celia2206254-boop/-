import React, { useState } from "react";

export default function App() {
  // 状态管理
  const [page, setPage] = useState("home");
  const [answers, setAnswers] = useState(Array(8).fill(null));
  const [aiText, setAiText] = useState("");

  const API_KEY = "sk-09ca899ee26340fcbcd4d59036eb53a2";

  const questions = [
    "你是否经常忘记刚发生的事情？",
    "你是否会重复问同一个问题？",
    "你是否会搞不清日期或时间？",
    "你是否在熟悉地方迷路？",
    "你是否容易分心？",
    "你做简单计算是否困难？",
    "你做日常事情是否变困难？",
    "你是否做出不太合理的决定？",
  ];

  // 判定逻辑
  const getLevel = (score) => {
    if (score <= 3) return "正常";
    if (score <= 7) return "轻度风险";
    if (score <= 11) return "中度风险";
    return "高风险";
  };

  const getResultText = (score) => {
    if (score <= 3) return "认知功能正常，建议保持良好生活习惯。";
    if (score <= 7) return "存在轻度风险，建议注意休息与观察。";
    if (score <= 11) return "存在中度风险，建议进行专业评估。";
    return "存在较高风险，建议尽快就医检查。";
  };

  // 核心计算
  const totalScore = answers.reduce((a, b) => a + (b || 0), 0);

  // AI 调用
  const getAIResult = async (score) => {
    const level = getLevel(score);
    const prompt = `用户得分 ${score}/16，系统判定为【${level}】。请以医生口吻给出简短解释和建议，50字内。不要胡乱判定。`;
    try {
      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setAiText(data.choices?.[0]?.message?.content || "建议咨询专业医生。");
    } catch (e) {
      setAiText("AI分析由于网络原因暂不可用。");
    }
  };

  // 处理选择
  const handleSelect = (idx, val) => {
    const newArr = [...answers];
    newArr[idx] = val;
    setAnswers(newArr);
  };

  // 提交
  const submit = () => {
    if (answers.includes(null)) {
      alert("请完成所有题目");
      return;
    }
    setPage("result");
    getAIResult(totalScore);
  };

  // 样式对象
  const s = {
    bg: {
      minHeight: "100vh",
      background: "#f5f7fa",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px",
      fontFamily: "sans-serif",
    },
    card: {
      background: "#fff",
      padding: "30px",
      borderRadius: "20px",
      width: "100%",
      maxWidth: "360px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      textAlign: "center",
    },
    btn: {
      width: "100%",
      padding: "12px",
      background: "#4CAF50",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "15px",
    },
    opt: (active) => ({
      flex: 1,
      padding: "8px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      cursor: "pointer",
      background: active ? "#4CAF50" : "#fff",
      color: active ? "#fff" : "#333",
      fontSize: "14px",
    }),
    aiBox: {
      background: "#f0fdf4",
      padding: "15px",
      borderRadius: "12px",
      textAlign: "left",
      marginTop: "20px",
      borderLeft: "4px solid #4CAF50",
    },
  };

  // 页面渲染
  if (page === "home") {
    return (
      <div style={s.bg}>
        <div style={s.card}>
          <h2 style={{ marginBottom: "10px" }}>认知功能自测</h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "25px" }}>
            关爱大脑健康，从简单测试开始
          </p>
          <button style={s.btn} onClick={() => setPage("quiz")}>
            开始测试
          </button>
        </div>
      </div>
    );
  }

  if (page === "quiz") {
    return (
      <div style={s.bg}>
        <div style={s.card}>
          <div
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              paddingRight: "10px",
              textAlign: "left",
            }}
          >
            {questions.map((q, i) => (
              <div key={i} style={{ marginBottom: "25px" }}>
                <p
                  style={{
                    fontWeight: "bold",
                    fontSize: "15px",
                    marginBottom: "10px",
                  }}
                >
                  {i + 1}. {q}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["从不", "偶尔", "经常"].map((label, val) => (
                    <button
                      key={val}
                      style={s.opt(answers[i] === val)}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelect(i, val);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button style={s.btn} onClick={submit}>
            查看报告
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.bg}>
      <div style={s.card}>
        <h2 style={{ marginBottom: "15px" }}>测试结果</h2>
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            border: "4px solid #4CAF50",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ fontSize: "28px", fontWeight: "bold" }}>
            {totalScore}
          </span>
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: totalScore > 7 ? "#f44336" : "#4CAF50",
            margin: "15px 0",
          }}
        >
          风险等级：{getLevel(totalScore)}
        </div>
        <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6" }}>
          {getResultText(totalScore)}
        </p>
        <div style={s.aiBox}>
          <div
            style={{
              fontWeight: "bold",
              color: "#166534",
              marginBottom: "5px",
              fontSize: "14px",
            }}
          >
            🩺 AI 医生解读：
          </div>
          <p style={{ fontSize: "13px", color: "#374151", margin: 0 }}>
            {aiText || "深度分析中..."}
          </p>
        </div>
        <button
          style={{ ...s.btn, background: "#666" }}
          onClick={() => {
            setAnswers(Array(8).fill(null));
            setAiText("");
            setPage("home");
          }}
        >
          重新测试
        </button>
      </div>
    </div>
  );
}
