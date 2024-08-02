import './style.css'
import Plotly from "plotly.js-dist-min"

function convertToJSFunction(mathFunc) {
  // Reemplazar funciones matemáticas con funciones de JavaScript
  let jsFunc = mathFunc
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/arcoS/g, 'Math.asin')
      .replace(/arcoC/g, 'Math.acos')
      .replace(/arcoT/g, 'Math.atan')
      .replace(/log/g, 'Math.log')
      .replace(/ln/g, 'Math.log')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/pi/g, 'Math.PI')
      .replace(/\^/g, '**'); // Reemplazar ^ con ** para exponentes

  return jsFunc;
}

function evaluateFunction(func, x) {
  return eval(func);
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

async function calculate(){
  const funcString = document.getElementById('function').value;
  const func = convertToJSFunction(funcString);
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const n = 100; // Número de subdivisiones para la integración numérica

  const volume = Math.PI * integrateSimpson(`${func} * ${func}`, a, b, n);

  document.getElementById('result').innerText = `El volumen del sólido de revolución es: ${volume.toFixed(4)}`;
}

function calculateAndPlot() {
  calculate();
  const funcString = document.getElementById('function').value;
  const func = convertToJSFunction(funcString);
  const a = parseFloat(document.getElementById('a').value);
  const b = parseFloat(document.getElementById('b').value);
  const n = 100; // Número de rectangulos en las sumas de riemann
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
          const theta = 2 * Math.PI * j / numTheta;
          solidX.push(x);
          solidY.push(y * Math.cos(theta));
          solidZ.push(y * Math.sin(theta));
      }
  }

  let trace1 = {
      x: xValues,
      y: yValues,
      mode: 'lines',
      line: { color: 'blue' }
  };

  let trace2 = {
      x: solidX,
      y: solidY,
      z: solidZ,
      mode: 'lines',
      marker: { color: 'red', size: 2 },
      type: 'scatter3d'
  };

  let data = [trace1];
  let data2 = [trace2];

  let layout = {
      scene: {
          xaxis: { title: 'X' },
          yaxis: { title: 'Y' }
      }
  };

  Plotly.newPlot('graph', data, layout);

  let layout2 = {
      scene: {
          xaxis: { title: 'X' },
          yaxis: { title: 'Y' },
          zaxis: { title: 'Z' }
      }
  };

  Plotly.newPlot('solid', data2, layout2);
}

document.getElementById('form').addEventListener('submit', function (event) {event.preventDefault(); calculateAndPlot();});