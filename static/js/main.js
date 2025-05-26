// State management
let state = {
  span: 0,
  supports: [
    { coord: 0, fixed: [0, 1, 0], type: "roller" },
    { coord: 0, fixed: [0, 1, 0], type: "roller" },
  ],
  distributedLoads: [{ expr: 0, span: [0, 0] }],
  pointLoads: [{ force: 0, coord: 0 }],
};

// Support type mapping
const supportTypes = {
  roller: [0, 1, 0],
  pinned: [1, 1, 0],
  fixed: [1, 1, 1],
};

// Toast system
const toastContainer = document.getElementById("toast-container");

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "";
  if (type === "info") icon = '<i class="fas fa-info-circle"></i>';
  else if (type === "error") icon = '<i class="fas fa-exclamation-circle"></i>';
  else if (type === "success") icon = '<i class="fas fa-check-circle"></i>';
  else if (type === "loading") icon = '<i class="fas fa-spinner spinner"></i>';

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  if (type !== "loading") {
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        toastContainer.removeChild(toast);
      }, 300);
    }, 5000);
  }

  return toast;
}

// Helper function to create elements with attributes and event listeners
function createElement(tag, attributes = {}, eventListeners = {}) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "className") {
      element.className = value;
    } else if (key === "textContent") {
      element.textContent = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  }

  for (const [event, handler] of Object.entries(eventListeners)) {
    element.addEventListener(event, handler);
  }

  return element;
}

// Render support item
function renderSupport(index, support) {
  const container = document.getElementById("supports-container");
  const supportItem = createElement("div", { className: "load-item" });
  const header = createElement("div", { className: "load-item-header" });

  header.appendChild(
    createElement("h3", { textContent: `Apoio ${index + 1}` })
  );

  const removeBtn = createElement(
    "button",
    {
      className: "remove-btn",
      type: "button",
      innerHTML: '<i class="fas fa-times"></i>',
    },
    {
      click: () => removeSupport(index),
    }
  );

  if (state.supports.length <= 2) {
    removeBtn.disabled = true;
    removeBtn.style.opacity = "0.5";
    removeBtn.style.cursor = "not-allowed";
  }

  header.appendChild(removeBtn);
  supportItem.appendChild(header);

  const coordRow = createElement("div", { className: "form-row" });
  const coordCol = createElement("div", { className: "form-col" });

  coordCol.appendChild(
    createElement("label", {
      textContent: "Posição (m)",
      for: `support-coord-${index}`,
    })
  );

  coordCol.appendChild(
    createElement(
      "input",
      {
        type: "number",
        id: `support-coord-${index}`,
        value: support.coord,
        min: 0,
        step: "any",
      },
      {
        input: (e) => updateSupport(index, "coord", parseFloat(e.target.value)),
      }
    )
  );

  coordRow.appendChild(coordCol);
  supportItem.appendChild(coordRow);

  const typeRow = createElement("div", { className: "form-row" });
  const typeCol = createElement("div", { className: "form-col" });

  typeCol.appendChild(
    createElement("label", {
      textContent: "Tipo de apoio",
      for: `support-type-${index}`,
    })
  );

  const selectEl = createElement(
    "select",
    {
      id: `support-type-${index}`,
    },
    {
      change: (e) => updateSupportType(index, e.target.value),
    }
  );

  // Add options to select element
  const options = [
    { value: "roller", text: "Móvel (1° gênero)" },
    { value: "pinned", text: "Fixo (2° gênero)" },
    { value: "fixed", text: "Engaste (3° gênero)" },
  ];

  options.forEach((option) => {
    const optionEl = createElement("option", {
      value: option.value,
      textContent: option.text,
    });

    if (support.type === option.value) {
      optionEl.selected = true;
    }

    selectEl.appendChild(optionEl);
  });

  typeCol.appendChild(selectEl);
  typeRow.appendChild(typeCol);
  supportItem.appendChild(typeRow);

  container.appendChild(supportItem);
}

