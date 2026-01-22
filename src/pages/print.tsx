import React, { useMemo, useState } from "react";
import "./print.css";

export default function PrintPage() {
  const [font, setFont] = useState("Inter");
  const [size, setSize] = useState("Medium");
  const [color, setColor] = useState("Blue");
  const [margins, setMargins] = useState("Normal");
  const [perPage, setPerPage] = useState(2);

  const [headingStyle, setHeadingStyle] = useState({
    check: true,
    bold: true,
    italic: true,
    underline: false,
    dot: false,
  });

  const [bodyStyle, setBodyStyle] = useState({
    check: false,
    bold: false,
    italic: false,
    underline: false,
    dot: false,
  });

  const computedPreviewStyle = useMemo(() => {
    const sizeMap = { Small: 12, Medium: 14, Large: 16 };
    const headingWeight = headingStyle.bold ? 800 : 600;
    const headingFontStyle = headingStyle.italic ? "italic" : "normal";
    const headingTextDecoration = headingStyle.underline ? "underline" : "none";

    const bodyFontStyle = bodyStyle.italic ? "italic" : "normal";
    const bodyTextDecoration = bodyStyle.underline ? "underline" : "none";
    const bodyWeight = bodyStyle.bold ? 700 : 400;

    // minimal color mapping (you can expand this)
    const colorMap = { Blue: "#1a4b7a", Black: "#111", Gray: "#444" };

    return {
      fontFamily: font === "Inter" ? "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" : font,
      bodyFontSize: sizeMap[size] ?? 14,
      ink: colorMap[color] ?? "#111",
      heading: {
        fontWeight: headingWeight,
        fontStyle: headingFontStyle,
        textDecoration: headingTextDecoration,
      },
      body: {
        fontWeight: bodyWeight,
        fontStyle: bodyFontStyle,
        textDecoration: bodyTextDecoration,
      },
      padding: margins === "Compact" ? 12 : margins === "Wide" ? 26 : 18,
    };
  }, [font, size, color, margins, headingStyle, bodyStyle]);

  function toggle(setter, key) {
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function onPrint() {
    // In a real app you might route to a print-only view first.
    window.print();
  }

  function onEditExercises() {
    // In a real app: navigate to edit screen/modal
    alert("Navigate to Edit Exercises");
  }

  return (
    <main className="page">
      <header className="titleRow">
        <h1 className="title">
          Customize + Print <span className="titleUnderline" />
        </h1>
      </header>

      <section className="contentGrid">
        {/* LEFT: Preview */}
        <div className="previewPanel" aria-label="Preview">
          <div className="previewFrame">
            <div
              className="previewSheet"
              style={{
                fontFamily: computedPreviewStyle.fontFamily,
                padding: computedPreviewStyle.padding,
                color: computedPreviewStyle.ink,
              }}
            >
              <div className="sheetHeading">
                <div className="sheetHeadingText" style={computedPreviewStyle.heading}>
                  Heading
                </div>
                <div className="sheetSubText" style={computedPreviewStyle.body}>
                  Workout #1
                </div>
              </div️
              <div className="sheetBody">
                <div className="imgBox" style={computedPreviewStyle.body}>
                  img
                </div>
                <div className="textLines" style={{ fontSize: computedPreviewStyle.bodyFontSize, ...computedPreviewStyle.body }}>
                  <div className="line">text (directions, instructions)</div>
                  <div className="line">text (directions, instructions)</div>
                  <div className="line">text (directions, instructions)</div>
                  <div className="line">text (directions, instructions)</div>
                </div>
              </div>

              <div className="sheetFooter">
                <div className="sheetHeadingText" style={computedPreviewStyle.heading}>
                  Heading
                </div>
              </div>
            </div>

            <div className="scrollBar" aria-hidden="true">
              <div className="scrollThumb" />
            </div>
          </div>

          <button className="ctaButton" type="button" onClick={onPrint}>
            Print Now
          </button>
        </div>

        {/* RIGHT: Controls */}
        <div className="controlsPanel" aria-label="Controls">
          <div className="controlRow">
            <label className="controlLabel" htmlFor="fontSelect">
              Font
            </label>
            <select className="pillSelect" id="fontSelect" value={font} onChange={(e) => setFont(e.target.value)}>
              <option>Inter</option>
              <option>Arial</option>
              <option>Georgia</option>
              <option>Times New Roman</option>
            </select>
          </div>

          <div className="controlRow twoLine">
            <div className="controlLabel">Heading</div>
            <div className="toggleGroup" role="group" aria-label="Heading formatting">
              <button type="button" className="checkPill" onClick={() => toggle(setHeadingStyle, "check")} aria-pressed={headingStyle.check}>
                ✓
              </button>
              <button type="button" className="iconPill" onClick={() => toggle(setHeadingStyle, "bold")} aria-pressed={headingStyle.bold}>
                <b>B</b>
              </button>
              <button type="button" className="iconPill" onClick={() => toggle(setHeadingStyle, "italic")} aria-pressed={headingStyle.italic}>
                <i>I</i>
              </button>
              <button type="button" className="iconPill" onClick={() => toggle(setHeadingStyle, "underline")} aria-pressed={headingStyle.underline}>
                <u>U</u>
              </button>
              <button type="button" className="dotPill" onClick={() => toggle(setHeadingStyle, "dot")} aria-pressed={headingStyle.dot} />
            </div>
          </div>

          <div className="controlRow twoLine">
            <div className="controlLabel">Body</div>
            <div className="toggleGroup" role="group" aria-label="Body formatting">
              <button type="button" className="checkPill" onClick={() => toggle(setBodyStyle, "check")} aria-pressed={bodyStyle.check}>
                ✓
              </button>
              <button type="button" className="iconPill" onClick={() => toggle(setBodyStyle, "bold")} aria-pressed={bodyStyle.bold}>
                <b>B</b>
              </button>
              <button type="button" className="iconPill" onClick={() => toggle(setBodyStyle, "italic")} aria-pressed={bodyStyle.italic}>
                <i>I</i>
              </button>
              <button type="button" className="iconPill" onClick={() => toggle(setBodyStyle, "underline")} aria-pressed={bodyStyle.underline}>
                <u>U</u>
              </button>
              <button type="button" className="dotPill" onClick={() => toggle(setBodyStyle, "dot")} aria-pressed={bodyStyle.dot} />
            </div>
          </div>

          <div className="controlRow">
            <label className="controlLabel" htmlFor="sizeSelect">
              Font Size
            </label>
            <select className="pillSelect" id="sizeSelect" value={size} onChange={(e) => setSize(e.target.value)}>
              <option>Small</option>
              <option>Medium</option>
              <option>Large</option>
            </select>
          </div>

          <div className="controlRow">
            <label className="controlLabel" htmlFor="colorSelect">
              Color
            </label>
            <select className="pillSelect" id="colorSelect" value={color} onChange={(e) => setColor(e.target.value)}>
              <option>Blue</option>
              <option>Black</option>
              <option>Gray</option>
            </select>
          </div>

          <div className="controlRow">
            <label className="controlLabel" htmlFor="marginsSelect">
              Margins
            </label>
            <select className="pillSelect" id="marginsSelect" value={margins} onChange={(e) => setMargins(e.target.value)}>
              <option>Compact</option>
              <option>Normal</option>
              <option>Wide</option>
            </select>
          </div>

          <div className="controlRow">
            <label className="controlLabel" htmlFor="perPageSelect">
              Exercises per page
            </label>
            <select
              className="pillSelect narrow"
              id="perPageSelect"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>

          <button className="ctaButton" type="button" onClick={onEditExercises}>
            Edit Exercises
          </button>

          <div style={{ color: "#666", fontSize: 12, marginTop: 6 }}>
            (Demo) Exercises/page: <b>{perPage}</b>
          </div>
        </div>
      </section>
    </main>
  );
}
