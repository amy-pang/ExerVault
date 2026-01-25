document.addEventListener("DOMContentLoaded", () => {
  const printBtn = document.getElementById("printBtn");
  const fontSizeSelect = document.getElementById("fontSize");
  const colorSelect = document.getElementById("color");
  const printArea = document.getElementById("printArea");

  function updateStyles() {
    printArea.style.fontSize = fontSizeSelect.value + "px";
    printArea.style.color = colorSelect.value;
  }

  fontSizeSelect.addEventListener("change", updateStyles);
  colorSelect.addEventListener("change", updateStyles);

  printBtn.addEventListener("click", () => {
    printJS({
      printable: "printArea",
      type: "html",
      targetStyles: ["*"],
      
      css: "print.css"
    });
  });

  updateStyles();
});