// Render distributed load item
function renderDistributedLoad(index, load) {
  const container = document.getElementById("distributed-loads-container");
  const loadItem = createElement("div", { className: "load-item" });
  const header = createElement("div", { className: "load-item-header" });

  header.appendChild(
    createElement("h3", { textContent: `Carga Distribuída ${index + 1}` })
  );

  const removeBtn = createElement(
    "button",
    {
      className: "remove-btn",
      type: "button",
      innerHTML: '<i class="fas fa-times"></i>',
    },
    {
      click: () => removeDistributedLoad(index),
    }
  );

  if (state.distributedLoads.length <= 1) {
    removeBtn.disabled = true;
    removeBtn.style.opacity = "0.5";
    removeBtn.style.cursor = "not-allowed";
  }

  header.appendChild(removeBtn);
  loadItem.appendChild(header);

  const exprRow = createElement("div", { className: "form-row" });
  const exprCol = createElement("div", { className: "form-col" });

  exprCol.appendChild(
    createElement("label", {
      textContent: "Valor da Carga (kN/m)",
      for: `dist-load-expr-${index}`,
    })
  );

  exprCol.appendChild(
    createElement(
      "input",
      {
        type: "number",
        id: `dist-load-expr-${index}`,
        value: load.expr,
        step: "any",
      },
      {
        input: (e) =>
          updateDistributedLoad(index, "expr", parseFloat(e.target.value)),
      }
    )
  );

  exprRow.appendChild(exprCol);
  loadItem.appendChild(exprRow);

  const spanRow = createElement("div", { className: "form-row" });

  const startCol = createElement("div", { className: "form-col" });
  startCol.appendChild(
    createElement("label", {
      textContent: "Posição inicial (m)",
      for: `dist-load-start-${index}`,
    })
  );

  startCol.appendChild(
    createElement(
      "input",
      {
        type: "number",
        id: `dist-load-start-${index}`,
        value: load.span[0],
        min: 0,
        step: "any",
      },
      {
        input: (e) =>
          updateDistributedLoad(index, "span", [0, parseFloat(e.target.value)]),
      }
    )
  );

  const endCol = createElement("div", { className: "form-col" });
  endCol.appendChild(
    createElement("label", {
      textContent: "Posição final (m)",
      for: `dist-load-end-${index}`,
    })
  );

  endCol.appendChild(
    createElement(
      "input",
      {
        type: "number",
        id: `dist-load-end-${index}`,
        value: load.span[1],
        min: 0,
        step: "any",
      },
      {
        input: (e) =>
          updateDistributedLoad(index, "span", [1, parseFloat(e.target.value)]),
      }
    )
  );

  spanRow.appendChild(startCol);
  spanRow.appendChild(endCol);
  loadItem.appendChild(spanRow);

  container.appendChild(loadItem);
}

// Render point load item
function renderPointLoad(index, load) {
  const container = document.getElementById("point-loads-container");
  const loadItem = createElement("div", { className: "load-item" });
  const header = createElement("div", { className: "load-item-header" });

  header.appendChild(
    createElement("h3", { textContent: `Carga Pontual ${index + 1}` })
  );

  const removeBtn = createElement(
    "button",
    {
      className: "remove-btn",
      type: "button",
      innerHTML: '<i class="fas fa-times"></i>',
    },
    {
      click: () => removePointLoad(index),
    }
  );

  if (state.pointLoads.length <= 1) {
    removeBtn.disabled = true;
    removeBtn.style.opacity = "0.5";
    removeBtn.style.cursor = "not-allowed";
  }

  header.appendChild(removeBtn);
  loadItem.appendChild(header);

  const forceRow = createElement("div", { className: "form-row" });
  const forceCol = createElement("div", { className: "form-col" });

  forceCol.appendChild(
    createElement("label", {
      textContent: "Valor da carga (kN)",
      for: `point-load-force-${index}`,
    })
  );

  forceCol.appendChild(
    createElement(
      "input",
      {
        type: "number",
        id: `point-load-force-${index}`,
        value: load.force,
        step: "any",
      },
      {
        input: (e) =>
          updatePointLoad(index, "force", parseFloat(e.target.value)),
      }
    )
  );

  forceRow.appendChild(forceCol);
  loadItem.appendChild(forceRow);

  const coordRow = createElement("div", { className: "form-row" });
  const coordCol = createElement("div", { className: "form-col" });

  coordCol.appendChild(
    createElement("label", {
      textContent: "Posição (m)",
      for: `point-load-coord-${index}`,
    })
  );

  coordCol.appendChild(
    createElement(
      "input",
      {
        type: "number",
        id: `point-load-coord-${index}`,
        value: load.coord,
        min: 0,
        step: "any",
      },
      {
        input: (e) =>
          updatePointLoad(index, "coord", parseFloat(e.target.value)),
      }
    )
  );

  coordRow.appendChild(coordCol);
  loadItem.appendChild(coordRow);

  container.appendChild(loadItem);
}

