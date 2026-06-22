// ============================================================
// VALORES OFICIALES COLOMBIA 2026
// Fuentes: Decreto 1469 & 1470 de 2025, Resolución DIAN 000238/2025
// ============================================================
const SMMLV         = 1750905;   // Salario mínimo 2026
const AUX_TRANSPORTE = 249095;   // Auxilio de transporte 2026
const UVT           = 52374;     // UVT 2026
const DIAS_MES      = 30;
const HORAS_MES     = 230;
const PORC_PENSION  = 0.04;
const PORC_SALUD    = 0.04;
const PORC_HORA_EXTRA = 0.25;    // recargo diurno 25%

const empleados = [
  { id: 1, nombre: "Empleado 1", salario: null },
  { id: 2, nombre: "Empleado 2", salario: null },
  { id: 3, nombre: "Empleado 3", salario: null }
];

// ── Formato moneda COP ────────────────────────────────────────
const fmt = n =>
  "$" + new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(Math.round(n));

// ── Login ─────────────────────────────────────────────────────
function iniciarSesion() {
  const correo    = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;
  if (correo === "admin@example.com" && contrasena === "admin123") {
    show("empleados-section");
    hide("login-section");
  } else {
    alert("Correo o contraseña incorrectos.\n\nUsa: admin@example.com / admin123");
  }
}

function cerrarSesion() {
  show("login-section");
  hide("empleados-section");
}

function volverEmpleados() {
  show("empleados-section");
  hide("salario-section");
  hide("calculadora-section");
}

// ── Selección de empleado ─────────────────────────────────────
function mostrarFormularioSalario(id) {
  const emp = empleados.find(e => e.id === id);
  document.getElementById("empleado-nombre").textContent = emp.nombre;
  document.getElementById("empleado-id").value = emp.id;
  hide("empleados-section");
  show("salario-section");
}

// ── Asignar salario ───────────────────────────────────────────
function asignarSalario() {
  const id     = parseInt(document.getElementById("empleado-id").value);
  const salario = parseFloat(document.getElementById("salarioAsignado").value);
  const emp    = empleados.find(e => e.id === id);
  if (!emp || salario <= 0 || isNaN(salario)) {
    alert("Ingresa un salario válido.");
    return;
  }
  emp.salario = salario;
  document.getElementById("salarioNeto").value = salario;
  document.getElementById("subtitulo-calculadora").textContent =
    emp.nombre + " · " + fmt(salario) + " / mes";
  hide("salario-section");
  show("calculadora-section");
  hide("resultado-panel");
}

// ── Cálculo de Retefuente (Art. 383 ET, Procedimiento 1) ─────
// Base depurada = salario − pensión(4%) − salud(4%) → exenta 25%
// Tabla en UVT: 0-95 = 0%, 95-150 = 19%, 150-360 = 28%,
//               360-640 = 33%, 640-945 = 35%, 945-2300 = 37%, >2300 = 39%
function calcularRetefuente(salarioBrutoMes, horasExtraVal) {
  const ingresoTotal = salarioBrutoMes + horasExtraVal;
  const pension      = ingresoTotal * PORC_PENSION;
  const salud        = ingresoTotal * PORC_SALUD;
  const subtotal     = ingresoTotal - pension - salud;
  const rentaExenta  = subtotal * 0.25;          // 25% exento, máx 790 UVT/año ≈ 65,8 UVT/mes
  const maxRentaExenta = 65.833 * UVT;
  const rentaExentaReal = Math.min(rentaExenta, maxRentaExenta);
  const baseDepurada = subtotal - rentaExentaReal;
  const baseUVT      = baseDepurada / UVT;

  // Tabla marginal Art. 383 ET
  const tramos = [
    { min: 0,    max: 95,   tarifa: 0.00 },
    { min: 95,   max: 150,  tarifa: 0.19 },
    { min: 150,  max: 360,  tarifa: 0.28 },
    { min: 360,  max: 640,  tarifa: 0.33 },
    { min: 640,  max: 945,  tarifa: 0.35 },
    { min: 945,  max: 2300, tarifa: 0.37 },
    { min: 2300, max: Infinity, tarifa: 0.39 }
  ];

  let retefuenteUVT = 0;
  let tramoAplicado = "0 - 95 UVT (0%)";

  for (const t of tramos) {
    if (baseUVT > t.min) {
      const excedente = Math.min(baseUVT, t.max) - t.min;
      retefuenteUVT += excedente * t.tarifa;
      if (t.tarifa > 0) tramoAplicado = `${t.min}-${t.max === Infinity ? "+" : t.max} UVT (${t.tarifa * 100}%)`;
    }
  }

  const retefuentePesos = retefuenteUVT * UVT;
  return {
    valor: retefuentePesos,
    baseDepurada,
    baseUVT: baseUVT.toFixed(2),
    tramo: tramoAplicado
  };
}

