const SMMLV = 1300000;
const AUX_TRANSPORTE = 162000;
const DIAS_MES = 30;
const HORAS_MES = 230;
const PORCENTAJE_PENSION = 0.04;
const PORCENTAJE_SALUD = 0.04;
const PORCENTAJE_HORA_EXTRA = 0.25;

const empleados = [
    { id: 1, nombre: "Empleado 1", salario: null },
    { id: 2, nombre: "Empleado 2", salario: null },
    { id: 3, nombre: "Empleado 3", salario: null }
];

const formatNumber = number =>
    new Intl.NumberFormat('es-CO', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(number);

function iniciarSesion() {
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;

    if (correo === "admin@example.com" && contrasena === "admin123") {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('empleados-section').classList.remove('hidden');
    } else {
        alert("Correo o contraseña incorrectos");
    }
}

function mostrarFormularioSalario(id) {
    const empleado = empleados.find(emp => emp.id === id);
    document.getElementById('empleado-nombre').textContent = empleado.nombre;
    document.getElementById('empleado-id').value = empleado.id;
    document.getElementById('empleados-section').classList.add('hidden');
    document.getElementById('salario-section').classList.remove('hidden');
}

function asignarSalario() {
    const id = parseInt(document.getElementById('empleado-id').value);
    const salario = parseFloat(document.getElementById('salarioAsignado').value);
    const empleado = empleados.find(emp => emp.id === id);

    if (empleado && salario > 0) {
        empleado.salario = salario;
        document.getElementById('salarioNeto').value = salario;
        document.getElementById('salario-section').classList.add('hidden');
        document.getElementById('calculadora-section').classList.remove('hidden');
    } else {
        alert("Ingrese un salario válido");
    }
}

function calcularSalario() {
    const salarioNeto = parseFloat(document.getElementById('salarioNeto').value) || 0;
    const horasTrabajadas = parseFloat(document.getElementById('horasExtra').value) || 0;

    const valorDia = salarioNeto / DIAS_MES;
    const valorHora = salarioNeto / HORAS_MES;
    const valorHoraExtra = valorHora * (1 + PORCENTAJE_HORA_EXTRA);
    const totalHorasTrabajadas = horasTrabajadas * (horasTrabajadas >= 0 ? valorHoraExtra : valorHora);

    const aplicaAuxilio = salarioNeto <= (SMMLV * 2);
    const auxilioTransporte = aplicaAuxilio ? AUX_TRANSPORTE : 0;

    const baseDescuentos = salarioNeto + totalHorasTrabajadas;
    const totalDescuentos = baseDescuentos * (PORCENTAJE_PENSION + PORCENTAJE_SALUD);

    const primeraQuincena = salarioNeto / 2;
    const segundaQuincena = (salarioNeto / 2) + totalHorasTrabajadas + auxilioTransporte - totalDescuentos;

    document.getElementById('valorDia').textContent = formatNumber(valorDia);
    document.getElementById('valorHora').textContent = formatNumber(valorHora);
    document.getElementById('valorHorasExtra').textContent = formatNumber(totalHorasTrabajadas);
    document.getElementById('primeraQuincena').textContent = formatNumber(primeraQuincena);
    document.getElementById('segundaQuincena').textContent = formatNumber(segundaQuincena);
    document.getElementById('descuentoPension').textContent = formatNumber(baseDescuentos * PORCENTAJE_PENSION);
    document.getElementById('descuentoSalud').textContent = formatNumber(baseDescuentos * PORCENTAJE_SALUD);
    document.getElementById('auxilioTransporte').textContent = formatNumber(auxilioTransporte);
    document.getElementById('salarioBruto').textContent = formatNumber(primeraQuincena + segundaQuincena);
}