// Update state functions
function updateSupport(index, field, value) {
  state.supports[index][field] = value;
}

function updateSupportType(index, type) {
  state.supports[index].type = type;
  state.supports[index].fixed = [...supportTypes[type]];
}

function updateDistributedLoad(index, field, value) {
  if (field === "span") {
    const [spanIndex, spanValue] = value;
    state.distributedLoads[index].span[spanIndex] = spanValue;
  } else {
    state.distributedLoads[index][field] = value;
  }
}

function updatePointLoad(index, field, value) {
  state.pointLoads[index][field] = value;
}

// Add/Remove items
function addSupport() {
  if (state.supports.length < 4) {
    state.supports.push({ coord: 0, fixed: [0, 1, 0], type: "roller" });
    renderUI();
  }
}

function removeSupport(index) {
  if (state.supports.length > 2) {
    state.supports.splice(index, 1);
    renderUI();
  }
}

function addDistributedLoad() {
  state.distributedLoads.push({ expr: 0, span: [0, 0] });
  renderUI();
}

function removeDistributedLoad(index) {
  if (state.distributedLoads.length > 1) {
    state.distributedLoads.splice(index, 1);
    renderUI();
  }
}

function addPointLoad() {
  state.pointLoads.push({ force: 0, coord: 0 });
  renderUI();
}

function removePointLoad(index) {
  if (state.pointLoads.length > 1) {
    state.pointLoads.splice(index, 1);
    renderUI();
  }
}

// Render UI
function renderUI() {
  // Clear containers
  document.getElementById("supports-container").innerHTML = "";
  document.getElementById("distributed-loads-container").innerHTML = "";
  document.getElementById("point-loads-container").innerHTML = "";

  // Update span input
  document.getElementById("beam-span").value = state.span;

  // Render supports
  state.supports.forEach((support, index) => {
    renderSupport(index, support);
  });

  // Render distributed loads
  state.distributedLoads.forEach((load, index) => {
    renderDistributedLoad(index, load);
  });

  // Render point loads
  state.pointLoads.forEach((load, index) => {
    renderPointLoad(index, load);
  });
}

