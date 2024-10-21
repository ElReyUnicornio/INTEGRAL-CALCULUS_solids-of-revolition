import "./style.css";
import Plotly from "plotly.js-dist-min";

// Funciones para controlar tabs

const tabs = [
  document.getElementById("tab-0"),
  document.getElementById("tab-1"),
  document.getElementById("tab-2"),
];
const carousel = document.getElementById("carousel");

function changeTab(e) {
  const tab = e.target.dataset.tab;
  tabs.forEach((tab) => tab.classList.remove("active"));
  tabs[Number(tab)].classList.add("active");
  carousel.style.left = `-${tab * 100}%`;
}

///////////////////////////////////////////////////////////////////////////////////

function convertToJSFunction(mathFunc) {
  // Reemplazar funciones matemáticas con funciones de JavaScript
  let jsFunc = mathFunc
    .replace(/sin/g, "Math.sin")
    .replace(/cos/g, "Math.cos")
    .replace(/tan/g, "Math.tan")
    .replace(/arcSin/g, "Math.asin")
    .replace(/arcCos/g, "Math.acos")
    .replace(/arcTan/g, "Math.atan")
    .replace(/log/g, "Math.log")
    .replace(/ln/g, "Math.log")
    .replace(/sqrt/g, "Math.sqrt")
    .replace(/abs/g, "Math.abs")
    .replace(/pi/g, "Math.PI")
    .replace(/\^/g, "**"); // Reemplazar ^ con ** para exponentes

  return jsFunc;
}

function createFunction(func) {
  return new Function("x", `return ${func};`);
}

function evaluateFunction(func, x) {
  const safeFunc = createFunction(func);
  return safeFunc(x);
}

function integrateSimpson(func, a, b, n) {
  const h = (b - a) / n;
  let sum = evaluateFunction(func, a) + evaluateFunction(func, b);

  for (let i = 1; i < n; i += 2) {
    sum += 4 * evaluateFunction(func, a + i * h);
  }
  for (let i = 2; i < n; i += 2) {
    sum += 2 * evaluateFunction(func, a + i * h);
  }
  return (h / 3) * sum;
}

async function calculateVolume() {
  const funcString = document.getElementById("function").value;
  const func = convertToJSFunction(funcString);
  const a = parseFloat(document.getElementById("a").value);
  const b = parseFloat(document.getElementById("b").value);
  const n = b - a > 100 ? 500 : 100; // Número de subdivisiones para la integración numérica

  return Math.PI * integrateSimpson(`${func} * ${func}`, a, b, n);
}

async function calculateSurface() {
  const funcString = document.getElementById("function").value;
  const func = convertToJSFunction(funcString);
  const a = parseFloat(document.getElementById("a").value);
  const b = parseFloat(document.getElementById("b").value);
  const n = b - a > 100 ? 500 : 100; // Número de subdivisiones para la integración numérica

  return Math.PI * integrateSimpson(`Math.sqrt(1 + (${func})^2)`, a, b, n);
}

function calculateAndPlot() {
  const funcString = document.getElementById("function").value;
  const func = convertToJSFunction(funcString);
  const a = parseFloat(document.getElementById("a").value);
  const b = parseFloat(document.getElementById("b").value);
  const n = b - a > 100 ? 500 : 100; // Número de rectangulos en las sumas de riemann
  const dx = (b - a) / n;

  let volume = 0;
  let xValues = [];
  let yValues = [];

  for (let i = 0; i <= n; i++) {
    const x = a + i * dx;
    const y = evaluateFunction(func, x);
    xValues.push(x);
    yValues.push(y);
    volume += Math.PI * y * y * dx;
  }

  // Crear el sólido de revolución
  let solidX = [];
  let solidY = [];
  let solidZ = [];
  let numTheta = 50;

  for (let i = 0; i <= n; i++) {
    const x = a + i * dx;
    const y = evaluateFunction(func, x);
    for (let j = 0; j <= numTheta; j++) {
      const theta = (2 * Math.PI * j) / numTheta;
      solidX.push(x);
      solidY.push(y * Math.cos(theta));
      solidZ.push(y * Math.sin(theta));
    }
  }

  let trace1 = {
    x: xValues,
    y: yValues,
    mode: "lines",
    line: { color: "green" },
  };

  let trace2 = {
    x: solidX,
    y: solidY,
    z: solidZ,
    opacity: 0.7,
    line: {
      width: 10,
      color: solidX,
      colorscale: "Viridis",
    },
    type: "scatter3d",
    mode: "lines",
  };

  let data = [trace1];
  let data2 = [trace2];

  let layout = {
    scene: {
      xaxis: { title: "X" },
      yaxis: { title: "Y" },
    },
  };

  Plotly.newPlot("graph", data, layout);

  let layout2 = {
    scene: {
      xaxis: { title: "X" },
      yaxis: { title: "Y" },
      zaxis: { title: "Z" },
    },
  };

  Plotly.newPlot("solid", data2, layout2);

  document.getElementById("results").style.opacity = 1;
  calculateSurface().then((surface) => {
    document.getElementById("superficie").innerText =
      surface.toFixed(4) + " u^2";
  });
  calculateVolume().then((volume) => {
    document.getElementById("volumen").innerText = volume.toFixed(4) + " u^3";
  });

  changeTab({ target: { dataset: { tab: 2 } } });
  carousel.style.backgroundColor = "white";
}

export function setup() {
  tabs.forEach((tab) => tab.addEventListener("click", changeTab));
  changeTab({ target: { dataset: { tab: 0 } } });
  document.getElementById("form").addEventListener("submit", function (event) {
    event.preventDefault();
    calculateAndPlot();
  });
}