// ── Cálculo principal ─────────────────────────────────────────
function calcularSalario() {
  const salario      = parseFloat(document.getElementById("salarioNeto").value)  || 0;
  const horasExtra   = parseFloat(document.getElementById("horasExtra").value)   || 0;

  const valorDia     = salario / DIAS_MES;
  const valorHora    = salario / HORAS_MES;
  const valorHoraExtra = valorHora * (1 + PORC_HORA_EXTRA);
  const totalHorasExtra = horasExtra * valorHoraExtra;

  const aplicaAuxilio = salario <= SMMLV * 2;
  const auxilio       = aplicaAuxilio ? AUX_TRANSPORTE : 0;

  const base          = salario + totalHorasExtra;
  const pension       = base * PORC_PENSION;
  const salud         = base * PORC_SALUD;

  const rete          = calcularRetefuente(salario, totalHorasExtra);
  const retefuente    = rete.valor;

  const primeraQ      = salario / 2;
  const segundaQ      = (salario / 2) + totalHorasExtra + auxilio - pension - salud - retefuente;
  const neto          = primeraQ + segundaQ;

  // Actualizar UI
  document.getElementById("valorDia").textContent          = fmt(valorDia);
  document.getElementById("valorHora").textContent         = fmt(valorHora);
  document.getElementById("valorHorasExtra").textContent   = fmt(totalHorasExtra);
  document.getElementById("auxilioTransporte").textContent  = fmt(auxilio);
  document.getElementById("descuentoPension").textContent  = fmt(pension);
  document.getElementById("descuentoSalud").textContent    = fmt(salud);
  document.getElementById("descuentoRetefuente").textContent = fmt(retefuente);
  document.getElementById("primeraQuincena").textContent   = fmt(primeraQ);
  document.getElementById("segundaQuincena").textContent   = fmt(segundaQ);
  document.getElementById("salarioBruto").textContent      = fmt(neto);

  // Detalle retefuente
  const detalle = document.getElementById("retefuente-detalle");
  if (retefuente > 0) {
    detalle.innerHTML = `<span>🔍</span><span>Retefuente: base depurada <strong>${fmt(rete.baseDepurada)}</strong> (${rete.baseUVT} UVT) → tramo <strong>${rete.tramo}</strong> → retención <strong>${fmt(retefuente)}</strong></span>`;
    detalle.style.display = "flex";
  } else {
    detalle.innerHTML = `<span>✅</span><span>Sin retefuente: base depurada <strong>${fmt(rete.baseDepurada)}</strong> (${rete.baseUVT} UVT) · umbral mínimo es 95 UVT = $4.976.000</span>`;
    detalle.style.display = "flex";
  }

  show("resultado-panel");
}

// ── Helpers ───────────────────────────────────────────────────
function show(id) { document.getElementById(id).classList.remove("hidden"); }
function hide(id) { document.getElementById(id).classList.add("hidden");    }