// Submit form data
async function submitForm(e) {
  e.preventDefault();

  // Update span value
  state.span = parseFloat(document.getElementById("beam-span").value);

  // Prepare data
  const data = {
    beam: {
      span: state.span,
      supports: state.supports.map((support) => ({
        coord: support.coord,
        fixed: support.fixed,
      })),
      distributedLoads: state.distributedLoads,
      pointLoads: state.pointLoads,
    },
  };

  const loadingToast = showToast("Analisando viga", "loading");
  try {
    let calculationResult = await fetch("/calculate-beam", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data.beam),
    });

    let json = await calculationResult.json();

    let graph1 = JSON.parse(json[0]);
    let graph2 = JSON.parse(json[1]);

    // console.log(graph1);
    // console.log(graph2);

    graph1.data.forEach((d) => {
      if (d.name === "Beam") {
        d.name = "Viga";
      }
      if (d.name === "Beam_") {
        d.name = "Viga";
      }
      if (d.name === "Support") {
        d.name = "Apoio";
      }
      if (d.name === "Distributed<br>Load") {
        d.name = "Carga<br>Distribuída";
      }
      if (d.hovertemplate?.includes("Force")) {
        d.hovertemplate = d.hovertemplate.replace("Force", "Força");
      }
      if (d.hovertemplate?.includes("Angle")) {
        d.hovertemplate = d.hovertemplate.replace("Angle", "Ângulo");
      }
      if (d.hovertemplate?.includes("Fixed")) {
        d.hovertemplate = d.hovertemplate.replace("Fixed", "Fixo em");
      }
      if (d.hovertemplate?.includes("Beam_")) {
        d.hovertemplate = d.hovertemplate.replace("Beam_", "Viga");
      }
      if (d.hovertemplate?.includes("Beam")) {
        d.hovertemplate = d.hovertemplate.replace("Beam", "Viga");
      }
      if (d.hovertemplate?.includes("Reactions")) {
        d.hovertemplate = d.hovertemplate.replace("Reactions", "Reações");
      }
      if (d.hovertemplate?.includes("Support")) {
        d.hovertemplate = d.hovertemplate.replace("Support", "Suporte");
      }
      if (d.hovertemplate?.includes("Distributed Load")) {
        d.hovertemplate = d.hovertemplate.replace(
          "Distributed Load",
          "Carga Distribuída"
        );
      }
    });
    graph1.layout.annotations.forEach((a) => {
      if (a.text === "Beam schematic") {
        a.text = "Esquema da Viga";
      }
      if (a.text === "Reaction Forces") {
        a.text = "Forças de Reação";
      }
    });
    graph1.layout.title.text = "Condições Externas da Viga";
    graph1.layout.xaxis2.title.text = "Comprimento da Viga (m)";


    graph2.layout.annotations.forEach((a) => {
      if (a.text === "Normal Force Diagram") {
        a.text = "Diagrama de Força Normal";
      }
      if (a.text === "Shear Force Diagram") {
        a.text = "Diagrama de Força de Cisalhamento";
      }
      if (a.text === "Bending Moment Diagram") {
        a.text = "Diagrama de Momento Fletor";
      }
      if (a.text === "Deflection Diagram") {
        a.text = "Diagrama de Deflexão";
      }
    });

    graph2.layout.title.text = "Resultados da Análise";
    graph2.layout.xaxis4.title.text = "Comprimento da Viga (m)";
    graph2.layout.yaxis.title.text = "Força Normal (N)";
    graph2.layout.yaxis2.title.text = "Força de Cisalhamento (N)";
    graph2.layout.yaxis3.title.text = "Momento Fletor (N.m)";
    graph2.layout.yaxis4.title.text = "Deflexão (m)";

    graph2.data.forEach((d) => {
      if (d.name === "Normal Force") {
        d.name = "Força Normal";
      }
      if (d.name === "Shear Force") {
        d.name = "Força de Cisalhamento";
      }
      if (d.name === "Bending Moment") {
        d.name = "Momento Fletor";
      }
      if (d.name === "Deflection") {
        d.name = "Deflexão";
      }
    });

    Plotly.newPlot("chart", graph1.data, graph1.layout);
    Plotly.newPlot("chart2", graph2.data, graph2.layout);
    toastContainer.removeChild(loadingToast);
    showToast("Cálculo finalizado com sucesso!", "success");
  } catch (e) {
    console.log(e);
    console.error(e);
    toastContainer.removeChild(loadingToast);
    showToast("Houve um erro ao analizar a viga", "error");
  }
}

function resetForm(e) {
  e.preventDefault();
  const form = document.getElementById("beam-form");
  form.reset();

  state = {
    span: 0,
    supports: [
      { coord: 0, fixed: [0, 1, 0], type: "roller" },
      { coord: 0, fixed: [0, 1, 0], type: "roller" },
    ],
    distributedLoads: [{ expr: 0, span: [0, 0] }],
    pointLoads: [{ force: 0, coord: 0 }],
  };

  renderUI();
}

// Event listeners
document.getElementById("beam-form").addEventListener("submit", submitForm);
document.getElementById("beam-form").addEventListener("reset", resetForm);
document.getElementById("add-support").addEventListener("click", addSupport);
document
  .getElementById("add-distributed-load")
  .addEventListener("click", addDistributedLoad);
document
  .getElementById("add-point-load")
  .addEventListener("click", addPointLoad);
document.getElementById("beam-span").addEventListener("input", (e) => {
  state.span = parseFloat(e.target.value);
});

// Initialize UI
renderUI();

// Add dark mode toggle
function setupThemeToggle() {
  const header = document.querySelector("header");

  // Create theme switch button
  const themeSwitch = createElement(
    "button",
    {
      className: "theme-switch",
      type: "button",
      innerHTML: '<i class="fas fa-sun"></i>',
    },
    {
      click: toggleTheme,
    }
  );

  header.appendChild(themeSwitch);

  // Set initial theme
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const button = document.querySelector(".theme-switch");
  if (!button) return;

  if (theme === "dark") {
    button.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    button.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Setup theme toggler (last to ensure header exists)
setupThemeToggle();
